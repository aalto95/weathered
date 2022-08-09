import React, { FormEvent, useState } from 'react'
import styled from 'styled-components'
import { useAppDispatch } from '../app/hooks'
import { fetchWeatherByCityName } from '../features/app-slice'
import searchIcon from '../assets/icons/search-icon.svg'

const Section = styled.section`
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const Form = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 2rem 0 2rem 0;
`

const Input = styled.input`
  padding: 1rem 0 1rem 0;
  width: 200px;
  height: 50px;
  outline: none;
  border: none;
  border-radius: 20px;
  padding: 5px;
  padding-left: 25px;
  font-family: inherit;
  font-size: inherit;
  background-image: url(${searchIcon});
  background-repeat: no-repeat;
  background-position: 5px;
`

const SearchBar: React.FC = () => {
  const dispatch = useAppDispatch()

  const commenceSearch = (e: FormEvent) => {
    e.preventDefault()
    dispatch(fetchWeatherByCityName(inputField))
  }

  const [inputField, setInputField] = useState('')

  return (
    <Section>
      <Form onSubmit={commenceSearch}>
        <Input
          type="text"
          placeholder="Search..."
          value={inputField}
          onChange={(e: React.FormEvent<HTMLInputElement>) =>
            setInputField(e.currentTarget.value)
          }
        />
      </Form>
    </Section>
  )
}

export default SearchBar
