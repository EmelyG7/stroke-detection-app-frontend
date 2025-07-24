import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    ArrowLeftIcon,
    TrashIcon,
    PencilIcon,
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ImageAnalysis {
    filename: string;
    diagnosis: string;
    confidence: number;
    probability: number;
    url: string;
}

interface Consultation {
    id: string;
    patient_id: string;
    patient_name: string;
    date: string;
    notes: string;
    diagnosis: string;
    probability: number;
    created_at: string;
    images: ImageAnalysis[];
}

export default function ConsultationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [consultation, setConsultation] = useState<Consultation | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchConsultation();
    }, [id]);

    const fetchConsultation = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/consultations/${id}/`);
            setConsultation(response.data.data);
        } catch (error) {
            toast.error('Error loading consultation');
            navigate('/consultations');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this consultation?')) return;

        setDeleting(true);
        try {
            await axios.delete(`${API_BASE_URL}/consultations/${id}/`);
            toast.success('Consultation deleted successfully');
            navigate('/consultations');
        } catch (error) {
            toast.error('Error deleting consultation');
        } finally {
            setDeleting(false);
        }
    };

    const downloadReport = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/consultations/${id}/report`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `consultation-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Error downloading report');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading consultation details...</div>;
    }

    if (!consultation) {
        return <div className="text-center py-8">Consultation not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/consultations')}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-1" />
                    Back to Consultations
                </button>
                <div className="flex space-x-3">
                    <button
                        onClick={() => navigate(`/consultations/${id}/edit`)}
                        className="flex items-center px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">
                        Consultation Details
                    </h1>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Patient Name</p>
                                <p className="text-gray-900">{consultation.patient_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Patient ID</p>
                                <p className="text-gray-900">{consultation.patient_id}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Consultation Details</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="text-gray-900">
                                    {new Date(consultation.date).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Created At</p>
                                <p className="text-gray-900">
                                    {new Date(consultation.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Diagnosis</h2>
                        <div className={`p-4 rounded-lg ${
                            consultation.diagnosis === 'Stroke'
                                ? 'bg-red-50 text-red-800'
                                : 'bg-green-50 text-green-800'
                        }`}>
                            <div className="flex items-center">
                                {consultation.diagnosis === 'Stroke' ? (
                                    <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                                ) : (
                                    <CheckCircleIcon className="h-6 w-6 mr-2" />
                                )}
                                <span className="font-bold text-lg">{consultation.diagnosis}</span>
                                <span className="ml-auto">
                                    Probability: {(consultation.probability * 100).toFixed(2)}%
                                </span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${
                                        consultation.diagnosis === 'Stroke' ? 'bg-red-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${consultation.probability * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {consultation.notes && (
                        <div className="md:col-span-2">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Medical Notes</h2>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700 whitespace-pre-line">{consultation.notes}</p>
                            </div>
                        </div>
                    )}

                    <div className="md:col-span-2">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Image Analysis</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {consultation.images.map((image, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 p-2">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {image.filename}
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <img
                                            src={image.url}
                                            alt={`Medical image ${index + 1}`}
                                            className="w-full h-40 object-contain mb-2"
                                        />
                                        <div className={`text-center ${
                                            image.diagnosis === 'Stroke'
                                                ? 'text-red-600'
                                                : 'text-green-600'
                                        }`}>
                                            <p className="font-medium">{image.diagnosis}</p>
                                            <p className="text-sm">
                                                Probability: {(image.probability * 100).toFixed(2)}%
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Confidence: {(image.confidence * 100).toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-right">
                    <button
                        onClick={downloadReport}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                        Download Medical Report
                    </button>
                </div>
            </div>
        </div>
    );
}