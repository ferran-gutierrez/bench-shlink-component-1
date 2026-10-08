---
name: Local timezone date interval filters for visits
description: Preset visit date filters (Today, Yesterday, Last N days) and interval matching for empty-result fallback use the user's local calendar-day boundaries instead of UTC, including on DST transition days, with regression tests that stay stable on UTC CI.
targets:
  - src/utils/dates/helpers/dateIntervals.ts
  - test/utils/dates/helpers/dateIntervals.test.ts
---

- **REQ-1** When `intervalToDateRange('today')` runs while the current instant is `2024-06-14T17:00:00.000Z` (10:00 on June 14 in `America/Los_Angeles`), it returns `startDate` `2024-06-14T07:00:00.000Z` and `endDate` `2024-06-15T06:59:59.999Z` (local midnight through end of June 14 in that zone).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-2** When `intervalToDateRange('yesterday')` runs with the same frozen current instant as REQ-1, it returns `startDate` `2024-06-13T07:00:00.000Z` and `endDate` `2024-06-14T06:59:59.999Z` (the full previous local calendar day in `America/Los_Angeles`).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-3** When `intervalToDateRange('last7Days')` runs with the same frozen current instant as REQ-1, it returns `startDate` `2024-06-07T07:00:00.000Z` and `endDate` `2024-06-15T06:59:59.999Z` (local midnight seven days before the current local day through the end of the current local day).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-4** When `intervalToDateRange('last30Days')`, `intervalToDateRange('last90Days')`, `intervalToDateRange('last180Days')`, and `intervalToDateRange('last365Days')` run with the same frozen current instant as REQ-1, each range starts at local midnight exactly N calendar days before the current local day (N = 30, 90, 180, 365 respectively) and ends at the same local end-of-day instant as REQ-1.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-5** When `dateToMatchingInterval` receives `2024-06-15T02:00:00.000Z` (19:00 on June 14 in `America/Los_Angeles`) while the current instant is frozen to REQ-1, it returns `'today'` rather than `'yesterday'` or a wider interval.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-6** When `dateToMatchingInterval` receives `2024-06-14T06:00:00.000Z` (23:00 on June 13 in `America/Los_Angeles`) while the current instant is frozen to REQ-1, it returns `'yesterday'` rather than `'today'`.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-7** When the current instant is frozen to `2024-03-10T18:30:00.000Z` (10:30 on the US spring-forward Sunday in `America/Los_Angeles`), `intervalToDateRange('today')` returns `startDate` `2024-03-10T08:00:00.000Z` and `endDate` `2024-03-11T06:59:59.999Z` (that local calendar day despite the missing hour).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-8** When the current instant is frozen to `2024-11-03T09:30:00.000Z` (01:30 on the US fall-back Sunday in `America/Los_Angeles`), `intervalToDateRange('today')` returns `startDate` `2024-11-03T07:00:00.000Z` and `endDate` `2024-11-04T07:59:59.999Z` (that local calendar day despite the repeated hour).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-9** Preset interval resolution uses `date-fns` `startOfDay` and `endOfDay` on the local timeline (via the environment default time zone) instead of deriving day bounds from UTC year/month/date fields, so a user whose local offset is zero gets the same numeric boundaries as before this change for any frozen instant.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-10** With the current instant frozen to `2024-06-14T12:00:00.000Z`, a visit timestamp `2024-06-15T02:00:00.000Z` falls inside `intervalToDateRange('today')` (inclusive bounds), whereas it falls outside the range produced by UTC-midnight day boundaries anchored to that same frozen instant.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

## Assumptions

- “User local time zone” means the JavaScript environment default time zone (`Date` local getters and `date-fns` `startOfDay` / `endOfDay`), matching the browser where the web client runs; no new time-zone selector or `Intl` override API is added.
- Regression tests pin the environment time zone to `America/Los_Angeles` (for example with `process.env.TZ` in the test file or an equivalent approach that works under Vitest browser mode) and freeze the clock with Vitest fake timers so expected `Date` instants in requirements stay valid on CI runners that default to UTC.
- REQ-10 compares against UTC-midnight bounds computed in the test (not production code) purely to lock the regression described in the task; production code must not retain a separate UTC code path.
- Custom date ranges, `calcPrevDateRange`, `DateRangeSelector` labels, and API query serialization outside `intervalToDateRange` / `dateToMatchingInterval` are unchanged except where they consume the corrected ranges.
- Changing `vite.config.ts` or global Playwright `timezoneId` defaults is out of scope; per-file time zone pinning in tests is sufficient.
- No new npm dependencies are required; `date-fns` already in use supplies `startOfDay` and `endOfDay`.
