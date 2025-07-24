import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    CloudArrowUpIcon,
    PhotoIcon,
    TrashIcon,
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Patient {
    _id: string;
    name: string;
}

interface ImageAnalysis {
    filename: string;
    diagnosis: string;
    confidence: number;
    probability: number;
}

export default function DiagnosisForm() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{
        consultation_id: string;
        diagnosis: string;
        probability: number;
        image_analyses: ImageAnalysis[];
    } | null>(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/patients`);
            setPatients(response.data);
        } catch (error) {
            toast.error('Error al cargar pacientes');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} no es una imagen válida`);
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} es demasiado grande (máximo 10MB)`);
                return false;
            }
            return true;
        });

        setImages(prev => [...prev, ...validFiles]);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPatient) {
            toast.error('Seleccione un paciente');
            return;
        }

        if (images.length === 0) {
            toast.error('Agregue al menos una imagen');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('patient_id', selectedPatient);
            formData.append('date', date);
            formData.append('notes', notes);

            images.forEach((image) => {
                formData.append('images', image);
            });

            const response = await axios.post(`${API_BASE_URL}/consultations`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setResults(response.data);
            toast.success('Análisis completado exitosamente');

            setSelectedPatient('');
            setDate(new Date().toISOString().split('T')[0]);
            setNotes('');
            setImages([]);
        } catch (error: any) {
            console.error('Error creating consultation:', error);
            const errorMessage = error.response?.data?.error || 'Error al procesar la consulta';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async () => {
        if (!results) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/consultations/${results.consultation_id}/report`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `consulta-${results.consultation_id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Error al descargar el reporte');
        }
    };

    const resetResults = () => {
        setResults(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Diagnóstico de Stroke</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Carga imágenes DWI para análisis automático
                </p>
            </div>

            {!results ? (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Nueva Consulta</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Paciente *
                                </label>
                                <select
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={selectedPatient}
                                    onChange={(e) => setSelectedPatient(e.target.value)}
                                >
                                    <option value="">Seleccionar paciente</option>
                                    {patients.map((patient) => (
                                        <option key={patient._id} value={patient._id}>
                                            {patient.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Fecha *
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Notas Médicas
                            </label>
                            <textarea
                                rows={3}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Agregar notas sobre la consulta..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Imágenes DWI *
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors duration-200">
                                <div className="space-y-1 text-center">
                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                            <span>Cargar imágenes</span>
                                            <input
                                                type="file"
                                                className="sr-only"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                        <p className="pl-1">o arrastra y suelta</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, JPEG hasta 10MB cada una</p>
                                </div>
                            </div>
                        </div>

                        {images.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3">
                                    Imágenes seleccionadas ({images.length})
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                                                {image.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !selectedPatient || images.length === 0}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                                        Analizar Imágenes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-900">Resultados del Análisis</h2>
                                <button
                                    onClick={resetResults}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Nuevo Análisis
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className={`flex-shrink-0 ${results.diagnosis === 'Stroke' ? 'text-red-600' : 'text-green-600'}`}>
                                    {results.diagnosis === 'Stroke' ? (
                                        <ExclamationTriangleIcon className="h-8 w-8" />
                                    ) : (
                                        <CheckCircleIcon className="h-8 w-8" />
                                    )}
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-bold ${results.diagnosis === 'Stroke' ? 'text-red-600' : 'text-green-600'}`}>
                                        {results.diagnosis}
                                    </h3>
                                    <p className="text-gray-600">
                                        Probabilidad: {(results.probability * 100).toFixed(2)}%
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full ${results.diagnosis === 'Stroke' ? 'bg-red-500' : 'bg-green-500'}`}
                                        style={{ width: `${results.probability * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Análisis por Imagen</h3>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.image_analyses.map((analysis, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="text-center">
                                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                            <h4 className="text-sm font-medium text-gray-900 mb-2 truncate">
                                                {analysis.filename}
                                            </h4>
                                            <div className={`text-sm font-medium mb-1 ${analysis.diagnosis === 'Stroke' ? 'text-red-600' : 'text-green-600'}`}>
                                                {analysis.diagnosis}
                                            </div>
                                            <div className="text-xs text-gray-500 mb-2">
                                                Probabilidad: {(analysis.probability * 100).toFixed(2)}%
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Confianza: {(analysis.confidence * 100).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={downloadReport}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                            Descargar Reporte Médico
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}