
let initialState = {
    cities: null
}

export type InitialStateType = typeof initialState

const searchReducer = (state = initialState, action : any) : InitialStateType => {
    switch(action.type) {
        default:
            return state
    }
}

export default searchReducer
