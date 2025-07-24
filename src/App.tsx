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
import NotFound from './pages/NotFound';
import type { JSX } from "react";

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requiredRoles = [] }: { children: JSX.Element, requiredRoles?: string[] }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Rutas públicas */}
                <Route path="/login" element={<Login />} />

                {/* Rutas protegidas */}
                <Route element={<Layout />}>
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
                    <Route path="consultations">
                        <Route index element={
                            <ProtectedRoute>
                                <Consultations />
                            </ProtectedRoute>
                        } />
                        <Route path="new" element={
                            <ProtectedRoute requiredRoles={['doctor', 'admin']}>
                                <ConsultationForm />
                            </ProtectedRoute>
                        } />
                        <Route path=":id" element={
                            <ProtectedRoute>
                                <ConsultationDetail />
                            </ProtectedRoute>
                        } />
                    </Route>
                    <Route path="users" element={
                        <ProtectedRoute requiredRoles={['admin']}>
                            <UserManagement />
                        </ProtectedRoute>
                    } />
                </Route>

                {/* Redirección para rutas no encontradas */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;