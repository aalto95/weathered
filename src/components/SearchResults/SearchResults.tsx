import React from "react";
import styles from './SearchResults.module.css'

const SearchResults = (props : any) => {
    let formatUnixDate = (unixDate : number) => {
        let date = new Date(unixDate * 1000);
        let hours = date.getHours();
        let minutes = "0" + date.getMinutes();
        let formattedTime = hours + ':' + minutes.substr(-2)
        return formattedTime
    }

    if (props.city) return (
        <section className={styles.searchResults}>
            <div className={styles.city}>
                <h1>{props.city.name}, {props.city.sys.country}</h1>
                <p>{Math.round(props.city.main.temp)}°C</p>
                <p>{props.city.weather[0].main}</p>
                <div className={styles.characteristics}>
                    <span>
                        <p>visibility</p>
                        <p>{props.city.visibility / 1000}km</p>
                    </span>
                    <span>
                        <p>wind</p>
                        <p>{props.city.wind.speed}km/h</p>
                    </span>
                    <span>
                        <p>sunrise</p>
                        <p>{formatUnixDate(props.city.sys.sunrise)}</p>
                    </span>
                    <span>
                        <p>humidity</p>
                        <p>{props.city.main.humidity}</p>
                    </span>
                    <span>
                        <p>cloudiness</p>
                        <p>{props.city.clouds.all}%</p>
                    </span>
                    <span>
                        <p>sunset</p>
                        <p>{formatUnixDate(props.city.sys.sunset)}</p>
                    </span>

                </div>
            </div>
        </section>
    )
    return <></>
}

export default SearchResults
