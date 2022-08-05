import React, {useState} from "react";
import styled from "styled-components";
import theme from 'styled-theming';

const rotation = theme('mode', {
    light: 'rotate(180deg)',
    dark: 'rotate(360deg)',
})

const VinylIcon = ({theme}: {theme: string}) => {

    const ThemeImg = styled.div`
        width: 32px;
        height: 32px;
        transform: ${rotation};
        transition: all 0.5s ease;
    `

    return (
        <ThemeImg>
            <svg version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 454.745 454.745" width='32px'>
                <g>
                    <g>
                        <g>
                            <path fill={theme === 'light' ? '#51557E' : '#F7ECDE' } d="M227.372,172.545c-30.238,0-54.819,24.581-54.819,54.827c0,30.23,24.581,54.827,54.819,54.827
                                c30.222,0,54.819-24.597,54.819-54.827C282.192,197.134,257.595,172.545,227.372,172.545z"/>
                        </g>
                        <g>
                            <path fill={theme === 'light' ? '#51557E' : '#F7ECDE' } d="M227.372,0C102.005,0,0,101.981,0,227.372C0,352.74,102.005,454.745,227.372,454.745
                                S454.745,352.74,454.745,227.372C454.745,101.981,352.74,0,227.372,0z M122.709,377.003l64.525-56.168l0.813,84.935
                                C149.013,405.77,122.709,377.003,122.709,377.003z M227.372,308.772c-44.894,0-81.424-36.522-81.424-81.4
                                c0-44.894,36.522-81.4,81.424-81.4c44.878,0,81.4,36.497,81.4,81.4C308.772,272.25,272.25,308.772,227.372,308.772z"/>
                        </g>
                    </g>
                </g>
            </svg>
        </ThemeImg>
    )
}

const sectionBackgroundColor = theme('mode', {
    light: '#F7ECDE',
    dark: '#51557E',
})

const headingColor = theme('mode', {
    light: '#51557E',
    dark: '#F7ECDE',
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

const Heading = styled.h1`
    color: ${headingColor};
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
                <Heading>Weathered</Heading>
                <ToggleButton onClick={toggleTheme}>
                    <VinylIcon theme={props.mode} />
                </ToggleButton>
            </Header>
            <Form onSubmit={commenceSearch}>
                <Input type="text" value={inputField} onChange={(e) => setInputField(e.target.value)}/>
            </Form>
        </Section>
    )
}

export default SearchBar
