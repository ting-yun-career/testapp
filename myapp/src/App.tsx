import { useMemo, useState } from 'react'

const HOST = {
  name: 'Ting Yun',
  initials: 'T',
  title: '30 min meeting',
  duration: 30,
  location: 'Cal Video',
  timezone: 'America/Vancouver',
}

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
const WORKING_DAYS = [1, 2, 3, 4, 5]
const BOOKED_SLOT_MAP: Record<string, string[]> = {
  '2026-04-09': ['04:00'],
  '2026-04-10': ['03:30'],
  '2026-04-13': ['01:30', '05:00'],
  '2026-04-14': ['02:30', '06:00'],
  '2026-04-15': ['04:30'],
  '2026-04-16': ['01:00', '07:00'],
}

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

type ViewMode = 'calendar' | 'agenda'

const OVERLAY_BLOCKS: OverlayBlock[] = [
  { dayOffset: 0, startHour: 9, endHour: 16.5 },
  { dayOffset: 1, startHour: 9, endHour: 16.5 },
  { dayOffset: 2, startHour: 7, endHour: 24 },
  { dayOffset: 3, startHour: 7, endHour: 24 },
  { dayOffset: 4, startHour: 9, endHour: 24 },
  { dayOffset: 5, startHour: 9, endHour: 24 },
  { dayOffset: 6, startHour: 9, endHour: 24 },
]

