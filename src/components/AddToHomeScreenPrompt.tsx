import React, { useEffect } from 'react'
import styled from 'styled-components'
import theme from 'styled-theming'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  dismissA2HSButton,
  isA2HSButtonDismissedSet
} from '../features/app-slice'

const buttonColor = theme('mode', {
  light: '#FFFFFF',
  dark: '#242526;'
})

const buttonTextColor = theme('mode', {
  light: '#242526',
  dark: '#FFFFFF'
})

const A2HSButton = styled.button`
  display: flex;
  justify-content: center;
  width: 200px;
  padding: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  color: ${buttonTextColor};
  background-color: ${buttonColor};
`

const ButtonText = styled.p`
  width: 70%;
`

const DismissButton = styled.span`
  width: 30%;
  background-color: red;
`

export const AddToHomeScreenPrompt = () => {
  const dispatch = useAppDispatch()

  const dismissButton = (e: any) => {
    e.stopPropagation()
    console.log('dismiss button clicked')
    dispatch(dismissA2HSButton())
  }

  const isA2HSButtonDismissed = useAppSelector(
    (state) => state.app.isA2HSButtonDismissed
  )

  useEffect(() => {
    console.log(Boolean(localStorage.getItem('a2hsButtonDismissed')))
    dispatch(
      isA2HSButtonDismissedSet(
        localStorage.getItem('a2hsButtonDismissed') === 'true'
      )
    )
    if (!isA2HSButtonDismissed) {
      let deferredPrompt: any
      const addBtn = document.getElementById('add-button')

      addBtn!.style.display = 'none'
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault()
        // Stash the event so it can be triggered later.
        deferredPrompt = e
        // Update UI to notify the user they can add to home screen
        addBtn!.style.display = 'flex'

        addBtn!.addEventListener('click', (e) => {
          // hide our user interface that shows our A2HS button
          addBtn!.style.display = 'none'
          // Show the prompt
          deferredPrompt.prompt()
          // Wait for the user to respond to the prompt
          deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the A2HS prompt')
            } else {
              console.log('User dismissed the A2HS prompt')
            }
            deferredPrompt = null
          })
        })
      })
    }
  }, [])
  if (!isA2HSButtonDismissed) {
    return (
      <A2HSButton id="add-button">
        <ButtonText>Add to home screen</ButtonText>
        <DismissButton onClick={(e: any) => dismissButton(e)}>x</DismissButton>
      </A2HSButton>
    )
  }

  return null
}
