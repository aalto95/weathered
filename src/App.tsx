import React, { lazy, Suspense, useEffect } from 'react'
import './App.css'
import { ThemeProvider } from 'styled-components'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { favoritesIdsSet, initializeMode } from './features/app-slice'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { Header } from './components/Header'

import { Sidebar } from './components/Sidebar'
import { AddToHomeScreenNotification } from './components/AddToHomeScreenNotification'

const Search = lazy(() => import('./pages/Search'))
const Favorites = lazy(() => import('./pages/Favorites'))

const App: React.FC = () => {
  const dispatch = useAppDispatch()
  const mode = useAppSelector((state) => state.app.mode)

  useEffect(() => {
    if (localStorage.getItem('favoritesIds')) {
      const favoritesIds = JSON.parse(localStorage.getItem('favoritesIds')!)
      dispatch(favoritesIdsSet(favoritesIds))
    }
    if (localStorage.getItem('lang') === null) {
      localStorage.setItem('lang', 'en')
    }
    dispatch(initializeMode())
  }, [dispatch])

  return (
    <div className="App">
      <Router>
        <ThemeProvider theme={{ mode }}>
          <Header />
          <Sidebar />
          <Routes>
            <Route path="/" element={<Search />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
          <AddToHomeScreenNotification />
        </ThemeProvider>
      </Router>
    </div>
  )
}

export default App
