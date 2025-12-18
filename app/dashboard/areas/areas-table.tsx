"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AreaListItem } from "@/lib/domain/area";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { AreaDialog } from "./area-dialog";
import { DeleteAreaDialog } from "./delete-area-dialog";

interface AreasTableProps {
  areas: AreaListItem[];
}

const areaTypeLabels: Record<string, string> = {
  GREEN: "Green",
  TEE: "Tee",
  FAIRWAY: "Fairway",
  ROUGH: "Rough",
  FIRST_CUT: "First Cut",
  APRON: "Apron",
  COLLAR: "Collar",
  PATH: "Path",
  OTHER: "Other",
};

export function AreasTable({ areas }: AreasTableProps) {
  const [editingArea, setEditingArea] = useState<AreaListItem | null>(null);
  const [deletingArea, setDeletingArea] = useState<AreaListItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsCreating(true)} variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">New Area</span>
        </Button>
      </div>

      {areas.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">No areas found</p>
          <Button onClick={() => setIsCreating(true)}>
            <IconPlus className="w-4 h-4 mr-2" />
            Create your first area
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Size (ha)</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell>{areaTypeLabels[area.type]}</TableCell>
                  <TableCell className="text-right">
                    {area.sizeHa.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingArea(area)}
                      >
                        <IconEdit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingArea(area)}
                      >
                        <IconTrash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AreaDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        mode="create"
      />

      {editingArea && (
        <AreaDialog
          open={!!editingArea}
          onOpenChange={(open) => !open && setEditingArea(null)}
          mode="edit"
          area={editingArea}
        />
      )}

      {deletingArea && (
        <DeleteAreaDialog
          open={!!deletingArea}
          onOpenChange={(open) => !open && setDeletingArea(null)}
          area={deletingArea}
        />
      )}
    </div>
  );
}
