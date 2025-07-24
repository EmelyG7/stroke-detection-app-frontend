import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import Consultations from './components/Consultations';
import ConsultationForm from './components/ConsultationForm';
import ConsultationDetail from './components/ConsultationDetail';
import UserManagement from './components/UserManagement';
import Login from './pages/Login';
import Layout from './components/Layout';
import type {JSX} from "react";

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Rutas públicas */}
                <Route path="/login" element={<Login />} />

                {/* Rutas protegidas */}
                <Route path="/" element={<Layout />}>
                    <Route index element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="patients" element={
                        <ProtectedRoute>
                            <Patients />
                        </ProtectedRoute>
                    } />
                    <Route path="consultations" element={
                        <ProtectedRoute>
                            <Consultations />
                        </ProtectedRoute>
                    } />
                    <Route path="consultations/new" element={
                        <ProtectedRoute>
                            <ConsultationForm />
                        </ProtectedRoute>
                    } />
                    <Route path="consultations/:id" element={
                        <ProtectedRoute>
                            <ConsultationDetail />
                        </ProtectedRoute>
                    } />
                    <Route path="users" element={
                        <ProtectedRoute>
                            <UserManagement />
                        </ProtectedRoute>
                    } />
                </Route>

                {/* Redirección para rutas no encontradas */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;