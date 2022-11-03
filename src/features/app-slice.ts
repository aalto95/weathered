import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { weatherAPI } from '../api/api'
import { WeatherModel } from '../models/weather.model'

interface AppState {
  mode: string
  city: WeatherModel | null
  fetchError: boolean
  isFetching: boolean
  isSidebarOpen: boolean
  isA2HSButtonDismissed: boolean
  favoritesIds: number[]
  favorites: WeatherModel[]
}

const initialState: AppState = {
  mode: 'light',
  city: null,
  fetchError: false,
  isFetching: false,
  isSidebarOpen: false,
  isA2HSButtonDismissed: false,
  favoritesIds: [],
  favorites: []
}

export const fetchWeatherByCityName = createAsyncThunk(
  'city/fetchWeatherByCityName',
  async (cityName: string) => {
    const lang = window.localStorage.lang
    const response = await weatherAPI.getCityByName(cityName, lang)
    return response
  }
)

export const fetchWeatherByCoords = createAsyncThunk(
  'city/fetchWeatherByCoords',
  async ({ lat, lon, lang }: { lat: number; lon: number; lang: string }) => {
    const response = await weatherAPI.getCityByCoords(lat, lon, lang)
    return response
  }
)

export const fetchMultipleCities = createAsyncThunk(
  'city/fetchMultipleCities',
  async (cities: number[]) => {
    const response = await weatherAPI.getMultipleCities(
      initializeFavoritesIds()
    )
    return response
  }
)

const setThemeColors = (themeMode: string) => {
  const setTheme = (themeColor: string, backgroundColor: string) => {
    document
      .querySelector('meta[name="theme-color"]')!
      .setAttribute('content', themeColor)
    document.documentElement.style.setProperty(
      'background-color',
      backgroundColor
    )
  }
  if (themeMode === 'dark') {
    setTheme('#242526', '#1B1B1D')
  } else if (themeMode === 'light') {
    setTheme('#FFFFFF', '#FAFAFA')
  }
}

export const toggleMode = createAsyncThunk(
  'app/toggleMode',
  async (mode: string) => {
    localStorage.setItem('mode', mode)
    const themeMode = localStorage.getItem('mode')
    setThemeColors(mode)
    return themeMode
  }
)

export const dismissA2HSButton = createAsyncThunk(
  'app/dismissA2HSButton',
  async () => {
    localStorage.setItem('a2hsButtonDismissed', 'true')
    return true
  }
)

export const initializeMode = createAsyncThunk(
  'app/initializeMode',
  async () => {
    const mode = localStorage.getItem('mode')
    if (mode === null) {
      localStorage.setItem('mode', 'light')
      setThemeColors('light')
      return 'light'
    }
    setThemeColors(mode)
    return mode
  }
)

const initializeFavoritesIds = () => {
  const favoritesIds = localStorage.getItem('favoritesIds')
  if (favoritesIds === null) {
    localStorage.setItem('favoritesIds', '[]')
    return []
  }
  return JSON.parse(favoritesIds)
}

const appSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    citySet(state, action) {
      state.city = action.payload
    },
    isA2HSButtonDismissedSet(state, action) {
      state.isA2HSButtonDismissed = action.payload
    },
    modeToggled(state, action) {
      state.mode = action.payload
    },
    sidebarToggled(state, action) {
      state.isSidebarOpen = action.payload
    },
    favoritesIdsSet(state, action) {
      state.favoritesIds = action.payload
    },
    favoritePushed(state, action) {
      state.favoritesIds.push(action.payload)
      localStorage.setItem('favoritesIds', JSON.stringify(state.favoritesIds))
    },
    favoriteRemoved(state, action) {
      state.favoritesIds = state.favoritesIds.filter(
        (id) => id !== action.payload
      )
      state.favorites = state.favorites.filter(
        (city) => city.id !== action.payload
      )
      localStorage.setItem('favoritesIds', JSON.stringify(state.favoritesIds))
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherByCityName.pending, (state) => {
        state.fetchError = false
        state.isFetching = true
      })
      .addCase(fetchWeatherByCityName.rejected, (state) => {
        state.fetchError = true
        state.isFetching = false
      })
      .addCase(fetchWeatherByCityName.fulfilled, (state, action) => {
        state.isFetching = false
        state.city = action.payload
      })
      .addCase(fetchWeatherByCoords.pending, (state) => {
        state.fetchError = false
        state.isFetching = true
      })
      .addCase(fetchWeatherByCoords.rejected, (state) => {
        state.fetchError = true
        state.isFetching = false
      })
      .addCase(fetchWeatherByCoords.fulfilled, (state, action) => {
        state.isFetching = false
        state.city = action.payload
      })
      .addCase(toggleMode.fulfilled, (state, action) => {
        state.mode = action.payload!
      })
      .addCase(initializeMode.fulfilled, (state, action) => {
        state.mode = action.payload!
      })
      .addCase(dismissA2HSButton.fulfilled, (state) => {
        state.isA2HSButtonDismissed = true
      })
      .addCase(fetchMultipleCities.pending, (state, action) => {
        state.fetchError = false
        state.isFetching = true
      })
      .addCase(fetchMultipleCities.fulfilled, (state, action) => {
        state.isFetching = false
        state.favorites = action.payload.list
      })
  }
})

export const {
  citySet,
  modeToggled,
  sidebarToggled,
  isA2HSButtonDismissedSet,
  favoritePushed,
  favoriteRemoved,
  favoritesIdsSet
} = appSlice.actions
export default appSlice.reducer
