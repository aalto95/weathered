import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { ThemeProvider } from 'styled-components';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { AddToHomeScreenNotification } from './components/AddToHomeScreenNotification';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { favoritesIdsSet, initializeMode } from './features/app-slice';
import Favorites from './pages/Favorites';
import Search from './pages/Search';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.app.mode);

  useEffect(() => {
    if (localStorage.getItem('favoritesIds')) {
      const favoritesIds = JSON.parse(localStorage.getItem('favoritesIds')!);
      dispatch(favoritesIdsSet(favoritesIds));
    }
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
          <AddToHomeScreenNotification />
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
};

export default App;
