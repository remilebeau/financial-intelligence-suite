import FocusForm from "@/components/FocusForm";
import { Metadata } from "next";
import BackButton from "@/components/BackButton";

export const metadata: Metadata = {
  title: "FOCUS 1.3 Schema Conversion for Cloud Billing Data",
  description: "FOCUS 1.3 Schema Conversion for Cloud Billing Data",
};
export default function FocusPage() {
  return (
    <section className="flex flex-col gap-8">
      <BackButton />
      <FocusForm />
      <BackButton />
    </section>
  );
}
