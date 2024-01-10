#!/usr/bin/env node

import { Command } from "commander";
import {
  compareAsc,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";

// Fetch holidays data from https://canada-holidays.ca/
async function getHolidays(year, province) {
  try {
    const response = await fetch(
      `https://canada-holidays.ca/api/v1/provinces/${province}?year=${year}`
    );

    if (!response.ok) {
      throw new Error(`Unable to fetch holidays for ${province} in ${year}`);
    }
    const result = await response.json();
    return {
      holidays: result.province.holidays,
      raw: result,
    };
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Display holidays in calendar format
function displayCalendar(year, month, holidays) {
  const firstDayOfMonth = startOfMonth(new Date(year, month - 1));
  const lastDayOfMonth = endOfMonth(new Date(year, month - 1));

  const firstDayOfWeek = getDay(firstDayOfMonth);

  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const calendarTable = Array.from({ length: 6 }, () =>
    Array(7).fill({ date: "", isHoliday: false })
  );
  const holidayDates = holidays.map((holiday) => holiday.date);
  let hasHoliday = false;
  daysInMonth.forEach((day, index) => {
    const row = Math.floor((index + firstDayOfWeek) / 7);
    const col = (index + firstDayOfWeek) % 7;
    const isHoliday = holidayDates.includes(format(day, "yyyy-MM-dd"));
    hasHoliday = hasHoliday || isHoliday;

    calendarTable[row][col] = {
      date: format(day, "dd"),
      isHoliday,
    };
  });

  // If this month has no holiday, don't display the calendar
  if (!hasHoliday) {
    return;
  }

  const monthYearHeader = `${format(firstDayOfMonth, "MMMM yyyy")}`;
  const padding = " ".repeat(Math.floor((21 - monthYearHeader.length) / 2));

  console.log(`\n${padding}${monthYearHeader}`);
  console.log("Su Mo Tu We Th Fr Sa");

  calendarTable.forEach((row) => {
    console.log(
      row
        .map((cell) => {
          if (cell.isHoliday) {
            return getColorCode(cell.date.padStart(2, " "), "red"); // Use red color to highlight holidays
          } else {
            return cell.date.padStart(2, " ");
          }
        })
        .join(" ")
    );
  });
}

async function main() {
  const program = new Command();
  program
    .option("-c, --calendar <calendar>", "Display holidays in calendar format")
    .option(
      "-p, --province <province>",
      "Specify the Canadian province to get holidays for that province"
    )
    .option(
      "-y, --year <year>",
      "Specify the year for which you want to check holidays"
    )
    .parse(process.argv);

  const options = program.opts();

  const today = new Date();
  const province = options.province || "BC"; // Default to BC
  const year = options.year || new Date().getFullYear(); // Default to current year

  const { raw, holidays } = await getHolidays(year, province);

  console.log(
    `\nList of statutory holidays in ${raw.province.nameEn}, ${year}:\n`
  );

  let isTodayInserted = false;
  holidays.forEach((holiday) => {
    if (!isTodayInserted) {
      const compare = compareAsc(format(today, "yyyy-MM-dd"), holiday.date);

      if (compare === -1) {
        printToday(today);
        isTodayInserted = true;
      } else if (compare === 0) {
        printColorfulText(`${printHoliday(holiday)} (Today)`, "green");
        isTodayInserted = true;
      }
    }
    printHoliday(holiday);
  });

  // If today is not displayed, print it at the end
  if (!isTodayInserted) {
    printToday(today);
  }

  if (options.calendar) {
    for (let month = 1; month <= 12; month++) {
      displayCalendar(year, month, holidays);
    }
  }
}

// Run the program
main();

// Utils =======================================================
function getColorCode(text, color) {
  const colorCodes = {
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
  };
  return `\x1b[${colorCodes[color]}m${text}\x1b[0m`;
}

function printColorfulText(text, color) {
  console.log(getColorCode(text, color));
}

function printToday(today) {
  printColorfulText(`${format(today, "yyyy-MM-dd")}: --> Today <--`, "green");
}

function printHoliday(holiday) {
  console.log(
    `${holiday.date}: [${holiday.federal ? "National" : "Provincial"}] ${
      holiday.nameEn
    }`
  );
}
// ===============================================================
