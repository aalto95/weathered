import { beforeEach, describe, expect, test, vi } from 'vitest';
import { weatherAPI } from './api';

const { clients, create } = vi.hoisted(() => {
  const clients = new Map<string, { get: ReturnType<typeof vi.fn> }>();
  const create = vi.fn((config: { baseURL: string }) => {
    const client = { get: vi.fn() };
    clients.set(config.baseURL, client);
    return client;
  });

  return { clients, create };
});

vi.mock('axios', () => ({
  default: {
    create
  }
}));

const WEATHER_URL = 'https://api.open-meteo.com/v1/';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/';
const REVERSE_GEOCODING_URL = 'https://api.bigdatacloud.net/data/';

const client = (baseUrl: string) => {
  const axiosClient = clients.get(baseUrl);
  if (!axiosClient) {
    throw new Error(`No axios client registered for ${baseUrl}`);
  }
  return axiosClient;
};

const openMeteoResponse = (overrides: Record<string, unknown> = {}) => ({
  latitude: 52.512604,
  longitude: 13.419517,
  timezone: 'Europe/Berlin',
  current: {
    time: '2026-11-10T14:45',
    temperature_2m: 5,
    relative_humidity_2m: 81,
    apparent_temperature: 2.2,
    surface_pressure: 1007.9,
    weather_code: 3,
    cloud_cover: 90,
    wind_speed_10m: 6.6,
    wind_direction_10m: 299,
    wind_gusts_10m: 17.6,
    visibility: 26640,
    precipitation: 0.2
  },
  hourly: {
    time: ['2026-11-10T13:00', '2026-11-10T14:00', '2026-11-10T15:00'],
    temperature_2m: [4.5, 5, 5.5],
    weather_code: [2, 3, 61],
    precipitation_probability: [0, 10, 55]
  },
  daily: {
    time: ['2026-11-10', '2026-11-11'],
    weather_code: [3, 61],
    temperature_2m_max: [7, 9],
    temperature_2m_min: [1, 3],
    precipitation_probability_max: [20, 80],
    sunrise: ['2026-11-10T07:19', '2026-11-11T07:20'],
    sunset: ['2026-11-10T16:20', '2026-11-11T16:19']
  },
  ...overrides
});

const geocodingResult = (overrides: Record<string, unknown> = {}) => ({
  id: 2950159,
  name: 'Berlin',
  latitude: 52.52437,
  longitude: 13.41053,
  country_code: 'DE',
  ...overrides
});

beforeEach(() => {
  clients.forEach(({ get }) => get.mockReset());
});

describe('getCityByName', () => {
  test('geocodes the name and normalizes the forecast', async () => {
    client(GEOCODING_URL).get.mockResolvedValue({
      data: { results: [geocodingResult()] }
    });
    client(WEATHER_URL).get.mockResolvedValue({ data: openMeteoResponse() });

    const city = await weatherAPI.getCityByName('Berlin', 'de');

    expect(client(GEOCODING_URL).get).toHaveBeenCalledWith('search', {
      params: {
        name: 'Berlin',
        count: 1,
        language: 'de',
        format: 'json'
      }
    });
    expect(client(WEATHER_URL).get).toHaveBeenCalledWith('forecast', {
      params: expect.objectContaining({
        latitude: 52.52437,
        longitude: 13.41053,
        current: expect.stringContaining('weather_code'),
        hourly: expect.stringContaining('precipitation_probability'),
        daily: expect.stringContaining('temperature_2m_max'),
        timezone: 'auto'
      })
    });

    expect(city).toEqual({
      id: 2950159,
      name: 'Berlin',
      country: 'DE',
      coord: { lat: 52.512604, lon: 13.419517 },
      weather: [
        {
          code: 3,
          main: 'clouds',
          description: 'weather.overcast'
        }
      ],
      hourly: [
        {
          time: '2026-11-10T14:00',
          temperature: 5,
          code: 3,
          condition: 'clouds',
          precipitationProbability: 10
        },
        {
          time: '2026-11-10T15:00',
          temperature: 5.5,
          code: 61,
          condition: 'rain',
          precipitationProbability: 55
        }
      ],
      daily: [
        {
          date: '2026-11-10',
          code: 3,
          condition: 'clouds',
          tempMax: 7,
          tempMin: 1,
          precipitationProbability: 20
        },
        {
          date: '2026-11-11',
          code: 61,
          condition: 'rain',
          tempMax: 9,
          tempMin: 3,
          precipitationProbability: 80
        }
      ],
      updatedAt: '2026-11-10T14:45',
      main: {
        temp: 5,
        feels_like: 2.2,
        pressure: 1007.9,
        humidity: 81,
        precipitation: 0.2
      },
      visibility: 26640,
      wind: {
        speed: 6.6,
        deg: 299,
        gust: 17.6
      },
      clouds: {
        all: 90
      },
      sys: {
        sunrise: '2026-11-10T07:19',
        sunset: '2026-11-10T16:20'
      },
      timezone: 'Europe/Berlin'
    });
  });

  test('rejects when the geocoder finds no match', async () => {
    client(GEOCODING_URL).get.mockResolvedValue({ data: { results: [] } });

    await expect(weatherAPI.getCityByName('Nowhere')).rejects.toThrow(
      'No location found for "Nowhere"'
    );
    expect(client(WEATHER_URL).get).not.toHaveBeenCalled();
  });

  test('falls back to the generic condition for an unknown WMO code', async () => {
    client(GEOCODING_URL).get.mockResolvedValue({
      data: { results: [geocodingResult()] }
    });
    const response = openMeteoResponse();
    response.current.weather_code = 1234;
    client(WEATHER_URL).get.mockResolvedValue({ data: response });

    const city = await weatherAPI.getCityByName('Berlin');

    expect(city.weather[0]).toEqual({
      code: 1234,
      main: 'clouds',
      description: 'weather.unknown'
    });
  });
});

