import { clsx } from 'clsx'
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import DialogLayer from './DialogLayer'
import TextControl from './form/TextControl'
import Button from './web/Button'
import Pill from './web/Pill'

const WEEKDAY_LABELS = Array.from({ length: 7 }, (_, index) =>
  format(
    addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), index),
    'EEE',
  ).toUpperCase(),
)

type CalendarDay = {
  date: Date
  inMonth: boolean
  isAvailable: boolean
  isSelected: boolean
  isToday: boolean
}

type Availability = {
  endHour?: number
  startHour?: number
}

type BookingCalendarProps = {
  availabilities?: Availability[]
}

type SelectionRange = {
  dayIndex: number
  endSlot: number
  startSlot: number
}

type RequestDetails = {
  additionalInfo: string
  email: string
  meetingLinkOrPhone: string
  name: string
}

const DEFAULT_REQUEST_DETAILS: RequestDetails = {
  additionalInfo: '',
  email: '',
  meetingLinkOrPhone: '',
  name: '',
}

export default function BookingCalendar({
  availabilities = [
    {},
    { startHour: 9, endHour: 17 },
    { startHour: 9, endHour: 17 },
    { startHour: 9, endHour: 17 },
    { startHour: 9, endHour: 17 },
    { startHour: 9, endHour: 17 },
    {},
  ],
}: BookingCalendarProps) {
  const initialDate = new Date()
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(initialDate))
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [is24Hour, setIs24Hour] = useState(true)
  const [dragSelection, setDragSelection] = useState<SelectionRange | null>(null)
  const [appointmentDraft, setAppointmentDraft] =
    useState<SelectionRange | null>(null)
  const [requestDetails, setRequestDetails] = useState(DEFAULT_REQUEST_DETAILS)

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth, selectedDate, availabilities),
    [availabilities, selectedDate, visibleMonth],
  )

  const weekDays = useMemo(
    () => getWeekDaysStarting(selectedDate),
    [selectedDate],
  )
  const hourBounds = useMemo(
    () => getHourBounds(availabilities),
    [availabilities],
  )
  const isUnavailableSelectionSlot = (dayIndex: number, slotIndex: number) =>
    isBusySlot({
      availabilities,
      dayIndex,
      slotIndex,
      startHour: hourBounds.startHour,
    })

  useEffect(() => {
    if (!dragSelection) {
      return
    }

    const handleMouseUp = () => {
      setAppointmentDraft(normalizeSelection(dragSelection))
      setDragSelection(null)
    }

    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragSelection])

  const draftDay = appointmentDraft
    ? (weekDays[appointmentDraft.dayIndex] ?? selectedDate)
    : null
  const draftStartMinutes = appointmentDraft
    ? slotIndexToMinutes(appointmentDraft.startSlot, hourBounds.startHour)
    : null
  const draftEndMinutes = appointmentDraft
    ? slotIndexToMinutes(appointmentDraft.endSlot + 1, hourBounds.startHour)
    : null
  const draftDurationMinutes =
    draftStartMinutes !== null && draftEndMinutes !== null
      ? draftEndMinutes - draftStartMinutes
      : 0

  const handleConfirmAppointment = () => {
    if (
      !appointmentDraft ||
      !draftDay ||
      draftStartMinutes === null ||
      draftEndMinutes === null
    ) {
      return
    }

    const appointmentRequest = {
      additionalInfo: requestDetails.additionalInfo.trim(),
      date: format(draftDay, 'yyyy-MM-dd'),
      dayIndex: appointmentDraft.dayIndex,
      durationMinutes: draftDurationMinutes,
      email: requestDetails.email.trim(),
      endTime: formatMinutesLabel(draftEndMinutes, true),
      meetingLinkOrPhone: requestDetails.meetingLinkOrPhone.trim(),
      name: requestDetails.name.trim(),
      startTime: formatMinutesLabel(draftStartMinutes, true),
    }

    console.info('Appointment request submitted', appointmentRequest)
  }

  const handleSelectionStart = (dayIndex: number, slotIndex: number) => {
    if (isUnavailableSelectionSlot(dayIndex, slotIndex)) {
      return
    }

    setSelectedDate(weekDays[dayIndex] ?? selectedDate)
    setDragSelection({
      dayIndex,
      endSlot: slotIndex,
      startSlot: slotIndex,
    })
  }

  const handleSelectionExtend = (dayIndex: number, slotIndex: number) => {
    if (
      !dragSelection ||
      dragSelection.dayIndex !== dayIndex ||
      isUnavailableSelectionSlot(dayIndex, slotIndex)
    ) {
      return
    }

    setDragSelection((current) =>
      current && current.dayIndex === dayIndex && current.endSlot !== slotIndex
        ? {
            ...current,
            endSlot: slotIndex,
          }
        : current,
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <section className="grid flex-1 grid-cols-[minmax(320px,390px)_minmax(0,1fr)] overflow-hidden rounded-[3px] border border-white/8 bg-neutral-950 shadow-[0_24px_80px_rgba(0,0,0,0.45)] max-[1279px]:grid-cols-1">
          <aside className="border-b border-white/8 p-6 lg:border-b-0 lg:border-r lg:p-8">
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white lg:text-[2.15rem]">
              Appointments
            </h1>

            <div className="mt-12">
              <div className="flex items-center justify-between">
                <h2 className="text-[1.6rem] font-semibold text-white">
                  {format(visibleMonth, 'MMMM')}{' '}
                  <span className="text-white/58">
                    {format(visibleMonth, 'yyyy')}
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <MonthArrow
                    direction="prev"
                    onClick={() => {
                      setVisibleMonth(startOfMonth(addMonths(visibleMonth, -1)))
                    }}
                  />
                  <MonthArrow
                    direction="next"
                    onClick={() => {
                      setVisibleMonth(startOfMonth(addMonths(visibleMonth, 1)))
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-7 gap-x-3 gap-y-4 text-center text-xs font-semibold tracking-[0.24em] text-white/78">
                {WEEKDAY_LABELS.map((label) => (
                  <div key={label}>{label}</div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-7 gap-3">
                {calendarDays.map((day) => (
                  <button
                    key={day.date.toISOString()}
                    className={clsx(
                      'relative flex aspect-square cursor-pointer items-center justify-center rounded-[3px] border border-transparent text-white/70 transition [transition-property:background-color,color,transform,border-color]',
                      'text-base max-[1279px]:text-[2rem] max-[640px]:text-[1.45rem]',
                      !day.inMonth && 'text-white/30',
                      day.isAvailable
                        ? 'bg-neutral-600 text-white hover:-translate-y-px '
                        : 'cursor-default',
                      day.isSelected && 'border-white bg-neutral-600',
                      day.isToday && 'border-white text-[1.2rem] text-white',
                    )}
                    disabled={!day.isAvailable}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <span>{day.date.getDate()}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            <div className="border-b border-white/8 px-5 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:items-center">
                <div className="flex items-center">
                  <h2 className="text-2xl font-semibold text-white">
                    {formatRangeTitle(weekDays)}
                  </h2>
                </div>

                <div className="flex justify-center gap-1">
                  <MonthArrow
                    direction="prev"
                    onClick={() =>
                      shiftSelectedDate(-7, setSelectedDate, setVisibleMonth)
                    }
                  />
                  <MonthArrow
                    direction="next"
                    onClick={() =>
                      shiftSelectedDate(7, setSelectedDate, setVisibleMonth)
                    }
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-white/88 xl:justify-end">
                  <div className="inline-flex rounded-[3px] border border-white/8 bg-white/4 p-1">
                    <button
                      className={hourToggleClass(!is24Hour)}
                      onClick={() => setIs24Hour(false)}
                    >
                      12h
                    </button>
                    <button
                      className={hourToggleClass(is24Hour)}
                      onClick={() => setIs24Hour(true)}
                    >
                      24h
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-5 py-5 sm:px-6 lg:px-8">
              <AppointmentTimeGrid
                availabilities={availabilities}
                dragSelection={dragSelection}
                onCellMouseDown={handleSelectionStart}
                onCellMouseEnter={handleSelectionExtend}
                selectedDate={selectedDate}
                weekDays={weekDays}
                is24Hour={is24Hour}
              />
            </div>
          </section>
        </section>
      </div>

      {appointmentDraft &&
      draftDay &&
      draftStartMinutes !== null &&
      draftEndMinutes !== null ? (
        <DialogLayer
          footer={
            <>
              <Button onClick={() => setAppointmentDraft(null)} variant="ghost">
                Back
              </Button>
              <Button onClick={handleConfirmAppointment} variant="solid">
                Confirm
              </Button>
            </>
          }
          onClose={() => setAppointmentDraft(null)}
          title="Confirm your details"
        >
          <div className="mt-6 flex flex-wrap gap-[0.85rem]">
            <Pill icon={<CalendarSmallIcon />}>
              {`${format(draftDay, 'EEE, MMMM d, yyyy')}, `}
              {formatMinutesLabel(draftStartMinutes, is24Hour)} -{' '}
              {formatMinutesLabel(draftEndMinutes, is24Hour)}
            </Pill>
            <Pill icon={<ClockSmallIcon />}>{draftDurationMinutes} min</Pill>
          </div>

          <TextControl
            label="Your Name"
            onChange={(value) =>
              setRequestDetails((current) => ({
                ...current,
                name: value,
              }))
            }
            placeholder="eg. John Smith"
            required
            value={requestDetails.name}
          />

          <TextControl
            label="Email Address"
            onChange={(value) =>
              setRequestDetails((current) => ({
                ...current,
                email: value,
              }))
            }
            placeholder="eg. jsmith@gmail.com"
            required
            type="email"
            value={requestDetails.email}
          />

          <TextControl
            label="Phone / Meeting link"
            onChange={(value) =>
              setRequestDetails((current) => ({
                ...current,
                meetingLinkOrPhone: value,
              }))
            }
            required
            placeholder="Paste Meeting link or Phone here "
            value={requestDetails.meetingLinkOrPhone}
          />

          <TextControl
            label="Additional info"
            lines={5}
            onChange={(value) =>
              setRequestDetails((current) => ({
                ...current,
                additionalInfo: value,
              }))
            }
            placeholder="Additional information"
            value={requestDetails.additionalInfo}
          />
        </DialogLayer>
      ) : null}
    </main>
  )
}

function MonthArrow({
  direction,
  onClick,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
}) {
  return (
    <button
      aria-label={direction === 'prev' ? 'Previous' : 'Next'}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/35 transition hover:bg-white/6 hover:text-white"
      onClick={onClick}
      type="button"
    >
      {direction === 'prev' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </button>
  )
}

function AppointmentTimeGrid({
  availabilities,
  dragSelection,
  onCellMouseDown,
  onCellMouseEnter,
  selectedDate,
  weekDays,
  is24Hour,
}: {
  availabilities: Availability[]
  dragSelection: SelectionRange | null
  onCellMouseDown: (dayIndex: number, slotIndex: number) => void
  onCellMouseEnter: (dayIndex: number, slotIndex: number) => void
  selectedDate: Date
  weekDays: Date[]
  is24Hour: boolean
}) {
  const now = new Date()
  const { endHour, startHour } = getHourBounds(availabilities)
  const normalizedStart = Math.max(0, Math.min(startHour, endHour))
  const normalizedEnd = Math.max(normalizedStart + 1, endHour)
  const slotCount = (normalizedEnd - normalizedStart) * 4
  const slotIndexes = Array.from({ length: slotCount }, (_, index) => index)
  const todayVisible = weekDays.some((day) => isSameDay(day, now))
  const marker = getCurrentMarker({
    endHour: normalizedEnd,
    now,
    startHour: normalizedStart,
    todayVisible,
    weekDays,
  })
  const normalizedSelection = getSelectionDetails(
    dragSelection ? normalizeSelection(dragSelection) : null,
  )

  return (
    <div
      className="grid select-none border-t border-l border-white/10 [grid-auto-rows:1.05rem]"
      style={{
        gridTemplateColumns: 'minmax(70px, 0.5fr) repeat(7, minmax(30px, 1fr))',
        gridTemplateRows: '2.25rem',
      }}
    >
      <div
        className="border-r border-b border-white/10"
        style={{ gridColumn: 1, gridRow: 1 }}
      />
      {weekDays.map((day, dayIndex) => (
        <div
          key={day.toISOString()}
          className={clsx(
            'flex items-center justify-center gap-[0.55rem] border-r border-b border-white/10 border-b-white/20 px-3 py-[0.85rem] text-center select-none',
            isSameDay(day, selectedDate) && 'border-b-2 border-b-white/35',
            isSameDay(day, now) && 'bg-white/[0.035]',
          )}
          style={{
            gridColumn: dayIndex + 2,
            gridRow: 1,
          }}
        >
          <span className="text-xs uppercase tracking-[0.24em] text-white/46">
            {format(day, 'EEE')}
          </span>
          <span className="text-base font-medium text-white/75">
            {format(day, 'dd')}
          </span>
        </div>
      ))}

      {slotIndexes
        .filter((slotIndex) => slotIndex % 4 === 0)
        .map((slotIndex) => (
          <div
            key={`time-${slotIndex}`}
            className="flex select-none items-center justify-center border-r border-b border-white/10 pt-0 text-[0.8rem] text-white/46"
            style={{
              gridColumn: 1,
              gridRow: `${slotIndex + 2} / span 4`,
            }}
          >
            {formatHourLabel(
              normalizedStart + Math.floor(slotIndex / 4),
              is24Hour,
            )}
          </div>
        ))}

      {slotIndexes.map((slotIndex) =>
        weekDays.map((day, dayIndex) => {
          const busy = isBusySlot({
            availabilities,
            dayIndex,
            slotIndex,
            startHour: normalizedStart,
          })

          return (
            <div
              key={`${day.toISOString()}-${slotIndex}`}
              className={clsx(
                'relative h-[1.05rem] border-r border-b border-white/10 bg-white/[0.01]',
                isSameDay(day, now) && 'bg-white/[0.035]',
                busy ? 'cursor-not-allowed' : 'cursor-crosshair',
              )}
              onMouseDown={(event) => {
                if (event.button !== 0 || busy) {
                  return
                }

                event.preventDefault()
                onCellMouseDown(dayIndex, slotIndex)
              }}
              onMouseEnter={() => onCellMouseEnter(dayIndex, slotIndex)}
              onMouseMove={(event) => {
                if (event.buttons !== 1) {
                  return
                }

                onCellMouseEnter(dayIndex, slotIndex)
              }}
              style={{
                gridColumn: dayIndex + 2,
                gridRow: slotIndex + 2,
              }}
            >
              {busy ? (
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.045)_12.5%,transparent_25%,transparent_50%,rgba(255,255,255,0.045)_50%,rgba(255,255,255,0.045)_62.5%,transparent_75%,transparent)] bg-[length:5px_5px]" />
              ) : null}
              {marker &&
              marker.dayIndex === dayIndex &&
              marker.slotIndex === slotIndex ? (
                <div
                  className="absolute inset-x-0 z-[3] flex -translate-y-1/2 items-center gap-2 text-[0.86rem] text-white before:flex-1 before:border-t before:border-white/95"
                  style={{ top: `${marker.topOffsetPercent}%` }}
                >
                  <span className="rounded-full bg-white/8 px-2 py-[0.15rem]">
                    {formatDateTimeLabel(now, is24Hour)}
                  </span>
                </div>
              ) : null}
            </div>
          )
        }),
      )}
      {normalizedSelection ? (
        <div
          className="pointer-events-none relative z-[4]"
          style={{
            gridColumn: normalizedSelection.dayIndex + 2,
            gridRow: `${normalizedSelection.startSlot + 2} / span ${normalizedSelection.slotCount}`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[3px] bg-white/95 px-[0.4rem] py-[0.12rem] text-center text-[0.75rem] font-bold leading-[1.15] text-neutral-950 shadow-[0_1px_2px_rgba(0,0,0,0.18)]">
            {normalizedSelection.durationMinutes} min
          </div>
        </div>
      ) : null}
    </div>
  )
}

function buildCalendarDays(
  month: Date,
  selectedDate: Date,
  availabilities: Availability[],
): CalendarDay[] {
  const today = new Date()
  const firstOfMonth = startOfMonth(month)
  const lastOfMonth = endOfMonth(month)
  const leading = firstOfMonth.getDay()
  const totalCells = Math.ceil((leading + lastOfMonth.getDate()) / 7) * 7
  const start = addDays(firstOfMonth, -leading)

  return Array.from({ length: totalCells }, (_, index) => {
    const date = addDays(start, index)
    const inMonth = isSameMonth(date, month)
    const isAvailable =
      inMonth && getAvailabilityForDay(availabilities, date.getDay()) !== null
    const isSelected = isSameDay(date, selectedDate)

    return {
      date,
      inMonth,
      isAvailable,
      isSelected,
      isToday: isSameDay(date, today),
    }
  })
}

function getWeekDaysStarting(selectedDate: Date) {
  const start = startOfWeek(selectedDate, { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

function shiftSelectedDate(
  amount: number,
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>,
  setVisibleMonth: React.Dispatch<React.SetStateAction<Date>>,
) {
  setSelectedDate((current) => {
    const nextDate = addDays(current, amount)
    setVisibleMonth(startOfMonth(nextDate))
    return nextDate
  })
}

function formatRangeTitle(weekDays: Date[]) {
  const start = weekDays[0]
  const end = weekDays[weekDays.length - 1]

  if (!start || !end) {
    return ''
  }

  if (start.getMonth() === end.getMonth()) {
    return `${format(start, 'MMMM d')}-${format(end, 'd, yyyy')}`
  }

  return `${format(start, 'MMMM d')}-${format(end, 'MMMM d, yyyy')}`
}

function formatTimeLabel(time: string, is24Hour: boolean) {
  const [hoursText, minutesText] = time.split(':')
  const hours = Number(hoursText)
  const minutes = Number(minutesText)
  return formatClockTime(hours, minutes, is24Hour)
}

function formatHourLabel(hour: number, is24Hour: boolean) {
  return formatTimeLabel(`${pad(hour)}:00`, is24Hour)
}

function formatMinutesLabel(totalMinutes: number, is24Hour: boolean) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return formatClockTime(hours, minutes, is24Hour)
}

function formatDateTimeLabel(date: Date, is24Hour: boolean) {
  return formatMinutesLabel(date.getHours() * 60 + date.getMinutes(), is24Hour)
}

function hourToggleClass(active: boolean) {
  return clsx(
    'rounded-[3px] px-3 py-2 text-sm transition',
    active ? 'bg-black text-white' : 'text-white/55 hover:text-white',
  )
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function formatClockTime(hours: number, minutes: number, is24Hour: boolean) {
  const date = new Date(2026, 0, 1, hours, minutes)
  return format(date, is24Hour ? 'HH:mm' : 'h:mm a')
}

function normalizeSelection(selection: SelectionRange): SelectionRange {
  return {
    dayIndex: selection.dayIndex,
    endSlot: Math.max(selection.startSlot, selection.endSlot),
    startSlot: Math.min(selection.startSlot, selection.endSlot),
  }
}

function getSelectionDetails(selection: SelectionRange | null) {
  if (!selection) {
    return null
  }

  const slotCount = selection.endSlot - selection.startSlot + 1

  return {
    durationMinutes: slotCount * 15,
    slotCount,
    ...selection,
  }
}

function slotIndexToMinutes(slotIndex: number, startHour: number) {
  return startHour * 60 + slotIndex * 15
}

function isBusySlot({
  availabilities,
  dayIndex,
  slotIndex,
  startHour,
}: {
  availabilities: Availability[]
  dayIndex: number
  slotIndex: number
  startHour: number
}) {
  const slotStartMinutes = slotIndexToMinutes(slotIndex, startHour)
  const slotEndMinutes = slotStartMinutes + 15
  const availability = getAvailabilityForDay(availabilities, dayIndex)

  if (!availability) {
    return true
  }

  return !(
    slotStartMinutes < availability.endHour * 60 &&
    slotEndMinutes > availability.startHour * 60
  )
}

function getCurrentMarker({
  endHour,
  now,
  startHour,
  todayVisible,
  weekDays,
}: {
  endHour: number
  now: Date
  startHour: number
  todayVisible: boolean
  weekDays: Date[]
}) {
  if (!todayVisible) {
    return null
  }

  const dayIndex = weekDays.findIndex((day) => isSameDay(day, now))
  const totalMinutes = now.getHours() * 60 + now.getMinutes()
  const startMinutes = startHour * 60
  const endMinutes = endHour * 60

  if (
    dayIndex === -1 ||
    totalMinutes < startMinutes ||
    totalMinutes >= endMinutes
  ) {
    return null
  }

  const minutesFromStart = totalMinutes - startMinutes
  return {
    dayIndex,
    slotIndex: Math.floor(minutesFromStart / 15),
    topOffsetPercent: ((minutesFromStart % 15) / 15) * 100,
  }
}

function getHourBounds(availabilities: Availability[]) {
  const validAvailabilities = availabilities
    .map(normalizeAvailability)
    .filter(
      (availability): availability is { startHour: number; endHour: number } =>
        availability !== null,
    )

  if (validAvailabilities.length === 0) {
    return { endHour: 18, startHour: 8 }
  }

  const minStartHour = Math.min(
    ...validAvailabilities.map((availability) => availability.startHour),
  )
  const maxEndHour = Math.max(
    ...validAvailabilities.map((availability) => availability.endHour),
  )

  return {
    endHour: Math.min(24, maxEndHour + 1),
    startHour: Math.max(0, minStartHour - 1),
  }
}

function getAvailabilityForDay(
  availabilities: Availability[],
  dayIndex: number,
) {
  return normalizeAvailability(availabilities[dayIndex])
}

function normalizeAvailability(availability?: Availability | null) {
  if (!availability) {
    return null
  }

  const { endHour, startHour } = availability

  if (
    typeof startHour !== 'number' ||
    typeof endHour !== 'number' ||
    !Number.isFinite(startHour) ||
    !Number.isFinite(endHour) ||
    startHour < 0 ||
    endHour < 0 ||
    endHour > 24 ||
    startHour > 24 ||
    endHour <= startHour
  ) {
    return null
  }

  return { endHour, startHour }
}

function CalendarSmallIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <rect
        height="15"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
        width="18"
        x="3"
        y="5"
      />
      <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function ClockSmallIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="m9 18 6-6-6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}
