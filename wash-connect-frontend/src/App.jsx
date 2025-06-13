import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Login from './Login';
import Register from './customers/Register';
import UserDashboard from './customers/UserDashboard';
import LandingPage from './LandingPage';
import CarwashShopPage from './customers/CarwashShopPage';
import BookingPage from './customers/BookingPage';
import CarwashRegister from './carwashowners/carwashRegister';
import CarwashLogin from './carwashowners/carwashLogin';
import CarwashApplicationRegistration from './carwashowners/carwashApplicationRegistration';
import AdminRegister from './admin/adminRegister';
import AdminDashboard from './admin/adminDashboard';
import AdminApplicationRequests from './admin/adminApplicationRequests';
import AdminUserManagement from './admin/adminUserManagement';
import AdminCarwashManagement from './admin/adminCarwashManagement';
import BookForm from './customers/bookForm';
import BookingConfirmation from './customers/bookingConfirmation';
import Payment from './customers/payment';
import CarwashDashboard from './carwashowners/carwashDashboard';
import CustomerList from './carwashowners/CustomerList';
import BannedPage from './customers/BannedPage';
import PersonnelList from './carwashowners/PersonnelList';
import AddEmployee from './carwashowners/AddEmployee';
import PersonnelAssign from './carwashowners/personnelAssign';
import Bookings from './carwashowners/booking';

function App() {
    return (
        <Router>
            <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/popular-carwash" element={<CarwashShopPage />} />
                <Route path="/book" element={<BookingPage />} />
                <Route path="/book-form" element={<BookForm />} />
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/banned" element={<BannedPage />} />
                

                {/* Carwash Owner Routes */}
                <Route path="/carwash-register" element={<CarwashRegister />} />
                <Route path="/carwash-login" element={<CarwashLogin />} />
                <Route path="/carwash-application-registration" element={<CarwashApplicationRegistration />} /> 
                <Route path="/carwash-dashboard" element={<CarwashDashboard />} />
                <Route path="/customer-list" element={<CustomerList />} />
                <Route path="/personnel-list" element={<PersonnelList />} />
                <Route path="/add-employee" element={<AddEmployee />} />
                <Route path="/personnel-assign" element={<PersonnelAssign />} />
                <Route path="/bookings" element={<Bookings />} />

                {/* Admin Routes */}
                <Route path="/admin-register" element={<AdminRegister />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin-application-requests" element={<AdminApplicationRequests />} />
                <Route path="/admin-customer-management" element={<AdminUserManagement />} />
                <Route path="/admin-carwash-management" element={<AdminCarwashManagement />} />
            </Routes>
        </Router>
    );
}

export default App;