describe('getCityByCoords', () => {
  test('reverse geocodes the coordinates and fetches the forecast', async () => {
    client(REVERSE_GEOCODING_URL).get.mockResolvedValue({
      data: {
        city: 'Berlin',
        countryCode: 'DE'
      }
    });
    client(WEATHER_URL).get.mockResolvedValue({ data: openMeteoResponse() });

    const city = await weatherAPI.getCityByCoords(52.52, 13.41, 'en');

    expect(client(REVERSE_GEOCODING_URL).get).toHaveBeenCalledWith(
      'reverse-geocode-client',
      {
        params: {
          latitude: 52.52,
          longitude: 13.41,
          localityLanguage: 'en'
        }
      }
    );
    expect(client(WEATHER_URL).get).toHaveBeenCalledWith(
      'forecast',
      expect.objectContaining({
        params: expect.objectContaining({
          latitude: 52.52,
          longitude: 13.41
        })
      })
    );
    expect(city.id).toEqual(expect.any(Number));
    expect(city.name).toBe('Berlin');
    expect(city.country).toBe('DE');
  });

  test('still loads the weather when reverse geocoding fails', async () => {
    client(REVERSE_GEOCODING_URL).get.mockRejectedValue(
      new Error('blocked by client')
    );
    client(WEATHER_URL).get.mockResolvedValue({ data: openMeteoResponse() });

    const city = await weatherAPI.getCityByCoords(52.52, 13.41);

    expect(city.name).toBe('');
    expect(city.country).toBe('');
    expect(city.main.temp).toBe(5);
  });

  test('uses locality or subdivision when the city is missing', async () => {
    client(REVERSE_GEOCODING_URL).get.mockResolvedValue({
      data: {
        locality: 'Mitte',
        principalSubdivision: 'Berlin',
        countryCode: 'DE'
      }
    });
    client(WEATHER_URL).get.mockResolvedValue({ data: openMeteoResponse() });

    const city = await weatherAPI.getCityByCoords(52.52, 13.41);

    expect(city.name).toBe('Mitte');
  });
});

describe('getMultipleCities', () => {
  test('returns an empty list without a request when there are no places', async () => {
    await expect(weatherAPI.getMultipleCities([])).resolves.toEqual([]);
    expect(client(WEATHER_URL).get).not.toHaveBeenCalled();
  });

  test('maps a multi-location response back to each place', async () => {
    const berlin = {
      id: 1,
      name: 'Berlin',
      country: 'DE',
      latitude: 52.52,
      longitude: 13.41
    };
    const paris = {
      id: 2,
      name: 'Paris',
      country: 'FR',
      latitude: 48.85,
      longitude: 2.35
    };
    client(WEATHER_URL).get.mockResolvedValue({
      data: [
        openMeteoResponse(),
        openMeteoResponse({
          latitude: 48.853382,
          longitude: 2.355208,
          timezone: 'Europe/Paris'
        })
      ]
    });

    const cities = await weatherAPI.getMultipleCities([berlin, paris]);

    expect(client(WEATHER_URL).get).toHaveBeenCalledWith('forecast', {
      params: expect.objectContaining({
        latitude: '52.52,48.85',
        longitude: '13.41,2.35'
      })
    });
    expect(cities).toHaveLength(2);
    expect(cities[0]).toMatchObject({
      id: 1,
      name: 'Berlin',
      country: 'DE'
    });
    expect(cities[1]).toMatchObject({
      id: 2,
      name: 'Paris',
      country: 'FR',
      timezone: 'Europe/Paris'
    });
  });

  test('normalizes a single-object response into a list', async () => {
    client(WEATHER_URL).get.mockResolvedValue({ data: openMeteoResponse() });

    const cities = await weatherAPI.getMultipleCities([
      {
        id: 1,
        name: 'Berlin',
        country: 'DE',
        latitude: 52.52,
        longitude: 13.41
      }
    ]);

    expect(cities).toHaveLength(1);
    expect(cities[0].name).toBe('Berlin');
  });
});
