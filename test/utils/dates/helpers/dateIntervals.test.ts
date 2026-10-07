import { endOfDay, format, formatISO, isWithinInterval, startOfDay, subDays } from 'date-fns';
import { cdp } from 'vitest/browser';
import { now, parseDate } from '../../../../src/utils/dates/helpers/date';
import type { DateInterval } from '../../../../src/utils/dates/helpers/dateIntervals';
import {
  calcPrevDateRange,
  dateRangeDaysDiff,
  dateRangeIsEmpty,
  dateToMatchingInterval,
  intervalToDateRange,
  isMandatoryStartDateRange,
  rangeIsInterval,
  rangeOrIntervalToString,
  toDateRange,
} from '../../../../src/utils/dates/helpers/dateIntervals';

describe('date-types', () => {
  const currentDate = now();
  const daysBack = (days: number) => subDays(currentDate, days);

  describe('dateRangeIsEmpty', () => {
    it.each([
      [undefined, true],
      [{}, true],
      [{ startDate: null }, true],
      [{ endDate: null }, true],
      [{ startDate: null, endDate: null }, true],
      [{ startDate: undefined }, true],
      [{ endDate: undefined }, true],
      [{ startDate: undefined, endDate: undefined }, true],
      [{ startDate: undefined, endDate: null }, true],
      [{ startDate: null, endDate: undefined }, true],
      [{ startDate: currentDate }, false],
      [{ endDate: currentDate }, false],
      [{ startDate: currentDate, endDate: currentDate }, false],
    ])('returns proper result', (dateRange, expectedResult) => {
      expect(dateRangeIsEmpty(dateRange)).toEqual(expectedResult);
    });
  });

  describe('rangeIsInterval', () => {
    it.each([
      [undefined, false],
      [{}, false],
      ['today' as DateInterval, true],
      ['yesterday' as DateInterval, true],
    ])('returns proper result', (range, expectedResult) => {
      expect(rangeIsInterval(range)).toEqual(expectedResult);
    });
  });

  describe('rangeOrIntervalToString', () => {
    it.each([
      [undefined, undefined],
      ['today' as DateInterval, 'Today'],
      ['yesterday' as DateInterval, 'Yesterday'],
      ['last7Days' as DateInterval, 'Last 7 days'],
      ['last30Days' as DateInterval, 'Last 30 days'],
      ['last90Days' as DateInterval, 'Last 90 days'],
      ['last180Days' as DateInterval, 'Last 180 days'],
      ['last365Days' as DateInterval, 'Last 365 days'],
      [{}, undefined],
      [{ startDate: null }, undefined],
      [{ endDate: null }, undefined],
      [{ startDate: null, endDate: null }, undefined],
      [{ startDate: undefined }, undefined],
      [{ endDate: undefined }, undefined],
      [{ startDate: undefined, endDate: undefined }, undefined],
      [{ startDate: undefined, endDate: null }, undefined],
      [{ startDate: null, endDate: undefined }, undefined],
      [{ startDate: parseDate('2020-01-01', 'yyyy-MM-dd') }, 'Since 2020-01-01'],
      [{ endDate: parseDate('2020-01-01', 'yyyy-MM-dd') }, 'Until 2020-01-01'],
      [
        { startDate: parseDate('2020-01-01', 'yyyy-MM-dd'), endDate: parseDate('2021-02-02', 'yyyy-MM-dd') },
        '2020-01-01 - 2021-02-02',
      ],
    ])('returns proper result', (range, expectedValue) => {
      expect(rangeOrIntervalToString(range)).toEqual(expectedValue);
    });
  });

  describe('intervalToDateRange', () => {
    const formatted = (date?: Date | null): string | undefined => (!date ? undefined : format(date, 'yyyy-MM-dd'));

    it.each([
      [undefined, undefined, undefined],
      ['today' as const, currentDate, currentDate],
      ['yesterday' as const, daysBack(1), daysBack(1)],
      ['last7Days' as const, daysBack(7), currentDate],
      ['last30Days' as const, daysBack(30), currentDate],
      ['last90Days' as const, daysBack(90), currentDate],
      ['last180Days' as const, daysBack(180), currentDate],
      ['last365Days' as const, daysBack(365), currentDate],
    ])('returns proper result', (interval, expectedStartDate, expectedEndDate) => {
      const { startDate, endDate } = intervalToDateRange(interval);

      expect(formatted(expectedStartDate)).toEqual(formatted(startDate));
      expect(formatted(expectedEndDate)).toEqual(formatted(endDate));
    });
  });

  describe('dateToMatchingInterval', () => {
    it.each([
      [startOfDay(currentDate), 'today'],
      [currentDate, 'today'],
      [formatISO(currentDate), 'today'],
      [daysBack(1), 'yesterday'],
      [endOfDay(daysBack(1)), 'yesterday'],
      [daysBack(2), 'last7Days'],
      [daysBack(7), 'last7Days'],
      [startOfDay(daysBack(7)), 'last7Days'],
      [daysBack(18), 'last30Days'],
      [daysBack(29), 'last30Days'],
      [daysBack(58), 'last90Days'],
      [startOfDay(daysBack(90)), 'last90Days'],
      [daysBack(120), 'last180Days'],
      [daysBack(250), 'last365Days'],
      [daysBack(366), 'all'],
      [formatISO(daysBack(500)), 'all'],
    ])('returns the first interval which contains provided date', (date, expectedInterval) => {
      expect(dateToMatchingInterval(date)).toEqual(expectedInterval);
    });
  });

  describe('toDateRange', () => {
    it.each([
      ['today' as const, intervalToDateRange('today')],
      ['yesterday' as const, intervalToDateRange('yesterday')],
      ['last7Days' as const, intervalToDateRange('last7Days')],
      ['last30Days' as const, intervalToDateRange('last30Days')],
      ['last90Days' as const, intervalToDateRange('last90Days')],
      ['last180Days' as const, intervalToDateRange('last180Days')],
      ['last365Days' as const, intervalToDateRange('last365Days')],
      ['all' as const, intervalToDateRange('all')],
      [{}, {}],
      [{ startDate: currentDate }, { startDate: currentDate }],
      [{ endDate: currentDate }, { endDate: currentDate }],
      [
        { startDate: daysBack(10), endDate: currentDate },
        { startDate: daysBack(10), endDate: currentDate },
      ],
    ])('returns properly parsed interval or range', (rangeOrInterval, expectedResult) => {
      expect(toDateRange(rangeOrInterval)).toEqual(expectedResult);
    });
  });

  describe('isMandatoryStartDateRange', () => {
    it.each([
      [undefined, false],
      [{}, false],
      [{ startDate: null }, false],
      [{ endDate: null }, false],
      [{ startDate: null, endDate: null }, false],
      [{ startDate: new Date() }, true],
      [{ endDate: new Date() }, false],
      [{ startDate: new Date(), endDate: null }, true],
      [{ startDate: null, endDate: new Date() }, false],
      [{ startDate: new Date(), endDate: new Date() }, true],
    ])('returns true for semi-strict date ranges', (dateRange, isStrict) => {
      expect(isMandatoryStartDateRange(dateRange)).toEqual(isStrict);
    });
  });

  describe('calcPrevDateRange', () => {
    it.each([
      [
        { startDate: new Date('2024-01-10 00:00:00'), endDate: new Date('2024-01-18 23:59:59') },
        '2024-01-01 00:00:00',
        '2024-01-09 23:59:59',
      ],
      [
        { startDate: new Date('2024-01-18'), endDate: new Date('2024-01-18') },
        '2024-01-17 00:00:00',
        '2024-01-17 23:59:59',
      ],
      [
        { startDate: new Date('2024-02-27 23:00:00'), endDate: new Date('2024-05-02 01:00:00') },
        '2023-12-23 00:00:00',
        '2024-02-26 23:59:59',
      ],
      [
        { startDate: subDays(currentDate, 3) },
        `${format(subDays(currentDate, 7), 'yyyy-MM-dd')} 00:00:00`,
        `${format(subDays(currentDate, 4), 'yyyy-MM-dd')} 23:59:59`,
      ],
    ])('calculates previous date range', (dateRange, expectedStartDate, expectedEndDate) => {
      const { startDate, endDate } = calcPrevDateRange(dateRange);

      expect(format(startDate, 'yyyy-MM-dd HH:mm:ss')).toEqual(expectedStartDate);
      expect(format(endDate, 'yyyy-MM-dd HH:mm:ss')).toEqual(expectedEndDate);
    });
  });

  describe('dateRangeDaysDiff', () => {
    it.each([
      [{ startDate: new Date('2024-01-10 00:00:00'), endDate: new Date('2024-01-18 23:59:59') }, 8],
      [{ startDate: new Date('2024-02-27 23:00:00'), endDate: new Date('2024-05-02 01:00:00') }, 64],
      [{ startDate: subDays(currentDate, 5) }, 5],
      [undefined, undefined],
      [{}, undefined],
      [{ endDate: new Date() }, undefined],
    ])('returns the difference in days for a dateRange', (dateRange, expectedDays) => {
      expect(dateRangeDaysDiff(dateRange)).toEqual(expectedDays);
    });
  });

  describe('local timezone day boundaries', () => {
    type CdpSessionWithSend = { send: (method: string, params?: Record<string, string>) => Promise<unknown> };

    const cdpSession = (): CdpSessionWithSend => cdp() as CdpSessionWithSend;

    const emulateTimezone = async (timezoneId: string) => {
      await cdpSession().send('Emulation.setTimezoneOverride', { timezoneId });
    };

    const clearTimezoneOverride = async () => {
      await cdpSession().send('Emulation.setTimezoneOverride', { timezoneId: '' });
    };

    afterEach(async () => {
      vi.useRealTimers();
      await clearTimezoneOverride();
    });

    describe('REQ-1', () => {
      beforeEach(async () => {
        await emulateTimezone('America/Los_Angeles');
        vi.setSystemTime(new Date('2024-06-14T17:00:00.000Z'));
      });

      it('REQ-1 intervalToDateRange(today) uses America/Los_Angeles local day boundaries', () => {
        const { startDate, endDate } = intervalToDateRange('today');

        expect(startDate?.toISOString()).toEqual('2024-06-14T07:00:00.000Z');
        expect(endDate?.toISOString()).toEqual('2024-06-15T06:59:59.999Z');
      });
    });

    describe('REQ-2', () => {
      beforeEach(async () => {
        await emulateTimezone('America/Los_Angeles');
        vi.setSystemTime(new Date('2024-06-14T17:00:00.000Z'));
      });

      it('REQ-2 intervalToDateRange(yesterday) covers the previous local calendar day in America/Los_Angeles', () => {
        const { startDate, endDate } = intervalToDateRange('yesterday');

        expect(startDate?.toISOString()).toEqual('2024-06-13T07:00:00.000Z');
        expect(endDate?.toISOString()).toEqual('2024-06-14T06:59:59.999Z');

        const stillYesterdayEvening = new Date('2024-06-14T06:00:00.000Z');
        const alreadyTodayMorning = new Date('2024-06-14T07:30:00.000Z');

        expect(isWithinInterval(stillYesterdayEvening, { start: startDate!, end: endDate! })).toEqual(true);
        expect(isWithinInterval(alreadyTodayMorning, { start: startDate!, end: endDate! })).toEqual(false);
      });
    });

    describe('REQ-3', () => {
      beforeEach(async () => {
        await emulateTimezone('America/Los_Angeles');
        vi.setSystemTime(new Date('2024-06-14T17:00:00.000Z'));
      });

      it('REQ-3 intervalToDateRange(last7Days) spans seven local days ago through today in America/Los_Angeles', () => {
        const { startDate, endDate } = intervalToDateRange('last7Days');

        expect(startDate?.toISOString()).toEqual('2024-06-07T07:00:00.000Z');
        expect(endDate?.toISOString()).toEqual('2024-06-15T06:59:59.999Z');
      });
    });

    describe('REQ-4', () => {
      const aucklandEndOfJune14 = '2024-06-14T11:59:59.999Z';

      beforeEach(async () => {
        await emulateTimezone('Pacific/Auckland');
        vi.setSystemTime(new Date('2024-06-14T12:00:00.000Z'));
      });

      it('REQ-4 intervalToDateRange(last7Days) uses Pacific/Auckland local day boundaries', () => {
        const { startDate, endDate } = intervalToDateRange('last7Days');

        expect(startDate?.toISOString()).toEqual('2024-06-06T12:00:00.000Z');
        expect(endDate?.toISOString()).toEqual(aucklandEndOfJune14);
      });

      it.each([
        ['last30Days' as const, '2024-05-14T12:00:00.000Z'],
        ['last90Days' as const, '2024-03-15T11:00:00.000Z'],
        ['last180Days' as const, '2023-12-16T11:00:00.000Z'],
        ['last365Days' as const, '2023-06-14T12:00:00.000Z'],
      ])('REQ-4 intervalToDateRange(%s) uses Pacific/Auckland local day boundaries', (interval, expectedStart) => {
        const { startDate, endDate } = intervalToDateRange(interval);

        expect(startDate?.toISOString()).toEqual(expectedStart);
        expect(endDate?.toISOString()).toEqual(aucklandEndOfJune14);
      });
    });

    describe('REQ-5', () => {
      beforeEach(async () => {
        await emulateTimezone('UTC');
        vi.setSystemTime(new Date('2024-06-14T17:00:00.000Z'));
      });

      it.each([
        ['today' as const, '2024-06-14T00:00:00.000Z', '2024-06-14T23:59:59.999Z'],
        ['yesterday' as const, '2024-06-13T00:00:00.000Z', '2024-06-13T23:59:59.999Z'],
        ['last7Days' as const, '2024-06-07T00:00:00.000Z', '2024-06-14T23:59:59.999Z'],
        ['last30Days' as const, '2024-05-15T00:00:00.000Z', '2024-06-14T23:59:59.999Z'],
        ['last90Days' as const, '2024-03-16T00:00:00.000Z', '2024-06-14T23:59:59.999Z'],
        ['last180Days' as const, '2023-12-17T00:00:00.000Z', '2024-06-14T23:59:59.999Z'],
        ['last365Days' as const, '2023-06-15T00:00:00.000Z', '2024-06-14T23:59:59.999Z'],
      ])('REQ-5 intervalToDateRange(%s) keeps UTC calendar day boundaries', (interval, expectedStart, expectedEnd) => {
        const { startDate, endDate } = intervalToDateRange(interval);

        expect(startDate?.toISOString()).toEqual(expectedStart);
        expect(endDate?.toISOString()).toEqual(expectedEnd);
      });
    });

    describe('REQ-6', () => {
      beforeEach(async () => {
        await emulateTimezone('America/Los_Angeles');
      });

      it('REQ-6 intervalToDateRange(today) handles US daylight-saving spring-forward local day length', () => {
        vi.setSystemTime(new Date('2024-03-10T20:00:00.000Z'));

        const { startDate, endDate } = intervalToDateRange('today');

        expect(startDate?.toISOString()).toEqual('2024-03-10T08:00:00.000Z');
        expect(endDate?.toISOString()).toEqual('2024-03-11T06:59:59.999Z');
      });

      it('REQ-6 intervalToDateRange(today) handles US daylight-saving fall-back local day length', () => {
        vi.setSystemTime(new Date('2024-11-03T20:00:00.000Z'));

        const { startDate, endDate } = intervalToDateRange('today');

        expect(startDate?.toISOString()).toEqual('2024-11-03T07:00:00.000Z');
        expect(endDate?.toISOString()).toEqual('2024-11-04T07:59:59.999Z');
      });
    });

    describe('REQ-7', () => {
      beforeEach(async () => {
        await emulateTimezone('America/Los_Angeles');
        vi.setSystemTime(new Date('2024-06-14T17:00:00.000Z'));
      });

      it('REQ-7 dateToMatchingInterval classifies visits using America/Los_Angeles local day boundaries', () => {
        expect(dateToMatchingInterval(new Date('2024-06-14T06:00:00.000Z'))).toEqual('yesterday');
        expect(dateToMatchingInterval(new Date('2024-06-14T07:00:00.000Z'))).toEqual('today');
        expect(dateToMatchingInterval(new Date('2024-06-13T07:00:00.000Z'))).toEqual('last7Days');
      });
    });

    describe('REQ-8', () => {
      beforeEach(async () => {
        await emulateTimezone('America/Los_Angeles');
        vi.setSystemTime(new Date('2024-06-14T17:00:00.000Z'));
      });

      it.each([
        ['today' as const, '2024-06-14T07:00:00.000Z', '2024-06-15T06:59:59.999Z'],
        ['yesterday' as const, '2024-06-13T07:00:00.000Z', '2024-06-14T06:59:59.999Z'],
        ['last7Days' as const, '2024-06-07T07:00:00.000Z', '2024-06-15T06:59:59.999Z'],
      ])(
        'REQ-8 toDateRange(%s) delegates to intervalToDateRange with local timezone boundaries',
        (interval, expectedStart, expectedEnd) => {
          expect(toDateRange(interval)).toEqual(intervalToDateRange(interval));

          const { startDate, endDate } = toDateRange(interval);
          expect(startDate?.toISOString()).toEqual(expectedStart);
          expect(endDate?.toISOString()).toEqual(expectedEnd);
        },
      );
    });
  });
});
