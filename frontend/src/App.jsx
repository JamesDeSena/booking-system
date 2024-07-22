import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Header from './user/utilities/Header.jsx';
import UserLogin from './user/UserLogin';
import UserDashboard from './user/UserDashboard';
import Room from './user/reservation/RoomReservation';
import ReservationFormsDetails from './user/reservation/ReservationFormsDetails';
import Edit from './user/utilities/EditProfile.jsx';
import UserList from './user/utilities/UserList.jsx';
import Confirmation from './user/reservation/Confirmation';

import AdminLogin from './admin/AdminLogin.jsx';
import EmployeeList from './admin/EmployeeList.jsx';
import AddEmployee from './admin/AddEmployee.jsx';
import ApprovalRoom from './admin/ApprovalRooms.jsx';
import Approval from './admin/Approval.jsx';
import NotFoundPage from './auth/NotFoundPage.jsx';
import EditAdmin from './admin/AdminProfile.jsx';

import Sidebaree from './admin/sidebarex.jsx'

import "react-toastify/dist/ReactToastify.css";
import 'react-datepicker/dist/react-datepicker.css';
import 'rc-time-picker/assets/index.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Tablet from './tablet/tablet';

import './App.css';


function App() {
  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path="/" element={<UserLogin />} />
        <Route path='/page-not-found' element={<NotFoundPage/>}/>
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
        <Route path="/user/edit" element={
          <>
            <Header/>
            <Edit />
          </>
        } />
         <Route path="/employee-list" element={
          <>
            <UserList />
          </>
        } />
        <Route path="/admin" element={
          <>
            <AdminLogin />
          </>
        } />
        <Route path="/admin/employee-list" element={
          <>
            <Sidebaree/>
            <EmployeeList />
          </>
        } />
        <Route path="/tablet" element={
          <>
            <Tablet />
          </>
        } />
        <Route path="/admin/add-employee" element={
          <>
            <Sidebaree />
            <AddEmployee />
          </>
        } />
        <Route path="/admin/approval" element={
          <>
            <Sidebaree />
            <Approval />
          </>
        } />
        <Route path="/admin/room-approval" element={
          <>
            <Sidebaree />
            <ApprovalRoom />
          </>
        } />
        <Route path="/admin/profile-settings" element={
          <>
          <Sidebaree />
          <EditAdmin/>
          </>
        }
        />

      </Routes>
    </div>
  );
}

export default App;
