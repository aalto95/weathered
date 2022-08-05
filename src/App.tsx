import React, { useEffect } from 'react';
import SearchBarContainer from "./components/SearchBar/SearchBarContainer";
import SearchResultsContainer from "./components/SearchResults/SearchResultsContainer";
import './App.css'
import styled, { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'
import { initializeMode } from './redux/app-reducer'
import theme from 'styled-theming'
import { Tabbar } from './components/Tabbar/Tabbar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AQI } from './components/AQI'
import { Settings } from './components/Settings'

const AppContainer = ({mode, initializeMode}: any) => {
  useEffect(() => {
    initializeMode()
    let themeMode = localStorage.getItem('mode')
    if (themeMode === 'dark') {
      document.querySelector('meta[name="theme-color"]')!.setAttribute('content', '#51557E');
    } else if (themeMode === 'light') {
      document.querySelector('meta[name="theme-color"]')!.setAttribute('content', '#F7ECDE');
    }
  }, [])
  
  return (
    <App
      mode={mode}
    />
  )
}

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

const App = (props: any) => {

  return (
    <ThemeProvider theme={{ mode: props.mode }}>
      <Router>
        <Wrapper>
          <Routes>
              <Route path="/weather" element={
                <div>
                  <SearchBarContainer />
                  <SearchResultsContainer/>
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

let mapStateToProps = (state : any) => {
  return {
    mode: state.app.mode
  }
}

let mapDispatchToProps = {
  initializeMode
}

export default connect(mapStateToProps, mapDispatchToProps) (AppContainer)
