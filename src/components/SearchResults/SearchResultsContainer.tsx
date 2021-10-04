import React from "react";
import SearchResults from "./SearchResults";
import {connect} from "react-redux";
import Loader from "../Loader/Loader";
import styled from "styled-components";

const Section = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

const SearchResultsContainer = (props : any) => {
    return (
        <Section>
            {
                props.isFetching ? <Loader /> : <SearchResults {...props}/>
            }
        </Section>
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
