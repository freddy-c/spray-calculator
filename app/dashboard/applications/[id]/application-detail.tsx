"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApplicationStatus } from "@/lib/domain/application/types";
import type { ApplicationProductField } from "@/lib/domain/product/types";
import { calculateSprayMetrics } from "@/lib/domain/application/calculations";
import { nozzleCatalog } from "@/lib/data/nozzle-catalog";
import { areaTypeOptions } from "@/lib/domain/application/types";
import { StatusDropdown } from "./status-dropdown";
import { DeleteApplicationDialog } from "./delete-dialog";

type ApplicationDetailProps = {
  application: {
    id: string;
    name: string;
    status: ApplicationStatus;
    nozzleId: string;
    sprayVolumeLHa: number;
    nozzleSpacingM: number;
    nozzleCount: number;
    tankSizeL: number;
    speedKmH: number;
    scheduledDate: Date | null;
    completedDate: Date | null;
    operator: string | null;
    weatherConditions: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    areas: Array<{
      label: string;
      type: string;
      sizeHa: number;
    }>;
    products: ApplicationProductField[];
  };
};

export function ApplicationDetail({ application }: ApplicationDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const metrics = calculateSprayMetrics({
    name: application.name,
    nozzleId: application.nozzleId,
    sprayVolumeLHa: application.sprayVolumeLHa,
    nozzleSpacingM: application.nozzleSpacingM,
    nozzleCount: application.nozzleCount,
    tankSizeL: application.tankSizeL,
    speedKmH: application.speedKmH,
    areas: application.areas.map(a => ({
      label: a.label,
      type: a.type as any,
      sizeHa: a.sizeHa,
    })),
    products: application.products,
  });

  const nozzle = nozzleCatalog[application.nozzleId];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Status and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <StatusBadge status={application.status} />
          <div className="text-sm text-muted-foreground">
            {application.status === ApplicationStatus.SCHEDULED && application.scheduledDate &&
              `Scheduled: ${formatDate(application.scheduledDate)}`}
            {application.status === ApplicationStatus.COMPLETED && application.completedDate &&
              `Completed: ${formatDate(application.completedDate)}`}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/applications/${application.id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>

          <StatusDropdown
            applicationId={application.id}
            currentStatus={application.status}
          />

          <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Completion Details */}
      {application.status === ApplicationStatus.COMPLETED &&
       (application.operator || application.weatherConditions || application.notes) && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Completion Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {application.operator && (
              <div>
                <div className="text-sm text-muted-foreground">Operator</div>
                <div className="font-medium">{application.operator}</div>
              </div>
            )}
            {application.weatherConditions && (
              <div>
                <div className="text-sm text-muted-foreground">Weather Conditions</div>
                <div className="font-medium">{application.weatherConditions}</div>
              </div>
            )}
            {application.notes && (
              <div>
                <div className="text-sm text-muted-foreground">Notes</div>
                <p className="text-sm whitespace-pre-wrap">{application.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Application Details - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Areas */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Areas</CardTitle>
              <CardDescription>
                {metrics.totalAreaHa} ha total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Area</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Size (ha)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {application.areas.map((area, index) => (
                    <TableRow key={index}>
                      <TableCell>{area.label}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {areaTypeOptions.find(opt => opt.value === area.type)?.label}
                      </TableCell>
                      <TableCell className="text-right">{area.sizeHa}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Rate/ha</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.productTotals.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {product.ratePerHa} {product.unit}/ha
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {product.totalAmount.toFixed(2)} {product.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-3">
          {/* Sprayer Configuration */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Sprayer Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Equipment Setup */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Equipment Setup</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-muted-foreground">Nozzle</p>
                    <p className="text-xl font-semibold">{nozzle.label}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-muted-foreground">Nozzle Spacing</p>
                    <p className="text-xl font-semibold">{application.nozzleSpacingM} m</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-muted-foreground">Nozzle Count</p>
                    <p className="text-xl font-semibold">{application.nozzleCount}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-muted-foreground">Tank Size</p>
                    <p className="text-xl font-semibold">{application.tankSizeL} L</p>
                  </div>
                </div>
              </div>

              {/* Operating Parameters */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Operating Parameters</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-muted-foreground">Speed</p>
                    <p className="text-xl font-semibold">{application.speedKmH} km/h</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-muted-foreground">Pressure</p>
                    <p className={`text-xl font-semibold ${metrics.pressureStatus === "ok" ? "text-emerald-700" : "text-destructive"}`}>
                      {metrics.requiredPressureBar.toFixed(2)} bar
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-muted-foreground">Nozzle Flow</p>
                    <p className="text-xl font-semibold">{metrics.flowPerNozzleLMin.toFixed(2)} L/min</p>
                  </div>
                </div>
              </div>

              {/* Application & Job Outputs */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Application & Job Outputs</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-muted-foreground">Spray Volume</p>
                    <p className="text-xl font-semibold">{application.sprayVolumeLHa} L/ha</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-muted-foreground">Total Spray Volume</p>
                    <p className="text-xl font-semibold">{metrics.totalSprayVolumeL} L</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-muted-foreground">Tanks Required</p>
                    <p className="text-xl font-semibold">{metrics.tanksRequired.toFixed(2)}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-muted-foreground">Spray Time</p>
                    <p className="text-xl font-semibold">
                      {(() => {
                        const totalMinutes = Math.round(metrics.sprayTimeMinutes);
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        const parts: string[] = [];
                        if (hours > 0) parts.push(`${hours}h`);
                        if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
                        return parts.join(" ");
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pressure Warning */}
              {metrics.pressureStatus !== "ok" && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-sm text-destructive">
                    {metrics.pressureStatus === "low" &&
                      "Pressure is below the recommended range — consider increasing speed or increasing spray volume."}
                    {metrics.pressureStatus === "high" &&
                      "Pressure is above the recommended range — consider reducing speed or reducing spray volume."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteApplicationDialog
        applicationId={application.id}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        redirectAfterDelete="/dashboard"
      />
    </div>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  let variant: "default" | "secondary" | "outline" = "default";
  let text: string = "";

  switch (status) {
    case ApplicationStatus.DRAFT:
      variant = "outline";
      text = "Draft";
      break;
    case ApplicationStatus.SCHEDULED:
      variant = "secondary";
      text = "Scheduled";
      break;
    case ApplicationStatus.COMPLETED:
      variant = "default";
      text = "Completed";
      break;
    default:
      text = status;
  }

  return <Badge variant={variant}>{text}</Badge>;
}
