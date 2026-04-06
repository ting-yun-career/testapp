import { useEffect, useMemo, useState } from 'react'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type CalendarDay = {
  date: Date
  inMonth: boolean
  isAvailable: boolean
  isSelected: boolean
  isToday: boolean
}

type OverlayBlock = {
  dayOffset: number
  startHour: number
  endHour: number
}

type BookingCalendarProps = {
  endHour?: number
  overlayBlocks?: OverlayBlock[]
  startHour?: number
  workingDays?: number[]
}

type DragSelection = {
  dayIndex: number
  endSlot: number
  startSlot: number
}

type AppointmentDraft = {
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
  endHour = 21,
  overlayBlocks = [
    // { dayOffset: 0, startHour: 9, endHour: 17 },
    { dayOffset: 1, startHour: 9, endHour: 17 },
    { dayOffset: 2, startHour: 9, endHour: 17 },
    { dayOffset: 3, startHour: 9, endHour: 17 },
    { dayOffset: 4, startHour: 9, endHour: 17 },
    { dayOffset: 5, startHour: 9, endHour: 17 },
  ],
  startHour = 7,
  workingDays = [1, 2, 3, 4, 5],
}: BookingCalendarProps) {
  const initialDate = new Date('2026-04-09T12:00:00')
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  )
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [is24Hour, setIs24Hour] = useState(true)
  const [dragSelection, setDragSelection] = useState<DragSelection | null>(null)
  const [appointmentDraft, setAppointmentDraft] =
    useState<AppointmentDraft | null>(null)
  const [requestDetails, setRequestDetails] = useState(DEFAULT_REQUEST_DETAILS)

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth, selectedDate, workingDays),
    [selectedDate, visibleMonth, workingDays],
  )

  const weekDays = useMemo(
    () => getWeekDaysStarting(selectedDate),
    [selectedDate],
  )

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
    ? slotIndexToMinutes(appointmentDraft.startSlot, startHour)
    : null
  const draftEndMinutes = appointmentDraft
    ? slotIndexToMinutes(appointmentDraft.endSlot + 1, startHour)
    : null
  const draftDurationMinutes =
    draftStartMinutes !== null && draftEndMinutes !== null
      ? draftEndMinutes - draftStartMinutes
      : 0

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <section className="booking-shell flex-1 overflow-hidden rounded-[3px] border border-white/8 bg-[var(--panel-bg)] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <aside className="border-b border-white/8 p-6 lg:border-b-0 lg:border-r lg:p-8">
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white lg:text-[2.15rem]">
              Appointments
            </h1>

            <div className="mt-12">
              <div className="flex items-center justify-between">
                <h2 className="text-[1.6rem] font-semibold text-white">
                  {MONTH_NAMES[visibleMonth.getMonth()]}{' '}
                  <span className="text-white/58">
                    {visibleMonth.getFullYear()}
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <MonthArrow
                    direction="prev"
                    onClick={() => {
                      setVisibleMonth(
                        new Date(
                          visibleMonth.getFullYear(),
                          visibleMonth.getMonth() - 1,
                          1,
                        ),
                      )
                    }}
                  />
                  <MonthArrow
                    direction="next"
                    onClick={() => {
                      setVisibleMonth(
                        new Date(
                          visibleMonth.getFullYear(),
                          visibleMonth.getMonth() + 1,
                          1,
                        ),
                      )
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
                    className={[
                      'calendar-day',
                      day.inMonth ? '' : 'calendar-day--outside',
                      day.isAvailable ? 'calendar-day--available' : '',
                      day.isToday ? 'calendar-day--today' : '',
                      day.isSelected ? 'calendar-day--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
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
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-semibold text-white">
                    {formatRangeTitle(weekDays)}
                  </h2>
                  <div className="flex gap-1">
                    <MonthArrow
                      direction="prev"
                      onClick={() => shiftSelectedDate(-7, setSelectedDate)}
                    />
                    <MonthArrow
                      direction="next"
                      onClick={() => shiftSelectedDate(7, setSelectedDate)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-white/88">
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
              <OverlayBoard
                dragSelection={dragSelection}
                endHour={endHour}
                overlayBlocks={overlayBlocks}
                onCellMouseDown={(dayIndex, slotIndex) => {
                  if (
                    isBusySlot({
                      dayIndex,
                      endHour,
                      overlayBlocks,
                      slotIndex,
                      startHour,
                    })
                  ) {
                    return
                  }

                  setSelectedDate(weekDays[dayIndex] ?? selectedDate)
                  setDragSelection({
                    dayIndex,
                    endSlot: slotIndex,
                    startSlot: slotIndex,
                  })
                }}
                onCellMouseEnter={(dayIndex, slotIndex) => {
                  if (
                    !dragSelection ||
                    dragSelection.dayIndex !== dayIndex ||
                    isBusySlot({
                      dayIndex,
                      endHour,
                      overlayBlocks,
                      slotIndex,
                      startHour,
                    })
                  ) {
                    return
                  }

                  setDragSelection((current) =>
                    current
                      ? {
                          ...current,
                          endSlot: slotIndex,
                        }
                      : current,
                  )
                }}
                selectedDate={selectedDate}
                startHour={startHour}
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
        <AppointmentModal
          day={draftDay}
          details={requestDetails}
          durationMinutes={draftDurationMinutes}
          endMinutes={draftEndMinutes}
          is24Hour={is24Hour}
          onChangeDetails={(field, value) =>
            setRequestDetails((current) => ({
              ...current,
              [field]: value,
            }))
          }
          onClose={() => setAppointmentDraft(null)}
          startMinutes={draftStartMinutes}
        />
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

function OverlayBoard({
  dragSelection,
  endHour,
  overlayBlocks,
  onCellMouseDown,
  onCellMouseEnter,
  selectedDate,
  startHour,
  weekDays,
  is24Hour,
}: {
  dragSelection: DragSelection | null
  endHour: number
  overlayBlocks: OverlayBlock[]
  onCellMouseDown: (dayIndex: number, slotIndex: number) => void
  onCellMouseEnter: (dayIndex: number, slotIndex: number) => void
  selectedDate: Date
  startHour: number
  weekDays: Date[]
  is24Hour: boolean
}) {
  const now = new Date()
  const normalizedStart = Math.max(0, Math.min(startHour, endHour))
  const normalizedEnd = Math.max(normalizedStart + 1, endHour)
  const slotCount = (normalizedEnd - normalizedStart) * 4
  const slotIndexes = Array.from({ length: slotCount }, (_, index) => index)
  const todayVisible = weekDays.some((day) => isSameDate(day, now))
  const marker = getCurrentMarker({
    endHour: normalizedEnd,
    now,
    startHour: normalizedStart,
    todayVisible,
    weekDays,
  })
  const normalizedSelection = dragSelection
    ? normalizeSelection(dragSelection)
    : null

  return (
    <div className="overlay-grid">
      <div
        className="overlay-grid__top"
        style={{ gridColumn: 1, gridRow: 1 }}
      />
      {weekDays.map((day, dayIndex) => (
        <div
          key={day.toISOString()}
          className={[
            'overlay-grid__day-label',
            isSameDate(day, selectedDate)
              ? 'overlay-grid__day-label--selected'
              : '',
            isSameDate(day, now) ? 'overlay-grid__day-label--today' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ gridColumn: dayIndex + 2, gridRow: 1 }}
        >
          <span className="text-xs uppercase tracking-[0.24em] text-white/46">
            {WEEKDAY_SHORT[day.getDay()]}
          </span>
          <span className="text-base font-medium text-white/75">
            {pad(day.getDate())}
          </span>
        </div>
      ))}

      {slotIndexes
        .filter((slotIndex) => slotIndex % 4 === 0)
        .map((slotIndex) => (
          <div
            key={`time-${slotIndex}`}
            className={[
              'overlay-grid__time',
            ]
              .filter(Boolean)
              .join(' ')}
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
            dayIndex,
            endHour: normalizedEnd,
            overlayBlocks,
            slotIndex,
            startHour: normalizedStart,
          })
          const selectedColumn = isSameDate(day, selectedDate)
          const isSelectedSlot = isSlotInSelection(
            normalizedSelection,
            dayIndex,
            slotIndex,
          )
          const isSelectionStart =
            normalizedSelection?.dayIndex === dayIndex &&
            normalizedSelection.startSlot === slotIndex

          return (
            <div
              key={`${day.toISOString()}-${slotIndex}`}
              className={[
                'overlay-grid__cell',
                selectedColumn ? 'overlay-grid__cell--selected' : '',
                isSameDate(day, now) ? 'overlay-grid__cell--today' : '',
                busy ? 'overlay-grid__cell--busy' : '',
                isSelectedSlot ? 'overlay-grid__cell--active-selection' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseDown={(event) => {
                if (event.button !== 0 || busy) {
                  return
                }

                event.preventDefault()
                onCellMouseDown(dayIndex, slotIndex)
              }}
              onMouseEnter={() => onCellMouseEnter(dayIndex, slotIndex)}
              style={{
                gridColumn: dayIndex + 2,
                gridRow: slotIndex + 2,
              }}
            >
              {busy ? <div className="overlay-grid__busy" /> : null}
              {isSelectionStart ? (
                <div className="overlay-grid__selection-chip">
                  {formatMinutesLabel(
                    slotIndexToMinutes(slotIndex, normalizedStart),
                    is24Hour,
                  )}
                </div>
              ) : null}
              {marker &&
              marker.dayIndex === dayIndex &&
              marker.slotIndex === slotIndex ? (
                <div
                  className="overlay-grid__now"
                  style={{ top: `${marker.topOffsetPercent}%` }}
                >
                  <span>{formatDateTimeLabel(now, is24Hour)}</span>
                </div>
              ) : null}
            </div>
          )
        }),
      )}
    </div>
  )
}

function AppointmentModal({
  day,
  details,
  durationMinutes,
  endMinutes,
  is24Hour,
  onChangeDetails,
  onClose,
  startMinutes,
}: {
  day: Date
  details: RequestDetails
  durationMinutes: number
  endMinutes: number
  is24Hour: boolean
  onChangeDetails: (field: keyof RequestDetails, value: string) => void
  onClose: () => void
  startMinutes: number
}) {
  const displayDate = `${WEEKDAY_SHORT[day.getDay()]}, ${MONTH_NAMES[day.getMonth()]} ${day.getDate()}, ${day.getFullYear()}`

  return (
    <div
      className="booking-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-modal="true"
        className="booking-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="booking-modal__body">
          <h2 className="booking-modal__title">Confirm your details</h2>

          <div className="booking-modal__chips">
            <span className="booking-modal__chip">
              <CalendarSmallIcon />
              {displayDate}, {formatMinutesLabel(startMinutes, is24Hour)} -{' '}
              {formatMinutesLabel(endMinutes, is24Hour)}
            </span>
            <span className="booking-modal__chip">
              <ClockSmallIcon />
              {durationMinutes}m
            </span>
          </div>

          <label className="booking-modal__field">
            <span className="booking-modal__label">Your name *</span>
            <input
              className="booking-modal__input"
              onChange={(event) => onChangeDetails('name', event.target.value)}
              placeholder="Alex Chen"
              value={details.name}
            />
          </label>

          <label className="booking-modal__field">
            <span className="booking-modal__label">Email address *</span>
            <input
              className="booking-modal__input"
              onChange={(event) => onChangeDetails('email', event.target.value)}
              placeholder="alex@example.com"
              type="email"
              value={details.email}
            />
          </label>

          <label className="booking-modal__field">
            <span className="booking-modal__label">Phone or meeting link</span>
            <input
              className="booking-modal__input"
              onChange={(event) =>
                onChangeDetails('meetingLinkOrPhone', event.target.value)
              }
              placeholder="Phone number or Zoom/Meet link"
              value={details.meetingLinkOrPhone}
            />
          </label>

          <label className="booking-modal__field">
            <span className="booking-modal__label">Additional info</span>
            <textarea
              className="booking-modal__textarea"
              onChange={(event) =>
                onChangeDetails('additionalInfo', event.target.value)
              }
              placeholder="Share anything that will help prepare for this appointment."
              rows={5}
              value={details.additionalInfo}
            />
          </label>
        </div>

        <footer className="booking-modal__footer">
          <button
            className="booking-modal__button booking-modal__button--ghost"
            onClick={onClose}
            type="button"
          >
            Back
          </button>
          <button
            className="booking-modal__button booking-modal__button--primary"
            type="button"
          >
            Confirm
          </button>
        </footer>
      </section>
    </div>
  )
}

function buildCalendarDays(
  month: Date,
  selectedDate: Date,
  workingDays: number[],
): CalendarDay[] {
  const today = new Date()
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
  const lastOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const leading = firstOfMonth.getDay()
  const totalCells = Math.ceil((leading + lastOfMonth.getDate()) / 7) * 7
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - leading)

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const inMonth = date.getMonth() === month.getMonth()
    const isAvailable = inMonth && workingDays.includes(date.getDay())
    const isSelected = isSameDate(date, selectedDate)

    return {
      date,
      inMonth,
      isAvailable,
      isSelected,
      isToday: isSameDate(date, today),
    }
  })
}

function getWeekDaysStarting(selectedDate: Date) {
  const start = new Date(selectedDate)
  start.setDate(start.getDate() - start.getDay())

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

function shiftSelectedDate(
  amount: number,
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>,
) {
  setSelectedDate((current) => {
    const next = new Date(current)
    next.setDate(next.getDate() + amount)
    return next
  })
}

function formatRangeTitle(weekDays: Date[]) {
  const start = weekDays[0]
  const end = weekDays[weekDays.length - 1]

  if (!start || !end) {
    return ''
  }

  if (start.getMonth() === end.getMonth()) {
    return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`
  }

  return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}-${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`
}

function formatTimeLabel(time: string, is24Hour: boolean) {
  const [hoursText, minutesText] = time.split(':')
  const hours = Number(hoursText)
  const minutes = Number(minutesText)

  if (is24Hour) {
    return `${pad(hours)}:${pad(minutes)}`
  }

  const suffix = hours >= 12 ? 'PM' : 'AM'
  const normalized = hours % 12 || 12
  return `${normalized}:${pad(minutes)} ${suffix}`
}

function formatHourLabel(hour: number, is24Hour: boolean) {
  return formatTimeLabel(`${pad(hour)}:00`, is24Hour)
}

function formatMinutesLabel(totalMinutes: number, is24Hour: boolean) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return formatTimeLabel(`${pad(hours)}:${pad(minutes)}`, is24Hour)
}

function formatDateTimeLabel(date: Date, is24Hour: boolean) {
  return formatMinutesLabel(date.getHours() * 60 + date.getMinutes(), is24Hour)
}

function hourToggleClass(active: boolean) {
  return [
    'rounded-[3px] px-3 py-2 text-sm transition',
    active ? 'bg-black text-white' : 'text-white/55 hover:text-white',
  ].join(' ')
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function normalizeSelection(selection: DragSelection): AppointmentDraft {
  return {
    dayIndex: selection.dayIndex,
    endSlot: Math.max(selection.startSlot, selection.endSlot),
    startSlot: Math.min(selection.startSlot, selection.endSlot),
  }
}

function slotIndexToMinutes(slotIndex: number, startHour: number) {
  return startHour * 60 + slotIndex * 15
}

function isSlotInSelection(
  selection: AppointmentDraft | null,
  dayIndex: number,
  slotIndex: number,
) {
  if (!selection || selection.dayIndex !== dayIndex) {
    return false
  }

  return slotIndex >= selection.startSlot && slotIndex <= selection.endSlot
}

function isBusySlot({
  dayIndex,
  endHour,
  overlayBlocks,
  slotIndex,
  startHour,
}: {
  dayIndex: number
  endHour: number
  overlayBlocks: OverlayBlock[]
  slotIndex: number
  startHour: number
}) {
  const slotStartMinutes = slotIndexToMinutes(slotIndex, startHour)
  const slotEndMinutes = slotStartMinutes + 15
  const rangeEndMinutes = endHour * 60

  if (slotStartMinutes >= rangeEndMinutes) {
    return true
  }

  return !overlayBlocks.some(
    (block) =>
      block.dayOffset === dayIndex &&
      slotStartMinutes < block.endHour * 60 &&
      slotEndMinutes > block.startHour * 60,
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

  const dayIndex = weekDays.findIndex((day) => isSameDate(day, now))
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
