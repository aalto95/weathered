import axios from 'axios';
import { FavoriteLocation, WeatherModel } from '../models/weather.model';
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
  'visibility'
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
  };
  daily: {
    sunrise: string[];
    sunset: string[];
  };
}

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
    main: {
      temp: data.current.temperature_2m,
      feels_like: data.current.apparent_temperature,
      pressure: data.current.surface_pressure,
      humidity: data.current.relative_humidity_2m
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
      daily: 'sunrise,sunset',
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
        daily: 'sunrise,sunset',
        timezone: 'auto'
      }
    });

    const results = Array.isArray(data) ? data : [data];
    return results.map((result, index) =>
      toWeatherModel(result, places[index])
    );
  }
};
