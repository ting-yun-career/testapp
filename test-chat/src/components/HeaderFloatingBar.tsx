import React from 'react'
import IconButton from './Button/IconButton/IconButton'
import FloatingBarWrapper from './FloatingBarWrapper'

const HeaderFloatingBar: React.FC = () => {
  return (
    <FloatingBarWrapper position="top">
      <IconButton icon="menu" text="Menu" />
    </FloatingBarWrapper>
  )
}

export default HeaderFloatingBar
