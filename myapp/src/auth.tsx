import { Auth0Provider, type AppState } from '@auth0/auth0-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { hasAuth0Config } from './auth.config'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()

  if (!hasAuth0Config) {
    return <>{children}</>
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      onRedirectCallback={(appState?: AppState) => {
        navigate(appState?.returnTo ?? '/dashboard', { replace: true })
      }}
      authorizationParams={{
        redirect_uri: `${window.location.origin}`,
      }}
    >
      {children}
    </Auth0Provider>
  )
}
