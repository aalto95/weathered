import {weatherAPI} from "../api/api";

const SET_CITY = 'SET_CITY'
const SET_FETCH_ERROR = 'SET_FETCH_ERROR'
const SET_IS_FETCHING = 'SET_IS_FETCHING'

let initialState = {
    city: null,
    fetchError: false,
    isFetching: false
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
        case SET_IS_FETCHING:
            return {
                ...state,
                isFetching: action.isFetching
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
export let setIsFetching = (isFetching : boolean) => ({ type: SET_IS_FETCHING, isFetching })

export let search = (cityName : string) => async (dispatch : any) => {
    dispatch(setIsFetching(true))
    try {
        let response = await weatherAPI.getCity(cityName)
        dispatch(setCity(response))
        dispatch(setFetchError(false))
    } catch (e) {
        dispatch(setFetchError(true))
    }
    dispatch(setIsFetching(false))
}

export default searchReducer
