import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { weatherAPI } from '../api/api'

interface AppState {
  mode: string
  city: {
    coord: {
      lat: number
      lon: number
    }
    weather: {
      0: {
        id: number
        main: string
        description: string
        icon: string
      }
      base: string
    }
    main: {
      temp: number
      feels_like: number
      temp_min: number
      temp_max: number
      pressure: number
      humidity: number
      sea_level: number
      grnd_level: number
    }
    visibility: number
    wind: {
      speed: number
      deg: number
      gust: number
    }
    clouds: {
      all: number
    }
    dt: number
    sys: {
      country: string
      sunrise: number
      sunset: number
    }
    timezone: number
    id: number
    name: string
    cod: number
  } | null
  fetchError: boolean
  isFetching: boolean
}

const initialState: AppState = {
  mode: 'light',
  city: null,
  fetchError: false,
  isFetching: false
}

export const fetchCityWeather = createAsyncThunk(
  'city/fetchCityWeather',
  async (cityName: string) => {
    const response = await weatherAPI.getCity(cityName)
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

const appSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    citySet(state, action) {
      state.city = action.payload
    },
    modeToggled(state, action) {
      state.mode = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCityWeather.pending, (state) => {
        state.fetchError = false
        state.isFetching = true
      })
      .addCase(fetchCityWeather.rejected, (state) => {
        state.fetchError = true
        state.isFetching = false
      })
      .addCase(fetchCityWeather.fulfilled, (state, action) => {
        state.isFetching = false
        state.city = action.payload
      })
      .addCase(toggleMode.fulfilled, (state, action) => {
        state.mode = action.payload!
      })
      .addCase(initializeMode.fulfilled, (state, action) => {
        state.mode = action.payload!
      })
  }
})

export const { citySet, modeToggled } = appSlice.actions
export default appSlice.reducer
