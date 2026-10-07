---
name: Local timezone visit date intervals
description: Date interval filters (Today, Yesterday, Last N days) and visit fallback interval selection use the browser local timezone day boundaries instead of UTC.
targets:
  - src/utils/dates/helpers/dateIntervals.ts
  - test/utils/dates/helpers/dateIntervals.test.ts
---

- **REQ-1** When `intervalToDateRange('today')` runs with the clock at `2024-06-14T17:00:00.000Z` and the runtime time zone is `America/Los_Angeles`, the returned `startDate` is local midnight on 2024-06-14 (`2024-06-14T07:00:00.000Z`) and the returned `endDate` is the last instant of that local calendar day (`2024-06-15T06:59:59.999Z`), not the UTC calendar day for 2024-06-14.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-2** When `intervalToDateRange('yesterday')` runs with the same clock and time zone as REQ-1, the range covers the full previous local calendar day (2024-06-13 local midnight through 2024-06-13 local end-of-day), so a visit at `2024-06-14T06:00:00.000Z` (still 2024-06-13 evening in Los Angeles) falls inside yesterday’s range and a visit at `2024-06-14T07:30:00.000Z` (2024-06-14 morning in Los Angeles) does not.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-3** When `intervalToDateRange('last7Days')` runs with the clock at `2024-06-14T17:00:00.000Z` and the runtime time zone is `America/Los_Angeles`, `startDate` is local midnight seven local days before the current local day (2024-06-07 local start) and `endDate` matches REQ-1’s end of the current local day, so the span is eight local calendar days inclusive (seven days ago through today).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-4** For each of `last30Days`, `last90Days`, `last180Days`, and `last365Days`, `intervalToDateRange` sets `startDate` to local midnight N local days before the current local day and `endDate` to the end of the current local day, using the same local-day rules as REQ-3 with N equal to 30, 90, 180, and 365 respectively; with the clock at `2024-06-14T12:00:00.000Z` and time zone `Pacific/Auckland`, `last7Days` starts at Auckland local midnight on 2024-06-07 and ends at the end of 2024-06-14 Auckland local time.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-5** When the runtime time zone is `UTC`, `intervalToDateRange` for `today`, `yesterday`, and each Last N days option produces the same `startDate` and `endDate` values as before this change (UTC day boundaries derived from the current instant), so UTC users see no shift in filtered ranges.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-6** On the US daylight-saving spring-forward date 2024-03-10 in `America/Los_Angeles`, `intervalToDateRange('today')` with the clock at `2024-03-10T20:00:00.000Z` still uses local start and end of 2024-03-10 (a 23-hour civil day), and on the fall-back date 2024-11-03 with the clock at `2024-11-03T20:00:00.000Z` it uses local start and end of 2024-11-03 (a 25-hour civil day), without off-by-one-day errors at the boundaries.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-7** `dateToMatchingInterval` classifies visit timestamps against local day boundaries: with time zone `America/Los_Angeles` and the clock at `2024-06-14T17:00:00.000Z`, a visit at `2024-06-14T06:00:00.000Z` maps to `yesterday`, a visit at `2024-06-14T07:00:00.000Z` maps to `today`, and a visit at `2024-06-13T07:00:00.000Z` maps to `last7Days` rather than `yesterday`, matching the interval a user would expect when visits load with an empty result set and the UI falls back from the latest visit date.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-8** `toDateRange` continues to delegate interval keys to `intervalToDateRange`, so visit screens that resolve `today`, `yesterday`, or Last N days through `toDateRange` (including the visits stats loader and date range selector) send API date ranges aligned with REQ-1 through REQ-4.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

## Assumptions

- The user’s time zone is the JavaScript environment default (browser local zone in production; tests set `process.env.TZ` and/or mock `now()` so CI on UTC can still assert non-UTC zones).
- No new npm dependency is required; local day boundaries use `date-fns` `startOfDay` / `endOfDay` (or equivalent local-calendar logic) instead of the current UTC `getUTC*` day truncation in `dateIntervals.ts`.
- Custom absolute date ranges from the date picker and `calcPrevDateRange` behavior are unchanged; only preset interval resolution and `dateToMatchingInterval` are in scope.
- End-of-day precision may remain millisecond-based (last ms of the local day) consistent with existing interval ranges; API formatting via `formatIsoDate` stays as today.
