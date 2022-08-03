import React, {useState} from "react";
import styled from "styled-components";
import theme from 'styled-theming';

const sectionBackgroundColor = theme('mode', {
    light: 'lightgray',
    dark: '#282c34',
})

const Section = styled.section`
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
    padding: 10px;
    transition: all 0.5s ease;
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
    width: 200px;
    height: 50px;
    outline: none;
    border: 2px solid ${sectionBackgroundColor};
    border-radius: 20px;
    padding: 5px;
`

const ToggleButton = styled.button`
    border: none;
    background-color: transparent;
    cursor: pointer;
    color: #FFF;
    font-size: 16px;
`

const SearchBar:React.FC = (props : any) => {
    const toggleTheme = () => {
        props.toggleMode(props.mode === 'light' ? 'dark' : 'light')
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
                <ToggleButton onClick={toggleTheme}>
                    {props.mode === 'light' ? 'Dark' : 'Light'}
                </ToggleButton>
            </Header>
            <Form onSubmit={commenceSearch}>
                <Input type="text" value={inputField} onChange={(e) => setInputField(e.target.value)}/>
            </Form>
        </Section>
    )
}

export default SearchBar
