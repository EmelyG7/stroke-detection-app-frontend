import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    CloudArrowUpIcon,
    PhotoIcon,
    TrashIcon,
    ArrowLeftIcon,
    DocumentTextIcon,
    CalendarIcon,
    UserIcon,
    PencilSquareIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Patient {
    id: string;
    name: string;
}

interface ConsultationFormData {
    patient_id: string;
    date: string;
    notes: string;
}

// Add interface for API response wrapper
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Configure axios defaults for better CORS handling
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default function ConsultationForm() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Obtener parámetros de la URL
    const preselectedPatientId = searchParams.get('patient_id');
    const returnPath = searchParams.get('return') || '/consultations';

    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [formData, setFormData] = useState<ConsultationFormData>({
        patient_id: preselectedPatientId || '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                console.log('Fetching patients from:', `${API_BASE_URL}/patients/`);

                const response = await axios.get<ApiResponse<Patient[]> | Patient[]>(`${API_BASE_URL}/patients/`);
                console.log('Patients response:', response.data);

                // Check if response has the ApiResponse wrapper structure
                if (response.data && typeof response.data === 'object' && 'success' in response.data) {
                    // Handle ApiResponse wrapper
                    const apiResponse = response.data as ApiResponse<Patient[]>;
                    if (apiResponse.success && Array.isArray(apiResponse.data)) {
                        setPatients(apiResponse.data);

                        // Si hay un paciente preseleccionado, encontrarlo y establecerlo
                        if (preselectedPatientId) {
                            const patient = apiResponse.data.find(p => p.id === preselectedPatientId);
                            if (patient) {
                                setSelectedPatient(patient);
                            }
                        }
                    } else {
                        console.error('API returned unsuccessful response or invalid data structure');
                        toast.error(apiResponse.message || 'Error loading patients');
                    }
                } else if (Array.isArray(response.data)) {
                    // Handle direct array response (fallback for different API versions)
                    const patientsData = response.data as Patient[];
                    setPatients(patientsData);

                    // Si hay un paciente preseleccionado, encontrarlo y establecerlo
                    if (preselectedPatientId) {
                        const patient = patientsData.find(p => p.id === preselectedPatientId);
                        if (patient) {
                            setSelectedPatient(patient);
                        }
                    }
                } else {
                    console.error('Unexpected response structure:', response.data);
                    toast.error('Unexpected response format from server');
                }
            } catch (error) {
                console.error('Error fetching patients:', error);
                if (axios.isAxiosError(error)) {
                    if (error.code === 'ERR_NETWORK') {
                        toast.error('Cannot connect to server. Please check if the backend is running.');
                    } else if (error.response?.status === 0) {
                        toast.error('CORS error: Cannot connect to API. Check backend CORS configuration.');
                    } else {
                        toast.error(`Error loading patients: ${error.response?.data?.detail || error.message}`);
                    }
                } else {
                    toast.error('Error loading patients');
                }
            }
        };

        // Test CORS connection first
        const testConnection = async () => {
            try {
                await axios.get(`${API_BASE_URL}/test`);
                console.log('✅ CORS connection test successful');
            } catch (error) {
                console.error('❌ CORS connection test failed:', error);
                if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
                    toast.error('Cannot connect to backend server. Please ensure it\'s running on port 5000.');
                }
            }
        };

        testConnection();
        fetchPatients();

        if (id) {
            const fetchConsultation = async () => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/consultations/${id}`);
                    const consultation = response.data;
                    setFormData({
                        patient_id: consultation.patient_id,
                        date: consultation.date.split('T')[0],
                        notes: consultation.notes || ''
                    });
                    setIsEditing(true);
                } catch (error) {
                    console.error('Error fetching consultation:', error);
                    toast.error('Error loading consultation');
                    navigate('/consultations');
                }
            };
            fetchConsultation();
        }
    }, [id, navigate, preselectedPatientId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Si se cambia el paciente, actualizar el paciente seleccionado
        if (name === 'patient_id') {
            const patient = patients.find(p => p.id === value);
            setSelectedPatient(patient || null);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(file => {
                if (!file.type.startsWith('image/')) {
                    toast.error(`${file.name} is not a valid image`);
                    return false;
                }
                if (file.size > 10 * 1024 * 1024) {
                    toast.error(`${file.name} is too large (max 10MB)`);
                    return false;
                }
                return true;
            });

            setImages(prev => [...prev, ...validFiles]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleGoBack = () => {
        navigate(returnPath);
    };

    const getReturnButtonText = () => {
        switch (returnPath) {
            case '/patients':
                return 'Volver a Pacientes';
            case returnPath.startsWith('/patients/') ? returnPath : '':
                return 'Volver a Detalles del Paciente';
            default:
                return 'Volver a Consultas';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.patient_id) {
                toast.error('Please select a patient');
                setLoading(false);
                return;
            }

            if (!formData.date) {
                toast.error('Please select a date');
                setLoading(false);
                return;
            }

            if (!isEditing && images.length === 0) {
                toast.error('Please upload at least one image');
                setLoading(false);
                return;
            }

            const formDataObj = new FormData();
            formDataObj.append('patient_id', formData.patient_id);
            formDataObj.append('date', formData.date);

            // Only append notes if it's not empty
            if (formData.notes && formData.notes.trim()) {
                formDataObj.append('notes', formData.notes.trim());
            }

            // Append images for new consultations
            if (!isEditing) {
                images.forEach((image) => {
                    formDataObj.append('images', image);
                });
            }

            // Configuration for multipart form data
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000, // 60 second timeout for large image uploads
                withCredentials: true
            };

            console.log('Submitting form with data:');
            console.log('- patient_id:', formData.patient_id);
            console.log('- date:', formData.date);
            console.log('- notes:', formData.notes);
            console.log('- images count:', images.length);
            console.log('- isEditing:', isEditing);

            let response;
            if (isEditing) {
                response = await axios.put(`${API_BASE_URL}/consultations/${id}`, formDataObj, config);
                toast.success('Consultation updated successfully');
            } else {
                response = await axios.post(`${API_BASE_URL}/consultations/`, formDataObj, config);
                console.log('Create consultation response:', response.data);
                toast.success('Consultation created successfully');
            }

            // Navigate back to the original page
            navigate(returnPath);

        } catch (error) {
            console.error('Error submitting consultation:', error);

            if (axios.isAxiosError(error)) {
                // Handle different types of errors
                if (error.code === 'ERR_NETWORK') {
                    toast.error('Network error - cannot reach the server. Please check if the backend is running.');
                } else if (error.response?.status === 0) {
                    toast.error('CORS error - please check backend configuration');
                } else if (error.response?.status === 422) {
                    // Validation error
                    const validationErrors = error.response.data?.detail;
                    if (Array.isArray(validationErrors)) {
                        const errorMessages = validationErrors.map((err: any) => err.msg).join(', ');
                        toast.error(`Validation error: ${errorMessages}`);
                    } else {
                        toast.error('Validation error - please check your input');
                    }
                } else if (error.response?.status === 500) {
                    // Server error
                    const errorMessage = error.response?.data?.detail || 'Internal server error';
                    toast.error(`Server error: ${errorMessage}`);
                    console.error('Server error details:', error.response.data);
                } else {
                    // Other HTTP errors
                    const errorMessage = error.response?.data?.detail ||
                        error.response?.data?.message ||
                        `HTTP ${error.response?.status}: ${error.response?.statusText}`;
                    toast.error(errorMessage);
                }

                console.error('API Error details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    headers: error.response?.headers,
                    config: {
                        url: error.config?.url,
                        method: error.config?.method,
                        headers: error.config?.headers
                    }
                });
            } else {
                toast.error('Unexpected error occurred');
                console.error('Non-Axios error:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleGoBack}
                            className="flex items-center px-4 py-2 bg-gray-100 text-blue-600 hover:bg-gray-200 hover:text-blue-800 rounded-lg transition-colors group"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            {getReturnButtonText()}
                        </button>

                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <DocumentTextIcon className="w-8 h-8 mr-3 text-blue-600" />
                                {isEditing ? 'Editar Consulta' : 'Nueva Consulta'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {isEditing ? 'Modifica los datos de la consulta existente' : 'Registra una nueva evaluación médica'}
                            </p>
                            {selectedPatient && (
                                <p className="text-sm text-blue-600 mt-1 font-medium">
                                    Paciente: {selectedPatient.name}
                                </p>
                            )}
                        </div>

                        <div className="w-24"></div> {/* Spacer for centering */}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Main Form Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Card Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <PencilSquareIcon className="w-6 h-6 mr-2 text-blue-600" />
                            Datos de la Consulta
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Complete todos los campos obligatorios marcados con *
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Patient and Date Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-semibold text-gray-700">
                                    <UserIcon className="w-4 h-4 mr-2 text-blue-600" />
                                    Paciente *
                                </label>
                                {preselectedPatientId && selectedPatient ? (
                                    // Mostrar paciente preseleccionado como solo lectura
                                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-900">
                                        <div className="flex items-center">
                                            <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                                            <span className="font-medium">{selectedPatient.name}</span>
                                            <span className="ml-2 text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded-full">
                                                Preseleccionado
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    // Selector normal de paciente
                                    <select
                                        name="patient_id"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                                        value={formData.patient_id}
                                        onChange={handleChange}
                                        disabled={isEditing}
                                    >
                                        <option value="" className="text-gray-500">Seleccionar paciente...</option>
                                        {patients.map(patient => (
                                            <option key={patient.id} value={patient.id} className="text-gray-900">
                                                {patient.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {patients.length === 0 && (
                                    <p className="text-sm text-gray-500 flex items-center">
                                        <ExclamationTriangleIcon className="w-4 h-4 mr-1 text-yellow-500" />
                                        No hay pacientes disponibles
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-semibold text-gray-700">
                                    <CalendarIcon className="w-4 h-4 mr-2 text-blue-600" />
                                    Fecha de Consulta *
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                                    value={formData.date}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Notes Section */}
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-semibold text-gray-700">
                                <PencilSquareIcon className="w-4 h-4 mr-2 text-blue-600" />
                                Notas Médicas
                            </label>
                            <textarea
                                name="notes"
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white text-gray-900 placeholder-gray-500"
                                placeholder="Escriba observaciones, diagnósticos preliminares, tratamientos recomendados..."
                                value={formData.notes}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-gray-500">
                                Opcional: Añada cualquier información relevante sobre la consulta
                            </p>
                        </div>

                        {/* Image Upload Section - Only for new consultations */}
                        {!isEditing && (
                            <div className="space-y-4">
                                <label className="flex items-center text-sm font-semibold text-gray-700">
                                    <PhotoIcon className="w-4 h-4 mr-2 text-blue-600" />
                                    Imágenes DWI *
                                </label>

                                <div className="border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors">
                                    <div className="p-8">
                                        <div className="text-center">
                                            <CloudArrowUpIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                            <div className="space-y-2">
                                                <label className="cursor-pointer">
                                                    <span className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                                        <PhotoIcon className="w-5 h-5 mr-2" />
                                                        Seleccionar Imágenes
                                                    </span>
                                                    <input
                                                        type="file"
                                                        className="sr-only"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        required={!isEditing && images.length === 0}
                                                    />
                                                </label>
                                                <p className="text-gray-600">o arrastra y suelta las imágenes aquí</p>
                                                <p className="text-sm text-gray-500">
                                                    Formatos: PNG, JPG, JPEG • Máximo 10MB por imagen
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Image Preview Section */}
                        {images.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                                        <PhotoIcon className="w-4 h-4 mr-2 text-green-600" />
                                        Imágenes Seleccionadas ({images.length})
                                    </h4>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {images.length} archivo{images.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            <div className="aspect-square">
                                                <img
                                                    src={URL.createObjectURL(image)}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
                                                title="Eliminar imagen"
                                            >
                                                <TrashIcon className="h-3 w-3" />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs p-2">
                                                <p className="truncate font-medium">{image.name}</p>
                                                <p className="text-gray-300">
                                                    {(image.size / (1024 * 1024)).toFixed(1)} MB
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleGoBack}
                                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.patient_id || (!isEditing && images.length === 0)}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                                        {isEditing ? 'Actualizar Consulta' : 'Crear Consulta'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Card */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start">
                        <ExclamationTriangleIcon className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900 mb-2">Información Importante</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Las imágenes DWI son requeridas para nuevas consultas</li>
                                <li>• El sistema procesará automáticamente las imágenes para generar el diagnóstico</li>
                                <li>• Asegúrese de que las imágenes sean claras y de buena calidad</li>
                                <li>• Una vez creada, la consulta se añadirá al historial del paciente</li>
                                {preselectedPatientId && (
                                    <li>• El paciente ha sido preseleccionado desde la página anterior</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}