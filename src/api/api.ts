import axios from 'axios';
import {
  DailyForecast,
  FavoriteLocation,
  HourlyForecast,
  WeatherModel
} from '../models/weather.model';
import { getWmoInfo } from './wmo';

const weatherClient = axios.create({
  baseURL: 'https://api.open-meteo.com/v1/'
});

const geocodingClient = axios.create({
  baseURL: 'https://geocoding-api.open-meteo.com/v1/'
});

const reverseGeocodingClient = axios.create({
  baseURL: 'https://api.bigdatacloud.net/data/'
});

const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'surface_pressure',
  'weather_code',
  'cloud_cover',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'visibility',
  'precipitation'
].join(',');

const HOURLY_FIELDS = [
  'temperature_2m',
  'weather_code',
  'precipitation_probability'
].join(',');

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'sunrise',
  'sunset'
].join(',');

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country_code: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ReverseGeocodingResponse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  countryCode?: string;
}

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    surface_pressure: number;
    weather_code: number;
    cloud_cover: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    visibility: number;
    precipitation: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: (number | null)[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
    sunrise: string[];
    sunset: string[];
  };
}

const toHourlyForecast = (data: OpenMeteoResponse): HourlyForecast[] => {
  const { time } = data.hourly;
  let startIndex = 0;

  time.forEach((value, index) => {
    if (value <= data.current.time) {
      startIndex = index;
    }
  });

  return time.slice(startIndex, startIndex + 24).map((value, offset) => {
    const index = startIndex + offset;
    const code = data.hourly.weather_code[index];

    return {
      time: value,
      temperature: data.hourly.temperature_2m[index],
      code,
      condition: getWmoInfo(code).animation,
      precipitationProbability:
        data.hourly.precipitation_probability[index] ?? 0
    };
  });
};

const toDailyForecast = (data: OpenMeteoResponse): DailyForecast[] =>
  data.daily.time.map((date, index) => {
    const code = data.daily.weather_code[index];

    return {
      date,
      code,
      condition: getWmoInfo(code).animation,
      tempMax: data.daily.temperature_2m_max[index],
      tempMin: data.daily.temperature_2m_min[index],
      precipitationProbability:
        data.daily.precipitation_probability_max[index] ?? 0
    };
  });

const toWeatherModel = (
  data: OpenMeteoResponse,
  place: FavoriteLocation
): WeatherModel => {
  const condition = getWmoInfo(data.current.weather_code);

  return {
    id: place.id,
    name: place.name,
    country: place.country,
    coord: {
      lat: data.latitude,
      lon: data.longitude
    },
    weather: [
      {
        code: data.current.weather_code,
        main: condition.animation,
        description: condition.description
      }
    ],
    hourly: toHourlyForecast(data),
    daily: toDailyForecast(data),
    updatedAt: data.current.time,
    main: {
      temp: data.current.temperature_2m,
      feels_like: data.current.apparent_temperature,
      pressure: data.current.surface_pressure,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation
    },
    visibility: data.current.visibility,
    wind: {
      speed: data.current.wind_speed_10m,
      deg: data.current.wind_direction_10m,
      gust: data.current.wind_gusts_10m
    },
    clouds: {
      all: data.current.cloud_cover
    },
    sys: {
      sunrise: data.daily.sunrise[0],
      sunset: data.daily.sunset[0]
    },
    timezone: data.timezone
  };
};

const getWeather = async (
  lat: number,
  lon: number,
  place: FavoriteLocation
) => {
  const { data } = await weatherClient.get<OpenMeteoResponse>('forecast', {
    params: {
      latitude: lat,
      longitude: lon,
      current: CURRENT_FIELDS,
      hourly: HOURLY_FIELDS,
      daily: DAILY_FIELDS,
      timezone: 'auto'
    }
  });

  return toWeatherModel(data, place);
};

const searchPlace = async (
  city: string,
  lang: string
): Promise<FavoriteLocation> => {
  const { data } = await geocodingClient.get<GeocodingResponse>('search', {
    params: {
      name: city,
      count: 1,
      language: lang,
      format: 'json'
    }
  });

  const result = data.results?.[0];
  if (!result) {
    throw new Error(`No location found for "${city}"`);
  }

  return {
    id: result.id,
    name: result.name,
    country: result.country_code,
    latitude: result.latitude,
    longitude: result.longitude
  };
};

// Derive a stable id for coordinates that don't come from the geocoding API.
const coordinateId = (lat: number, lon: number) =>
  Math.round((lat + 90) * 1_000_000) * 1_000_000 +
  Math.round((lon + 180) * 1_000_000);

const reverseGeocode = async (
  lat: number,
  lon: number,
  lang: string
): Promise<FavoriteLocation> => {
  const fallback: FavoriteLocation = {
    id: coordinateId(lat, lon),
    name: '',
    country: '',
    latitude: lat,
    longitude: lon
  };

  try {
    const { data } = await reverseGeocodingClient.get<ReverseGeocodingResponse>(
      'reverse-geocode-client',
      {
        params: {
          latitude: lat,
          longitude: lon,
          localityLanguage: lang
        }
      }
    );

    return {
      ...fallback,
      name:
        data.city ||
        data.locality ||
        data.principalSubdivision ||
        data.countryName ||
        '',
      country: data.countryCode || ''
    };
  } catch {
    return fallback;
  }
};

export const weatherAPI = {
  getCityByName: async (city: string, lang: string = 'en') => {
    const place = await searchPlace(city, lang);
    return getWeather(place.latitude, place.longitude, place);
  },

  getCityByCoords: async (lat: number, lon: number, lang: string = 'en') => {
    const place = await reverseGeocode(lat, lon, lang);
    return getWeather(lat, lon, place);
  },

  getMultipleCities: async (places: FavoriteLocation[]) => {
    if (!places.length) {
      return [];
    }

    const { data } = await weatherClient.get<
      OpenMeteoResponse | OpenMeteoResponse[]
    >('forecast', {
      params: {
        latitude: places.map((place) => place.latitude).join(','),
        longitude: places.map((place) => place.longitude).join(','),
        current: CURRENT_FIELDS,
        hourly: HOURLY_FIELDS,
        daily: DAILY_FIELDS,
        timezone: 'auto'
      }
    });

    const results = Array.isArray(data) ? data : [data];
    return results.map((result, index) =>
      toWeatherModel(result, places[index])
    );
  }
};
