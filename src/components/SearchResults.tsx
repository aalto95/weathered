import React from 'react'
import styled from 'styled-components'
import cloudsAnimation from '../assets/animations/clouds.json'
import rainAnimation from '../assets/animations/rain.json'
import snowAnimation from '../assets/animations/snow.json'
import clearAnimation from '../assets/animations/clear.json'
import thunderstormAnimation from '../assets/animations/thunderstorm.json'
import theme from 'styled-theming'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { Loader } from './Loader'
import { useTranslation } from 'react-i18next'
import { favoritePushed, favoriteRemoved } from '../features/app-slice'
import {
  MapPinIcon,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid'
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline'
import { RiveAnimation } from './RiveAnimation'

const cardBackgroundColor = theme('mode', {
  light: '#f2f2f2',
  dark: '#242526'
})

const textColor = theme('mode', {
  light: '#1C1E21',
  dark: '#E3E3E3;'
})

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

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
`

const Info = styled.div`
  display: grid;
  width: 300px;
  padding-top: 20px;
  grid-template-columns: 33% 33% 33%;
  grid-template-rows: 70px 50px;
`

const Span = styled.span`
  text-align: center;
`

interface SearchResultsProps {
  city: any
  fetchError: boolean
  isFetching: boolean
  isFavorite?: boolean
}

const SearchResults: React.FC<SearchResultsProps> = ({
  city,
  fetchError,
  isFetching,
  isFavorite
}) => {
  const dispatch = useAppDispatch()
  const mode = useAppSelector((state) => state.app.mode)
  const favoritesIds = useAppSelector((state) => state.app.favoritesIds)

  const formatUnixDate = (unixDate: number) => {
    const date = new Date(unixDate * 1000)
    const hours = date.getHours()
    const minutes = '0' + date.getMinutes()
    const formattedTime = hours + ':' + minutes.substr(-2)
    return formattedTime
  }

  const { t, i18n } = useTranslation()

  const addToFavorite = () => {
    dispatch(favoritePushed(city.id))
  }

  const removeFromFavorite = () => {
    dispatch(favoriteRemoved(city.id))
  }

  const getIsFavorite = () => {
    return favoritesIds.includes(city.id)
  }

  return (
    <Container>
      {isFetching && <Loader />}
      {fetchError && <RiveAnimation animationName="404" />}
      {city && !isFetching && !fetchError && (
        <City>
          <h1 style={{ textAlign: 'center' }}>
            {city.name}, {t(city.sys.country)}
          </h1>
          <p>{Math.round(city.main.temp)}°C</p>
          <p>{city.weather[0].description}</p>
          <RiveAnimation
            animationName={city.weather[0].main.toLowerCase()}
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
              <p>{formatUnixDate(city.sys.sunrise)}</p>
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
              <p>{formatUnixDate(city.sys.sunset)}</p>
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
              onClick={getIsFavorite() ? removeFromFavorite : addToFavorite}
            >
              {!getIsFavorite() && (
                <StarIconOutline
                  color={mode === 'light' ? 'black' : 'white'}
                  width="32"
                />
              )}
              {getIsFavorite() && (
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
  )
}

export default SearchResults
