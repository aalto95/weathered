import { configureStore } from '@reduxjs/toolkit';
import { render, RenderOptions } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import appReducer, { AppState, initialState } from './features/app-slice';
import { FavoriteLocation, WeatherModel } from './models/weather.model';

export const createTestStore = (appState: Partial<AppState> = {}) =>
  configureStore({
    reducer: {
      app: appReducer
    },
    preloadedState: {
      app: {
        ...initialState,
        ...appState
      }
    }
  });

export type TestStore = ReturnType<typeof createTestStore>;

interface ProviderOptions {
  store: TestStore;
  mode: string;
}

const Providers: React.FC<PropsWithChildren<ProviderOptions>> = ({
  children,
  store,
  mode
}) => (
  <Provider store={store}>
    <ThemeProvider theme={{ mode }}>{children}</ThemeProvider>
  </Provider>
);

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  appState?: Partial<AppState>;
  mode?: string;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  { appState = {}, mode = 'light', ...options }: RenderWithProvidersOptions = {}
) => {
  const store = createTestStore(appState);
  const result = render(
    <Providers store={store} mode={mode}>
      {ui}
    </Providers>,
    options
  );

  return { store, ...result };
};

export const makeCity = (
  overrides: Partial<WeatherModel> = {}
): WeatherModel => ({
  id: 1,
  name: 'Berlin',
  country: 'DE',
  coord: {
    lat: 52.52,
    lon: 13.41
  },
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
    temp: 5.4,
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
  timezone: 'Europe/Berlin',
  ...overrides
});

export const makeFavorite = (
  overrides: Partial<FavoriteLocation> = {}
): FavoriteLocation => ({
  id: 1,
  name: 'Berlin',
  country: 'DE',
  latitude: 52.52,
  longitude: 13.41,
  ...overrides
});
