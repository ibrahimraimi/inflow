import { cn } from "@/lib/utils";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMemo } from "react";

import { MapData, TrafficData } from "@/configs/types";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GeographyObject {
  rsmKey: string;
  id: string | number;
  properties: {
    name: string;
    ISO_A2?: string;
    iso_a2?: string;
    ISO_A3?: string;
    iso_a3?: string;
    code?: string;
    [key: string]: unknown;
  };
}

interface DataMapProps {
  mapData?: MapData[];
  trafficData?: TrafficData[];
}

export function DataMap({ mapData = [], trafficData = [] }: DataMapProps) {
  // Transform traffic trafficData (flat) into grid (hour rows x day columns)
  const trafficGrid = useMemo(() => {
    // Create 24 hours x 7 days grid initialized with 0
    const grid = Array.from({ length: 24 }, (_, hour) => {
      const hourLabel = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}${
        hour < 12 ? "am" : "pm"
      }`;
      // Initialize days 0-6 (Sun-Sat) with 0
      const days = Array(7).fill(0);
      return { hour: hourLabel, days, originalHour: hour };
    });

    // Fill with data
    trafficData.forEach((item) => {
      if (item.hour >= 0 && item.hour < 24 && item.day >= 0 && item.day < 7) {
        grid[item.hour].days[item.day] = item.visitors;
      }
    });

    return grid;
  }, [trafficData]);

  // Map data lookup
  const getCountryVisitors = (geo: GeographyObject) => {
    if (!geo.properties) return 0;

    // Check common property keys for country codes (2-letter, 3-letter, and Name)
    const possibleCodes = [
      geo.properties.ISO_A2,
      geo.properties.iso_a2,
      geo.properties.ISO_A3,
      geo.properties.iso_a3,
      geo.properties.code,
      geo.id, // numeric or string ID
      geo.properties.name,
    ].filter(Boolean);

    for (const code of possibleCodes) {
      const found = mapData.find(
        (d) =>
          d.code?.toLowerCase() === code?.toString().toLowerCase() ||
          ("name" in d &&
            String(d.name).toLowerCase() === code?.toString().toLowerCase())
      );
      if (found) return found.visitors;
    }

    return 0;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-2 lg:h-[600px]">
      {/* Map */}
      <div className="bg-card border rounded-lg overflow-hidden shadow-sm flex-1 flex flex-col">
        <div className="flex items-center justify-center flex-1">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 110 }}
            className="w-full h-full"
          >
            <ZoomableGroup center={[0, 0]} zoom={1}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const visitors = getCountryVisitors(geo);
                    // Note: verifying world-atlas 110m properties. Usually ISO_A2 or ISO_A3.
                    // If mapData is empty, default styling.

                    const hasVisitors = visitors > 0;

                    return (
                      <Tooltip key={geo.rsmKey}>
                        <TooltipTrigger asChild>
                          <Geography
                            geography={geo}
                            className={cn(
                              "transition-colors duration-200 outline-none focus:outline-none",
                              hasVisitors
                                ? "fill-blue-600 hover:fill-blue-700 stroke-blue-800"
                                : "fill-muted/20 stroke-border hover:fill-muted/30"
                            )}
                            strokeWidth={0.5}
                            style={{
                              default: { outline: "none" },
                              hover: { outline: "none" },
                              pressed: { outline: "none" },
                            }}
                          />
                        </TooltipTrigger>
                        {hasVisitors && (
                          <TooltipContent>
                            {geo.properties.name}: {visitors} visitors
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </div>

      {/* Traffic */}
      <div className="bg-card border rounded-lg overflow-hidden shadow-sm lg:w-[400px] flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Traffic</h3>
        </div>
        <div className="p-4 flex-1 overflow-auto">
          <div className="grid grid-cols-8 gap-1 text-xs text-muted-foreground mb-2">
            <div className="col-span-1" />
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-medium text-[10px]">
                {day}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {trafficGrid.map((row, i) => (
              <div key={i} className="grid grid-cols-8 gap-1 items-center">
                <div className="text-[10px] text-muted-foreground text-right pr-3 font-medium">
                  {row.hour}
                </div>
                {row.days.map((value, j) => (
                  <div key={j} className="flex justify-center h-3 items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center cursor-pointer w-full h-full">
                          <div
                            className={cn(
                              "rounded-full transition-all duration-300",
                              value === 0
                                ? "h-1 w-1 bg-muted/20"
                                : cn(
                                    "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
                                    value < 2
                                      ? "h-1.5 w-1.5"
                                      : value < 5
                                        ? "h-2 w-2"
                                        : "h-2.5 w-2.5"
                                  )
                            )}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white border-zinc-800 text-xs">
                        <p>Visitors: {value}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
