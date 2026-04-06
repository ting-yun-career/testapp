import { useMemo, useState } from 'react'

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

export default function BookingCalendar({
  endHour = 24,
  overlayBlocks = [
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

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth, selectedDate, workingDays),
    [selectedDate, visibleMonth, workingDays],
  )

  const weekDays = useMemo(
    () => getWeekDaysStarting(selectedDate),
    [selectedDate],
  )

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
                    {formatRangeTitle(selectedDate)}
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
                endHour={endHour}
                overlayBlocks={overlayBlocks}
                startHour={startHour}
                selectedDate={selectedDate}
                weekDays={weekDays}
                is24Hour={is24Hour}
              />
            </div>
          </section>
        </section>
      </div>
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
  endHour,
  overlayBlocks,
  startHour,
  selectedDate,
  weekDays,
  is24Hour,
}: {
  endHour: number
  overlayBlocks: OverlayBlock[]
  startHour: number
  selectedDate: Date
  weekDays: Date[]
  is24Hour: boolean
}) {
  const normalizedStart = Math.max(0, Math.min(startHour, endHour))
  const normalizedEnd = Math.max(normalizedStart, endHour)
  const hours = Array.from(
    { length: normalizedEnd - normalizedStart + 1 },
    (_, index) => index + normalizedStart,
  )

  return (
    <div className="overlay-grid">
      <div className="overlay-grid__top" />
      {weekDays.map((day) => (
        <div key={day.toISOString()} className="overlay-grid__day-label">
          <span className="block text-xs uppercase tracking-[0.24em] text-white/46">
            {WEEKDAY_SHORT[day.getDay()]}
          </span>
          <span className="mt-1 block text-base font-medium text-white/75">
            {pad(day.getDate())}
          </span>
        </div>
      ))}

      {hours.map((hour) => (
        <div key={hour} className="contents">
          <div className="overlay-grid__time">
            {formatHourLabel(hour, is24Hour)}
          </div>
          {weekDays.map((day, dayIndex) => (
            <div
              key={`${day.toISOString()}-${hour}`}
              className="overlay-grid__cell"
            >
              {overlayBlocks.some(
                (block) =>
                  block.dayOffset === dayIndex &&
                  hour >= block.startHour &&
                  hour < block.endHour,
              ) ? (
                <div className="overlay-grid__busy" />
              ) : null}
              {sameHour(selectedDate, day, hour) ? (
                <div className="overlay-grid__now">
                  <span>{formatTimeLabel('16:37', is24Hour)}</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function buildCalendarDays(
  month: Date,
  selectedDate: Date,
  workingDays: number[],
): CalendarDay[] {
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
      isToday: formatDateKey(date) === '2026-04-05',
    }
  })
}

function getWeekDaysStarting(selectedDate: Date) {
  const start = new Date(selectedDate)
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

function formatRangeTitle(date: Date) {
  const end = new Date(date)
  end.setDate(date.getDate() + 6)
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}-${end.getDate()}, ${date.getFullYear()}`
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

function hourToggleClass(active: boolean) {
  return [
    'rounded-[3px] px-3 py-2 text-sm transition',
    active ? 'bg-black text-white' : 'text-white/55 hover:text-white',
  ].join(' ')
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function sameHour(selectedDate: Date, day: Date, hour: number) {
  return isSameDate(selectedDate, day) && hour === 16
}

function pad(value: number) {
  return String(value).padStart(2, '0')
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
