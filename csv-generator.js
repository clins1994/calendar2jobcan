#!/usr/bin/env node
const moment = require("moment");
const fs = require("fs").promises;
const JapaneseHolidays = require("japanese-holidays");

// defaults
let filename = "./monthly.csv";
let now = moment();
let year, month;
let clockin = "10:00";
let clockout = "19:00";
let breaktime = "01:00";

// parse command line arguments
const args = process.argv.slice(2);

// If --current: use current month and year
if (args.includes("--current")) {
  year = now.year();
  month = now.month() + 1; // moment month is 0-based, so add 1
} else {
  // Default to previous month, handling January properly
  // If current month is January (0), previous month is December and previous year
  // So, take now.subtract(1, 'month'): in Jan 2026, gives Dec 2025
  let prevMonth = moment().subtract(1, "month");
  year = prevMonth.year();
  month = prevMonth.month() + 1; // month() is 0-based
}

// best effort!
function isHoliday(date) {
  return (
    ["Sat", "Sun"].indexOf(date.format("ddd")) !== -1 ||
    JapaneseHolidays.isHoliday(date.toDate())
  );
}

async function main() {
  let content = ["date,clockin,clockout,breaktime"];

  let iterator = 1;
  const lastDay = moment([year, month - 1, 1])
    .endOf("month")
    .date();

  while (iterator <= lastDay) {
    const cursor = moment([year, month - 1, iterator]);

    if (!isHoliday(cursor)) {
      content.push(
        [cursor.format("YYYY-MM-DD"), clockin, clockout, breaktime].join(","),
      );
    }

    iterator += 1;
  }

  await fs.writeFile(filename, content.join("\n"));
  console.log(`File ${filename} written.`);
  console.log(`Review extra working or swapped days !!`);
}

main().catch(console.error);
