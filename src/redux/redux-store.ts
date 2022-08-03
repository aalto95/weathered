import { applyMiddleware, combineReducers, createStore } from "redux";
import searchReducer from "./search-reducer";
import thunkMiddleware from "redux-thunk";
import appReducer from "./app-reducer";

let reducers = combineReducers({
  search: searchReducer,
  app: appReducer,
});

let store = createStore(reducers, applyMiddleware(thunkMiddleware));

export default store;
