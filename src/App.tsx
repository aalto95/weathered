import React from 'react';
import SearchBarContainer from "./components/SearchBar/SearchBarContainer";
import SearchResultsContainer from "./components/SearchResults/SearchResultsContainer";
import './App.css'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'

const AppContainer = ({mode}: any) => {
  return (
    <App
      mode={mode}
    />
  )
}

const App = (props: any) => {
  return (
    <ThemeProvider theme={{ mode: props.mode }}>
      <div className="App">
          <SearchBarContainer />
          <SearchResultsContainer/>
      </div>
    </ThemeProvider>
  );
}

let mapStateToProps = (state : any) => {
  return {
    mode: state.app.mode
  }
}

let mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps) (AppContainer)
