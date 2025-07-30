"use client";

import React, { useEffect, useState } from "react";
import CustomDateForm from "@/components/CustomDateForm";
import CustomDateDisplay from "@/components/CustomDateDisplay";
import {
  CustomDateSystem,
  toCustomDate,
  formatCustomDate,
} from "@/lib/dateUtils";

const STORAGE_KEY = "custom_date_systems";

export default function IndexPage() {
  const [systems, setSystems] = useState<CustomDateSystem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<CustomDateSystem | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);

  // Birthday state
  const [birthdayInput, setBirthdayInput] = useState("");
  const [customBirthday, setCustomBirthday] = useState<string | null>(null);

  // --- Load from LocalStorage on mount ---
  useEffect(() => {
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

  // --- Save system to localStorage ---
  const saveSystem = (system: CustomDateSystem) => {
    const updated = [...systems, system];
    setSystems(updated);
    setSelectedSystem(system);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        updated.map((s) => ({
          ...s,
          gregorianAnchor: s.gregorianAnchor.toISOString(),
        }))
      )
    );
    setShowForm(false);
  };

  // --- Delete selected system ---
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
  };

  // --- Handle Birthday Conversion ---
  const handleBirthdayConvert = () => {
    if (!selectedSystem || !birthdayInput) return;
    const gregorian = new Date(birthdayInput);
    const customDate = toCustomDate(gregorian, selectedSystem);
    setCustomBirthday(formatCustomDate(customDate));
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-white flex flex-col items-center py-10 space-y-8 w-full">
      <h1 className="text-3xl font-bold">🌌 Custom Calendar Manager</h1>

      {/* Dropdown for existing systems */}
      {systems.length > 0 && (
        <div className="flex space-x-2 items-center">
          <select
            className="p-2 bg-neutral-800 text-white rounded"
            value={selectedSystem?.name || ""}
            onChange={(e) => {
              const found = systems.find((s) => s.name === e.target.value);
              if (found) {
                setSelectedSystem(found);
                setCustomBirthday(null); // reset birthday display
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
            onClick={() => setShowForm(true)}
          >
            + New Calendar
          </button>

          {selectedSystem && (
            <button
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
              onClick={deleteSelected}
            >
              🗑 Delete
            </button>
          )}
        </div>
      )}

      {/* Show create button if no systems exist */}
      {systems.length === 0 && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
        >
          Create First Calendar
        </button>
      )}

      {/* Form for creating a new system */}
      {showForm && <CustomDateForm onSubmit={saveSystem} />}

      {/* Display selected system */}
      {selectedSystem && !showForm && (
        <>
          <CustomDateDisplay system={selectedSystem} />

          {/* Birthday Conversion */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-lg">🎂 Please input your birthday:</p>
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
        </>
      )}
    </main>
  );
}
