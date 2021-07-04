import {weatherAPI} from "../api/api";

const SET_CITY = 'SET_CITY'

let initialState = {
    city: null
}

export type InitialStateType = typeof initialState

const searchReducer = (state = initialState, action : any) : InitialStateType => {
    switch(action.type) {
        case SET_CITY:
            return {
                ...state,
                city: action.city
            }
        default:
            return state
    }
}

type SetCityActionType = {
    type: typeof SET_CITY
    city: object
}

export let setCity = (city : object) : SetCityActionType => ({ type: SET_CITY, city })

export let search = (cityName : string) => async (dispatch : any) => {
    let response = await weatherAPI.getCity(cityName)
    dispatch(setCity(response))
}

export default searchReducer
