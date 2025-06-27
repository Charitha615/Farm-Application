import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import FarmerInsurancePage from './pages/FarmerInsurancePage';
import ProfileEdit from './pages/ProfileEdit';

import LandList from './pages/LandList';
import LandManagement from './pages/LandManagement'
import AddLand from './pages/AddLand';
import EditLand from './pages/EditLand';


import AdminDashboard from './pages/AdminDashboard';


import FieldInspectorDashboard from './pages/FieldInspectorDashboard';

import DamageClaimPage from './pages/DamageClaimPage';
import RiskAlertsPage from './pages/RiskAlertsPage';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />


            <Route path="/profile" element={<Profile />} />
            <Route path="/farmer/insurance" element={<FarmerInsurancePage />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />

            <Route path="/lands" element={<LandManagement />} />
            <Route path="/land/add" element={<AddLand />} />
            <Route path="/lands/edit/:id" element={<EditLand />} />


            <Route path="/admin/dashboard/*" element={<AdminDashboard />} />


            <Route path="/inspector/dashboard" element={<FieldInspectorDashboard />} />


            <Route path="/farmer/damageclaim" element={<DamageClaimPage />} />
            <Route path="/farmer/riskalerts" element={<RiskAlertsPage />} />


          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;