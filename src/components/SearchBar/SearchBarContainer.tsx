import React from "react";
import SearchBar from "./SearchBar";
import {connect} from "react-redux";
import {search} from "../../redux/search-reducer";
import { toggleMode } from '../../redux/app-reducer'

const SearchBarContainer = (props : any) => {
    return <SearchBar {...props}/>
}

let mapStateToProps = (state : any) => {
    return {
        mode: state.app.mode
    }
}

let mapDispatchToProps = {
    search,
    toggleMode
}

export default connect(mapStateToProps, mapDispatchToProps) (SearchBarContainer)
