import { getWmoInfo } from '../api/wmo.js';
import type {
  NotificationCity,
  NotificationLang,
  NotificationMessage
} from './types.js';

const labels: Record<string, { en: string; ru: string }> = {
  'weather.clear': { en: 'Clear sky', ru: 'Ясно' },
  'weather.mainlyClear': { en: 'Mainly clear', ru: 'Преимущественно ясно' },
  'weather.partlyCloudy': { en: 'Partly cloudy', ru: 'Переменная облачность' },
  'weather.overcast': { en: 'Overcast', ru: 'Пасмурно' },
  'weather.fog': { en: 'Fog', ru: 'Туман' },
  'weather.drizzle': { en: 'Drizzle', ru: 'Морось' },
  'weather.freezingDrizzle': { en: 'Freezing drizzle', ru: 'Ледяная морось' },
  'weather.rain': { en: 'Rain', ru: 'Дождь' },
  'weather.freezingRain': { en: 'Freezing rain', ru: 'Ледяной дождь' },
  'weather.snow': { en: 'Snow', ru: 'Снег' },
  'weather.rainShowers': { en: 'Rain showers', ru: 'Ливень' },
  'weather.snowShowers': { en: 'Snow showers', ru: 'Снегопад' },
  'weather.thunderstorm': { en: 'Thunderstorm', ru: 'Гроза' },
  'weather.thunderstormHail': {
    en: 'Thunderstorm with hail',
    ru: 'Гроза с градом'
  },
  'weather.unknown': { en: 'Unknown', ru: 'Неизвестно' }
};

export const describeWeatherCode = (code: number, lang: NotificationLang) => {
  const description = getWmoInfo(code).description;
  return labels[description]?.[lang] ?? labels['weather.unknown'][lang];
};

export interface WeatherSummary {
  name: string;
  temperature: number;
  code: number;
}

interface OpenMeteoCurrentResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
  };
}

export const fetchWeatherSummaries = async (
  cities: NotificationCity[]
): Promise<WeatherSummary[]> => {
  if (cities.length === 0) {
    return [];
  }

  const params = new URLSearchParams({
    latitude: cities.map((city) => city.latitude).join(','),
    longitude: cities.map((city) => city.longitude).join(','),
    current: 'temperature_2m,weather_code',
    timezone: 'auto'
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    {
      signal: AbortSignal.timeout(8000)
    }
  );

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with ${response.status}`);
  }

  const data = (await response.json()) as
    OpenMeteoCurrentResponse | OpenMeteoCurrentResponse[];
  const results = Array.isArray(data) ? data : [data];

  return cities.map((city, index) => ({
    name: city.name,
    temperature: results[index]?.current.temperature_2m ?? 0,
    code: results[index]?.current.weather_code ?? 0
  }));
};

const cityLine = (summary: WeatherSummary, lang: NotificationLang) =>
  `${summary.name}: ${Math.round(summary.temperature)}°C, ${describeWeatherCode(
    summary.code,
    lang
  )}`;

export const buildDailyNotification = (
  summaries: WeatherSummary[],
  lang: NotificationLang
): NotificationMessage => {
  if (summaries.length === 0) {
    return {
      title: 'Weathered',
      body:
        lang === 'ru'
          ? 'Добавьте города в избранное, чтобы получать прогноз.'
          : 'Add cities to your favorites to receive a forecast.',
      tag: 'weathered-daily',
      url: '/favorites'
    };
  }

  const lines = summaries.slice(0, 4).map((summary) => cityLine(summary, lang));
  if (summaries.length > 4) {
    lines.push(
      lang === 'ru'
        ? `и ещё ${summaries.length - 4}`
        : `and ${summaries.length - 4} more`
    );
  }

  const first = summaries[0];
  const title =
    summaries.length === 1
      ? `${first.name} · ${Math.round(first.temperature)}°C`
      : `Weathered · ${lang === 'ru' ? 'Прогноз на день' : 'Daily forecast'}`;

  return {
    title,
    body: lines.join('\n'),
    tag: 'weathered-daily',
    url: '/favorites'
  };
};

export const buildTestNotification = (
  lang: NotificationLang
): NotificationMessage => ({
  title: lang === 'ru' ? 'Weathered · Проверка' : 'Weathered · Test',
  body:
    lang === 'ru'
      ? 'Уведомления работают. Ежедневный прогноз будет приходить в выбранное время.'
      : 'Notifications are working. Your daily forecast will arrive at the time you chose.',
  tag: 'weathered-test',
  url: '/notifications'
});
