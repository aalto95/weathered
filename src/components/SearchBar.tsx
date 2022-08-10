import React, { useState } from 'react'
import styled from 'styled-components'
import { useAppDispatch } from '../app/hooks'
import { fetchWeatherByCityName } from '../features/app-slice'
import searchIcon from '../assets/icons/search-icon.svg'
import closeIcon from '../assets/icons/close-icon-dark.svg'

const Container = styled.section`
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const Form = styled.form`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2rem 0 2rem 0;
  background-color: #fff;
  border-radius: 15px;
  padding: 5px;
  width: 280px;
  height: 60px;
`

const Input = styled.input`
  padding: 1rem 0 1rem 0;
  outline: none;
  border: none;
  border-radius: 20px;
  font-family: inherit;
  font-size: inherit;
  padding-left: 10px;
`

const DeleteButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
`

const Icon = styled.img`
  width: 32px;
  height: 32px;
`

const Span = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
`

const SearchBar: React.FC = () => {
  const dispatch = useAppDispatch()

  const commenceSearch = () => {
    dispatch(fetchWeatherByCityName(inputField))
  }

  const clearInputField = () => {
    setInputField('')
  }

  const [inputField, setInputField] = useState('')

  return (
    <Container>
      <Form onSubmit={commenceSearch}>
        <Span>
          <Icon src={searchIcon} alt="search" />
          <Input
            type="text"
            placeholder="Search"
            value={inputField}
            onChange={(e: React.FormEvent<HTMLInputElement>) =>
              setInputField(e.currentTarget.value)
            }
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                commenceSearch()
              }
            }}
          />
        </Span>
        {inputField && (
          <DeleteButton onClick={clearInputField}>
            <Icon src={closeIcon} />
          </DeleteButton>
        )}
      </Form>
    </Container>
  )
}

export default SearchBar
