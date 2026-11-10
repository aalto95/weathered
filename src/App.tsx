import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Route, Routes } from 'react-router';
import styled, { ThemeProvider } from 'styled-components';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { AddToHomeScreenNotification } from './components/AddToHomeScreenNotification';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { mutedTextColor, pageBackground } from './constants/theme';
import { favoritesSet, initializeMode } from './features/app-slice';
import { useNotificationAutoSync } from './hooks/usePushNotifications';
import { FavoriteLocation } from './models/weather.model';
import Favorites from './pages/Favorites';
import Notifications from './pages/Notifications';
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
  padding-top: 24px;
  padding-right: max(16px, env(safe-area-inset-right));
  padding-bottom: 8px;
  padding-left: max(16px, env(safe-area-inset-left));

  @media (max-width: 480px) {
    padding-top: 16px;
    padding-right: max(12px, env(safe-area-inset-right));
    padding-bottom: 4px;
    padding-left: max(12px, env(safe-area-inset-left));
  }
`;

const Footer = styled.footer`
  padding-top: 20px;
  padding-right: max(16px, env(safe-area-inset-right));
  padding-bottom: calc(28px + env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
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
  const favorites = useAppSelector((state) => state.app.favorites);
  const { i18n } = useTranslation();

  useNotificationAutoSync(favorites, i18n.language === 'ru' ? 'ru' : 'en');

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
              <Route path="/notifications" element={<Notifications />} />
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
