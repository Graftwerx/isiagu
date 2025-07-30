export type CustomMonth = {
  name: string;
  days: number;
  weeks: number;
};

export type CustomSeason = {
  name: string;
  startMonthIndex: number;
  endMonthIndex: number;
};

export type CustomStartDate = {
  dayIndex: number;      // Index of custom weekday (0 = first)
  dayOfMonth: number;    // 1-based day in custom month
  monthIndex: number;    // 0-based month index
  yearNumber: number;    // Starting custom year
};

export type CustomDateSystem = {
  name: string;
  yearSize: number;
  monthCount: number;
  weekSize: number;
  months: CustomMonth[];
  seasons: CustomSeason[];
  gregorianAnchor: Date;
  startDate: CustomStartDate;
  daysOfWeek: string[];
};

export type CustomDate = {
  day: number;
  month: string;
  year: number;
  season: string;
};

/**
 * Auto-generate months evenly over yearSize with extra days
 */
export function generateMonths(
  yearSize: number,
  monthCount: number,
  weekSize: number
): CustomMonth[] {
  const baseDays = Math.floor(yearSize / monthCount);
  const extraDays = yearSize % monthCount;

  const months: CustomMonth[] = [];
  for (let i = 0; i < monthCount; i++) {
    const days = baseDays + (i < extraDays ? 1 : 0);
    const weeks = Math.floor(days / weekSize);
    months.push({ name: `Month ${i + 1}`, days, weeks });
  }
  return months;
}

/**
 * Convert Gregorian date → Custom date, respecting custom start date
 */
export function toCustomDate(
  gregorianDate: Date,
  system: CustomDateSystem
): CustomDate {
  const { gregorianAnchor, yearSize, months, seasons, startDate } = system;

  // 1. Days difference from Gregorian anchor
  const daysDiff = Math.floor(
    (gregorianDate.getTime() - gregorianAnchor.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 2. Initial offset from custom start date
  let startOffset = (startDate.dayOfMonth || 1) - 1;
  for (let i = 0; i < startDate.monthIndex; i++) {
    startOffset += months[i].days;
  }

  // 3. Total days since custom calendar "epoch"
  let totalDays = startOffset + daysDiff;
  let year = startDate.yearNumber;

  // 4. Normalize year and day-of-year
  while (totalDays >= yearSize) {
    totalDays -= yearSize;
    year++;
  }
  while (totalDays < 0) {
    totalDays += yearSize;
    year--;
  }

  // 5. Determine month & day
  let dayOfYear = totalDays;
  let monthIndex = 0;
  for (let i = 0; i < months.length; i++) {
    if (dayOfYear < months[i].days) {
      monthIndex = i;
      break;
    }
    dayOfYear -= months[i].days;
  }

  const day = dayOfYear + 1;
  const month = months[monthIndex].name;

  // 6. Determine season (if any)
  const season =
    seasons.find(
      (s) =>
        (s.startMonthIndex <= s.endMonthIndex &&
          monthIndex >= s.startMonthIndex &&
          monthIndex <= s.endMonthIndex) ||
        (s.startMonthIndex > s.endMonthIndex &&
          (monthIndex >= s.startMonthIndex || monthIndex <= s.endMonthIndex))
    )?.name || "";

  return { day, month, year, season };
}

/**
 * Format as: "Day Month Year (Season)"
 */
export function formatCustomDate(date: CustomDate): string {
  return `${date.day} ${date.month} ${date.year}${
    date.season ? ` (${date.season})` : ""
  }`;
}





