import { WeatherAnimation } from '../models/weather.model';

export const conditionAccents: Record<
  WeatherAnimation,
  { light: string; dark: string }
> = {
  clear: { light: '#F59E0B', dark: '#FBBF24' },
  clouds: { light: '#64748B', dark: '#94A3B8' },
  rain: { light: '#2563EB', dark: '#60A5FA' },
  snow: { light: '#0891B2', dark: '#67E8F9' },
  thunderstorm: { light: '#7C3AED', dark: '#A78BFA' }
};

export const getConditionAccent = (condition: WeatherAnimation, mode: string) =>
  conditionAccents[condition][mode === 'light' ? 'light' : 'dark'];
