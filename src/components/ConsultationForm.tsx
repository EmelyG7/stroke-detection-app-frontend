import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    CloudArrowUpIcon,
    PhotoIcon,
    TrashIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Patient {
    id: string;
    name: string;
}

interface ConsultationData {
    patient_id: string;
    date: string;
    notes: string;
    images?: File[];
}

export default function ConsultationForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [formData, setFormData] = useState<ConsultationData>({
        patient_id: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchPatients();
        if (id) {
            fetchConsultation();
            setIsEditing(true);
        }
    }, [id]);

    const fetchPatients = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/patients/`);
            setPatients(response.data.data);
        } catch (error) {
            toast.error('Error loading patients');
        }
    };

    const fetchConsultation = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/consultations/${id}/`);
            const consultation = response.data.data;
            setFormData({
                patient_id: consultation.patient_id,
                date: consultation.date.split('T')[0],
                notes: consultation.notes || ''
            });
        } catch (error) {
            toast.error('Error loading consultation');
            navigate('/consultations');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
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
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('patient_id', formData.patient_id);
            data.append('date', formData.date);
            data.append('notes', formData.notes);
            images.forEach(image => data.append('images', image));

            if (isEditing) {
                await axios.put(`${API_BASE_URL}/consultations/${id}/`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success('Consultation updated successfully');
            } else {
                await axios.post(`${API_BASE_URL}/consultations/`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success('Consultation created successfully');
            }
            navigate('/consultations');
        } catch (error) {
            toast.error('Error saving consultation');
        } finally {
            setLoading(false);
        }
    };

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
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEditing ? 'Edit Consultation' : 'New Consultation'}
                </h1>
                <div className="w-6"></div> {/* Spacer for alignment */}
            </div>

            <div className="bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Patient *
                            </label>
                            <select
                                name="patient_id"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={formData.patient_id}
                                onChange={handleChange}
                                disabled={isEditing}
                            >
                                <option value="">Select patient</option>
                                {patients.map(patient => (
                                    <option key={patient.id} value={patient.id}>
                                        {patient.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Date *
                            </label>
                            <input
                                type="date"
                                name="date"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Medical Notes
                        </label>
                        <textarea
                            name="notes"
                            rows={3}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add consultation notes..."
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>

                    {!isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                DWI Images {!isEditing && '*'}
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors duration-200">
                                <div className="space-y-1 text-center">
                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                            <span>Upload images</span>
                                            <input
                                                type="file"
                                                className="sr-only"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB each</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {images.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Selected Images ({images.length})
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

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/consultations')}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.patient_id || (!isEditing && images.length === 0)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                                    {isEditing ? 'Update Consultation' : 'Create Consultation'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}