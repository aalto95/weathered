import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';

import {
  ArrowTopRightOnSquareIcon,
  StarIcon as StarIconOutline
} from '@heroicons/react/24/outline';
import {
  MapPinIcon,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  borderColor,
  cardShadow,
  hoverColor,
  mutedTextColor,
  surfaceColor,
  surfaceMutedColor,
  textColor
} from '../constants/theme';
import { favoritePushed, favoriteRemoved } from '../features/app-slice';
import {
  FavoriteLocation,
  WeatherAnimation,
  WeatherModel
} from '../models/weather.model';
import { Loader } from './Loader';
import { RiveAnimation } from './RiveAnimation';

const conditionAccents: Record<
  WeatherAnimation,
  { light: string; dark: string }
> = {
  clear: { light: '#F59E0B', dark: '#FBBF24' },
  clouds: { light: '#64748B', dark: '#94A3B8' },
  rain: { light: '#2563EB', dark: '#60A5FA' },
  snow: { light: '#0891B2', dark: '#67E8F9' },
  thunderstorm: { light: '#7C3AED', dark: '#A78BFA' }
};

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const City = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  max-width: 640px;
  padding: clamp(20px, 4vw, 32px);
  background-color: ${surfaceColor};
  border: 1px solid ${borderColor};
  border-radius: 28px;
  box-shadow: ${cardShadow};
  color: ${textColor};
  animation: ${rise} 0.4s ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Glow = styled.div<{ $accent: string }>`
  position: absolute;
  top: -90px;
  right: -70px;
  width: 240px;
  height: 240px;
  background-color: ${({ $accent }) => $accent};
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.18;
  pointer-events: none;
`;

const Content = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 18px;
  z-index: 1;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: ${mutedTextColor};

  svg {
    flex-shrink: 0;
  }
`;

const CityName = styled.h1`
  margin: 0;
  overflow: hidden;
  color: ${textColor};
  font-size: 1.1rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Country = styled.span`
  color: ${mutedTextColor};
  font-weight: 400;
`;

const FavoriteButton = styled.button<{ $active: boolean }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  color: ${({ $active }) => ($active ? '#F59E0B' : 'inherit')};
  transition:
    background-color 0.2s ease,
    transform 0.15s ease;

  &:hover {
    background-color: ${hoverColor};
  }

  &:active {
    transform: scale(0.92);
  }
`;

const Hero = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Temperature = styled.p<{ $accent: string }>`
  margin: 0;
  color: ${textColor};
  font-size: clamp(3.4rem, 11vw, 5rem);
  font-weight: 300;
  letter-spacing: -0.05em;
  line-height: 0.95;
  font-variant-numeric: tabular-nums;

  span {
    margin-left: 4px;
    color: ${({ $accent }) => $accent};
    font-size: 0.34em;
    font-weight: 600;
    letter-spacing: 0;
    vertical-align: top;
  }
`;

const Description = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  margin: 10px 0 0;
  font-size: 1rem;

  strong {
    font-weight: 600;
  }

  span {
    color: ${mutedTextColor};
    font-size: 0.9rem;
  }
`;

const AnimationBox = styled.div<{ $accent: string }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 132px;
  height: 132px;
  background-color: ${({ $accent }) => `${$accent}1a`};
  border: 1px solid ${({ $accent }) => `${$accent}33`};
  border-radius: 50%;

  @media (max-width: 420px) {
    width: 104px;
    height: 104px;
  }
`;

const Stats = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background-color: ${surfaceMutedColor};
  border-radius: 14px;
`;

const StatLabel = styled.dt`
  margin: 0;
  color: ${mutedTextColor};
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const StatValue = styled.dd`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
`;

const MapLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background-color: ${surfaceMutedColor};
  border: 1px solid transparent;
  border-radius: 999px;
  color: ${textColor};
  font-size: 0.88rem;
  font-weight: 500;
  text-decoration: none;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${borderColor};
  }
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
  const { t } = useTranslation();

  const formatTime = (isoDate: string) => {
    const time = isoDate.split('T')[1];
    return time ? time.slice(0, 5) : isoDate;
  };

  if (!city) {
    return (
      <Container>
        {isFetching && <Loader width={140} height={140} />}
        {fetchError && (
          <RiveAnimation animationName="404" width={240} height={240} />
        )}
      </Container>
    );
  }

  const condition = city.weather[0];
  const accent =
    conditionAccents[condition.main][mode === 'light' ? 'light' : 'dark'];

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

  return (
    <Container>
      {isFetching && <Loader width={140} height={140} />}
      {fetchError && (
        <RiveAnimation animationName="404" width={240} height={240} />
      )}
      {!isFetching && !fetchError && (
        <City>
          <Glow $accent={accent} aria-hidden="true" />
          <Content>
            <CardHeader>
              <Location>
                <MapPinIcon width={18} />
                <CityName>
                  {city.name || t('myLocation')}
                  {city.country && <Country>, {t(city.country)}</Country>}
                </CityName>
              </Location>
              <FavoriteButton
                type="button"
                onClick={favorite ? removeFromFavorite : addToFavorite}
                $active={Boolean(favorite)}
                aria-pressed={Boolean(favorite)}
                aria-label={
                  favorite ? t('removeFromFavorites') : t('addToFavorites')
                }
              >
                {favorite ? (
                  <StarIconSolid width={20} />
                ) : (
                  <StarIconOutline width={20} />
                )}
              </FavoriteButton>
            </CardHeader>

            <Hero>
              <div>
                <Temperature $accent={accent}>
                  {Math.round(city.main.temp)}
                  <span>°C</span>
                </Temperature>
                <Description>
                  <strong>{t(condition.description)}</strong>
                  <span>
                    {t('feelsLike')} {Math.round(city.main.feels_like)}°C
                  </span>
                </Description>
              </div>
              <AnimationBox $accent={accent}>
                <RiveAnimation
                  animationName={condition.main}
                  width={120}
                  height={120}
                />
              </AnimationBox>
            </Hero>

            <Stats>
              <Stat>
                <StatLabel>{t('visibility')}</StatLabel>
                <StatValue>
                  {(city.visibility / 1000).toFixed(1)} {t('km')}
                </StatValue>
              </Stat>
              <Stat>
                <StatLabel>{t('wind')}</StatLabel>
                <StatValue>
                  {Math.round(city.wind.speed)} {t('kmperhour')}
                </StatValue>
              </Stat>
              <Stat>
                <StatLabel>{t('sunrise')}</StatLabel>
                <StatValue>{formatTime(city.sys.sunrise)}</StatValue>
              </Stat>
              <Stat>
                <StatLabel>{t('humidity')}</StatLabel>
                <StatValue>{Math.round(city.main.humidity)}%</StatValue>
              </Stat>
              <Stat>
                <StatLabel>{t('cloudiness')}</StatLabel>
                <StatValue>{Math.round(city.clouds.all)}%</StatValue>
              </Stat>
              <Stat>
                <StatLabel>{t('sunset')}</StatLabel>
                <StatValue>{formatTime(city.sys.sunset)}</StatValue>
              </Stat>
            </Stats>

            <CardFooter>
              <MapLink
                href={`https://www.google.com/maps/place/${city.coord.lat}%2C${city.coord.lon}`}
                target="_blank"
                rel="noreferrer"
              >
                <ArrowTopRightOnSquareIcon width={16} />
                {t('viewOnMap')}
              </MapLink>
            </CardFooter>
          </Content>
        </City>
      )}
    </Container>
  );
};

export default SearchResults;
