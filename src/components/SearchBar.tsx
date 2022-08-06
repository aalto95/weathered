import React, {useState} from "react";
import styled from "styled-components";
import theme from 'styled-theming';
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchCityWeather, toggleMode } from '../features/app-slice'
import darkModeIcon from '../assets/icons/dark-mode-icon.svg'
import lightModeIcon from '../assets/icons/light-mode-icon.svg'
import {HandySvg} from 'handy-svg';

const LightModeIcon = () => (
    <HandySvg
        src={lightModeIcon}
        className="icon"
        width="32"
        height="32"
        color="#000"
    />
)

const DarkModeIcon = () => (
    <HandySvg
        src={darkModeIcon}
        className="icon"
        width="32"
        height="32"
    />
);

const LogoImg = styled.img`
    width: 32px;
`

const sectionBackgroundColor = theme('mode', {
    light: '#FFF',
    dark: 'rgb(36, 37, 38)',
})

const headingColor = theme('mode', {
    light: '#1C1E21',
    dark: '#E3E3E3;',
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
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px
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
    border: none;
    background-color: #f2f2f2;
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

const Heading = styled.h1`
    margin-left: 8px;
    font-size: 18px;
    color: ${headingColor};
`

const HeadingWrapper = styled.div`
    display: flex;
    align-items: center;
`

const SearchBar:React.FC = () => {
    const mode = useAppSelector(state => state.app.mode)
    const dispatch = useAppDispatch()

    const toggleTheme = () => {
        dispatch(toggleMode(mode === "light" ? 'dark' : 'light'))
    }    

    const commenceSearch = (e : any) => {
        e.preventDefault()
        dispatch(fetchCityWeather(inputField))
    }

    const [inputField, setInputField] = useState('')

    return (
        <Section>
            <Header>
                <HeadingWrapper>
                    <LogoImg src="/logo192.png" alt="logo" style={mode === "light" ? { filter: 'invert(1)' } : { filter: 'invert(0)' }} /> 
                    <Heading>Weathered</Heading>
                </HeadingWrapper>
                <ToggleButton onClick={toggleTheme}>
                    {mode === 'light' ? <LightModeIcon /> : <DarkModeIcon /> }
                </ToggleButton>
            </Header>
            <Form onSubmit={commenceSearch}>
                <Input type="text" value={inputField} onChange={(e) => setInputField(e.target.value)}/>
            </Form>
        </Section>
    )
}

export default SearchBar
