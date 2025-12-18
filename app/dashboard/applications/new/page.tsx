import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/core/auth/server";
import { ApplicationForm } from "@/components/features/application/form";
import { getAreas } from "@/lib/domain/area";

export default async function NewApplicationPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in?callbackUrl=/dashboard/applications/new");
  }

  const areasResult = await getAreas();
  const availableAreas = areasResult.success ? areasResult.data : [];

  return <ApplicationForm mode="create" availableAreas={availableAreas} />;
}
