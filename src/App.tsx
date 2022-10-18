import React, { useEffect } from 'react'
import './App.css'
import { ThemeProvider } from 'styled-components'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { fetchWeatherByCoords, initializeMode } from './features/app-slice'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { Header } from './components/Header'
import { Search } from './pages/Search'
import { Sidebar } from './components/Sidebar'
import { AddToHomeScreenNotification } from './components/AddToHomeScreenNotification'
import { Favorites } from './pages/Favorites'

const App: React.FC = () => {
  const dispatch = useAppDispatch()
  const mode = useAppSelector((state) => state.app.mode)

  useEffect(() => {
    if (localStorage.getItem('lang') === null) {
      localStorage.setItem('lang', 'en')
    }
    dispatch(initializeMode())
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        dispatch(
          fetchWeatherByCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            lang: localStorage.getItem('lang') || 'en'
          })
        )
      })
    } else {
      /* geolocation IS NOT available */
    }
    window.addEventListener('scroll', (e) => {
      e.preventDefault()
      window.scrollTo(0, 0)
    })
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
