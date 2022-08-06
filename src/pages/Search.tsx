import styled from 'styled-components'
import SearchBar from '../components/SearchBar'
import SearchResults from '../components/SearchResults'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: transparent;
`

export const Search = () => {
  return (
    <Wrapper>
      <SearchBar />
      <SearchResults />
    </Wrapper>
  )
}