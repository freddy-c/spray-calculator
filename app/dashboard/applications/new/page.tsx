import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/core/auth/server";
import { ApplicationForm } from "@/components/features/application/form";

export default async function NewApplicationPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in?callbackUrl=/dashboard/applications/new");
  }

  return <ApplicationForm mode="create" />;
}
