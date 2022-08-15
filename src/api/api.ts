import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5/weather'
})

export const weatherAPI = {
  getCityByName: (city: string, lang: string = 'en') => {
    return instance
      .get(
        `?q=${city}&units=metric&appid=4cb227e028a1bd4aed635ca5f6820041&lang=${lang}`
      )
      .then((response) => {
        return response.data
      })
  },
  getCityByCoords: (lat: number, lon: number, lang: string = 'en') => {
    return instance
      .get(
        `?lat=${lat}&lon=${lon}&units=metric&appid=4cb227e028a1bd4aed635ca5f6820041&lang=${lang}`
      )
      .then((response) => {
        return response.data
      })
  }
}
