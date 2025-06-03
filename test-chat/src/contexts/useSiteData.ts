import { useContext } from 'react'
import { SiteDataContext, SiteDataProvider } from './SiteDataContext'

export const useSiteData = () => {
  const context = useContext(SiteDataContext)
  if (context === undefined) {
    throw new Error('useSiteData must be used within a SiteDataProvider')
  }
  return context
}

export { SiteDataProvider }
