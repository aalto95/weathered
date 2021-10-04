import React, {useState} from "react";
import styled from "styled-components";

const Section = styled.section`
      background-color: #282c34;
      color: #FFF;
      display: flex;
      justify-content: center;
      align-items: center;
    `
const Form = styled.form`
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      margin: 2rem 0 2rem 0;
    `

const Input = styled.input`
      margin: 1rem 0 1rem 0;
      height: 30px;
      outline: none;
      border: none;
      border-radius: 5px;
      padding: 5px;
    `

const SearchBar:React.FC = (props : any) => {
    let commenceSearch = (e : any) => {
        e.preventDefault()
        props.search(inputField)
    }
    const [inputField, setInputField] = useState('')
    return (
        <Section>
            <Form onSubmit={commenceSearch}>
                <h1>Weather Checker</h1>
                <Input type="text" value={inputField} onChange={(e) => setInputField(e.target.value)}/>
            </Form>
        </Section>
    )
}

export default SearchBar
