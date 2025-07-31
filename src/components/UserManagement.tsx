import { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
    UserGroupIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    UserIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    IdentificationIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

type UserFormData = {
    username: string;
    full_name: string;
    role: string;
    password?: string;
};

interface FilterState {
    search: string;
    role: string;
}

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const { user: currentUser } = useAuth();

    const [filters, setFilters] = useState<FilterState>({
        search: '',
        role: 'all'
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<UserFormData>();

    // Fetch users on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get<ApiResponse<User[]>>(`${API_BASE_URL}/users`);
                if (response.data.success) {
                    setUsers(response.data.data);
                    setFilteredUsers(response.data.data);
                } else {
                    const errorMessage = response.data.message || 'Failed to fetch users';
                    setError(errorMessage);
                    toast.error(errorMessage);
                }
            } catch (err) {
                const errorMessage = axios.isAxiosError(err)
                    ? err.response?.data?.error || err.message
                    : 'Unknown error occurred';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filter users
    useEffect(() => {
        let filtered = [...users];

        // Search filter
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase().trim();
            filtered = filtered.filter(u =>
                u.username?.toLowerCase().includes(searchTerm) ||
                u.full_name?.toLowerCase().includes(searchTerm) ||
                u.id?.toLowerCase().includes(searchTerm)
            );
        }

        // Role filter
        if (filters.role !== 'all') {
            filtered = filtered.filter(u => u.role === filters.role);
        }

        setFilteredUsers(filtered);
    }, [filters, users]);

    // Handle form submission
    const onSubmit = async (formData: UserFormData) => {
        setLoading(true);
        setError(null);

        try {
            if (editingUser) {
                // Verify permissions - Only admin or the user themselves can edit
                if (currentUser?.role !== 'admin' && currentUser?.id !== editingUser.id) {
                    throw new Error('No tienes permisos para editar este usuario');
                }

                // Update existing user
                const response = await axios.put<ApiResponse<User>>(
                    `${API_BASE_URL}/users/${editingUser.id}`,
                    formData
                );

                if (response.data.success) {
                    setUsers(users.map(u =>
                        u.id === editingUser.id ? response.data.data : u
                    ));
                    resetForm();
                    toast.success('Usuario actualizado exitosamente');
                } else {
                    const errorMessage = response.data.message || 'Failed to update user';
                    setError(errorMessage);
                    toast.error(errorMessage);
                }
            } else {
                // Verify permissions - Only admin can create new users
                if (currentUser?.role !== 'admin') {
                    throw new Error('Solo los administradores pueden crear nuevos usuarios');
                }

                // Create new user
                const response = await axios.post<ApiResponse<User>>(
                    `${API_BASE_URL}/users`,
                    formData
                );

                if (response.data.success) {
                    setUsers([...users, response.data.data]);
                    resetForm();
                    toast.success('Usuario creado exitosamente');
                } else {
                    const errorMessage = response.data.message || 'Failed to create user';
                    setError(errorMessage);
                    toast.error(errorMessage);
                }
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.error || err.message
                : err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Handle user edit
    const handleEdit = (user: User) => {
        // Verify permissions before showing edit form
        if (currentUser?.role !== 'admin' && currentUser?.id !== user.id) {
            toast.error('No tienes permisos para editar este usuario');
            return;
        }
        setEditingUser(user);
        setValue('username', user.username);
        setValue('full_name', user.full_name);
        setValue('role', user.role);
        setValue('password', ''); // Reset password field
        setShowForm(true);
    };

    // Handle user deletion
    const handleDelete = async (id: string) => {
        // Verify permissions - Only admin can delete users
        if (currentUser?.role !== 'admin') {
            toast.error('Solo los administradores pueden eliminar usuarios');
            return;
        }

        if (!id || !window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.delete<ApiResponse<null>>(
                `${API_BASE_URL}/users/${id}`
            );

            if (response.data.success) {
                setUsers(users.filter(u => u.id !== id));
                toast.success('Usuario eliminado exitosamente');
            } else {
                const errorMessage = response.data.message || 'Failed to delete user';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.error || err.message
                : 'Unknown error occurred';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Reset form and editing state
    const resetForm = () => {
        reset();
        setEditingUser(null);
        setShowForm(false);
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-800 border border-purple-200';
            case 'doctor': return 'bg-blue-100 text-blue-800 border border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    // Calculate statistics
    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        doctors: users.filter(u => u.role === 'doctor').length,
        active: users.length, // You might want to add an active field to your User model
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    if (error && users.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                    <div className="flex items-center mb-4">
                        <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">Error de Conexión</h3>
                    </div>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                            <p className="text-gray-600 mt-1">Administra todos los usuarios del sistema</p>
                        </div>

                        {/* Header controls */}
                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="relative">
                                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar usuarios..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                                    className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                                />
                            </div>

                            {/* Filters */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <FunnelIcon className="w-5 h-5 mr-2" />
                                    Filtros
                                </button>

                                {showFilters && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-800 mb-3">Filtros Avanzados</h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                                    <select
                                                        value={filters.role}
                                                        onChange={(e) => setFilters({...filters, role: e.target.value})}
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                                                    >
                                                        <option value="all">Todos los roles</option>
                                                        <option value="admin">Administrador</option>
                                                        <option value="doctor">Doctor</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex justify-between mt-4 pt-3 border-t">
                                                <button
                                                    onClick={() => {
                                                        setFilters({
                                                            search: '',
                                                            role: 'all'
                                                        });
                                                        setShowFilters(false);
                                                    }}
                                                    className="px-3 py-2 bg-white text-gray-600 hover:text-gray-800 transition-colors"
                                                >
                                                    Limpiar
                                                </button>
                                                <button
                                                    onClick={() => setShowFilters(false)}
                                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                                >
                                                    Aplicar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Add User button */}
                            {(currentUser?.role === 'admin') && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                                >
                                    <PlusIcon className="w-5 h-5 mr-2" />
                                    Nuevo Usuario
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Summary statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Usuarios</p>
                                <p className="text-3xl font-bold">{stats.total}</p>
                            </div>
                            <UserGroupIcon className="w-8 h-8 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Administradores</p>
                                <p className="text-3xl font-bold">{stats.admins}</p>
                            </div>
                            <ShieldCheckIcon className="w-8 h-8 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Doctores</p>
                                <p className="text-3xl font-bold">{stats.doctors}</p>
                            </div>
                            <UserCircleIcon className="w-8 h-8 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-100 text-sm font-medium">Usuarios Activos</p>
                                <p className="text-3xl font-bold">{stats.active}</p>
                            </div>
                            <IdentificationIcon className="w-8 h-8 opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className="text-gray-400 bg-white hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Basic Information */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Usuario</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario *</label>
                                            <input
                                                {...register('username', {
                                                    required: 'El nombre de usuario es requerido',
                                                    minLength: {
                                                        value: 3,
                                                        message: 'El nombre de usuario debe tener al menos 3 caracteres'
                                                    }
                                                })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white text-gray-900 placeholder-gray-500"
                                                disabled={loading || !!editingUser}
                                            />
                                            {errors.username && (
                                                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                                            <input
                                                {...register('full_name', {
                                                    required: 'El nombre completo es requerido',
                                                    minLength: {
                                                        value: 2,
                                                        message: 'El nombre completo debe tener al menos 2 caracteres'
                                                    }
                                                })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white text-gray-900 placeholder-gray-500"
                                                disabled={loading}
                                            />
                                            {errors.full_name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                                            <select
                                                {...register('role', { required: 'El rol es requerido' })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                                                disabled={loading || Boolean(editingUser && currentUser?.id === editingUser.id)}
                                            >
                                                <option value="">Seleccionar Rol</option>
                                                <option value="admin">Administrador</option>
                                                <option value="doctor">Doctor</option>
                                            </select>
                                            {errors.role && (
                                                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                                            )}
                                        </div>

                                        {(editingUser && currentUser?.role === 'admin') || !editingUser ? (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                                                </label>
                                                <input
                                                    type="password"
                                                    {...register('password', {
                                                        required: !editingUser ? 'La contraseña es requerida' : false,
                                                        minLength: {
                                                            value: 6,
                                                            message: 'La contraseña debe tener al menos 6 caracteres'
                                                        }
                                                    })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white text-gray-900 placeholder-gray-500"
                                                    disabled={loading}
                                                />
                                                {errors.password && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-2 border bg-white border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                                        disabled={loading}
                                    >
                                        {loading ? 'Procesando...' : editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <UserGroupIcon className="w-6 h-6 mr-2 text-blue-600" />
                                    Registro de Usuarios
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Mostrando {filteredUsers.length} de {users.length} usuarios
                                </p>
                            </div>
                        </div>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-16">
                            <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
                            <p className="text-gray-500 mb-6">
                                {users.length === 0
                                    ? 'Aún no hay usuarios registrados en el sistema.'
                                    : 'Prueba ajustando los filtros para encontrar lo que buscas.'
                                }
                            </p>
                            {(currentUser?.role === 'admin') && users.length === 0 && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <PlusIcon className="w-5 h-5 mr-2" />
                                    Crear Primer Usuario
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre de usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado el</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                                    user.role === 'admin' ? 'bg-purple-500' :
                                                        user.role === 'doctor' ? 'bg-blue-500' : 'bg-gray-500'
                                                }`}>
                                                    {user.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.full_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {user.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.username}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                                {user.role === 'admin' ? 'Administrador' :
                                                    user.role === 'doctor' ? 'Doctor' : 'Rol desconocido'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(user.created_at).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-3">
                                                {(currentUser?.role === 'admin' || currentUser?.id === user.id) && (
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-yellow-600 bg-white hover:text-yellow-900 transition-colors"
                                                        title="Editar"
                                                        disabled={loading}
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                                {currentUser?.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-red-600 bg-white hover:text-red-900 transition-colors"
                                                        title="Eliminar"
                                                        disabled={loading}
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {filteredUsers.length > 20 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Anterior
                            </button>
                            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Siguiente
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">1</span> a <span className="font-medium">{Math.min(20, filteredUsers.length)}</span> de{' '}
                                    <span className="font-medium">{filteredUsers.length}</span> resultados
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                        Anterior
                                    </button>
                                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        1
                                    </button>
                                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                        Siguiente
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;