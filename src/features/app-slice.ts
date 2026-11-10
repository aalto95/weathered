import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { weatherAPI } from '../api/api';
import { FavoriteLocation, WeatherModel } from '../models/weather.model';

interface AppState {
  mode: string;
  city: WeatherModel | null;
  fetchError: boolean;
  isFetching: boolean;
  isSidebarOpen: boolean;
  isA2HSButtonDismissed: boolean;
  favorites: FavoriteLocation[];
  favoritesWeather: WeatherModel[];
  favoritesFetchError: boolean;
  isFavoritesFetching: boolean;
}

const initialState: AppState = {
  mode: 'light',
  city: null,
  fetchError: false,
  isFetching: false,
  isSidebarOpen: false,
  isA2HSButtonDismissed: false,
  favorites: [],
  favoritesWeather: [],
  favoritesFetchError: false,
  isFavoritesFetching: false
};

export const fetchWeatherByCityName = createAsyncThunk(
  'city/fetchWeatherByCityName',
  async (cityName: string) => {
    const lang = window.localStorage.getItem('lang') ?? 'en';
    const response = await weatherAPI.getCityByName(cityName, lang);
    return response;
  }
);

export const fetchWeatherByCoords = createAsyncThunk(
  'city/fetchWeatherByCoords',
  async ({ lat, lon, lang }: { lat: number; lon: number; lang: string }) => {
    const response = await weatherAPI.getCityByCoords(lat, lon, lang);
    return response;
  }
);

export const fetchMultipleCities = createAsyncThunk(
  'city/fetchMultipleCities',
  async (cities: FavoriteLocation[]) => {
    return weatherAPI.getMultipleCities(cities);
  }
);

const setThemeColors = (themeMode: string) => {
  const setTheme = (themeColor: string, backgroundColor: string) => {
    document
      .querySelector('meta[name="theme-color"]')!
      .setAttribute('content', themeColor);
    document.documentElement.style.setProperty(
      'background-color',
      backgroundColor
    );
  };
  if (themeMode === 'dark') {
    setTheme('#242526', '#1B1B1D');
    document.documentElement.style.colorScheme = 'dark';
  } else if (themeMode === 'light') {
    setTheme('#FFFFFF', '#FAFAFA');
    document.documentElement.style.colorScheme = 'light';
  }
};

export const toggleMode = createAsyncThunk(
  'app/toggleMode',
  async (mode: string) => {
    localStorage.setItem('mode', mode);
    const themeMode = localStorage.getItem('mode');
    setThemeColors(mode);
    return themeMode;
  }
);

export const dismissA2HSButton = createAsyncThunk(
  'app/dismissA2HSButton',
  async () => {
    localStorage.setItem('a2hsButtonDismissed', 'true');
    return true;
  }
);

export const initializeMode = createAsyncThunk(
  'app/initializeMode',
  async () => {
    const mode = localStorage.getItem('mode');
    if (mode === null) {
      localStorage.setItem('mode', 'light');
      setThemeColors('light');
      return 'light';
    }
    setThemeColors(mode);
    return mode;
  }
);

const FAVORITES_STORAGE_KEY = 'favorites';

const persistFavorites = (favorites: FavoriteLocation[]) => {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
};

const appSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    citySet(state, action) {
      state.city = action.payload;
    },
    isA2HSButtonDismissedSet(state, action) {
      state.isA2HSButtonDismissed = action.payload;
    },
    modeToggled(state, action) {
      state.mode = action.payload;
    },
    sidebarToggled(state, action) {
      state.isSidebarOpen = action.payload;
    },
    favoritesSet(state, action: PayloadAction<FavoriteLocation[]>) {
      state.favorites = action.payload;
    },
    favoritePushed(state, action: PayloadAction<FavoriteLocation>) {
      if (
        state.favorites.some((favorite) => favorite.id === action.payload.id)
      ) {
        return;
      }
      state.favorites.push(action.payload);
      persistFavorites(state.favorites);
    },
    favoriteRemoved(state, action: PayloadAction<number>) {
      state.favorites = state.favorites.filter(
        (favorite) => favorite.id !== action.payload
      );
      state.favoritesWeather = state.favoritesWeather.filter(
        (city) => city.id !== action.payload
      );
      persistFavorites(state.favorites);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherByCityName.pending, (state) => {
        state.fetchError = false;
        state.isFetching = true;
      })
      .addCase(fetchWeatherByCityName.rejected, (state) => {
        state.fetchError = true;
        state.isFetching = false;
      })
      .addCase(fetchWeatherByCityName.fulfilled, (state, action) => {
        state.isFetching = false;
        state.city = action.payload;
      })
      .addCase(fetchWeatherByCoords.pending, (state) => {
        state.fetchError = false;
        state.isFetching = true;
      })
      .addCase(fetchWeatherByCoords.rejected, (state) => {
        state.fetchError = true;
        state.isFetching = false;
      })
      .addCase(fetchWeatherByCoords.fulfilled, (state, action) => {
        state.isFetching = false;
        state.city = action.payload;
      })
      .addCase(toggleMode.fulfilled, (state, action) => {
        state.mode = action.payload!;
      })
      .addCase(initializeMode.fulfilled, (state, action) => {
        state.mode = action.payload!;
      })
      .addCase(dismissA2HSButton.fulfilled, (state) => {
        state.isA2HSButtonDismissed = true;
      })
      .addCase(fetchMultipleCities.pending, (state) => {
        state.favoritesFetchError = false;
        state.isFavoritesFetching = true;
      })
      .addCase(fetchMultipleCities.rejected, (state) => {
        state.favoritesFetchError = true;
        state.isFavoritesFetching = false;
      })
      .addCase(fetchMultipleCities.fulfilled, (state, action) => {
        state.isFavoritesFetching = false;
        state.favoritesWeather = action.payload;
      });
  }
});

export const {
  citySet,
  modeToggled,
  sidebarToggled,
  isA2HSButtonDismissedSet,
  favoritePushed,
  favoriteRemoved,
  favoritesSet
} = appSlice.actions;
export default appSlice.reducer;
