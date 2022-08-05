import React, { useEffect } from 'react';
import SearchBarContainer from "./components/SearchBar/SearchBarContainer";
import SearchResultsContainer from "./components/SearchResults/SearchResultsContainer";
import './App.css'
import styled, { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'
import { initializeMode } from './redux/app-reducer'
import theme from 'styled-theming'

const AppContainer = ({mode, initializeMode}: any) => {
  useEffect(() => {
    initializeMode()
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
  width: 100vw;
  height: 100vh;
  background-color: ${WrapperBackgroundColor};
  transition: all 0.5s ease;
`

const App = (props: any) => {
  return (
    <ThemeProvider theme={{ mode: props.mode }}>
      <Wrapper>
          <SearchBarContainer />
          <SearchResultsContainer/>
      </Wrapper>
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
