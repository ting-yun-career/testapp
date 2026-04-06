import BookingCalendar from './components/BookingCalendar'

function App() {
  return (
    <BookingCalendar endHour={21} startHour={7} workingDays={[1, 2, 3, 4, 5]} />
  )
}

export default App
