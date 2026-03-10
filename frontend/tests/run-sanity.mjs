import assert from "node:assert/strict";

import {
  formatEventSchedule,
  formatTimeLabel,
  getUserInitials
} from "../src/utils/uiHelpers.mjs";

const checks = [
  {
    name: "getUserInitials returns uppercase initials and fallback",
    run() {
      assert.equal(getUserInitials("Smart Queue"), "SQ");
      assert.equal(getUserInitials("nishan"), "N");
      assert.equal(getUserInitials(""), "U");
      assert.equal(getUserInitials(null), "U");
    }
  },
  {
    name: "formatTimeLabel converts 24-hour time to 12-hour time",
    run() {
      assert.equal(formatTimeLabel("00:15"), "12:15 AM");
      assert.equal(formatTimeLabel("13:05"), "1:05 PM");
      assert.equal(formatTimeLabel("23:59"), "11:59 PM");
    }
  },
  {
    name: "formatTimeLabel preserves invalid values instead of broken output",
    run() {
      assert.equal(formatTimeLabel("bad-input"), "bad-input");
      assert.equal(formatTimeLabel("25:30"), "25:30");
      assert.equal(formatTimeLabel(undefined), "-");
    }
  },
  {
    name: "formatEventSchedule combines formatted dates and times",
    run() {
      const schedule = formatEventSchedule({
        startDate: "2030-05-01",
        endDate: "2030-05-02",
        startTime: "09:00",
        endTime: "17:30",
        formatDate: (value) => value
      });

      assert.deepEqual(schedule, {
        dateLabel: "2030-05-01 to 2030-05-02",
        timeLabel: "9:00 AM to 5:30 PM"
      });
    }
  }
];

let passed = 0;

for (const check of checks) {
  try {
    check.run();
    passed += 1;
    console.log(`PASS ${check.name}`);
  } catch (error) {
    console.error(`FAIL ${check.name}`);
    console.error(error);
    process.exit(1);
  }
}

console.log(`Completed ${passed} frontend sanity checks.`);
