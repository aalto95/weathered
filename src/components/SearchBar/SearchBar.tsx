import React, {useState} from "react";
import styles from './SearchBar.module.css'

const SearchBar = (props : any) => {
    let commenceSearch = (e : any) => {
        e.preventDefault()
        props.search(inputField)
    }
    const [inputField, setInputField] = useState('')
    return (
        <section className={styles.searchBar}>
            <form onSubmit={commenceSearch}>
                <h1>Weather Checker</h1>
                <input type="text" value={inputField} onChange={(e) => setInputField(e.target.value)}/>
            </form>
        </section>
    )
}

export default SearchBar
