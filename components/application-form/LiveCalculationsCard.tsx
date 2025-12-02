import type { SprayMetrics } from "@/lib/application";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PRODUCT_TYPE_UNITS } from "@/lib/product/types";

type LiveCalculationsCardProps = {
  metrics: SprayMetrics | null;
  sprayVolumeLHa: number;
  isSubmitting?: boolean;
  onReset?: () => void;
};

export function LiveCalculationsCard({ metrics, sprayVolumeLHa, isSubmitting, onReset }: LiveCalculationsCardProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Live calculations</CardTitle>
        <CardDescription>
          Values update as you adjust any setting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* First row: nozzle & pressure */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border p-3">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-sm text-muted-foreground">
                  Nozzle flow
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>The nozzle output for one nozzle</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xl font-semibold">
              {metrics ? metrics.flowPerNozzleLMin.toFixed(2) : "—"} L/min
            </p>
          </div>

          <div className="rounded-md border p-3">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-sm text-muted-foreground">
                  Pressure
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>The pressure at the nozzle</p>
              </TooltipContent>
            </Tooltip>
            <p
              className={`text-xl font-semibold ${metrics?.pressureStatus === "ok"
                ? "text-emerald-700"
                : "text-destructive"
                }`}
            >
              {metrics ? metrics.requiredPressureBar.toFixed(2) : "—"} bar
            </p>
          </div>

          <div className="rounded-md border p-3">
            <p className="text-sm text-muted-foreground">Speed</p>
            <p className="text-xl font-semibold">
              {metrics ? metrics.speedKmH.toFixed(2) : "—"} km/h
            </p>
          </div>
        </div>

        {/* Second row: area & tanks */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border p-3">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-sm text-muted-foreground">Total area</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sum of all areas receiving this application.</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xl font-semibold">
              {metrics ? metrics.totalAreaHa.toFixed(3) : "—"} ha
            </p>
          </div>

          <div className="rounded-md border p-3">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-sm text-muted-foreground">Spray volume</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total liquid required at {sprayVolumeLHa} L/ha.</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xl font-semibold">
              {metrics ? metrics.totalSprayVolumeL.toFixed(2) : "—"} L
            </p>
          </div>

          <div className="rounded-md border p-3">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-sm text-muted-foreground">Tanks required</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Number of full tanks to cover the total area.</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xl font-semibold">
              {metrics ? metrics.tanksRequired.toFixed(2) : "—"}
            </p>
          </div>
        </div>

        {/* Third row: spray time */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border p-3">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-sm text-muted-foreground">Spray time</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Estimated time to spray the entire area in a single pass without stopping. Actual time will be higher due to turns, fills, and overlaps.</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xl font-semibold">
              {metrics ? (() => {
                const totalMinutes = Math.round(metrics.sprayTimeMinutes);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;

                const parts: string[] = [];

                if (hours > 0) {
                  parts.push(`${hours}h`);
                }

                if (minutes > 0 || parts.length === 0) {
                  parts.push(`${minutes}m`);
                }

                return parts.join(" ");
              })() : "—"}
            </p>
          </div>
        </div>

        {metrics?.pressureStatus !== "ok" && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">
              {metrics?.pressureStatus === "low" &&
                "Pressure is below the recommended range — consider increasing speed or increasing spray volume."}
              {metrics?.pressureStatus === "high" &&
                "Pressure is above the recommended range — consider reducing speed or reducing spray volume."}
              {!metrics && "Enter values to see pressure guidance."}
            </p>
          </div>
        )}

        {/* Product Requirements */}
        {metrics && metrics.productTotals.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Product Requirements</h3>
            <div className="space-y-2">
              {metrics.productTotals.map((product) => (
                <div key={product.productId} className="rounded-md border p-3">
                  <p className="text-sm font-medium">{product.productName}</p>
                  <div className="mt-1 flex items-baseline justify-between">
                    <p className="text-xs text-muted-foreground">
                      Rate: {product.ratePerHa.toFixed(2)} {PRODUCT_TYPE_UNITS[product.productType]}
                    </p>
                    <p className="text-lg font-semibold">
                      {product.totalAmount.toFixed(2)} {product.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t flex-col gap-2 sm:flex-row">
        <Button
          type="submit"
          form="spray-calculator-form"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Saving..." : "Save Application"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}
