import React from "react";
import SearchResults from "./SearchResults";
import {connect} from "react-redux";

const SearchResultsContainer = (props : any) => {
    return <SearchResults {...props}/>
}

let mapStateToProps = (state : any) => {
    return {
        city: state.search.city,
        fetchError: state.search.fetchError
    }
}

let mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps) (SearchResultsContainer)
