import { CloudIcon } from '@heroicons/react/24/outline';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { SearchBar } from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import {
  mutedTextColor,
  surfaceMutedColor,
  textColor
} from '../constants/theme';
import { fetchWeatherByCoords } from '../features/app-slice';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: clamp(40px, 8vw, 80px);
  text-align: center;
`;

const EmptyIcon = styled.div`
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  margin-bottom: 4px;
  background-color: ${surfaceMutedColor};
  border-radius: 50%;
  color: ${mutedTextColor};
`;

const EmptyTitle = styled.p`
  margin: 0;
  color: ${textColor};
  font-size: 1.1rem;
  font-weight: 600;
`;

const EmptyHint = styled.p`
  max-width: 320px;
  margin: 0;
  color: ${mutedTextColor};
  font-size: 0.92rem;
  line-height: 1.5;
`;

const Search: React.FC = () => {
  const dispatch = useAppDispatch();
  const city = useAppSelector((state) => state.app.city);
  const fetchError = useAppSelector((state) => state.app.fetchError);
  const isFetching = useAppSelector((state) => state.app.isFetching);
  const { t } = useTranslation();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        dispatch(
          fetchWeatherByCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            lang: localStorage.getItem('lang') || 'en'
          })
        );
      });
    }
  }, [dispatch]);

  return (
    <Wrapper>
      <SearchBar />
      <SearchResults
        city={city}
        fetchError={fetchError}
        isFetching={isFetching}
      />
      {!city && !isFetching && !fetchError && (
        <EmptyState>
          <EmptyIcon>
            <CloudIcon width={30} />
          </EmptyIcon>
          <EmptyTitle>{t('searchEmptyTitle')}</EmptyTitle>
          <EmptyHint>{t('searchEmptyHint')}</EmptyHint>
        </EmptyState>
      )}
    </Wrapper>
  );
};

export default Search;
