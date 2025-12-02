import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getApplicationDetail } from "@/lib/actions/application";
import { ApplicationDetail } from "./application-detail";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getApplicationDetail(id);

  if (!result.success) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to Applications
          </Link>
          <h1 className="text-3xl font-bold">{result.data.name}</h1>
        </div>
      </div>

      <ApplicationDetail application={result.data} />
    </div>
  );
}
