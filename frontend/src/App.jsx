import React, { useState } from 'react'
import NavBar from './components/NavBar'
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Cars from './pages/Cars.jsx';
import CarDetails from './pages/CarDetails';
import MyBookings from './pages/MyBookings';
import Footer from './components/Footer.jsx';
import Layout from './pages/owner/Layout.jsx';
import DashBoard from './pages/owner/DashBoard.jsx';
import AddCar from './pages/owner/AddCar.jsx';
import ManageCars from './pages/owner/ManageCars.jsx';
import ManageBookings from './pages/owner/ManageBookings.jsx';
import Login from './components/Login.jsx';
import { Toaster } from 'react-hot-toast';
import { useAppContext } from './context/AppContext.jsx';

const App = () => {
 
  const {showLogin}= useAppContext(); 
  const isOwnerPath= useLocation().pathname.startsWith('/owner');  

  return (
    <>
        <Toaster />
        {showLogin && <Login/> }
        { !isOwnerPath && <NavBar />  } 
        <Routes>
          <Route  path="/" element={<Home/>} />
          <Route  path="/car-details/:id" element={<CarDetails/>} />
          <Route  path="/cars" element={<Cars/>} />
          <Route  path="/my-bookings" element={<MyBookings/>} />

          <Route path='/owner' element={<Layout/>}>
              <Route index element={<DashBoard />} />
              <Route path='add-car' element={<AddCar />} />
              <Route path="manage-cars" element={<ManageCars />} />
              <Route path="manage-bookings" element={<ManageBookings />} />
          </Route>
        </Routes>
        {!isOwnerPath && <Footer />}
    </>
  )
}

export default App
