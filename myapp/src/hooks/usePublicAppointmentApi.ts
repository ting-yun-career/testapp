import { apiBaseUrl } from '../auth-config'
import type {
  AppointmentRequest,
  SavedAppointment,
} from '../components/web/BookingCalendar/utils'

export function usePublicAppointmentApi() {
  async function saveAppointment(
    data: AppointmentRequest,
  ): Promise<SavedAppointment> {
    const response = await fetch(`${apiBaseUrl}/public/appointments`, {
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as {
      appointment?: SavedAppointment
      error?: string
    }
    if (!response.ok || !result.appointment) {
      throw new Error(result.error ?? 'Failed to save appointment.')
    }
    return result.appointment
  }

  async function getAppointments(
    from: string,
    to: string,
  ): Promise<SavedAppointment[]> {
    const params = new URLSearchParams({ from, to })
    const response = await fetch(`${apiBaseUrl}/public/appointments?${params}`)
    const result = (await response.json()) as {
      appointments?: SavedAppointment[]
      error?: string
    }
    if (!response.ok || !result.appointments) {
      throw new Error(result.error ?? 'Failed to fetch appointments.')
    }
    return result.appointments
  }

  return { getAppointments, saveAppointment }
}
