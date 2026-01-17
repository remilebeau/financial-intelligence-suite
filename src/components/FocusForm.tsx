"use client";

import React, { useState } from "react";
import { convertToFocus } from "@/lib/convertToFocus"; // Ensure path matches your project
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  UploadCloud,
  FileCheck,
  RefreshCw,
  AlertCircle,
  FileJson,
  ShieldCheck,
  ArrowRightLeft,
} from "lucide-react";

/**
 * FocusPage Component
 * Handles the UI for uploading cloud billing CSVs and converting them
 * to the FOCUS 1.3 specification using the FastAPI backend.
 */
export default function FocusPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const blob = await convertToFocus(file);

      // Create a temporary link to trigger the browser download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Append FOCUS standard prefix to the original filename
      link.download = `FOCUS_1.3_Normalized_${file.name}`;
      document.body.appendChild(link);
      link.click();

      // Cleanup DOM and memory
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err: any) {
      setError(
        err.message || "An unexpected error occurred during normalization.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="flex flex-col space-y-8">
        <Card className="border-border bg-card overflow-hidden shadow-xl">
          <CardHeader className="bg-muted/30 border-b pb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-lg p-2">
                <FileJson className="text-primary-foreground h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  FOCUS 1.3 Normalizer
                </CardTitle>
                <CardDescription className="text-sm">
                  Convert AWS CUR or Azure Consumption files to a unified FinOps
                  standard.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-8">
              <div className="grid w-full items-center gap-4">
                <Label
                  htmlFor="file-upload"
                  className="text-muted-foreground text-sm font-bold tracking-wider uppercase"
                >
                  1. Select Billing Export
                </Label>

                {/* NATIVE LABEL PATTERN: Clicking this dashed area triggers the 
                  hidden file input via the htmlFor="file-upload" relationship.
                */}
                <label
                  htmlFor="file-upload"
                  className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all ${
                    file
                      ? "border-primary/50 bg-primary/5 shadow-inner"
                      : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <input
                    id="file-upload"
                    type="file"
                    onChange={(e) => {
                      setFile(e.target.files?.[0] || null);
                      setError(null);
                      setSuccess(false);
                    }}
                    accept=".csv"
                    className="hidden"
                  />

                  <div className="bg-background mb-4 rounded-full p-4 shadow-sm transition-transform group-hover:scale-110">
                    <UploadCloud
                      className={`h-8 w-8 ${file ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>

                  <div className="text-center">
                    {file ? (
                      <div className="space-y-1">
                        <p className="text-foreground text-sm font-bold">
                          {file.name}
                        </p>
                        <p className="text-muted-foreground text-[10px] font-semibold uppercase">
                          Click to replace file
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold">
                          Drop your CSV here or click to browse
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Supports AWS CUR 2.0 and Azure Consumption Schemas
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* Status Notifications */}
              {error && (
                <Alert
                  variant="destructive"
                  className="bg-destructive/5 animate-in fade-in slide-in-from-top-1"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Processing Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="animate-in fade-in slide-in-from-top-1 border-emerald-500/50 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                  <FileCheck className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    The normalized file has been generated and your download has
                    started.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="bg-muted/10 border-t p-6">
              <Button
                type="submit"
                className="h-12 w-full font-bold shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                disabled={!file || isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Normalizing Schema...
                  </>
                ) : (
                  "Convert to FOCUS 1.3"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Technical Features Summary */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="bg-card flex items-start space-x-3 rounded-xl border p-4 shadow-sm">
            <ShieldCheck className="mt-1 h-5 w-5 text-blue-500" />
            <div>
              <h4 className="text-sm font-bold">Schema Coalescing</h4>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                Automatically merges provider-specific columns into unified
                attributes without data loss.
              </p>
            </div>
          </div>
          <div className="bg-card flex items-start space-x-3 rounded-xl border p-4 shadow-sm">
            <ArrowRightLeft className="mt-1 h-5 w-5 text-purple-500" />
            <div>
              <h4 className="text-sm font-bold">DTF-1 Standard</h4>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                Standardizes disparate billing timestamps into strict ISO 8601
                UTC-Z format.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
