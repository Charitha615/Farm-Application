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
import ProfileEdit from './pages/ProfileEdit';

import LandList from './pages/LandList';
import AddLand from './pages/AddLand';
import EditLand from './pages/EditLand';


import AdminDashboard from './pages/AdminDashboard';


import FieldInspectorDashboard from './pages/FieldInspectorDashboard';


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
            <Route path="/profile/edit" element={<ProfileEdit />} />

            <Route path="/lands" element={<LandList />} />
            <Route path="/land/add" element={<AddLand />} />
            <Route path="/lands/edit/:id" element={<EditLand />} />


            <Route path="/admin/dashboard/*" element={<AdminDashboard />} />


            <Route path="/inspector/dashboard" element={<FieldInspectorDashboard />} />

          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;