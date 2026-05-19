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

type AppointmentsListResponse =
  | { appointments: SavedAppointment[] }
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

  async function getToken() {
    try {
      return await getAccessTokenSilently({ authorizationParams })
    } catch (error) {
      if (requiresInteractiveAuth(error)) {
        const popupToken = await getAccessTokenWithPopup({ authorizationParams })

        if (!popupToken) {
          throw new Error('Auth0 did not return an API access token.')
        }

        return popupToken
      }

      console.error('appointments.auth0_token_failed', error)
      throw new Error(
        `${getAuth0ErrorMessage(error)} Check the API audience, application API access policy, and requested scopes.`,
      )
    }
  }

  async function saveAppointment(data: AppointmentRequest) {
    const token = await getToken()

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

  async function getAppointments(from: string, to: string) {
    const token = await getToken()

    const params = new URLSearchParams({ from, to })
    const response = await fetch(
      `${normalizedApiBaseUrl}/api/appointments?${params}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    const result = (await response.json()) as AppointmentsListResponse

    if (!response.ok || !('appointments' in result)) {
      const errorMessage =
        'error' in result ? result.error : 'Failed to fetch appointments.'
      throw new Error(errorMessage || 'Failed to fetch appointments.')
    }

    return result.appointments
  }

  async function deleteAppointment(id: string) {
    const token = await getToken()

    const response = await fetch(
      `${normalizedApiBaseUrl}/api/appointments/${encodeURIComponent(id)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        method: 'DELETE',
      },
    )

    if (!response.ok) {
      const result = (await response.json()) as { error?: string }
      throw new Error(result.error || 'Failed to delete appointment.')
    }
  }

  return { deleteAppointment, getAppointments, saveAppointment }
}
