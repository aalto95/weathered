import { useLottie } from 'lottie-react'
import React from 'react'
import styled from 'styled-components'
import cloudsAnimation from '../assets/animations/clouds.json'
import rainAnimation from '../assets/animations/rain.json'
import snowAnimation from '../assets/animations/snow.json'
import clearAnimation from '../assets/animations/clear.json'
import thunderstormAnimation from '../assets/animations/thunderstorm.json'
import theme from 'styled-theming'
import { useAppSelector } from '../app/hooks'
import Loader from './Loader'

const cardBackgroundColor = theme('mode', {
  light: '#f2f2f2',
  dark: '#272822'
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
  grid-template-rows: 50px 50px;
`

const Span = styled.span`
  text-align: center;
`

const getWeatherTypeAnimation = (type: string) => {
  switch (type) {
    case 'Thunderstorm':
      return thunderstormAnimation
    case 'Clear':
      return clearAnimation
    case 'Clouds':
      return cloudsAnimation
    case 'Rain':
      return rainAnimation
    case 'Snow':
      return snowAnimation
    default:
      return null
  }
}

const LottieAnimation = ({ type }: {type: string}) => {
  const options = {
    animationData: getWeatherTypeAnimation(type),
    style: { width: '100px', height: '100px' },
    loop: true,
    autoPlay: true
  }

  const { View } = useLottie(options)
  return View
}

const Error404Animation = () => {
  const { View } = useLottie({
    animationData: require('../assets/animations/404.json'),
    style: { width: '300px', height: '300px' },
    loop: true,
    autoPlay: true
  })
  return View
}

const SearchResults = () => {
  const city = useAppSelector(state => state.app.city)
  const fetchError = useAppSelector(state => state.app.fetchError)
  const isFetching = useAppSelector(state => state.app.isFetching)

  const formatUnixDate = (unixDate : number) => {
    const date = new Date(unixDate * 1000)
    const hours = date.getHours()
    const minutes = '0' + date.getMinutes()
    const formattedTime = hours + ':' + minutes.substr(-2)
    return formattedTime
  }

  return (
        <Container>
            {isFetching && <Loader />}
            {fetchError && <Error404Animation />}
            {city && !isFetching && !fetchError && <City>
                <h1>{city.name}, {city.sys.country}</h1>
                <p>{Math.round(city.main.temp)}°C</p>
                <p>{city.weather[0].main}</p>
                <LottieAnimation type={city.weather[0].main}/>
                <Info>
                    <Span>
                        <p>visibility</p>
                        <p>{city.visibility / 1000}km</p>
                    </Span>
                    <Span>
                        <p>wind</p>
                        <p>{city.wind.speed}km/h</p>
                    </Span>
                    <Span>
                        <p>sunrise</p>
                        <p>{formatUnixDate(city.sys.sunrise)}</p>
                    </Span>
                    <Span>
                        <p>humidity</p>
                        <p>{city.main.humidity}</p>
                    </Span>
                    <Span>
                        <p>cloudiness</p>
                        <p>{city.clouds.all}%</p>
                    </Span>
                    <Span>
                        <p>sunset</p>
                        <p>{formatUnixDate(city.sys.sunset)}</p>
                    </Span>
                </Info>
            </City>}
        </Container>
  )
}

export default SearchResults
