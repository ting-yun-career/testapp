import React from 'react'
import IconButton from './Button/IconButton/IconButton'
import FloatingBarWrapper from './FloatingBarWrapper'

const FooterFloatingBar: React.FC = () => {
  return (
    <FloatingBarWrapper position="bottom">
      <IconButton icon="menu" text="Menu" />
    </FloatingBarWrapper>
  )
}

export default FooterFloatingBar