function App() {
  const initialDate = new Date('2026-04-09T12:00:00')
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  )
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [selectedSlot, setSelectedSlot] = useState<string | null>('01:00')
  const [is24Hour, setIs24Hour] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth, selectedDate),
    [selectedDate, visibleMonth],
  )

  const selectedDateKey = formatDateKey(selectedDate)
  const availableSlots = useMemo(
    () => buildSlotsForDate(selectedDate, selectedDateKey),
    [selectedDate, selectedDateKey],
  )

  const weekDays = useMemo(
    () => getWeekDaysStarting(selectedDate),
    [selectedDate],
  )

  const selectedSlotLabel = selectedSlot
    ? formatTimeLabel(selectedSlot, is24Hour)
    : null

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <section className="booking-shell flex-1 overflow-hidden rounded-[32px] border border-white/8 bg-[var(--panel-bg)] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <aside className="border-b border-white/8 p-6 lg:border-b-0 lg:border-r lg:p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#72889b] text-sm font-semibold text-white">
              {HOST.initials}
            </div>
            <p className="mt-5 text-xl font-medium text-white/82">
              {HOST.name}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white lg:text-[2.15rem]">
              {HOST.title}
            </h1>

            <div className="mt-6 space-y-4 text-lg text-white/82">
              <DetailRow icon={<ClockIcon />} label={`${HOST.duration}m`} />
              <DetailRow icon={<VideoIcon />} label={HOST.location} />
              <DetailRow icon={<GlobeIcon />} label={HOST.timezone} />
            </div>

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
                      day.isSelected ? 'calendar-day--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={!day.isAvailable}
                    onClick={() => {
                      setSelectedDate(day.date)
                      setSelectedSlot(null)
                    }}
                  >
                    <span>{day.date.getDate()}</span>
                    {day.isToday ? (
                      <span className="calendar-day__dot" />
                    ) : null}
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
                    {formatRangeTitle(selectedDate, viewMode)}
                  </h2>
                  <div className="flex gap-1">
                    <MonthArrow
                      direction="prev"
                      onClick={() => shiftSelectedDate(-1, setSelectedDate)}
                    />
                    <MonthArrow
                      direction="next"
                      onClick={() => shiftSelectedDate(1, setSelectedDate)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-white/88">
                  <div className="inline-flex rounded-2xl border border-white/8 bg-white/4 p-1">
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

                  <IconButton
                    active={viewMode === 'calendar'}
                    label="Calendar"
                    onClick={() => setViewMode('calendar')}
                  >
                    <CalendarIcon />
                  </IconButton>
                  <IconButton
                    active={viewMode === 'agenda'}
                    label="Agenda"
                    onClick={() => setViewMode('agenda')}
                  >
                    <ColumnsIcon />
                  </IconButton>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-5 py-5 sm:px-6 lg:px-8">
              {viewMode === 'agenda' ? (
                <OverlayBoard
                  selectedDate={selectedDate}
                  weekDays={weekDays}
                  is24Hour={is24Hour}
                />
              ) : (
                <div className="flex h-full flex-col gap-5 xl:flex-row">
                  <section className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-semibold text-white">
                          {formatSelectedDay(selectedDate)}
                        </p>
                        <p className="mt-2 text-sm text-white/50">
                          Pick a time to book this appointment.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-2 text-sm text-white/66">
                        {availableSlots.filter((slot) => !slot.booked).length}{' '}
                        open slots
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          className={[
                            'slot-pill',
                            slot.booked ? 'slot-pill--booked' : '',
                            selectedSlot === slot.time
                              ? 'slot-pill--selected'
                              : '',
                          ].join(' ')}
                          disabled={slot.booked}
                          onClick={() => setSelectedSlot(slot.time)}
                        >
                          <span>{formatTimeLabel(slot.time, is24Hour)}</span>
                          <span className="text-xs uppercase tracking-[0.24em] text-white/38">
                            {slot.booked ? 'Booked' : 'Open'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>

                  <aside className="w-full shrink-0 xl:max-w-[360px]">
                    <div className="rounded-[28px] border border-white/8 bg-[var(--card-bg)] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
                      <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                        Booking summary
                      </p>
                      <h3 className="mt-4 text-3xl font-semibold text-white">
                        {HOST.title}
                      </h3>
                      <div className="mt-6 space-y-4 text-base text-white/74">
                        <DetailRow
                          icon={<ClockIcon />}
                          label={`${HOST.duration} minutes`}
                        />
                        <DetailRow icon={<VideoIcon />} label={HOST.location} />
                        <DetailRow
                          icon={<CalendarIcon />}
                          label={`${formatLongDate(selectedDate)}${
                            selectedSlotLabel ? ` at ${selectedSlotLabel}` : ''
                          }`}
                        />
                      </div>

                      <div className="mt-8 rounded-3xl border border-white/8 bg-black/20 p-4">
                        <p className="text-sm text-white/55">Your selection</p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          {selectedSlotLabel ?? 'Choose a time'}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/56">
                          Times are shown in {HOST.timezone}. We can plug this
                          into your real availability API and persist bookings
                          next.
                        </p>
                      </div>

                      <div className="mt-8 space-y-3">
                        <input
                          className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-white/25"
                          defaultValue="Alex Chen"
                          placeholder="Your name"
                        />
                        <input
                          className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-white/25"
                          defaultValue="alex@example.com"
                          placeholder="Your email"
                        />
                        <button
                          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/35"
                          disabled={!selectedSlot}
                        >
                          Confirm booking
                        </button>
                      </div>
                    </div>
                  </aside>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}

function IconButton({
  active = false,
  children,
  label,
  onClick,
}: React.PropsWithChildren<{
  active?: boolean
  label: string
  onClick?: () => void
}>) {
  return (
    <button
      aria-label={label}
      className={[
        'inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition',
        active
          ? 'border-white/16 bg-black text-white'
          : 'border-white/8 bg-white/4 text-white/76 hover:bg-white/8 hover:text-white',
      ].join(' ')}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function DetailRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/82">{icon}</span>
      <span>{label}</span>
    </div>
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
  selectedDate,
  weekDays,
  is24Hour,
}: {
  selectedDate: Date
  weekDays: Date[]
  is24Hour: boolean
}) {
  const hours = Array.from({ length: 18 }, (_, index) => index + 7)

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
              {OVERLAY_BLOCKS.some(
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

function buildCalendarDays(month: Date, selectedDate: Date): CalendarDay[] {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
  const lastOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const leading = firstOfMonth.getDay()
  const totalCells = Math.ceil((leading + lastOfMonth.getDate()) / 7) * 7
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - leading)

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const inMonth = date.getMonth() === month.getMonth()
    const isAvailable = inMonth && WORKING_DAYS.includes(date.getDay())
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

function buildSlotsForDate(date: Date, key: string) {
  const slots: { time: string; booked: boolean }[] = []

  for (let minutes = 60; minutes <= 510; minutes += 30) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const time = `${pad(hours)}:${pad(mins)}`
    slots.push({
      time,
      booked:
        date.getDay() === 5
          ? minutes >= 240 && minutes <= 270
          : (BOOKED_SLOT_MAP[key] ?? []).includes(time),
    })
  }

  return slots
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

function formatRangeTitle(date: Date, viewMode: ViewMode) {
  if (viewMode === 'calendar') {
    return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const end = new Date(date)
  end.setDate(date.getDate() + 6)
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}-${end.getDate()}, ${date.getFullYear()}`
}

function formatSelectedDay(date: Date) {
  return `${WEEKDAY_SHORT[date.getDay()]} ${pad(date.getDate())}`
}

function formatLongDate(date: Date) {
  return `${WEEKDAY_SHORT[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
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
    'rounded-xl px-3 py-2 text-sm transition',
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

function ClockIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24">
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

function VideoIcon() {
  return (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <rect height="12" rx="3" width="12" x="3" y="6" />
      <path d="M16 10.2 21 7v10l-5-3.2z" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="m16.8 16.8 2.7 2.7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
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

function ColumnsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <rect
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
        width="16"
        x="4"
        y="4"
      />
      <path d="M10 4v16M16 4v16" stroke="currentColor" strokeWidth="1.8" />
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

export default App
