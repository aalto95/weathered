import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import SearchResults from '../components/SearchResults'
import { fetchMultipleCities } from '../features/app-slice'

interface FavoritesProps {}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`

export const Favorites: React.FC<FavoritesProps> = () => {
  const dispatch = useAppDispatch()
  const favoritesIds = useAppSelector((state) => state.app.favoritesIds)
  const favorites = useAppSelector((state) => state.app.favorites)
  const isFetching = useAppSelector((state) => state.app.isFetching)
  const fetchError = useAppSelector((state) => state.app.fetchError)

  useEffect(() => {
    dispatch(fetchMultipleCities(favoritesIds))
  }, [])
  return (
    <Container>
      {favorites.map((city: any, id: number) => {
        return (
          <SearchResults
            key={id}
            city={city}
            fetchError={fetchError}
            isFetching={isFetching}
          ></SearchResults>
        )
      })}
    </Container>
  )
}
