import { useAuth0 } from '@auth0/auth0-react'

import { apiBaseUrl, auth0Audience, auth0Scope } from '../auth-config'
import type { SavedAppointment } from '../components/web/BookingCalendar/utils'

type AppointmentRequest = {
  additionalInfo: string
  email: string
  endAt: string
  meetingLinkOrPhone: string
  name: string
  startAt: string
  timezone: string
}

type AppointmentResponse =
  | { appointment: SavedAppointment }
  | { error?: string }

const normalizedApiBaseUrl = apiBaseUrl.replace(/\/+$/, '')
const authorizationParams = {
  ...(auth0Audience ? { audience: auth0Audience } : {}),
  ...(auth0Scope ? { scope: auth0Scope } : {}),
}

function getAuth0ErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return 'Auth0 could not issue an API access token.'
  }

  const auth0Error = error as {
    error?: string
    error_description?: string
    message?: string
  }

  return (
    auth0Error.error_description ??
    auth0Error.message ??
    auth0Error.error ??
    'Auth0 could not issue an API access token.'
  )
}

function requiresInteractiveAuth(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }

  const auth0Error = error as { error?: string }

  return (
    auth0Error.error === 'consent_required' ||
    auth0Error.error === 'interaction_required' ||
    auth0Error.error === 'login_required'
  )
}

export function useApi() {
  const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0()

  async function saveAppointment(data: AppointmentRequest) {
    let token: string

    try {
      token = await getAccessTokenSilently({
        authorizationParams,
      })
    } catch (error) {
      if (requiresInteractiveAuth(error)) {
        const popupToken = await getAccessTokenWithPopup({
          authorizationParams,
        })

        if (!popupToken) {
          throw new Error('Auth0 did not return an API access token.')
        }

        token = popupToken
      } else {
        console.error('appointments.auth0_token_failed', error)
        throw new Error(
          `${getAuth0ErrorMessage(error)} Check the API audience, application API access policy, and requested scopes.`,
        )
      }
    }

    const response = await fetch(`${normalizedApiBaseUrl}/api/appointments`, {
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    const result = (await response.json()) as AppointmentResponse

    if (!response.ok || !('appointment' in result)) {
      const errorMessage =
        'error' in result ? result.error : 'Failed to save appointment.'
      throw new Error(errorMessage || 'Failed to save appointment.')
    }

    return result.appointment
  }

  return { saveAppointment }
}
