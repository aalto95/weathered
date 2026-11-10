import React from 'react';
import styled from 'styled-components';

import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import {
  MapPinIcon,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import theme from 'styled-theming';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { favoritePushed, favoriteRemoved } from '../features/app-slice';
import { FavoriteLocation, WeatherModel } from '../models/weather.model';
import { Loader } from './Loader';
import { RiveAnimation } from './RiveAnimation';

const cardBackgroundColor = theme('mode', {
  light: '#f2f2f2',
  dark: '#242526'
});

const textColor = theme('mode', {
  light: '#1C1E21',
  dark: '#E3E3E3'
});

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const City = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 90%;
  background-color: gray;
  border-radius: 12px;
  background-color: ${cardBackgroundColor};
  color: ${textColor};
`;

const Info = styled.div`
  display: grid;
  width: 300px;
  padding-top: 20px;
  grid-template-columns: 33% 33% 33%;
  grid-template-rows: 70px 50px;
`;

const Span = styled.span`
  text-align: center;
`;

interface SearchResultsProps {
  city: WeatherModel | null;
  fetchError: boolean;
  isFetching: boolean;
}

const coordinatesMatch = (favorite: FavoriteLocation, city: WeatherModel) =>
  Math.abs(favorite.latitude - city.coord.lat) < 0.02 &&
  Math.abs(favorite.longitude - city.coord.lon) < 0.02;

const SearchResults: React.FC<SearchResultsProps> = ({
  city,
  fetchError,
  isFetching
}) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.app.mode);
  const favorites = useAppSelector((state) => state.app.favorites);

  const formatTime = (isoDate: string) => {
    const time = isoDate.split('T')[1];
    return time ? time.slice(0, 5) : isoDate;
  };

  const { t } = useTranslation();

  if (!city) {
    return (
      <Container>
        {isFetching && <Loader />}
        {fetchError && <RiveAnimation animationName="404" />}
      </Container>
    );
  }

  const favorite = favorites.find(
    (item) => item.id === city.id || coordinatesMatch(item, city)
  );

  const addToFavorite = () => {
    dispatch(
      favoritePushed({
        id: city.id,
        name: city.name,
        country: city.country,
        latitude: city.coord.lat,
        longitude: city.coord.lon
      })
    );
  };

  const removeFromFavorite = () => {
    if (favorite) {
      dispatch(favoriteRemoved(favorite.id));
    }
  };

  const countryLabel = city.country ? `, ${t(city.country)}` : '';

  return (
    <Container>
      {isFetching && <Loader />}
      {fetchError && <RiveAnimation animationName="404" />}
      {city && !isFetching && !fetchError && (
        <City>
          <h1 style={{ textAlign: 'center' }}>
            {city.name || t('myLocation')}
            {countryLabel}
          </h1>
          <p>{Math.round(city.main.temp)}°C</p>
          <p>{t(city.weather[0].description)}</p>
          <RiveAnimation
            animationName={city.weather[0].main}
            width={100}
            height={100}
          />
          <Info>
            <Span>
              <p>{t('visibility')}</p>
              <p>
                {city.visibility / 1000} {t('km')}
              </p>
            </Span>
            <Span>
              <p>{t('wind')}</p>
              <p>
                {city.wind.speed} {t('kmperhour')}
              </p>
            </Span>
            <Span>
              <p>{t('sunrise')}</p>
              <p>{formatTime(city.sys.sunrise)}</p>
            </Span>
            <Span>
              <p>{t('humidity')}</p>
              <p>{city.main.humidity}%</p>
            </Span>
            <Span>
              <p>{t('cloudiness')}</p>
              <p>{city.clouds.all}%</p>
            </Span>
            <Span>
              <p>{t('sunset')}</p>
              <p>{formatTime(city.sys.sunset)}</p>
            </Span>
          </Info>
          <div>
            <a
              href={`https://www.google.com/maps/place/${city.coord.lat}%2C${city.coord.lon}`}
              target="_blank"
              rel="noreferrer"
            >
              <MapPinIcon
                color={mode === 'light' ? 'black' : 'white'}
                width="32"
              />
            </a>
            <button
              onClick={favorite ? removeFromFavorite : addToFavorite}
              aria-label={
                favorite ? t('removeFromFavorites') : t('addToFavorites')
              }
            >
              {!favorite && (
                <StarIconOutline
                  color={mode === 'light' ? 'black' : 'white'}
                  width="32"
                />
              )}
              {favorite && (
                <StarIconSolid
                  color={mode === 'light' ? 'black' : 'white'}
                  width="32"
                />
              )}
            </button>
          </div>
        </City>
      )}
    </Container>
  );
};

export default SearchResults;
