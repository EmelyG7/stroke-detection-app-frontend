import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeftIcon,
    TrashIcon,
    PencilIcon,
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    PhotoIcon,
    DocumentTextIcon,
    UserIcon,
    CalendarIcon,
    ClockIcon,
    FireIcon,
    ShieldCheckIcon,
    EyeIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import type { Consultation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';

interface ImageData {
    id: string;
    url: string;
    filename: string;
    diagnosis: string;
    confidence: number;
    probability: number;
    status: 'loading' | 'loaded' | 'error';
}

const ImageWithFallback = ({ image }: { image: ImageData }) => {
    const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>(image.status);
    const [retryCount, setRetryCount] = useState(0);
    const [imgSrc, setImgSrc] = useState('');

    useEffect(() => {
        const loadImage = async () => {
            try {
                console.log(`Fetching image from: ${API_BASE_URL}/api/images/${image.id}`);
                const response = await axios.get(`${API_BASE_URL}/api/images/${image.id}`, {
                    responseType: 'blob'
                });

                const blobUrl = URL.createObjectURL(response.data);
                setImgSrc(blobUrl);
                setImgStatus('loaded');
                console.log(`✅ Successfully loaded image ${image.id}`);
            } catch (error) {
                console.error(`❌ Error fetching image ${image.id}:`, error);
                if (axios.isAxiosError(error)) {
                    console.error(`Status: ${error.response?.status}, Detail: ${error.response?.data?.detail}`);
                }
                if (retryCount < 2) {
                    setTimeout(() => {
                        setImgStatus('loading');
                        setRetryCount(prev => prev + 1);
                    }, 1000);
                } else {
                    setImgStatus('error');
                }
            }
        };

        if (imgStatus === 'loading') {
            loadImage();
        }

        return () => {
            if (imgSrc) {
                URL.revokeObjectURL(imgSrc);
            }
        };
    }, [imgStatus, retryCount, image.id]);
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 truncate flex items-center">
                    <PhotoIcon className="w-4 h-4 mr-2 text-blue-600" />
                    {image.filename}
                </h3>
            </div>

            <div className="p-4">
                {imgStatus === 'loading' && (
                    <div className="w-full h-48 flex flex-col items-center justify-center bg-gray-100 rounded-lg mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                        <p className="text-xs text-gray-500">Cargando imagen...{retryCount > 0 && ` (intento ${retryCount + 1})`}</p>
                    </div>
                )}

                {imgStatus === 'error' && (
                    <div className="w-full h-48 flex flex-col items-center justify-center bg-gray-100 rounded-lg mb-4">
                        <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Imagen no disponible</p>
                        <button
                            onClick={() => {
                                setRetryCount(0);
                                setImgStatus('loading');
                            }}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {imgStatus === 'loaded' && (
                    <div className="mb-4">
                        <img
                            src={imgSrc}
                            alt={`Medical scan - ${image.filename}`}
                            className="w-full h-48 object-contain rounded-lg border border-gray-200"
                            onError={() => setImgStatus('error')}
                        />
                    </div>
                )}

                {/* Diagnosis Results */}
                <div className="space-y-3">
                    <div className={`p-3 rounded-lg border ${image.diagnosis === 'Stroke' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`font-semibold flex items-center ${image.diagnosis === 'Stroke' ? 'text-red-800' : 'text-green-800'}`}>
                                {image.diagnosis === 'Stroke' ?
                                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" /> :
                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                }
                                {image.diagnosis}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600">Probabilidad:</span>
                                <span className={`text-sm font-bold ${image.diagnosis === 'Stroke' ? 'text-red-700' : 'text-green-700'}`}>
                                    {(image.probability * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${image.diagnosis === 'Stroke' ? 'bg-red-500' : 'bg-green-500'}`}
                                    style={{ width: `${image.probability * 100}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600">Confianza:</span>
                                <span className="text-xs text-gray-700 font-medium">
                                    {(image.confidence * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ConsultationDetail() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();
    const [consultation, setConsultation] = useState<Consultation | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [images, setImages] = useState<ImageData[]>([]);

    useEffect(() => {
        const fetchConsultation = async () => {
            try {
                setLoading(true);
                console.log(`Fetching consultation from: ${API_BASE_URL}/api/consultations/${id}`);
                const response = await axios.get(`${API_BASE_URL}/api/consultations/${id}`);

                const imagesData = response.data.images?.map((img: any) => ({
                    id: img.id || img._id,
                    url: '',
                    filename: img.filename || `scan-${(img.id || img._id).substring(0, 8)}.jpg`,
                    diagnosis: img.diagnosis || 'Unknown',
                    confidence: img.confidence || 0,
                    probability: img.probability || 0,
                    status: 'loading' as const
                })) || [];

                setImages(imagesData);
                setConsultation(response.data);
                console.log(`✅ Successfully loaded consultation ${id}`);
            } catch (error) {
                console.error(`❌ Error loading consultation ${id}:`, error);
                toast.error('Error al cargar la consulta');
                navigate('/consultations');
            } finally {
                setLoading(false);
            }
        };

        fetchConsultation();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta consulta?')) return;

        setDeleting(true);
        try {
            await axios.delete(`${API_BASE_URL}/api/consultations/${id}`);
            toast.success('Consulta eliminada exitosamente');
            navigate('/consultations');
        } catch (error) {
            console.error(`Error deleting consultation ${id}:`, error);
            toast.error('Error al eliminar la consulta');
        } finally {
            setDeleting(false);
        }
    };

    const downloadReport = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/consultations/${id}/report`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte-consulta-${id}.pdf`);
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                link.remove();
                window.URL.revokeObjectURL(url);
                setLoading(false);
            }, 100);

            toast.success('Reporte descargado exitosamente');
        } catch (error) {
            console.error(`Error downloading report for consultation ${id}:`, error);
            setLoading(false);
            toast.error('Error al descargar el reporte');
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.detail || 'Fallo al descargar el reporte');
            }
        }
    };

    const getRiskLevel = (probability: number) => {
        if (probability > 70) return {
            level: 'Alto',
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: FireIcon
        };
        if (probability > 30) return {
            level: 'Medio',
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: EyeIcon
        };
        return {
            level: 'Bajo',
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: ShieldCheckIcon
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Cargando detalles de la consulta...</p>
                </div>
            </div>
        );
    }

    if (!consultation) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4"/>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Consulta no encontrada</h3>
                    <p className="text-gray-600 mb-6">La consulta que buscas no existe o ha sido eliminada.</p>
                    <button
                        onClick={() => navigate('/consultations')}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Volver a Consultas
                    </button>
                </div>
            </div>
        );
    }

    const riskInfo = getRiskLevel(consultation.probability * 100);
    const RiskIcon = riskInfo.icon;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/consultations')}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform"/>
                            Volver a Consultas
                        </button>

                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <DocumentTextIcon className="w-8 h-8 mr-3 text-blue-600"/>
                                Detalles de Consulta
                            </h1>
                            <p className="text-gray-600 mt-1">Información completa del diagnóstico médico</p>
                        </div>

                        <div className="flex space-x-3">
                            {(user?.role === 'doctor' || user?.role === 'admin') && (
                                <>
                                    <button
                                        onClick={() => navigate(`/consultations/${id}/edit`)}
                                        className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
                                    >
                                        <PencilIcon className="h-4 w-4 mr-2"/>
                                        Editar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors shadow-md"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-2"/>
                                        {deleting ? 'Eliminando...' : 'Eliminar'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Paciente</p>
                                <p className="text-xl font-bold truncate">{consultation.patient_name}</p>
                            </div>
                            <UserIcon className="w-8 h-8 opacity-80"/>
                        </div>
                    </div>

                    <div
                        className={`bg-gradient-to-br ${consultation.diagnosis === 'Stroke' ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'} rounded-xl shadow-lg p-6 text-white`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`${consultation.diagnosis === 'Stroke' ? 'text-red-100' : 'text-green-100'} text-sm font-medium`}>Diagnóstico</p>
                                <p className="text-xl font-bold">{consultation.diagnosis}</p>
                            </div>
                            {consultation.diagnosis === 'Stroke' ?
                                <ExclamationTriangleIcon className="w-8 h-8 opacity-80"/> :
                                <CheckCircleIcon className="w-8 h-8 opacity-80"/>
                            }
                        </div>
                    </div>

                    <div
                        className={`bg-gradient-to-br ${riskInfo.color === 'text-red-600' ? 'from-red-500 to-red-600' : riskInfo.color === 'text-yellow-600' ? 'from-yellow-500 to-yellow-600' : 'from-green-500 to-green-600'} rounded-xl shadow-lg p-6 text-white`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm font-medium">Nivel de Riesgo</p>
                                <p className="text-xl font-bold">{riskInfo.level}</p>
                            </div>
                            <RiskIcon className="w-8 h-8 opacity-80"/>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Main Information */}
                    <div className="space-y-6">
                        {/* Patient and Consultation Info */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div
                                className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <UserIcon className="w-6 h-6 mr-2 text-blue-600"/>
                                    Información del Paciente
                                </h2>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <UserIcon className="w-5 h-5 text-gray-400"/>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Nombre del Paciente</p>
                                                <p className="text-gray-900 font-semibold">{consultation.patient_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <DocumentTextIcon className="w-5 h-5 text-gray-400"/>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">ID del Paciente</p>
                                                <p className="text-gray-900 font-mono text-sm">{consultation.patient_id}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <CalendarIcon className="w-5 h-5 text-gray-400"/>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Fecha de Consulta</p>
                                                <p className="text-gray-900 font-semibold">
                                                    {new Date(consultation.date).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <ClockIcon className="w-5 h-5 text-gray-400"/>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
                                                <p className="text-gray-900">
                                                    {new Date(consultation.created_at).toLocaleString('es-ES')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Diagnosis Results */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div
                                className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <ChartBarIcon className="w-6 h-6 mr-2 text-blue-600"/>
                                    Resultados del Diagnóstico
                                </h2>
                            </div>

                            <div className="p-6">
                                <div
                                    className={`p-6 rounded-xl border-2 ${consultation.diagnosis === 'Stroke' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            {consultation.diagnosis === 'Stroke' ? (
                                                <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3"/>
                                            ) : (
                                                <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3"/>
                                            )}
                                            <div>
                                                <h3 className={`text-2xl font-bold ${consultation.diagnosis === 'Stroke' ? 'text-red-800' : 'text-green-800'}`}>
                                                    {consultation.diagnosis}
                                                </h3>
                                                <p className={`text-sm ${consultation.diagnosis === 'Stroke' ? 'text-red-600' : 'text-green-600'}`}>
                                                    Resultado del análisis de imágenes DWI
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-3xl font-bold ${consultation.diagnosis === 'Stroke' ? 'text-red-700' : 'text-green-700'}`}>
                                                {(consultation.probability * 100).toFixed(1)}%
                                            </p>
                                            <p className="text-sm text-gray-600">Probabilidad</p>
                                        </div>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-500 ${consultation.diagnosis === 'Stroke' ? 'bg-red-500' : 'bg-green-500'}`}
                                            style={{width: `${consultation.probability * 100}%`}}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-700">{(consultation.probability * 100).toFixed(1)}%</p>
                                            <p className="text-xs text-gray-500">Probabilidad</p>
                                        </div>
                                        <div>
                                            <p className={`text-2xl font-bold ${riskInfo.color}`}>{riskInfo.level}</p>
                                            <p className="text-xs text-gray-500">Nivel de Riesgo</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-700">{images.length}</p>
                                            <p className="text-xs text-gray-500">Imágenes Analizadas</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Medical Notes */}
                        {consultation.notes && (
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div
                                    className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                        <DocumentTextIcon className="w-6 h-6 mr-2 text-blue-600"/>
                                        Notas Médicas
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{consultation.notes}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Download Report Section */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <DocumentArrowDownIcon className="w-6 h-6 mr-2 text-blue-600"/>
                                Reporte Médico
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-1">
                                    <p className="text-gray-600 mb-2">
                                        Descarga un reporte completo en PDF con todos los detalles de la consulta y
                                        análisis de imágenes.
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        El reporte incluye información del paciente, diagnóstico, probabilidades y
                                        análisis detallado de todas las imágenes.
                                    </p>
                                </div>
                                <button
                                    onClick={downloadReport}
                                    disabled={loading}
                                    className="flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                                >
                                    <DocumentArrowDownIcon className="h-5 w-5 mr-2"/>
                                    {loading ? 'Generando...' : 'Descargar PDF'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Image Analysis Section - Now at the bottom */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <PhotoIcon className="w-6 h-6 mr-2 text-blue-600"/>
                                    Análisis de Imágenes DWI
                                </h2>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span className="flex items-center">
                                        <PhotoIcon className="w-4 h-4 mr-1"/>
                                        {images.length} imagen{images.length !== 1 ? 'es' : ''}
                                    </span>
                                    {images.length > 0 && (
                                        <span className="flex items-center">
                                            <ChartBarIcon className="w-4 h-4 mr-1"/>
                                            Resultados individuales
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {images.length > 0 ? (
                                <>
                                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start">
                                            <ExclamationTriangleIcon
                                                className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"/>
                                            <div className="text-sm">
                                                <p className="text-blue-800 font-semibold mb-1">Análisis Detallado por
                                                    Imagen</p>
                                                <p className="text-blue-700">
                                                    Cada imagen ha sido procesada individualmente. El diagnóstico final
                                                    se basa en el análisis conjunto de todas las imágenes.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {images.map((image) => (
                                            <ImageWithFallback key={image.id} image={image}/>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <PhotoIcon className="mx-auto h-16 w-16 text-gray-300 mb-4"/>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sin imágenes disponibles</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">
                                        No hay imágenes DWI asociadas a esta consulta. Es posible que hayan sido
                                        eliminadas o no se hayan cargado correctamente.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with additional info */}
            <div className="mt-8 bg-gray-100 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                            <span>ID de Consulta: {consultation.id}</span>
                            <span>•</span>
                            <span>Creado: {new Date(consultation.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4"/>
                            <span>Última actualización: {new Date(consultation.created_at).toLocaleString('es-ES')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}