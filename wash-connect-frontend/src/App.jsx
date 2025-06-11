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

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/popular-carwash" element={<CarwashShopPage />} />
                <Route path="/book" element={<BookingPage />} />

                {/* Carwash Owner Routes */}
                <Route path="/carwash-register" element={<CarwashRegister />} />
                <Route path="/carwash-login" element={<CarwashLogin />} />
                <Route path="/carwash-application-registration" element={<CarwashApplicationRegistration />} /> 

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