export const auth0Connection = import.meta.env.VITE_AUTH0_CONNECTION
export const hasAuth0Config = Boolean(
  import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID,
)
