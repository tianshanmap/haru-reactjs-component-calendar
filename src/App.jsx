import './App.css'
import Header from './components/header.jsx'
import Footer from './components/footer.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppointmentCalendar from './calendar.jsx'

const AppointmentSection = () => {
  return (
    <div className='container'>
        <Header/>
        <AppointmentCalendar name="spa"/>
        <Footer/>
    </div>
  )
}
const Home = () => {
  return (
    <div className='container'>
        <Header/>
        <div className='container'></div>
        <Footer/>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/appointment-manager" element={<AppointmentSection/>} />
      </Routes>
    </Router>
  )
}

export default App
