import React from 'react'
import styled from 'styled-components'
import { useAppSelector } from '../app/hooks'
import SearchBar from '../components/SearchBar'
import SearchResults from '../components/SearchResults'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: transparent;
`

export const Search = () => {
  const city = useAppSelector((state) => state.app.city)
  const fetchError = useAppSelector((state) => state.app.fetchError)
  const isFetching = useAppSelector((state) => state.app.isFetching)

  return (
    <Wrapper>
      <SearchBar />
      <SearchResults
        city={city}
        fetchError={fetchError}
        isFetching={isFetching}
      />
    </Wrapper>
  )
}
