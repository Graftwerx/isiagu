import React, { useState } from "react";
import {
  CustomDateSystem,
  CustomSeason,
  CustomMonth,
  generateMonths,
} from "@/lib/dateUtils";

interface CustomDateFormProps {
  onSubmit: (system: CustomDateSystem) => void;
}

const CustomDateForm: React.FC<CustomDateFormProps> = ({ onSubmit }) => {
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Core Inputs
  const [name, setName] = useState("");
  const [yearSize, setYearSize] = useState(365);
  const [monthCount, setMonthCount] = useState(12);
  const [weekSize, setWeekSize] = useState(7);
  const [gregorianAnchor, setGregorianAnchor] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Generated & Editable
  const [months, setMonths] = useState<CustomMonth[]>([]);
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>(
    Array(7)
      .fill("")
      .map((_, i) => `Day ${i + 1}`)
  );
  const [seasons, setSeasons] = useState<CustomSeason[]>([]);

  // Custom Start Date
  const [startDayOfWeek, setStartDayOfWeek] = useState(0);
  const [startDayOfMonth, setStartDayOfMonth] = useState(1);
  const [startMonthIndex, setStartMonthIndex] = useState(0);
  const [startYearNumber, setStartYearNumber] = useState(1);

  // --- Generate months evenly ---
  const distributeMonths = (year = yearSize, monthsCount = monthCount) => {
    const generated = generateMonths(year, monthsCount, weekSize);
    const preservedNames = generated.map((m, i) => ({
      ...m,
      name: months[i]?.name || `Month ${i + 1}`,
    }));
    setMonths(preservedNames);
  };

  // --- Add a new season ---
  const addSeason = () => {
    setSeasons([
      ...seasons,
      {
        name: `Season ${seasons.length + 1}`,
        startMonthIndex: 0,
        endMonthIndex: 0,
      },
    ]);
  };

  // --- Update season fields ---
  const updateSeason = (
    index: number,
    field: "name" | "startMonthIndex" | "endMonthIndex",
    value: string
  ) => {
    setSeasons((prev) => {
      const updated = [...prev];

      if (field === "name") {
        updated[index].name = value;
      } else {
        updated[index][field] = parseInt(value) || 0;
      }

      return updated;
    });
  };

  // --- Validate form before confirming ---
  const validateForm = () => {
    if (yearSize <= 0 || monthCount <= 0 || weekSize <= 0) return false;
    if (monthCount >= yearSize || monthCount <= weekSize) return false;
    return true;
  };

  // --- Handle Save ---
  const handleSave = () => {
    const system: CustomDateSystem = {
      name,
      yearSize,
      monthCount,
      weekSize,
      months,
      seasons,
      gregorianAnchor: new Date(gregorianAnchor),
      startDate: {
        dayIndex: startDayOfWeek,
        dayOfMonth: startDayOfMonth,
        monthIndex: startMonthIndex,
        yearNumber: startYearNumber,
      },
      daysOfWeek,
    };

    onSubmit(system);
    setShowForm(false);
    setShowConfirm(false);
  };

  return (
    <div className="p-4 border rounded-lg bg-neutral-800 text-white">
      {!showForm && (
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            distributeMonths();
          }}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
        >
          Create Custom Calendar
        </button>
      )}

      {showForm && !showConfirm && (
        <div className="space-y-4 mt-4">
          <h2 className="text-xl font-bold">Custom Calendar Setup</h2>

          {/* Calendar Name */}
          <input
            className="border p-2 w-full bg-neutral-700 text-white"
            placeholder="Calendar Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Year Size */}
          <div>
            <label>Year Size (days)</label>
            <input
              type="number"
              className="border p-2 w-full bg-neutral-700 text-white"
              value={yearSize}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setYearSize(val);
                distributeMonths(val, monthCount);
              }}
            />
          </div>

          {/* Month Count */}
          <div>
            <label>Number of Months</label>
            <input
              type="number"
              className="border p-2 w-full bg-neutral-700 text-white"
              value={monthCount}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setMonthCount(val);
                distributeMonths(yearSize, val);
              }}
            />
          </div>

          {/* Week Size */}
          <div>
            <label>Days in a Week</label>
            <input
              type="number"
              className="border p-2 w-full bg-neutral-700 text-white"
              value={weekSize}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setWeekSize(val);
                setDaysOfWeek((prev) =>
                  Array(val)
                    .fill("")
                    .map((_, i) => prev[i] || `Day ${i + 1}`)
                );
                distributeMonths(yearSize, monthCount);
              }}
            />
          </div>

          {/* Name Days of the Week */}
          <div>
            <label className="block font-bold mb-1">
              Name Days of the Week
            </label>
            {daysOfWeek.map((d, i) => (
              <input
                key={i}
                className="border p-2 w-full mb-1 bg-neutral-700 text-white"
                value={d}
                onChange={(e) =>
                  setDaysOfWeek((prev) => {
                    const updated = [...prev];
                    updated[i] = e.target.value;
                    return updated;
                  })
                }
              />
            ))}
          </div>

          {/* Name Months */}
          <div>
            <label className="block font-bold mb-1">Name Months</label>
            {months.map((m, i) => (
              <input
                key={i}
                className="border p-2 w-full mb-1 bg-neutral-700 text-white"
                value={m.name}
                onChange={(e) =>
                  setMonths((prev) => {
                    const updated = [...prev];
                    updated[i] = { ...updated[i], name: e.target.value };
                    return updated;
                  })
                }
              />
            ))}
          </div>

          {/* Custom Start Date */}
          <div>
            <label className="block font-bold mb-1">Custom Start Date</label>
            <div className="flex space-x-2">
              <select
                className="border p-2 bg-neutral-700 text-white"
                value={startDayOfWeek}
                onChange={(e) => setStartDayOfWeek(parseInt(e.target.value))}
              >
                {daysOfWeek.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                className="border p-2 bg-neutral-700 text-white"
                value={startMonthIndex}
                onChange={(e) => setStartMonthIndex(parseInt(e.target.value))}
              >
                {months.map((m, i) => (
                  <option key={i} value={i}>
                    {m.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="border p-2 w-20 bg-neutral-700 text-white"
                min={1}
                max={months[startMonthIndex]?.days || 1}
                value={startDayOfMonth}
                onChange={(e) => setStartDayOfMonth(parseInt(e.target.value))}
              />
              <input
                type="number"
                className="border p-2 w-20 bg-neutral-700 text-white"
                value={startYearNumber}
                onChange={(e) => setStartYearNumber(parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Gregorian Anchor */}
          <div>
            <label>Gregorian Start Date (Anchor)</label>
            <input
              type="date"
              className="border p-2 w-full bg-neutral-700 text-white"
              value={gregorianAnchor}
              onChange={(e) => setGregorianAnchor(e.target.value)}
            />
          </div>

          {/* Overview */}
          {months.length > 0 && (
            <div className="mt-4 p-2 border rounded bg-neutral-700">
              <h3 className="font-bold mb-2">Overview (Auto Weeks)</h3>
              <ul className="list-disc pl-6">
                {months.map((m, i) => (
                  <li key={i}>
                    {m.name}: {m.days} days (~{m.weeks} weeks)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Seasons */}
          <div className="mt-4">
            <h3 className="font-bold mb-2">Seasons</h3>
            {seasons.map((s, i) => (
              <div key={i} className="flex space-x-2 mb-2">
                <input
                  className="border p-2 flex-1 bg-neutral-700 text-white"
                  value={s.name}
                  onChange={(e) => updateSeason(i, "name", e.target.value)}
                />
                <select
                  className="border p-2 bg-neutral-700 text-white"
                  value={s.startMonthIndex}
                  onChange={(e) =>
                    updateSeason(i, "startMonthIndex", e.target.value)
                  }
                >
                  {months.map((m, idx) => (
                    <option key={idx} value={idx}>
                      Start: {m.name}
                    </option>
                  ))}
                </select>
                <select
                  className="border p-2 bg-neutral-700 text-white"
                  value={s.endMonthIndex}
                  onChange={(e) =>
                    updateSeason(i, "endMonthIndex", e.target.value)
                  }
                >
                  {months.map((m, idx) => (
                    <option key={idx} value={idx}>
                      End: {m.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button
              type="button"
              onClick={addSeason}
              className="mt-2 px-3 py-1 bg-green-600 rounded hover:bg-green-500"
            >
              Add Season
            </button>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            disabled={!validateForm()}
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded w-full mt-4 hover:bg-yellow-500"
          >
            Review & Confirm
          </button>
        </div>
      )}

      {showConfirm && (
        <div className="mt-4 p-4 border border-yellow-500 rounded bg-neutral-700">
          <h3 className="font-bold mb-2 text-yellow-400">Confirm Creation</h3>
          <p className="mb-4">
            You are about to create the custom calendar: <b>{name}</b>. <br />
            Year Size: {yearSize} days, Months: {monthCount}, Week Size:{" "}
            {weekSize}.
            <br />
            Are you sure?
          </p>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
            >
              Yes, Create
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDateForm;
