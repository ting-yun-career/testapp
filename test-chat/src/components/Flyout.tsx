import React from 'react'
import type { ReactNode } from 'react'

interface FlyoutProps {
  isOpen: boolean
  togglePanel: () => void
  children: ReactNode
}

export const Flyout: React.FC<FlyoutProps> = ({ isOpen, togglePanel, children }) => {
  return (
    <div
      className="fixed left-0 top-0 bottom-0 bg-[#080811] border-r border-white transition-all duration-300 ease-in-out z-20"
      style={{ width: isOpen ? '250px' : '0' }}
    >
      <div
        className="absolute top-0 left-[calc(100%)] cursor-pointer hover:text-[orange] p-2 bg-[#080811] border-[#e1e1e1] border-b border-r border-[#080811]"
        onClick={togglePanel}
      >
        <span className="material-symbols-outlined mt-1 !text-4xl" title="Toggle Widget Panel">
          shelf_auto_hide
        </span>
      </div>
      {children}
    </div>
  )
}
