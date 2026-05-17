import { Auth0Provider, type AppState } from '@auth0/auth0-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  auth0Domain,
  auth0ClientId,
  hasAuth0Config,
  auth0Audience,
  auth0Scope,
  auth0Connection,
} from './auth.config'

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
      domain={auth0Domain}
      clientId={auth0ClientId}
      onRedirectCallback={(appState?: AppState) => {
        navigate(appState?.returnTo ?? '/dashboard', { replace: true })
      }}
      authorizationParams={{
        redirect_uri: `${window.location.origin}`,
        ...(auth0Audience ? { audience: auth0Audience } : {}),
        ...(auth0Scope ? { scope: auth0Scope } : {}),
        ...(auth0Connection ? { connection: auth0Connection } : {}),
      }}
    >
      {children}
    </Auth0Provider>
  )
}
