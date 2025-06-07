import React from 'react'
import IconButton from './Button/IconButton/IconButton'
import FloatingBar from './FloatingBarWrapper'

const HeaderFloatingBar: React.FC = () => {
  return (
    <FloatingBar position="top">
      <IconButton icon="menu" text="Menu" />
    </FloatingBar>
  )
}

export default HeaderFloatingBar
