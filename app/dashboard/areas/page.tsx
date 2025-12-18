import { getAreas } from "@/lib/domain/area";
import { AreasTable } from "./areas-table";

export default async function AreasPage() {
  const result = await getAreas();

  if (!result.success) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-destructive">
          Failed to load areas: {result.error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <AreasTable areas={result.data} />
    </div>
  );
}