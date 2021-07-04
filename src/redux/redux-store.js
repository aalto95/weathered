import {combineReducers, createStore} from "redux";
import searchReducer from "./search-reducer";

let reducers = combineReducers({
    search: searchReducer
})

let store = createStore(reducers)

window.store = store

export default store
