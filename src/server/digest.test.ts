import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  buildDailyNotification,
  buildTestNotification,
  describeWeatherCode,
  fetchWeatherSummaries
} from './digest';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('describeWeatherCode', () => {
  test('maps WMO codes to localized labels', () => {
    expect(describeWeatherCode(0, 'en')).toBe('Clear sky');
    expect(describeWeatherCode(61, 'en')).toBe('Rain');
    expect(describeWeatherCode(95, 'ru')).toBe('Гроза');
    expect(describeWeatherCode(3, 'ru')).toBe('Пасмурно');
  });

  test('falls back for unknown codes', () => {
    expect(describeWeatherCode(1234, 'en')).toBe('Unknown');
  });
});

describe('buildDailyNotification', () => {
  test('builds a single-city notification', () => {
    expect(
      buildDailyNotification(
        [{ name: 'Berlin', temperature: 5.4, code: 3 }],
        'en'
      )
    ).toEqual({
      title: 'Berlin · 5°C',
      body: 'Berlin: 5°C, Overcast',
      tag: 'weathered-daily',
      url: '/favorites'
    });
  });

  test('builds a multi-city digest and truncates after four', () => {
    const message = buildDailyNotification(
      [
        { name: 'Berlin', temperature: 5, code: 3 },
        { name: 'Paris', temperature: 12, code: 61 },
        { name: 'Rome', temperature: 18, code: 0 },
        { name: 'Oslo', temperature: -2, code: 71 },
        { name: 'Madrid', temperature: 20, code: 1 }
      ],
      'en'
    );

    expect(message.title).toBe('Weathered · Daily forecast');
    expect(message.body).toContain('Berlin: 5°C, Overcast');
    expect(message.body).toContain('Paris: 12°C, Rain');
    expect(message.body).toContain('and 1 more');
    expect(message.body).not.toContain('Madrid');
  });

  test('builds a Russian digest', () => {
    const message = buildDailyNotification(
      [
        { name: 'Берлин', temperature: 5, code: 3 },
        { name: 'Париж', temperature: 12, code: 61 }
      ],
      'ru'
    );

    expect(message.title).toBe('Weathered · Прогноз на день');
    expect(message.body).toContain('Берлин: 5°C, Пасмурно');
    expect(message.body).toContain('Париж: 12°C, Дождь');
  });

  test('handles an empty favorites list', () => {
    const message = buildDailyNotification([], 'en');
    expect(message.body).toContain('Add cities to your favorites');
  });
});

describe('buildTestNotification', () => {
  test('uses the subscriber language', () => {
    expect(buildTestNotification('en').title).toBe('Weathered · Test');
    expect(buildTestNotification('ru').title).toBe('Weathered · Проверка');
  });
});

describe('fetchWeatherSummaries', () => {
  test('requests every city and maps the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { current: { temperature_2m: 5.4, weather_code: 3 } },
        { current: { temperature_2m: 12.1, weather_code: 61 } }
      ]
    });
    vi.stubGlobal('fetch', fetchMock);

    const summaries = await fetchWeatherSummaries([
      {
        id: 1,
        name: 'Berlin',
        country: 'DE',
        latitude: 52.52,
        longitude: 13.41
      },
      {
        id: 2,
        name: 'Paris',
        country: 'FR',
        latitude: 48.85,
        longitude: 2.35
      }
    ]);

    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain('latitude=52.52%2C48.85');
    expect(url).toContain('longitude=13.41%2C2.35');
    expect(url).toContain('current=temperature_2m%2Cweather_code');
    expect(summaries).toEqual([
      { name: 'Berlin', temperature: 5.4, code: 3 },
      { name: 'Paris', temperature: 12.1, code: 61 }
    ]);
  });

  test('normalizes a single-object response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          current: { temperature_2m: 5, weather_code: 0 }
        })
      })
    );

    const summaries = await fetchWeatherSummaries([
      {
        id: 1,
        name: 'Berlin',
        country: 'DE',
        latitude: 52.52,
        longitude: 13.41
      }
    ]);

    expect(summaries).toEqual([{ name: 'Berlin', temperature: 5, code: 0 }]);
  });

  test('returns an empty list without a request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchWeatherSummaries([])).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('throws when Open-Meteo rejects the request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    await expect(
      fetchWeatherSummaries([
        {
          id: 1,
          name: 'Berlin',
          country: 'DE',
          latitude: 52.52,
          longitude: 13.41
        }
      ])
    ).rejects.toThrow('Open-Meteo request failed with 500');
  });
});
