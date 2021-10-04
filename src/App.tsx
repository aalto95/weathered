import React from 'react';
import SearchBarContainer from "./components/SearchBar/SearchBarContainer";
import SearchResultsContainer from "./components/SearchResults/SearchResultsContainer";
import './App.css'

function App() {
  return (
    <div className="App">
        <SearchBarContainer />
        <SearchResultsContainer/>
    </div>
  );
}

export default App;
