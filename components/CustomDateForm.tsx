"use client";

import React, { useEffect, useState } from "react";
import {
  CustomDateSystem,
  CustomSeason,
  CustomMonth,
  generateMonths,
} from "@/lib/dateUtils";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomDateFormProps {
  onSubmit: (system: CustomDateSystem) => void;
  initialSystem?: CustomDateSystem; // optional
}

export default function CustomDateForm({
  onSubmit,
  initialSystem,
}: CustomDateFormProps) {
  useEffect(() => {
    if (initialSystem) {
      setName(initialSystem.name);
      setYearSize(initialSystem.yearSize);
      setMonthCount(initialSystem.monthCount);
      setWeekSize(initialSystem.weekSize);
      setGregorianAnchor(
        initialSystem.gregorianAnchor.toISOString().split("T")[0]
      );
      setMonths(initialSystem.months);
      setDaysOfWeek(initialSystem.daysOfWeek);
      setSeasons(initialSystem.seasons);
      setStartDayOfWeek(initialSystem.startDate.dayIndex);
      setStartDayOfMonth(initialSystem.startDate.dayOfMonth);
      setStartMonthIndex(initialSystem.startDate.monthIndex);
      setStartYearNumber(initialSystem.startDate.yearNumber);
    }
  }, [initialSystem]);

  const [name, setName] = useState("");
  const [yearSize, setYearSize] = useState(365);
  const [monthCount, setMonthCount] = useState(12);
  const [weekSize, setWeekSize] = useState(7);
  const [gregorianAnchor, setGregorianAnchor] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [months, setMonths] = useState<CustomMonth[]>([]);
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>(
    Array(7)
      .fill("")
      .map((_, i) => `Day ${i + 1}`)
  );
  const [seasons, setSeasons] = useState<CustomSeason[]>([]);

  const [startDayOfWeek, setStartDayOfWeek] = useState(0);
  const [startDayOfMonth, setStartDayOfMonth] = useState(1);
  const [startMonthIndex, setStartMonthIndex] = useState(0);
  const [startYearNumber, setStartYearNumber] = useState(1);

  // Generate months evenly
  const distributeMonths = (year = yearSize, monthsCount = monthCount) => {
    const generated = generateMonths(year, monthsCount, weekSize);
    const preservedNames = generated.map((m, i) => ({
      ...m,
      name: months[i]?.name || `Month ${i + 1}`,
    }));
    setMonths(preservedNames);
  };

  // --- Seasons ---
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

  const updateSeason = (
    index: number,
    field: "name" | "startMonthIndex" | "endMonthIndex",
    value: string
  ) => {
    setSeasons((prev) => {
      const updated = [...prev];
      if (field === "name") updated[index].name = value;
      else updated[index][field] = parseInt(value) || 0;
      return updated;
    });
  };

  // Validation
  const validateForm = () =>
    yearSize > 0 &&
    monthCount > 0 &&
    weekSize > 0 &&
    monthCount < yearSize &&
    monthCount > weekSize;

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

    toast.success(`Custom calendar "${name}" created 🎉`);
  };

  return (
    <Card className="bg-neutral-800 text-white border-neutral-700 w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Create Custom Calendar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar Name */}
        <div className="space-y-1">
          <Label>Calendar Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-neutral-700 border-neutral-600 text-white"
            placeholder="My Fantasy Calendar"
          />
        </div>

        {/* Year, Months, Week */}
        <div className="grid grid-cols-3 space-y-2 gap-4">
          <div>
            {" "}
            <Label>Year Size (days)</Label>{" "}
            <Input
              type="number"
              value={yearSize}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setYearSize(val);
                distributeMonths(val, monthCount);
              }}
              className="bg-neutral-700 border-neutral-600 text-white mt-2"
            />
          </div>
          <div>
            <Label>Number of Months</Label>
            <Input
              type="number"
              value={monthCount}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setMonthCount(val);
                distributeMonths(yearSize, val);
              }}
              className="bg-neutral-700 border-neutral-600 text-white mt-2"
            />
          </div>
          <div>
            <Label>Week Size (days)</Label>
            <Input
              type="number"
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
              className="bg-neutral-700 border-neutral-600 text-white mt-2"
            />
          </div>
        </div>

        {/* Name Days of the Week */}
        <div>
          <Label>Name Days of the Week</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {daysOfWeek.map((d, i) => (
              <Input
                key={i}
                value={d}
                onChange={(e) =>
                  setDaysOfWeek((prev) => {
                    const updated = [...prev];
                    updated[i] = e.target.value;
                    return updated;
                  })
                }
                className="bg-neutral-700 border-neutral-600 text-white"
              />
            ))}
          </div>
        </div>

        {/* Name Months */}
        {months.length > 0 && (
          <div>
            <Label>Name Months</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {months.map((m, i) => (
                <Input
                  key={i}
                  value={m.name}
                  onChange={(e) =>
                    setMonths((prev) => {
                      const updated = [...prev];
                      updated[i] = { ...updated[i], name: e.target.value };
                      return updated;
                    })
                  }
                  className="bg-neutral-700 border-neutral-600 text-white"
                />
              ))}
            </div>
          </div>
        )}

        {/* Custom Start Date */}
        <div className="space-y-2">
          <Label>Custom Start Date</Label>
          <div className="flex space-x-2">
            <Select
              value={startDayOfWeek.toString()}
              onValueChange={(v) => setStartDayOfWeek(parseInt(v))}
            >
              <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((d, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={startMonthIndex.toString()}
              onValueChange={(v) => setStartMonthIndex(parseInt(v))}
            >
              <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              min={1}
              max={months[startMonthIndex]?.days || 1}
              value={startDayOfMonth}
              onChange={(e) => setStartDayOfMonth(parseInt(e.target.value))}
              className="bg-neutral-700 border-neutral-600 text-white w-20"
            />

            <Input
              type="number"
              value={startYearNumber}
              onChange={(e) => setStartYearNumber(parseInt(e.target.value))}
              className="bg-neutral-700 border-neutral-600 text-white w-20"
            />
          </div>
        </div>

        {/* Gregorian Anchor */}
        <div>
          <Label>Gregorian Anchor</Label>
          <Input
            type="date"
            value={gregorianAnchor}
            onChange={(e) => setGregorianAnchor(e.target.value)}
            className="bg-neutral-700 border-neutral-600 text-white mt-2"
          />
        </div>

        {/* --- Seasons Section --- */}
        <div>
          <Label>Seasons</Label>
          {seasons.map((s, i) => (
            <div key={i} className="flex space-x-2 mt-2">
              <Input
                value={s.name}
                onChange={(e) => updateSeason(i, "name", e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white flex-1"
              />
              <Select
                value={s.startMonthIndex.toString()}
                onValueChange={(v) => updateSeason(i, "startMonthIndex", v)}
              >
                <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={s.endMonthIndex.toString()}
                onValueChange={(v) => updateSeason(i, "endMonthIndex", v)}
              >
                <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          <Button
            type="button"
            className="mt-2 bg-green-600 hover:bg-green-500"
            onClick={addSeason}
          >
            + Add Season
          </Button>
        </div>

        {/* Confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              disabled={!validateForm()}
              className="w-full bg-yellow-600 hover:bg-yellow-500"
            >
              Review & Confirm
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-neutral-800 text-white border border-yellow-500">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirm creation of calendar {name}?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <p>
              Year Size: {yearSize} days, Months: {monthCount}, Week Size:{" "}
              {weekSize}
            </p>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="bg-red-600 text-white hover:bg-red-500">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-green-600 text-white hover:bg-green-500"
                onClick={handleSave}
              >
                Yes, Create
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
