import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../src/user/utilities/Header.jsx';
import UserLogin from './user/UserLogin';
import UserDashboard from './user/UserDashboard';
import Room from './user/reservation/RoomReservation';
import ReservationFormsDetails from './user/reservation/ReservationFormsDetails';
import Edit from '../src/user/utilities/EditProfile.jsx';
import Confirmation from './user/reservation/Confirmation';

import AdminLogin from './admin/AdminLogin.jsx';
import Sidebar from './admin/Sidebar.jsx';
import EmployeeList from './admin/EmployeeList.jsx';

import Tablet from './tablet/tablet';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserLogin />} />
        <Route path="/dashboard" element={
          <>
            <Header />
            <UserDashboard />
          </>
        } />
        <Route path="/reserve" element={
          <>
            <Header />
            <Room />
          </>
        } />
        <Route path="/reserveform" element={
          <>
            <Header />
            <ReservationFormsDetails />
          </>
        } />
        <Route path="/confirmation" element={
          <>
            <Header />
            <Confirmation />
          </>
        } />
        <Route path ="/user/edit" element={
          <>
            <Edit />
          </>
        } />
      <Route path ="/admin/log-in" element={
        <>
          <AdminLogin/>
        </>
      }/>
      <Route path = "/admin/employee-list" element={
        <>
        <Sidebar/>
        <EmployeeList/>
        </>
      }/>
      <Route path = "/tablet" element={
        <>
        <Tablet/>
        </>
      }/>
      </Routes>
    </Router>
  );
}

export default App;
