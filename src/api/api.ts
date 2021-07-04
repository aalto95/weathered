import axios from "axios";

const instance = axios.create({
    baseURL: 'http://api.openweathermap.org/data/2.5/weather',
})

export const weatherAPI = {
    getCity: (city : string) => {
        return instance.get(`?q=${city}&units=metric&appid=4cb227e028a1bd4aed635ca5f6820041`)
            .then(response => {
                console.log(response.data)
                return response.data
            })
    }
}
