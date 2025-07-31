import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    DocumentTextIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    FireIcon,
    ShieldCheckIcon,
    ArrowLeftIcon,
    EyeIcon,
    ClockIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import type { Patient, Consultation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ConsultationWithPatient extends Consultation {
    patient: Patient;
}

const PatientDetail = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [consultations, setConsultations] = useState<ConsultationWithPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    // Función para normalizar la probabilidad
    const normalizeProbability = (prob: number | undefined): number => {
        if (prob === undefined || prob === null) return 0;
        if (prob >= 0 && prob <= 1) {
            return prob * 100;
        }
        return prob;
    };

    // Generar la URL de retorno para nuevas consultas
    const getNewConsultationUrl = () => {
        const currentPath = location.pathname;
        return `/consultations/new?patient_id=${patient?.id}&return=${encodeURIComponent(currentPath)}`;
    };

    // Generar la URL de "Crear Primera Consulta"
    const getFirstConsultationUrl = () => {
        const currentPath = location.pathname;
        return `/consultations/new?patient_id=${patient?.id}&return=${encodeURIComponent(currentPath)}`;
    };

    useEffect(() => {
        const fetchPatientData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                setError(null);

                // Fetch patient data
                const patientResponse = await axios.get<{ success: boolean; data: Patient }>(`${API_BASE_URL}/patients/${id}/`);
                if (patientResponse.data.success) {
                    setPatient(patientResponse.data.data);
                } else {
                    throw new Error('Failed to fetch patient data');
                }

                // Fetch patient's consultations
                const consultationsResponse = await axios.get<ConsultationWithPatient[]>(`${API_BASE_URL}/consultations/`);
                const patientConsultations = consultationsResponse.data.filter(
                    consultation => consultation.patient_id === id
                );

                // Sort by date (most recent first)
                patientConsultations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setConsultations(patientConsultations);
            } catch (error) {
                const errorMessage = axios.isAxiosError(error)
                    ? error.response?.data?.message || error.message
                    : 'Error al cargar los datos del paciente';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [id]);

    const getRiskFactorCount = (patient: Patient) => {
        return [patient.hypertension, patient.diabetes, patient.heart_disease, patient.smoker, patient.alcoholic]
            .filter(Boolean).length;
    };

    const getRiskColor = (probability: number) => {
        if (probability > 70) return 'text-red-600 bg-red-50 border border-red-200';
        if (probability > 30) return 'text-yellow-600 bg-yellow-50 border border-yellow-200';
        return 'text-green-600 bg-green-50 border border-green-200';
    };

    const getRiskIcon = (probability: number) => {
        if (probability > 70) return <ExclamationTriangleIcon className="w-4 h-4" />;
        if (probability > 30) return <FireIcon className="w-4 h-4" />;
        return <ShieldCheckIcon className="w-4 h-4" />;
    };

    // Calcular estadísticas del paciente
    const patientStats = {
        totalConsultations: consultations.length,
        strokeCases: consultations.filter(c => c.diagnosis === 'Stroke').length,
        highRiskConsultations: consultations.filter(c => normalizeProbability(c.probability) > 70).length,
        averageProbability: consultations.length > 0
            ? consultations.reduce((sum, c) => sum + normalizeProbability(c.probability), 0) / consultations.length
            : 0,
        lastConsultation: consultations.length > 0 ? consultations[0] : null
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Cargando información del paciente...</p>
                </div>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                    <div className="flex items-center mb-4">
                        <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">Error</h3>
                    </div>
                    <p className="text-gray-600 mb-6">{error || 'Paciente no encontrado'}</p>
                    <Link
                        to="/patients"
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors block text-center"
                    >
                        Volver a Pacientes
                    </Link>
                </div>
            </div>
        );
    }

    const riskFactorCount = getRiskFactorCount(patient);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Link
                                to="/patients"
                                className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Perfil del Paciente</h1>
                                <p className="text-gray-600 mt-1">Información detallada e historial médico</p>
                            </div>
                        </div>

                        {(user?.role === 'doctor' || user?.role === 'admin') && (
                            <Link
                                to={getNewConsultationUrl()}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                            >
                                <DocumentTextIcon className="w-5 h-5 mr-2" />
                                Nueva Consulta
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Información del Paciente */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <div className="text-center mb-6">
                                <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 ${
                                    riskFactorCount >= 3 ? 'bg-red-500' :
                                        riskFactorCount >= 1 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}>
                                    {patient.name?.charAt(0) || 'P'}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                                <p className="text-gray-600">ID: {patient.id}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Edad</span>
                                    <span className="text-gray-600 font-semibold">{patient.age} años</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Género</span>
                                    <span className="text-gray-600 font-semibold">
                                        {patient.gender === 'Male' ? 'Masculino' :
                                            patient.gender === 'Female' ? 'Femenino' :
                                                patient.gender === 'Other' ? 'Otro' : 'No especificado'}
                                    </span>
                                </div>
                            </div>

                            {/* Factores de Riesgo */}
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Factores de Riesgo</h3>
                                <div className="space-y-2">
                                    {[
                                        { key: 'hypertension', label: 'Hipertensión', value: patient.hypertension },
                                        { key: 'diabetes', label: 'Diabetes', value: patient.diabetes },
                                        { key: 'heart_disease', label: 'Enfermedad Cardíaca', value: patient.heart_disease },
                                        { key: 'smoker', label: 'Fumador', value: patient.smoker },
                                        { key: 'alcoholic', label: 'Alcohólico', value: patient.alcoholic }
                                    ].map(factor => (
                                        <div key={factor.key} className="flex justify-between items-center py-1">
                                            <span className="text-gray-600">{factor.label}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                factor.value
                                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                                    : 'bg-green-100 text-green-800 border border-green-200'
                                            }`}>
                                                {factor.value ? 'Sí' : 'No'}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Nivel de Riesgo General */}
                                <div className="mt-4 p-3 rounded-lg border">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700 font-medium">Nivel de Riesgo General</span>
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            riskFactorCount >= 3 ? 'text-red-600 bg-red-50 border border-red-200' :
                                                riskFactorCount >= 1 ? 'text-yellow-600 bg-yellow-50 border border-yellow-200' :
                                                    'text-green-600 bg-green-50 border border-green-200'
                                        }`}>
                                            {riskFactorCount >= 3 ? 'Alto Riesgo' :
                                                riskFactorCount >= 1 ? 'Riesgo Moderado' : 'Bajo Riesgo'}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {riskFactorCount} factor{riskFactorCount !== 1 ? 'es' : ''} de riesgo presente{riskFactorCount !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas Rápidas */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <DocumentTextIcon className="w-5 h-5 text-blue-500 mr-2" />
                                        <span className="text-gray-600">Total Consultas</span>
                                    </div>
                                    <span className="font-bold text-xl">{patientStats.totalConsultations}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                                        <span className="text-gray-600">Casos de Stroke</span>
                                    </div>
                                    <span className="font-bold text-xl text-red-600">{patientStats.strokeCases}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FireIcon className="w-5 h-5 text-yellow-500 mr-2" />
                                        <span className="text-gray-600">Alto Riesgo</span>
                                    </div>
                                    <span className="font-bold text-xl text-yellow-600">{patientStats.highRiskConsultations}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <ChartBarIcon className="w-5 h-5 text-purple-500 mr-2" />
                                        <span className="text-gray-600">Probabilidad Promedio</span>
                                    </div>
                                    <span className="font-bold text-xl text-purple-600">
                                        {patientStats.averageProbability.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Historial de Consultas */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                            <DocumentTextIcon className="w-6 h-6 mr-2 text-blue-600" />
                                            Historial de Consultas
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {consultations.length} consulta{consultations.length !== 1 ? 's' : ''} registrada{consultations.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    {patientStats.lastConsultation && (
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Última consulta</p>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {new Date(patientStats.lastConsultation.date).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {consultations.length === 0 ? (
                                <div className="text-center py-16">
                                    <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sin consultas registradas</h3>
                                    <p className="text-gray-500 mb-6">
                                        Este paciente aún no tiene consultas en el sistema.
                                    </p>
                                    {(user?.role === 'doctor' || user?.role === 'admin') && (
                                        <Link
                                            to={getFirstConsultationUrl()}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <DocumentTextIcon className="w-5 h-5 mr-2" />
                                            Crear Primera Consulta
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {consultations.map((consultation, index) => {
                                        const normalizedProb = normalizeProbability(consultation.probability);
                                        return (
                                            <div key={consultation.id} className="p-6 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                                            normalizedProb > 70 ? 'bg-red-500' :
                                                                normalizedProb > 30 ? 'bg-yellow-500' : 'bg-green-500'
                                                        }`}>
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {new Date(consultation.date).toLocaleDateString('es-ES', {
                                                                        weekday: 'long',
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm text-gray-600">
                                                                    {new Date(consultation.date).toLocaleTimeString('es-ES', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        to={`/consultations/${consultation.id}`}
                                                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                                    >
                                                        <EyeIcon className="w-4 h-4 mr-1" />
                                                        Ver Detalles
                                                    </Link>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {/* Diagnóstico */}
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <div className="text-xs text-gray-600 mb-1">Diagnóstico</div>
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            consultation.diagnosis === 'Stroke'
                                                                ? 'bg-red-100 text-red-800 border border-red-200'
                                                                : 'bg-green-100 text-green-800 border border-green-200'
                                                        }`}>
                                                            {consultation.diagnosis || 'Sin diagnóstico'}
                                                        </span>
                                                    </div>

                                                    {/* Probabilidad */}
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <div className="text-xs text-gray-600 mb-1">Probabilidad de Stroke</div>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                                        normalizedProb > 70 ? 'bg-red-500' :
                                                                            normalizedProb > 30 ? 'bg-yellow-500' : 'bg-green-500'
                                                                    }`}
                                                                    style={{ width: `${Math.min(100, normalizedProb)}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-700 min-w-[45px]">
                                                                {normalizedProb.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Nivel de Riesgo */}
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <div className="text-xs text-gray-600 mb-1">Nivel de Riesgo</div>
                                                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(normalizedProb)}`}>
                                                            {getRiskIcon(normalizedProb)}
                                                            <span className="ml-1">
                                                                {normalizedProb > 70 ? 'Alto'
                                                                    : normalizedProb > 30 ? 'Medio'
                                                                        : 'Bajo'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* ID de consulta */}
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <span className="text-xs text-gray-500">ID de Consulta: {consultation.id}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetail;