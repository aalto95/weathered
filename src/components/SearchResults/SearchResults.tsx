import { useLottie } from 'lottie-react'
import React from "react";
import styled from "styled-components";
import cloudyAnimation from '../../assets/animations/cloudy.json'

const City = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 50px;
  background-color: gray;
`

const Info = styled.div`
  display: grid;
  width: 300px;
  margin-top: 20px;
  grid-template-columns: 33% 33% 33%;
  grid-template-rows: 50px 50px;
`

const Span = styled.span`
  text-align: center;
`

const CloudyAnimation = () => {
    const options = {
        animationData: cloudyAnimation,
        style: {width: '100px', height: '100px'},
        loop: true,
        autoPlay: true
    }
    const { View } = useLottie(options)
    return View
}

const SearchResults = (props : any) => {
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
            <CloudyAnimation />
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
    return <></>
}

export default SearchResults
