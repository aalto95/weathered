import { useLottie } from 'lottie-react';
import React from "react";
import styled from "styled-components";
import cloudsAnimation from '../../assets/animations/clouds.json'
import rainAnimation from '../../assets/animations/rain.json'
import snowAnimation from '../../assets/animations/snow.json'
import clearAnimation from '../../assets/animations/clear.json'
import thunderstormAnimation from '../../assets/animations/thunderstorm.json'
import theme from 'styled-theming'

const infoBackgroundColor = theme('mode', {
    light: '#F7ECDE',
    dark: '#51557E',
})

const cardBackgroundColor = theme('mode', {
    light: '#F7ECCC',
    dark: '#51557E',
})

const textColor = theme('mode', {
    light: '#000',
    dark: '#FFF',
})

const City = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 50px;
  background-color: gray;
  border-radius: 12px;
  background-color: ${cardBackgroundColor};
  color: ${textColor};
  transition: all 0.5s ease;
`

const Info = styled.div`
  display: grid;
  width: 300px;
  margin-top: 20px;
  grid-template-columns: 33% 33% 33%;
  grid-template-rows: 50px 50px;
  background-color: ${infoBackgroundColor};
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  transition: all 0.5s ease;
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

const LottieAnimation = ({type}: {type: string}) => {
    let options = {
        animationData: getWeatherTypeAnimation(type),
        style: {width: '100px', height: '100px'},
        loop: true,
        autoPlay: true
    }
    
    const { View } = useLottie(options)
    return View
}

interface SearchResultsProps {
    city: any;
    isFetching: boolean;
    fetchError: string;
}

const SearchResults = (props: SearchResultsProps) => {
    console.log(props.city)
    let formatUnixDate = (unixDate : number) => {
        let date = new Date(unixDate * 1000);
        let hours = date.getHours();
        let minutes = "0" + date.getMinutes();
        let formattedTime = hours + ':' + minutes.substr(-2)
        return formattedTime
    }

    if (props.fetchError) return (
        <h1>Failed to fetch...</h1>
    )

    if (props.city) return (
        <City>
            <h1>{props.city.name}, {props.city.sys.country}</h1>
            <p>{Math.round(props.city.main.temp)}°C</p>
            <p>{props.city.weather[0].main}</p>
            <LottieAnimation type={props.city.weather[0].main}/>
            <Info>
                <Span>
                    <p>visibility</p>
                    <p>{props.city.visibility / 1000}km</p>
                </Span>
                <Span>
                    <p>wind</p>
                    <p>{props.city.wind.speed}km/h</p>
                </Span>
                <Span>
                    <p>sunrise</p>
                    <p>{formatUnixDate(props.city.sys.sunrise)}</p>
                </Span>
                <Span>
                    <p>humidity</p>
                    <p>{props.city.main.humidity}</p>
                </Span>
                <Span>
                    <p>cloudiness</p>
                    <p>{props.city.clouds.all}%</p>
                </Span>
                <Span>
                    <p>sunset</p>
                    <p>{formatUnixDate(props.city.sys.sunset)}</p>
                </Span>
            </Info>
        </City>
    )

    return null
}

export default SearchResults
