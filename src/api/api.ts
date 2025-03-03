import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5/'
});

export const weatherAPI = {
  getCityByName: (city: string, lang: string = 'en') => {
    return instance
      .get(
        `weather?q=${city}&units=metric&appid=4cb227e028a1bd4aed635ca5f6820041&lang=${lang}`
      )
      .then((response) => {
        return response.data;
      });
  },
  getCityByCoords: (lat: number, lon: number, lang: string = 'en') => {
    return instance
      .get(
        `weather?lat=${lat}&lon=${lon}&units=metric&appid=4cb227e028a1bd4aed635ca5f6820041&lang=${lang}`
      )
      .then((response) => {
        return response.data;
      });
  },
  getMultipleCities: (cities: number[], lang: string = 'en') => {
    return instance
      .get(
        `group?id=${cities.join(
          ','
        )}&units=metric&appid=4cb227e028a1bd4aed635ca5f6820041&lang=${lang}`
      )
      .then((response) => {
        return response.data;
      });
  }
};
