import { DateTime } from 'luxon';
import { describe, expect, test } from 'vitest';
import {
  isDueNow,
  isValidTime,
  isValidTimezone,
  localDateKey
} from './schedule';

const preferences = {
  time: '08:00',
  timezone: 'Europe/Berlin',
  lastSentDate: undefined as string | undefined
};

const at = (iso: string, zone = 'utc') => DateTime.fromISO(iso, { zone });

describe('isValidTime', () => {
  test.each(['00:00', '08:30', '23:59'])('accepts %s', (time) => {
    expect(isValidTime(time)).toBe(true);
  });

  test.each(['24:00', '8:00', '08:60', '08:00:00', '', null, 8])(
    'rejects %s',
    (time) => {
      expect(isValidTime(time)).toBe(false);
    }
  );
});

describe('isValidTimezone', () => {
  test('accepts IANA zones', () => {
    expect(isValidTimezone('Europe/Berlin')).toBe(true);
    expect(isValidTimezone('America/New_York')).toBe(true);
  });

  test('rejects invalid zones', () => {
    expect(isValidTimezone('Mars/Olympus')).toBe(false);
    expect(isValidTimezone('')).toBe(false);
    expect(isValidTimezone(null)).toBe(false);
  });
});

describe('isDueNow', () => {
  test('is due at the chosen local time', () => {
    expect(isDueNow(at('2026-11-10T07:00:00'), preferences)).toBe(true);
  });

  test('is not due before the chosen local time', () => {
    expect(isDueNow(at('2026-11-10T06:59:00'), preferences)).toBe(false);
  });

  test('is due inside the grace window', () => {
    expect(isDueNow(at('2026-11-10T07:45:00'), preferences)).toBe(true);
  });

  test('is still due after 90 minutes', () => {
    expect(isDueNow(at('2026-11-10T08:30:00'), preferences)).toBe(true);
  });

  test('is not due after the grace window', () => {
    expect(isDueNow(at('2026-11-10T09:01:00'), preferences)).toBe(false);
  });

  test('does not fire twice on the same local date', () => {
    expect(
      isDueNow(at('2026-11-10T07:30:00'), {
        ...preferences,
        lastSentDate: '2026-11-10'
      })
    ).toBe(false);
  });

  test('handles a different timezone', () => {
    expect(
      isDueNow(at('2026-11-10T13:00:00'), {
        time: '08:00',
        timezone: 'America/New_York',
        lastSentDate: undefined
      })
    ).toBe(true);
  });

  test('handles daylight saving time', () => {
    // Berlin is UTC+2 in July, so 06:00 UTC is 08:00 local.
    expect(isDueNow(at('2026-07-15T06:00:00'), preferences)).toBe(true);
    expect(isDueNow(at('2026-07-15T05:59:00'), preferences)).toBe(false);
  });
});

describe('localDateKey', () => {
  test('returns the date in the subscriber timezone', () => {
    expect(localDateKey(at('2026-11-10T23:30:00'), 'Europe/Berlin')).toBe(
      '2026-11-11'
    );
    expect(localDateKey(at('2026-11-10T23:30:00'), 'America/New_York')).toBe(
      '2026-11-10'
    );
  });
});
