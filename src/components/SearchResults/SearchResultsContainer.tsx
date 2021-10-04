import React from "react";
import SearchResults from "./SearchResults";
import {connect} from "react-redux";
import Loader from "../Loader/Loader";
import styles from "./SearchResults.module.css";

const SearchResultsContainer = (props : any) => {
    return (
        <section className={styles.searchResults}>
            {
                props.isFetching ? <Loader /> : <SearchResults {...props}/>
            }
        </section>
    )
}

let mapStateToProps = (state : any) => {
    return {
        city: state.search.city,
        isFetching: state.search.isFetching,
        fetchError: state.search.fetchError
    }
}

let mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps) (SearchResultsContainer)
