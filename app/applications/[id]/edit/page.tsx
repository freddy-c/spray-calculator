import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getApplication } from "@/lib/actions/application";
import { ApplicationForm } from "@/components/application-form/ApplicationForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditApplicationPage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const { id } = await params;
    redirect(`/sign-in?callbackUrl=/applications/${id}/edit`);
  }

  const { id } = await params;
  const result = await getApplication(id);

  if (!result.success) {
    notFound();
  }

  return (
    <ApplicationForm
      mode="edit"
      applicationId={id}
      initialValues={result.data}
    />
  );
}
