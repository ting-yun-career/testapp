import { Auth0Provider } from '@auth0/auth0-react'
import type { ReactNode } from 'react'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
export const auth0Connection = import.meta.env.VITE_AUTH0_CONNECTION

export const hasAuth0Config = Boolean(domain && clientId)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  if (!hasAuth0Config) {
    return <>{children}</>
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      {children}
    </Auth0Provider>
  )
}
