import React, { useEffect } from 'react';
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import './App.css'
import styled, { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'
import theme from 'styled-theming'
import { Tabbar } from './components/Tabbar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AQI } from './components/AQI'
import { Settings } from './components/Settings'
import { initializeMode } from './features/app-slice'
import { useAppDispatch, useAppSelector } from './app/hooks'

const WrapperBackgroundColor = theme('mode', {
  light: '#FBF8F1',
  dark: '#1B2430',
})

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100vw;
  height: 100vh;
  background-color: ${WrapperBackgroundColor};
  transition: all 0.5s ease;
`

const App = () => {
  const dispatch = useAppDispatch()
  const mode = useAppSelector(state => state.app.mode)

  useEffect(() => {
    dispatch(initializeMode())
  }, [])
  
  return (
    <ThemeProvider theme={{ mode }}>
      <Router>
        <Wrapper>
          <Routes>
              <Route path="/weather" element={
                <div>
                  <SearchBar />
                  <SearchResults />
                </div>
              } />
              <Route path="/AQI" element={<AQI />} />
              <Route path="/Settings" element={<Settings />} />
          </Routes>
          <Tabbar />
        </Wrapper>
      </Router>
    </ThemeProvider>
  );
}

export default App
