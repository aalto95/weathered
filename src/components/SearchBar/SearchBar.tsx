import React, {useState} from "react";
import styled from "styled-components";
import theme from 'styled-theming';

const sectionBackgroundColor = theme('mode', {
    light: 'lightgray',
    dark: '#282c34',
})

const Section = styled.section`
    background-color: ${sectionBackgroundColor};
    color: #FFF;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const Header = styled.header`
    background-color: ${sectionBackgroundColor};
    display: flex;
    justify-content: space-between;
    width: 100%;
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
    const toggleTheme = () => {
        props.setMode(props.mode === 'light' ? 'dark' : 'light')
        console.log(props.mode)
    }    

    const commenceSearch = (e : any) => {
        e.preventDefault()
        props.search(inputField)
    }
    const [inputField, setInputField] = useState('')
    return (
        <Section>
            <Header>
                <h1>Weather</h1>
                <button onClick={toggleTheme}>Theme Change</button>
            </Header>
            <Form onSubmit={commenceSearch}>
                <Input type="text" value={inputField} onChange={(e) => setInputField(e.target.value)}/>
            </Form>
        </Section>
    )
}

export default SearchBar
