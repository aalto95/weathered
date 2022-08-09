import React, { useEffect } from 'react'
import './App.css'
import { ThemeProvider } from 'styled-components'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { initializeMode } from './features/app-slice'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { Header } from './components/Header'
import { Search } from './pages/Search'

const App = () => {
  const dispatch = useAppDispatch()
  const mode = useAppSelector((state) => state.app.mode)

  useEffect(() => {
    dispatch(initializeMode())
  }, [dispatch])

  return (
    <div className="App">
      <ThemeProvider theme={{ mode }}>
        <Header />
        <Router>
          <Routes>
            <Route path="/" element={<Search />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </div>
  )
}

export default App
