import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import styled, { ThemeProvider } from 'styled-components';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { AddToHomeScreenNotification } from './components/AddToHomeScreenNotification';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { mutedTextColor, pageBackground } from './constants/theme';
import { favoritesSet, initializeMode } from './features/app-slice';
import { FavoriteLocation } from './models/weather.model';
import Favorites from './pages/Favorites';
import Search from './pages/Search';

const FAVORITES_STORAGE_KEY = 'favorites';

const AppRoot = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${pageBackground};
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  padding: 24px 16px 8px;

  @media (max-width: 480px) {
    padding: 16px 12px 4px;
  }
`;

const Footer = styled.footer`
  padding: 20px 16px 28px;
  text-align: center;
  font-size: 12px;
  color: ${mutedTextColor};

  a {
    color: inherit;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s ease;
  }

  a:hover {
    border-bottom-color: currentColor;
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
    document.documentElement.lang = localStorage.getItem('lang') ?? 'en';
    dispatch(initializeMode());
  }, [dispatch]);

  return (
    <AppRoot>
      <BrowserRouter>
        <ThemeProvider theme={{ mode }}>
          <Header />
          <Sidebar />
          <Main>
            <Routes>
              <Route path="/" element={<Search />} />
              <Route path="/favorites" element={<Favorites />} />
            </Routes>
          </Main>
          <Footer>
            Weather data by{' '}
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Open-Meteo.com
            </a>
          </Footer>
          <AddToHomeScreenNotification />
        </ThemeProvider>
      </BrowserRouter>
    </AppRoot>
  );
};

export default App;
