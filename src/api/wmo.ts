import type { WeatherAnimation } from '../models/weather.model.js';

export interface WmoInfo {
  animation: WeatherAnimation;
  /** i18n key for the localized weather description. */
  description: string;
}

// Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
const wmoInfo: Record<number, WmoInfo> = {
  0: { animation: 'clear', description: 'weather.clear' },
  1: { animation: 'clear', description: 'weather.mainlyClear' },
  2: { animation: 'clouds', description: 'weather.partlyCloudy' },
  3: { animation: 'clouds', description: 'weather.overcast' },
  45: { animation: 'clouds', description: 'weather.fog' },
  48: { animation: 'clouds', description: 'weather.fog' },
  51: { animation: 'rain', description: 'weather.drizzle' },
  53: { animation: 'rain', description: 'weather.drizzle' },
  55: { animation: 'rain', description: 'weather.drizzle' },
  56: { animation: 'rain', description: 'weather.freezingDrizzle' },
  57: { animation: 'rain', description: 'weather.freezingDrizzle' },
  61: { animation: 'rain', description: 'weather.rain' },
  63: { animation: 'rain', description: 'weather.rain' },
  65: { animation: 'rain', description: 'weather.rain' },
  66: { animation: 'rain', description: 'weather.freezingRain' },
  67: { animation: 'rain', description: 'weather.freezingRain' },
  71: { animation: 'snow', description: 'weather.snow' },
  73: { animation: 'snow', description: 'weather.snow' },
  75: { animation: 'snow', description: 'weather.snow' },
  77: { animation: 'snow', description: 'weather.snow' },
  80: { animation: 'rain', description: 'weather.rainShowers' },
  81: { animation: 'rain', description: 'weather.rainShowers' },
  82: { animation: 'rain', description: 'weather.rainShowers' },
  85: { animation: 'snow', description: 'weather.snowShowers' },
  86: { animation: 'snow', description: 'weather.snowShowers' },
  95: { animation: 'thunderstorm', description: 'weather.thunderstorm' },
  96: { animation: 'thunderstorm', description: 'weather.thunderstormHail' },
  99: { animation: 'thunderstorm', description: 'weather.thunderstormHail' }
};

const fallback: WmoInfo = {
  animation: 'clouds',
  description: 'weather.unknown'
};

export const getWmoInfo = (code: number): WmoInfo => wmoInfo[code] ?? fallback;
