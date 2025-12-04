import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getApplicationDetail } from "@/lib/domain/application/actions";
import { ApplicationDetail } from "./application-detail";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    <div>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      <ApplicationDetail application={result.data} />
    </div>
  );
}
