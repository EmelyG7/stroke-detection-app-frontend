import { createContext, useState, type ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface User {
    id: string;
    username: string;
    full_name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                localStorage.removeItem('currentUser');
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Verificar si hay una sesión guardada al cargar la aplicación
    // useEffect(() => {
    //     const savedUser = localStorage.getItem('currentUser');
    //     if (savedUser) {
    //         try {
    //             const parsedUser = JSON.parse(savedUser);
    //             setUser(parsedUser);
    //         } catch (error) {
    //             console.error('Error parsing saved user:', error);
    //             localStorage.removeItem('currentUser');
    //         }
    //     }
    // }, []);

    const login = async (username: string, password: string) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/users/login`, {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                const authenticatedUser: User = response.data.data;
                setUser(authenticatedUser);
                localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
                navigate('/dashboard');
                return;
            }

            throw new Error(response.data.error || 'Error de autenticación');
        } catch (error) {
            console.error('API Login error:', error);

            // Solo en desarrollo permitir mock login
            if (import.meta.env.MODE === 'development') {
                if (axios.isAxiosError(error) &&
                    (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK')) {
                    return handleMockLogin(username, password);
                }
            }

            const errorMessage = getErrorMessage(error);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

// Función helper para manejar errores
    const getErrorMessage = (error: unknown): string => {
        if (axios.isAxiosError(error)) {
            return error.response?.data?.error ||
                error.response?.data?.detail?.error ||
                error.message ||
                'Error de conexión con el servidor';
        }
        return error instanceof Error ? error.message : 'Error de autenticación desconocido';
    };

    // Función fallback para login con credenciales mock cuando no hay conexión
    const handleMockLogin = (username: string, password: string) => {
        console.log('Usando credenciales mock como fallback');

        if (
            (username === 'admin' && password === 'admin123') ||
            (username === 'doctor' && password === 'doctor123')
        ) {
            const mockUser: User = {
                id: username === 'admin' ? 'mock-admin-id' : 'mock-doctor-id',
                username,
                full_name: username === 'admin' ? 'Administrador Sistema' : 'Doctor Sistema',
                role: username === 'admin' ? 'admin' : 'doctor',
            };

            setUser(mockUser);
            localStorage.setItem('currentUser', JSON.stringify(mockUser));
            navigate('/dashboard');
        } else {
            throw new Error('Credenciales inválidas - No hay conexión con el servidor');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};