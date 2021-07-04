import React from "react";
import SearchBar from "./SearchBar";
import {connect} from "react-redux";
import {search} from "../../redux/search-reducer";

const SearchBarContainer = (props : any) => {
    return <SearchBar {...props}/>
}

let mapStateToProps = (state : any) => {
    return {

    }
}

let mapDispatchToProps = {
    search
}

export default connect(mapStateToProps, mapDispatchToProps) (SearchBarContainer)
