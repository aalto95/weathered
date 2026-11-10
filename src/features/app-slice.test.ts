import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { weatherAPI } from '../api/api';
import { makeCity, makeFavorite } from '../test-utils';
import reducer, {
  citySet,
  dismissA2HSButton,
  favoritePushed,
  favoriteRemoved,
  favoritesSet,
  fetchMultipleCities,
  fetchWeatherByCityName,
  fetchWeatherByCoords,
  initialState,
  initializeMode,
  isA2HSButtonDismissedSet,
  modeToggled,
  sidebarToggled,
  toggleMode
} from './app-slice';

vi.mock('../api/api', () => ({
  weatherAPI: {
    getCityByName: vi.fn(),
    getCityByCoords: vi.fn(),
    getMultipleCities: vi.fn()
  }
}));

const getCityByName = vi.mocked(weatherAPI.getCityByName);
const getCityByCoords = vi.mocked(weatherAPI.getCityByCoords);
const getMultipleCities = vi.mocked(weatherAPI.getMultipleCities);

const makeStore = () =>
  configureStore({
    reducer: {
      app: reducer
    }
  });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('appSlice reducers', () => {
  test('returns the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('stores the selected city', () => {
    const city = makeCity();
    expect(reducer(initialState, citySet(city)).city).toEqual(city);
  });

  test('toggles the sidebar and theme mode', () => {
    expect(reducer(initialState, sidebarToggled(true)).isSidebarOpen).toBe(
      true
    );
    expect(reducer(initialState, modeToggled('dark')).mode).toBe('dark');
  });

  test('stores the A2HS dismissal flag', () => {
    expect(
      reducer(initialState, isA2HSButtonDismissedSet(true))
        .isA2HSButtonDismissed
    ).toBe(true);
  });

  test('sets the persisted favorites list', () => {
    const favorites = [makeFavorite(), makeFavorite({ id: 2, name: 'Paris' })];

    expect(reducer(initialState, favoritesSet(favorites)).favorites).toEqual(
      favorites
    );
  });

  test('adds a favorite and persists it', () => {
    const favorite = makeFavorite();
    const state = reducer(initialState, favoritePushed(favorite));

    expect(state.favorites).toEqual([favorite]);
    expect(JSON.parse(localStorage.getItem('favorites')!)).toEqual([favorite]);
  });

  test('does not add the same favorite twice', () => {
    const favorite = makeFavorite();
    const state = reducer(
      reducer(initialState, favoritePushed(favorite)),
      favoritePushed(favorite)
    );

    expect(state.favorites).toEqual([favorite]);
  });

  test('removes a favorite from both the saved list and loaded weather', () => {
    const favorite = makeFavorite();
    const city = makeCity();
    const state = {
      ...initialState,
      favorites: [favorite],
      favoritesWeather: [city]
    };

    const next = reducer(state, favoriteRemoved(favorite.id));

    expect(next.favorites).toEqual([]);
    expect(next.favoritesWeather).toEqual([]);
    expect(JSON.parse(localStorage.getItem('favorites')!)).toEqual([]);
  });
});

describe('async thunks', () => {
  test('fetchWeatherByCityName stores the result', async () => {
    const store = makeStore();
    const city = makeCity();
    getCityByName.mockResolvedValue(city);

    await store.dispatch(fetchWeatherByCityName('Berlin'));

    expect(getCityByName).toHaveBeenCalledWith('Berlin', 'en');
    expect(store.getState().app.city).toEqual(city);
    expect(store.getState().app.isFetching).toBe(false);
    expect(store.getState().app.fetchError).toBe(false);
  });

  test('fetchWeatherByCityName uses the stored language', async () => {
    const store = makeStore();
    localStorage.setItem('lang', 'ru');
    getCityByName.mockResolvedValue(makeCity());

    await store.dispatch(fetchWeatherByCityName('Берлин'));

    expect(getCityByName).toHaveBeenCalledWith('Берлин', 'ru');
  });

  test('fetchWeatherByCityName marks a rejection as an error', async () => {
    const store = makeStore();
    getCityByName.mockRejectedValue(new Error('city not found'));

    await store.dispatch(fetchWeatherByCityName('Nowhere'));

    expect(store.getState().app.fetchError).toBe(true);
    expect(store.getState().app.isFetching).toBe(false);
    expect(store.getState().app.city).toBeNull();
  });

  test('fetchWeatherByCoords passes the coordinates and language', async () => {
    const store = makeStore();
    const city = makeCity();
    getCityByCoords.mockResolvedValue(city);

    await store.dispatch(
      fetchWeatherByCoords({ lat: 52.52, lon: 13.41, lang: 'de' })
    );

    expect(getCityByCoords).toHaveBeenCalledWith(52.52, 13.41, 'de');
    expect(store.getState().app.city).toEqual(city);
  });

  test('fetchMultipleCities uses the favorites it is given', async () => {
    const store = makeStore();
    const favorites = [makeFavorite(), makeFavorite({ id: 2, name: 'Paris' })];
    const cities = [
      makeCity(),
      makeCity({ id: 2, name: 'Paris', country: 'FR' })
    ];
    getMultipleCities.mockResolvedValue(cities);

    await store.dispatch(fetchMultipleCities(favorites));

    expect(getMultipleCities).toHaveBeenCalledWith(favorites);
    expect(store.getState().app.favoritesWeather).toEqual(cities);
    expect(store.getState().app.isFavoritesFetching).toBe(false);
  });

  test('fetchMultipleCities marks a rejection as an error', async () => {
    const store = makeStore();
    getMultipleCities.mockRejectedValue(new Error('network down'));

    await store.dispatch(fetchMultipleCities([makeFavorite()]));

    expect(store.getState().app.favoritesFetchError).toBe(true);
    expect(store.getState().app.isFavoritesFetching).toBe(false);
  });
});

describe('theme thunks', () => {
  const themeColor = () =>
    document.querySelector('meta[name="theme-color"]')?.getAttribute('content');

  test('initializeMode defaults to light', async () => {
    const store = makeStore();

    await store.dispatch(initializeMode());

    expect(store.getState().app.mode).toBe('light');
    expect(localStorage.getItem('mode')).toBe('light');
    expect(themeColor()).toBe('#FFFFFF');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  test('initializeMode restores a stored dark mode', async () => {
    const store = makeStore();
    localStorage.setItem('mode', 'dark');

    await store.dispatch(initializeMode());

    expect(store.getState().app.mode).toBe('dark');
    expect(themeColor()).toBe('#242526');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  test('toggleMode persists the new mode and applies its colors', async () => {
    const store = makeStore();

    await store.dispatch(toggleMode('dark'));

    expect(store.getState().app.mode).toBe('dark');
    expect(localStorage.getItem('mode')).toBe('dark');
    expect(themeColor()).toBe('#242526');
  });

  test('dismissA2HSButton persists the dismissal', async () => {
    const store = makeStore();

    await store.dispatch(dismissA2HSButton());

    expect(store.getState().app.isA2HSButtonDismissed).toBe(true);
    expect(localStorage.getItem('a2hsButtonDismissed')).toBe('true');
  });
});
