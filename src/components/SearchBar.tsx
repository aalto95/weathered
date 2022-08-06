import React, {useState} from "react";
import styled from "styled-components";
import { useAppDispatch } from '../app/hooks'
import { fetchCityWeather } from '../features/app-slice'

const Section = styled.section`
    color: #FFF;
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
    background-color: #f2f2f2;
    border-radius: 20px;
    padding: 5px;
`

const SearchBar:React.FC = () => {

    const dispatch = useAppDispatch()

    const commenceSearch = (e : any) => {
        e.preventDefault()
        dispatch(fetchCityWeather(inputField))
    }

    const [inputField, setInputField] = useState('')

    return (
        <Section>
            <Form onSubmit={commenceSearch}>
                <Input type="text" value={inputField} onChange={(e) => setInputField(e.target.value)}/>
            </Form>
        </Section>
    )
}

export default SearchBar
