import React, { useEffect, useState } from "react";
import { CustomDateSystem, CustomDate, toCustomDate } from "@/lib/dateUtils";

interface Props {
  system: CustomDateSystem;
}

const CustomDateDisplay: React.FC<Props> = ({ system }) => {
  const [todayCustom, setTodayCustom] = useState<CustomDate | null>(null);

  useEffect(() => {
    if (system) {
      const today = new Date();
      const converted = toCustomDate(today, system);
      setTodayCustom(converted);
    }
  }, [system]);

  if (!system || !todayCustom) return null;

  // Format with ordinal suffix (1st, 2nd, 3rd, 4th...)
  const getOrdinal = (n: number) => {
    const j = n % 10,
      k = n % 100;
    if (j === 1 && k !== 11) return `${n}st`;
    if (j === 2 && k !== 12) return `${n}nd`;
    if (j === 3 && k !== 13) return `${n}rd`;
    return `${n}th`;
  };

  const dayName = system.daysOfWeek[todayCustom.day % system.weekSize] || "";
  const dayNumber = getOrdinal(todayCustom.day);
  const monthName = todayCustom.month;
  const yearNumber = todayCustom.year;
  const season = todayCustom.season ? ` (${todayCustom.season})` : "";

  return (
    <div className="p-4 rounded-lg bg-neutral-800 text-white text-xl font-semibold mt-4 text-center">
      {dayName} {dayNumber} {monthName} {yearNumber}
      {season}
    </div>
  );
};

export default CustomDateDisplay;
