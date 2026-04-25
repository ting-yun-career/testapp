type WorkerEnv = Env & {
  DB?: D1Database
}

export async function createAppointment(request: Request, env: WorkerEnv) {
  if (!env.DB) {
    return Response.json(
      { error: 'Database binding is missing.' },
      { status: 500 },
    )
  }

  let payload: {
    additionalInfo?: string
    email?: string
    endAt?: string
    meetingLinkOrPhone?: string
    name?: string
    startAt?: string
    timezone?: string
  }
  try {
    payload = (await request.json()) as typeof payload
  } catch (error) {
    console.error('appointments.invalid_json_body', {
      error: error instanceof Error ? error.message : String(error),
      method: request.method,
      path: new URL(request.url).pathname,
    })
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const appointment = {
    createdAt: new Date().toISOString(),
    email: payload.email?.trim() ?? '',
    endAt: payload.endAt ?? '',
    id: crypto.randomUUID(),
    meetingContact: payload.meetingLinkOrPhone?.trim() ?? '',
    name: payload.name?.trim() ?? '',
    notes: payload.additionalInfo?.trim() ?? '',
    startAt: payload.startAt ?? '',
    status: 'confirmed',
    timezone: payload.timezone?.trim() ?? 'America/Vancouver',
  }

  if (
    !appointment.name ||
    !appointment.email ||
    !appointment.meetingContact ||
    !appointment.startAt ||
    !appointment.endAt
  ) {
    return Response.json(
      { error: 'Missing required appointment fields.' },
      { status: 400 },
    )
  }

  const startAt = new Date(appointment.startAt)
  const endAt = new Date(appointment.endAt)

  if (
    Number.isNaN(startAt.getTime()) ||
    Number.isNaN(endAt.getTime()) ||
    endAt <= startAt
  ) {
    return Response.json(
      { error: 'Appointment time range is invalid.' },
      { status: 400 },
    )
  }

  try {
    await env.DB.prepare(
      `INSERT INTO appointments (
        id,
        status,
        start_at_utc,
        end_at_utc,
        timezone,
        name,
        email,
        meeting_contact,
        notes,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        appointment.id,
        appointment.status,
        startAt.toISOString(),
        endAt.toISOString(),
        appointment.timezone,
        appointment.name,
        appointment.email,
        appointment.meetingContact,
        appointment.notes,
        appointment.createdAt,
      )
      .run()
  } catch (error) {
    const causeMessage =
      error &&
      typeof error === 'object' &&
      'cause' in error &&
      error.cause &&
      typeof error.cause === 'object' &&
      'message' in error.cause &&
      typeof error.cause.message === 'string'
        ? error.cause.message
        : ''

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to insert appointment.'

    console.error('appointments.insert_failed', {
      causeMessage,
      endAt: appointment.endAt,
      errorMessage,
      hasNotes: Boolean(appointment.notes),
      id: appointment.id,
      meetingContactLength: appointment.meetingContact.length,
      startAt: appointment.startAt,
      timezone: appointment.timezone,
    })

    return Response.json(
      {
        error: causeMessage ? `${errorMessage}: ${causeMessage}` : errorMessage,
      },
      { status: 500 },
    )
  }

  console.log('appointments.saved', {
    appointment: {
      createdAt: appointment.createdAt,
      email: appointment.email,
      endAt: endAt.toISOString(),
      id: appointment.id,
      meetingLinkOrPhone: appointment.meetingContact,
      name: appointment.name,
      notes: appointment.notes,
      startAt: startAt.toISOString(),
      status: appointment.status,
      timezone: appointment.timezone,
    },
    request: {
      method: request.method,
      path: new URL(request.url).pathname,
    },
  })

  return Response.json({
    appointment: {
      createdAt: appointment.createdAt,
      email: appointment.email,
      endAt: endAt.toISOString(),
      id: appointment.id,
      meetingLinkOrPhone: appointment.meetingContact,
      name: appointment.name,
      notes: appointment.notes,
      startAt: startAt.toISOString(),
      status: appointment.status,
      timezone: appointment.timezone,
    },
  })
}
