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
import { getConditionAccent } from '../constants/weather';
import { fetchWeatherByCoords } from '../features/app-slice';

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  & > * {
    position: relative;
    z-index: 1;
  }
`;

const Atmosphere = styled.div<{ $accent: string }>`
  position: absolute;
  top: -60px;
  left: 50%;
  width: min(700px, 100%);
  height: 360px;
  background: radial-gradient(
    circle at 50% 0%,
    ${({ $accent }) => `${$accent}2e`} 0%,
    transparent 65%
  );
  filter: blur(20px);
  opacity: 0.9;
  pointer-events: none;
  transform: translateX(-50%);
  transition: background 0.6s ease;
  z-index: 0;
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
  const mode = useAppSelector((state) => state.app.mode);
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

  const accent = city ? getConditionAccent(city.weather[0].main, mode) : null;

  return (
    <Wrapper>
      {accent && <Atmosphere $accent={accent} aria-hidden="true" />}
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
