import React, { useEffect } from 'react';
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import './App.css'
import styled, { ThemeProvider } from 'styled-components'
import theme from 'styled-theming'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { initializeMode } from './features/app-slice'
import { useAppDispatch, useAppSelector } from './app/hooks'

const WrapperBackgroundColor = theme('mode', {
  light: '#FFF',
  dark: '#1B1B1D',
})

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${WrapperBackgroundColor};
  
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
              <Route path="/" element={
                <>
                  <SearchBar />
                  <SearchResults />
                </>
              } />
          </Routes>
        </Wrapper>
      </Router>
    </ThemeProvider>
  );
}

export default App
