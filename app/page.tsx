"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import CustomDateDisplay from "@/components/CustomDateDisplay";
import {
  CustomDateSystem,
  toCustomDate,
  formatCustomDate,
} from "@/lib/dateUtils";

const STORAGE_KEY = "custom_date_systems";

export default function IndexPage() {
  const router = useRouter();

  const [systems, setSystems] = useState<CustomDateSystem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<CustomDateSystem | null>(
    null
  );

  const [birthdayInput, setBirthdayInput] = useState("");
  const [customBirthday, setCustomBirthday] = useState<string | null>(null);

  // --- Load saved systems & check for creation toast ---
  useEffect(() => {
    // Toast if redirected from /post-custom
    if (localStorage.getItem("calendarCreated") === "1") {
      toast.success("Custom calendar created successfully 🎉");
      localStorage.removeItem("calendarCreated");
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
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

        setSystems(restored);
        if (restored.length > 0) setSelectedSystem(restored[0]);
      } catch (err) {
        console.error("Error parsing localStorage calendars", err);
      }
    }
  }, []);

  // --- Delete selected calendar ---
  const deleteSelected = () => {
    if (!selectedSystem) return;

    const updated = systems.filter((s) => s.name !== selectedSystem.name);
    setSystems(updated);
    setSelectedSystem(updated.length > 0 ? updated[0] : null);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        updated.map((s) => ({
          ...s,
          gregorianAnchor: s.gregorianAnchor.toISOString(),
        }))
      )
    );

    toast.error(`Calendar "${selectedSystem.name}" deleted 🗑`);
  };

  // --- Handle birthday conversion ---
  const handleBirthdayConvert = () => {
    if (!selectedSystem || !birthdayInput) return;
    const gregorian = new Date(birthdayInput);
    const customDate = toCustomDate(gregorian, selectedSystem);
    setCustomBirthday(formatCustomDate(customDate));
    toast(
      `Your birthday in "${selectedSystem.name}" is ${formatCustomDate(
        customDate
      )}`
    );
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-white flex flex-col items-center py-10 space-y-8 w-full px-4">
      <h1 className="text-3xl font-bold">🌌 Custom Calendar Manager</h1>

      {/* Dropdown + Actions */}
      {systems.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <select
            className="p-2 bg-neutral-800 text-white rounded"
            value={selectedSystem?.name || ""}
            onChange={(e) => {
              const found = systems.find((s) => s.name === e.target.value);
              if (found) {
                setSelectedSystem(found);
                setCustomBirthday(null); // reset birthday output
              }
            }}
          >
            {systems.map((s, i) => (
              <option key={i} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
            onClick={() => router.push("/post-custom")}
          >
            + New Calendar
          </button>
          {selectedSystem && (
            <>
              <button
                className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-500"
                onClick={() =>
                  router.push(
                    `/edit-custom?name=${encodeURIComponent(
                      selectedSystem.name
                    )}`
                  )
                }
              >
                ✏️ Edit
              </button>
              <button
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
                onClick={deleteSelected}
              >
                🗑 Delete
              </button>
            </>
          )}
        </div>
      )}

      {/* First Calendar Button */}
      {systems.length === 0 && (
        <button
          onClick={() => router.push("/post-custom")}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
        >
          Create First Calendar
        </button>
      )}

      {/* Display Current Date */}
      {selectedSystem && <CustomDateDisplay system={selectedSystem} />}

      {/* Birthday Conversion */}
      {selectedSystem && (
        <div className="mt-6 text-center space-y-2">
          <p className="text-lg">🎂 Please input your birthday (Gregorian):</p>
          <input
            type="date"
            className="p-2 bg-neutral-800 text-white rounded"
            value={birthdayInput}
            onChange={(e) => setBirthdayInput(e.target.value)}
          />
          <button
            className="ml-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            onClick={handleBirthdayConvert}
          >
            Convert
          </button>

          {customBirthday && (
            <p className="mt-2 text-xl font-semibold">
              Your custom birthday: {customBirthday}
            </p>
          )}
        </div>
      )}
    </main>
  );
}
