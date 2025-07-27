import {type ReactNode, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    children: ReactNode;
    roles?: string[]; // Roles permitidos (opcional)
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Usuario no autenticado, redirigir al login
                navigate('/login', {
                    state: { from: location },
                    replace: true
                });
                return;
            }

            // Verificar roles si se especifican
            if (roles && roles.length > 0 && !roles.includes(user.role)) {
                // Usuario no tiene el rol necesario
                navigate('/dashboard', { replace: true });
                return;
            }
        }
    }, [user, loading, navigate, location, roles]);

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Verificando autenticación...</p>
                </div>
            </div>
        );
    }

    // Si no está autenticado, no renderizar nada (se está redirigiendo)
    if (!user) {
        return null;
    }

    // Verificar roles
    if (roles && roles.length > 0 && !roles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                        <div className="text-red-500 text-6xl mb-4">🚫</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
                        <p className="text-gray-600 mb-6">
                            No tienes permisos para acceder a esta sección.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Ir al Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Usuario autenticado y con permisos correctos
    return <>{children}</>;
};