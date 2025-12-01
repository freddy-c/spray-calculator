import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ApplicationForm } from "@/components/application-form/ApplicationForm";

export default async function NewApplicationPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in?callbackUrl=/applications/new");
  }

  return <ApplicationForm mode="create" />;
}
