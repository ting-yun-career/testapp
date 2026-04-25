import { describe, expect, it, vi } from 'vitest'

import { createAppointment } from './appointment'

describe('createAppointment', () => {
  it('stores a realistic appointment request and returns the saved record', async () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    const run = vi.fn().mockResolvedValue(undefined)
    const bind = vi.fn().mockReturnValue({ run })
    const prepare = vi.fn().mockReturnValue({ bind })

    const request = new Request('https://example.com/api/appointments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        additionalInfo: 'Please call if the lobby door is locked.',
        email: 'alex@example.com',
        endAt: '2026-05-14T17:45:00.000Z',
        meetingLinkOrPhone: 'https://meet.example.com/alex-intake',
        name: 'Alex Chen',
        startAt: '2026-05-14T17:00:00.000Z',
        timezone: 'America/Vancouver',
      }),
    })

    const response = await createAppointment(request, {
      DB: { prepare } as unknown as D1Database,
      PRIVACY_SALT_PHRASE: 'replace-with-your-secret-salt-phrase',
    } as unknown as Env & { DB?: D1Database; PRIVACY_SALT_PHRASE?: string })

    expect(response.status).toBe(200)
    expect(prepare).toHaveBeenCalledOnce()
    expect(bind).toHaveBeenCalledOnce()
    expect(run).toHaveBeenCalledOnce()

    const bindArgs = bind.mock.calls[0]

    expect(bindArgs).toHaveLength(10)
    expect(bindArgs[1]).toBe('confirmed')
    expect(bindArgs[2]).toBe('2026-05-14T17:00:00.000Z')
    expect(bindArgs[3]).toBe('2026-05-14T17:45:00.000Z')
    expect(bindArgs[4]).toBe('America/Vancouver')
    expect(bindArgs[5]).toBe('Alex Chen')
    expect(bindArgs[6]).toBe('alex@example.com')
    expect(bindArgs[7]).toBe('https://meet.example.com/alex-intake')
    expect(bindArgs[8]).toBe('Please call if the lobby door is locked.')
    expect(typeof bindArgs[0]).toBe('string')
    expect(typeof bindArgs[9]).toBe('string')

    expect(consoleLog).toHaveBeenCalledWith(
      'appointments.saved',
      expect.objectContaining({
        appointment: expect.objectContaining({
          id: bindArgs[0],
          protectedDetails: {
            emailHash: expect.any(String),
            nameHash: expect.any(String),
          },
        }),
      }),
    )

    expect(JSON.stringify(consoleLog.mock.calls)).not.toContain(
      'alex@example.com',
    )
    expect(JSON.stringify(consoleLog.mock.calls)).not.toContain('Alex Chen')
    expect(JSON.stringify(consoleLog.mock.calls)).not.toContain(
      'https://meet.example.com/alex-intake',
    )

    await expect(response.json()).resolves.toEqual({
      appointment: {
        createdAt: bindArgs[9],
        email: 'alex@example.com',
        endAt: '2026-05-14T17:45:00.000Z',
        id: bindArgs[0],
        meetingLinkOrPhone: 'https://meet.example.com/alex-intake',
        name: 'Alex Chen',
        notes: 'Please call if the lobby door is locked.',
        startAt: '2026-05-14T17:00:00.000Z',
        status: 'confirmed',
        timezone: 'America/Vancouver',
      },
    })

    consoleLog.mockRestore()
  })
})
