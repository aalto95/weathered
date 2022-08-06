import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { weatherAPI } from "../api/api";

interface AppState {
  mode: string;
  city: any;
  fetchError: boolean;
  isFetching: boolean;
}

const initialState: AppState = {
  mode: "light",
  city: null,
  fetchError: false,
  isFetching: false,
};

export const fetchCityWeather = createAsyncThunk(
  "city/fetchCityWeather",
  async (cityName: string) => {
    const response = await weatherAPI.getCity(cityName);
    return response;
  }
);

const setThemeColors = (themeMode: string) => {
  if (themeMode === "dark") {
    document
      .querySelector('meta[name="theme-color"]')!
      .setAttribute("content", "#242526");
    document.documentElement.style.setProperty("background-color", "#1B1B1D");
  } else if (themeMode === "light") {
    document
      .querySelector('meta[name="theme-color"]')!
      .setAttribute("content", "#FFFFFF");
    document.documentElement.style.setProperty("background-color", "#FAFAFA");
  }
};

export const toggleMode = createAsyncThunk(
  "app/toggleMode",
  async (mode: string) => {
    localStorage.setItem("mode", mode);
    const themeMode = localStorage.getItem("mode");
    setThemeColors(mode);
    return themeMode;
  }
);

export const initializeMode = createAsyncThunk(
  "app/initializeMode",
  async () => {
    const mode = localStorage.getItem("mode");
    if (mode === null) {
      localStorage.setItem("mode", "light");
      setThemeColors("light");
      return "light";
    }
    setThemeColors(mode);
    return mode;
  }
);

const appSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    citySet(state, action) {
      state.city = action.payload;
    },
    modeToggled(state, action) {
      state.mode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCityWeather.pending, (state) => {
        state.fetchError = false;
        state.isFetching = true;
      })
      .addCase(fetchCityWeather.rejected, (state) => {
        state.fetchError = true;
        state.isFetching = false;
      })
      .addCase(fetchCityWeather.fulfilled, (state, action) => {
        state.isFetching = false;
        state.city = action.payload;
      })
      .addCase(toggleMode.fulfilled, (state, action) => {
        state.mode = action.payload!;
      })
      .addCase(initializeMode.fulfilled, (state, action) => {
        state.mode = action.payload!;
      });
  },
});

export const { citySet, modeToggled } = appSlice.actions;
export default appSlice.reducer;
