"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import CustomDateForm from "@/components/CustomDateForm";
import { CustomDateSystem } from "@/lib/dateUtils";

export default function EditCustomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [system, setSystem] = useState<CustomDateSystem | null>(null);

  const nameParam = searchParams.get("name");

  useEffect(() => {
    if (!nameParam) return;

    const raw = localStorage.getItem("custom_date_systems");
    if (!raw) return;

    try {
      const parsed: Partial<CustomDateSystem>[] = JSON.parse(raw);

      const restored: CustomDateSystem[] = parsed.map((s) => ({
        name: s.name || "Unnamed",
        yearSize: s.yearSize || 365,
        monthCount: s.monthCount || 12,
        weekSize: s.weekSize || 7,
        months: s.months || [],
        seasons: s.seasons || [],
        gregorianAnchor: s.gregorianAnchor
          ? new Date(s.gregorianAnchor)
          : new Date(),
        startDate: s.startDate || {
          dayIndex: 0,
          dayOfMonth: 1,
          monthIndex: 0,
          yearNumber: 1,
        },
        daysOfWeek: s.daysOfWeek || [],
      }));

      const found = restored.find((s) => s.name === nameParam);
      if (found) setSystem(found);
    } catch (err) {
      console.error("Error parsing localStorage calendars:", err);
    }
  }, [nameParam]);

  const handleUpdate = (updatedSystem: CustomDateSystem) => {
    const raw = localStorage.getItem("custom_date_systems") || "[]";

    try {
      const parsed: Partial<CustomDateSystem>[] = JSON.parse(raw);

      const systems: CustomDateSystem[] = parsed.map((s) => ({
        name: s.name || "Unnamed",
        yearSize: s.yearSize || 365,
        monthCount: s.monthCount || 12,
        weekSize: s.weekSize || 7,
        months: s.months || [],
        seasons: s.seasons || [],
        gregorianAnchor: s.gregorianAnchor
          ? new Date(s.gregorianAnchor)
          : new Date(),
        startDate: s.startDate || {
          dayIndex: 0,
          dayOfMonth: 1,
          monthIndex: 0,
          yearNumber: 1,
        },
        daysOfWeek: s.daysOfWeek || [],
      }));

      const idx = systems.findIndex((s) => s.name === nameParam);
      if (idx !== -1) {
        systems[idx] = updatedSystem;

        localStorage.setItem(
          "custom_date_systems",
          JSON.stringify(
            systems.map((s) => ({
              ...s,
              gregorianAnchor: s.gregorianAnchor.toISOString(),
            }))
          )
        );

        toast.success(
          `Calendar "${updatedSystem.name}" updated successfully ✨`
        );
        router.push("/");
      }
    } catch (err) {
      console.error("Error updating localStorage calendars:", err);
    }
  };

  if (!system) {
    return (
      <main className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <p>Loading calendar for edit...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-900 text-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl space-y-8">
        <h1 className="text-2xl font-bold text-center">
          Edit Calendar: {system.name}
        </h1>

        <CustomDateForm
          initialSystem={system} // Prepopulate the form
          onSubmit={handleUpdate}
        />
      </div>
    </main>
  );
}
