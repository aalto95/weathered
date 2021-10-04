import {weatherAPI} from "../api/api";

const SET_CITY = 'SET_CITY'
const SET_FETCH_ERROR = 'SET_FETCH_ERROR'

let initialState = {
    city: null,
    fetchError: false
}

export type InitialStateType = typeof initialState

const searchReducer = (state = initialState, action : any) : InitialStateType => {
    switch(action.type) {
        case SET_CITY:
            return {
                ...state,
                city: action.city
            }
        case SET_FETCH_ERROR:
            return {
                ...state,
                fetchError: action.fetchError
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
export let setFetchError = (fetchError : boolean) => ({ type: SET_FETCH_ERROR, fetchError })

export let search = (cityName : string) => async (dispatch : any) => {
    try {
        let response = await weatherAPI.getCity(cityName)
        dispatch(setCity(response))
        dispatch(setFetchError(false))
    } catch (e) {
        dispatch(setFetchError(true))
    }

}

export default searchReducer
