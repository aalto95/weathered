import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import styled, { ThemeProvider } from 'styled-components';
import theme from 'styled-theming';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { AddToHomeScreenNotification } from './components/AddToHomeScreenNotification';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { favoritesSet, initializeMode } from './features/app-slice';
import { FavoriteLocation } from './models/weather.model';
import Favorites from './pages/Favorites';
import Search from './pages/Search';

const FAVORITES_STORAGE_KEY = 'favorites';

const footerColor = theme('mode', {
  light: '#1C1E21',
  dark: '#E3E3E3'
});

const Footer = styled.footer`
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: ${footerColor};

  a {
    color: inherit;
  }
`;

const isFavoriteLocation = (value: unknown): value is FavoriteLocation => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const favorite = value as Record<string, unknown>;
  return (
    typeof favorite.id === 'number' &&
    typeof favorite.name === 'string' &&
    typeof favorite.country === 'string' &&
    typeof favorite.latitude === 'number' &&
    typeof favorite.longitude === 'number'
  );
};

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.app.mode);

  useEffect(() => {
    const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (storedFavorites) {
      try {
        const favorites = JSON.parse(storedFavorites);
        if (Array.isArray(favorites)) {
          dispatch(favoritesSet(favorites.filter(isFavoriteLocation)));
        }
      } catch {
        // Ignore malformed storage instead of crashing the app.
      }
    }
    // The old version stored OpenWeatherMap ids, which cannot be resolved
    // without that API. Drop them so stale data doesn't linger.
    localStorage.removeItem('favoritesIds');

    if (localStorage.getItem('lang') === null) {
      localStorage.setItem('lang', 'en');
    }
    dispatch(initializeMode());
  }, [dispatch]);

  return (
    <div className="App">
      <BrowserRouter>
        <ThemeProvider theme={{ mode }}>
          <Header />
          <Sidebar />
          <Routes>
            <Route path="/" element={<Search />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
          <Footer>
            Weather data by{' '}
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Open-Meteo.com
            </a>
          </Footer>
          <AddToHomeScreenNotification />
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
};

export default App;
