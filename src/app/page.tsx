import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-center text-3xl font-bold">Select a Model</h1>
      <Button asChild>
        <Link href="/focus">
          FOCUS 1.3 Schema Conversion for Cloud Billing Data
        </Link>
      </Button>
      <Button asChild>
        <Link href="/optimization">Optimization</Link>
      </Button>
      <Button asChild>
        <Link href="/simulation">Simulation</Link>
      </Button>
    </section>
  );
}
