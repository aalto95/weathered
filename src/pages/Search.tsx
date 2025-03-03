import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { SearchBar } from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import { fetchWeatherByCoords } from '../features/app-slice';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: transparent;
`;

const Search: React.FC = () => {
  const dispatch = useAppDispatch();
  const city = useAppSelector((state) => state.app.city);
  const fetchError = useAppSelector((state) => state.app.fetchError);
  const isFetching = useAppSelector((state) => state.app.isFetching);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        dispatch(
          fetchWeatherByCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            lang: localStorage.getItem('lang') || 'en'
          })
        );
      });
    } else {
      /* geolocation IS NOT available */
    }
  }, []);

  return (
    <Wrapper>
      <SearchBar />
      <SearchResults
        city={city}
        fetchError={fetchError}
        isFetching={isFetching}
      />
    </Wrapper>
  );
};

export default Search;
