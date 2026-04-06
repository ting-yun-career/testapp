import BookingCalendar from './components/BookingCalendar'

function App() {
  return (
    <BookingCalendar
      endHour={21}
      overlayBlocks={[
        { dayOffset: 0, startHour: 9, endHour: 17 },
        { dayOffset: 1, startHour: 9, endHour: 17 },
        { dayOffset: 2, startHour: 9, endHour: 17 },
        { dayOffset: 3, startHour: 9, endHour: 17 },
        { dayOffset: 4, startHour: 9, endHour: 17 },
      ]}
      startHour={7}
      workingDays={[1, 2, 3, 4, 5]}
    />
  )
}

export default App
