export type WeatherAnimation =
  'clear' | 'clouds' | 'rain' | 'snow' | 'thunderstorm';

export interface WeatherCondition {
  /** WMO weather interpretation code returned by Open-Meteo. */
  code: number;
  /** Animation name matching the .riv files in /public/animations. */
  main: WeatherAnimation;
  /** i18n key (e.g. "weather.rain") for the localized description. */
  description: string;
}

export interface HourlyForecast {
  /** Location-local ISO timestamp (e.g. "2026-11-10T14:00"). */
  time: string;
  temperature: number;
  code: number;
  condition: WeatherAnimation;
  precipitationProbability: number;
}

export interface DailyForecast {
  /** Location-local date (e.g. "2026-11-10"). */
  date: string;
  code: number;
  condition: WeatherAnimation;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
}

export interface WeatherModel {
  /** Stable location id (Open-Meteo geocoding id or a coordinate-derived id). */
  id: number;
  name: string;
  /** ISO 3166-1 alpha-2 country code. */
  country: string;
  coord: {
    lat: number;
    lon: number;
  };
  weather: WeatherCondition[];
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  /** Location-local ISO timestamp of the observation. */
  updatedAt: string;
  main: {
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    /** Current precipitation in millimetres. */
    precipitation: number;
  };
  /** Visibility in metres. */
  visibility: number;
  wind: {
    /** Wind speed in km/h. */
    speed: number;
    /** Wind direction in degrees. */
    deg: number;
    /** Wind gusts in km/h. */
    gust: number;
  };
  clouds: {
    all: number;
  };
  sys: {
    /** Local sunrise time as an ISO string (e.g. "2026-11-10T07:19"). */
    sunrise: string;
    /** Local sunset time as an ISO string (e.g. "2026-11-10T16:20"). */
    sunset: string;
  };
  timezone: string;
}

export interface FavoriteLocation {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}
