import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  return (
    <div>
      <Routes>
        {/* ── Public routes ── */}
        <Route path='/' element={<Home />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />

        {/* ── Protected dashboard routes ── */}
        <Route element={<ProtectedRoute />}>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/dashboard/profile' element={<Profile />} />
          {/* 
            Coming soon — will be added in next phases:
            <Route path='/dashboard/zones'   element={<Zones />} />
            <Route path='/dashboard/zones/:id' element={<ZoneDetail />} />
            <Route path='/dashboard/animals' element={<Animals />} />
            <Route path='/dashboard/animals/:id' element={<AnimalDetail />} />
            <Route path='/dashboard/tickets' element={<MyTickets />} />
          */}
        </Route>
      </Routes>
    </div>
  )
}

export default App
