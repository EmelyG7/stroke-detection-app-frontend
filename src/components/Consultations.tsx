import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    DocumentTextIcon,
    PencilIcon,
    TrashIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    FireIcon,
    ChartBarIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import type { Consultation, Patient } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ConsultationWithPatient extends Consultation {
    patient: Patient;
}

interface FilterState {
    search: string;
    dateRange: string;
    riskLevel: string;
    diagnosis: string;
    doctor: string;
}

const Consultations = () => {
    const [consultations, setConsultations] = useState<ConsultationWithPatient[]>([]);
    const [filteredConsultations, setFilteredConsultations] = useState<ConsultationWithPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const { user } = useAuth();

    const [filters, setFilters] = useState<FilterState>({
        search: '',
        dateRange: 'all',
        riskLevel: 'all',
        diagnosis: 'all',
        doctor: 'all'
    });

    // Función para normalizar la probabilidad (convertir de decimal a porcentaje si es necesario)
    const normalizeProbability = (prob: number | undefined): number => {
        if (prob === undefined || prob === null) return 0;
        // Si el valor está entre 0 y 1, probablemente es un decimal que necesita convertirse a porcentaje
        if (prob >= 0 && prob <= 1) {
            return prob * 100;
        }
        // Si ya está en formato de porcentaje (0-100), devolverlo tal como está
        return prob;
    };

    // Estadísticas calculadas
    const calculateStats = () => {
        const total = consultations.length;
        const strokeCases = consultations.filter(c => c.diagnosis === 'Stroke').length;
        const highRisk = consultations.filter(c => normalizeProbability(c.probability) > 70).length;
        const mediumRisk = consultations.filter(c => {
            const normalizedProb = normalizeProbability(c.probability);
            return normalizedProb > 30 && normalizedProb <= 70;
        }).length;
        const lowRisk = consultations.filter(c => normalizeProbability(c.probability) <= 30).length;
        const avgProbability = consultations.reduce((sum, c) => sum + normalizeProbability(c.probability), 0) / total || 0;

        return {
            total,
            strokeCases,
            highRisk,
            mediumRisk,
            lowRisk,
            avgProbability
        };
    };

    const stats = calculateStats();

    useEffect(() => {
        const fetchConsultations = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<ConsultationWithPatient[]>(`${API_BASE_URL}/consultations/`);
                setConsultations(response.data);
                setFilteredConsultations(response.data);
            } catch (error) {
                const errorMessage = axios.isAxiosError(error)
                    ? error.response?.data?.detail || error.message
                    : 'Failed to fetch consultations';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchConsultations();
    }, []);

    // Filtrado de consultas
    useEffect(() => {
        let filtered = [...consultations];

        // Filtro de búsqueda
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase().trim();
            filtered = filtered.filter(c =>
                c.patient?.name?.toLowerCase().includes(searchTerm) ||
                c.diagnosis?.toLowerCase().includes(searchTerm) ||
                c.id?.toLowerCase().includes(searchTerm)
            );
        }

        // Filtro de riesgo
        if (filters.riskLevel !== 'all') {
            filtered = filtered.filter(c => {
                const prob = normalizeProbability(c.probability);
                switch (filters.riskLevel) {
                    case 'high': return prob > 70;
                    case 'medium': return prob > 30 && prob <= 70;
                    case 'low': return prob <= 30;
                    default: return true;
                }
            });
        }

        // Filtro de diagnóstico
        if (filters.diagnosis !== 'all') {
            filtered = filtered.filter(c => c.diagnosis === filters.diagnosis);
        }

        // Filtro de fecha
        if (filters.dateRange !== 'all') {
            const now = new Date();
            const days = {
                '7d': 7,
                '30d': 30,
                '90d': 90
            }[filters.dateRange] || 0;

            if (days > 0) {
                const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(c => new Date(c.date) >= cutoffDate);
            }
        }

        setFilteredConsultations(filtered);
    }, [filters, consultations]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta consulta?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/consultations/${id}`);
            setConsultations(consultations.filter(c => c.id !== id));
            toast.success('Consulta eliminada exitosamente');
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.detail || error.message
                : 'Error al eliminar la consulta';
            toast.error(errorMessage);
        }
    };

// Reemplaza las funciones exportToPDF y exportToExcel existentes en tu componente Consultations

    const exportToPDF = async () => {
        try {
            const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <title>Reporte de Consultas - Stroke Diagnosis System</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    color: #333;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 2px solid #4F46E5;
                    padding-bottom: 20px;
                }
                .logo {
                    color: #4F46E5;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .stats-grid { 
                    display: grid; 
                    grid-template-columns: repeat(5, 1fr); 
                    gap: 15px; 
                    margin-bottom: 30px; 
                }
                .stat-card { 
                    border: 1px solid #E5E7EB; 
                    padding: 15px; 
                    border-radius: 8px; 
                    text-align: center;
                    background-color: #F9FAFB;
                }
                .stat-title {
                    font-size: 12px;
                    color: #6B7280;
                    margin-bottom: 5px;
                    font-weight: 500;
                }
                .stat-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #1F2937;
                }
                .table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px; 
                    font-size: 11px;
                }
                .table th, .table td { 
                    border: 1px solid #E5E7EB; 
                    padding: 6px; 
                    text-align: left; 
                }
                .table th { 
                    background-color: #F3F4F6; 
                    font-weight: 600;
                    color: #374151;
                }
                .table tbody tr:nth-child(even) {
                    background-color: #F9FAFB;
                }
                .risk-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 600;
                    text-align: center;
                    display: inline-block;
                    min-width: 60px;
                }
                .risk-high { background-color: #FEE2E2; color: #DC2626; }
                .risk-medium { background-color: #FEF3C7; color: #D97706; }
                .risk-low { background-color: #D1FAE5; color: #059669; }
                .diagnosis-badge {
                    padding: 3px 8px;
                    border-radius: 8px;
                    font-size: 10px;
                    font-weight: 500;
                }
                .diagnosis-stroke { background-color: #FEE2E2; color: #DC2626; }
                .diagnosis-normal { background-color: #D1FAE5; color: #059669; }
                .risk-factors {
                    font-size: 9px;
                }
                .risk-factor {
                    display: inline-block;
                    padding: 2px 4px;
                    margin: 1px;
                    border-radius: 4px;
                    background-color: #E5E7EB;
                    color: #374151;
                }
                .probability-bar {
                    width: 50px;
                    height: 8px;
                    background-color: #E5E7EB;
                    border-radius: 4px;
                    overflow: hidden;
                    display: inline-block;
                    margin-right: 5px;
                }
                .probability-fill {
                    height: 100%;
                    border-radius: 4px;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #E5E7EB;
                    text-align: center;
                    font-size: 12px;
                    color: #6B7280;
                }
                .filters-applied {
                    background-color: #EEF2FF;
                    padding: 10px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    font-size: 12px;
                }
                .analysis-section {
                    margin-top: 30px;
                    padding: 20px;
                    background-color: #F9FAFB;
                    border-radius: 8px;
                }
                @media print {
                    body { margin: 0; font-size: 12px; }
                    .header { page-break-after: avoid; }
                    .table { page-break-inside: avoid; }
                    .stat-card { break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">🏥 Sistema de Diagnóstico de Stroke</div>
                <h1>Reporte de Gestión de Consultas</h1>
                <p>Generado el ${new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
            </div>

            ${(filters.search || filters.dateRange !== 'all' || filters.riskLevel !== 'all' || filters.diagnosis !== 'all') ? `
            <div class="filters-applied">
                <strong>Filtros Aplicados:</strong>
                ${filters.search ? `Búsqueda: "${filters.search}" | ` : ''}
                ${filters.dateRange !== 'all' ? `Período: ${
                filters.dateRange === '7d' ? 'Últimos 7 días' :
                    filters.dateRange === '30d' ? 'Últimos 30 días' :
                        filters.dateRange === '90d' ? 'Últimos 90 días' : filters.dateRange
            } | ` : ''}
                ${filters.riskLevel !== 'all' ? `Riesgo: ${
                filters.riskLevel === 'high' ? 'Alto (>70%)' :
                    filters.riskLevel === 'medium' ? 'Medio (30-70%)' :
                        filters.riskLevel === 'low' ? 'Bajo (≤30%)' : filters.riskLevel
            } | ` : ''}
                ${filters.diagnosis !== 'all' ? `Diagnóstico: ${filters.diagnosis}` : ''}
            </div>
            ` : ''}
            
            <h2>Estadísticas Generales</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title">Total Consultas</div>
                    <div class="stat-value">${stats.total}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Casos de Stroke</div>
                    <div class="stat-value">${stats.strokeCases}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Alto Riesgo</div>
                    <div class="stat-value">${stats.highRisk}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Bajo Riesgo</div>
                    <div class="stat-value">${stats.lowRisk}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Probabilidad Promedio</div>
                    <div class="stat-value">${stats.avgProbability.toFixed(1)}%</div>
                </div>
            </div>

            <h2>Listado de Consultas (${filteredConsultations.length} registros)</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Paciente</th>
                        <th>Edad/Género</th>
                        <th>Factores de Riesgo</th>
                        <th>Diagnóstico</th>
                        <th>Probabilidad</th>
                        <th>Nivel de Riesgo</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredConsultations.map(consultation => {
                const normalizedProb = normalizeProbability(consultation.probability);
                const riskFactors = [];
                if (consultation.patient?.hypertension) riskFactors.push('HTN');
                if (consultation.patient?.diabetes) riskFactors.push('DM');
                if (consultation.patient?.heart_disease) riskFactors.push('CVD');
                if (consultation.patient?.smoker) riskFactors.push('Fumador');
                if (consultation.patient?.alcoholic) riskFactors.push('Alcohólico');

                return `
                        <tr>
                            <td>
                                ${new Date(consultation.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })}<br>
                                <small>${new Date(consultation.date).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}</small>
                            </td>
                            <td>
                                <strong>${consultation.patient?.name || 'Paciente Desconocido'}</strong><br>
                                <small>ID: ${consultation.patient_id}</small>
                            </td>
                            <td>
                                ${consultation.patient?.age || 0} años<br>
                                <small>${consultation.patient?.gender === 'Male' ? 'M' :
                    consultation.patient?.gender === 'Female' ? 'F' : 'N/A'}</small>
                            </td>
                            <td class="risk-factors">
                                ${riskFactors.length > 0 ?
                    riskFactors.map(factor => `<span class="risk-factor">${factor}</span>`).join(' ') :
                    '<span class="risk-factor">Sin factores</span>'
                }
                            </td>
                            <td>
                                <span class="diagnosis-badge ${
                    consultation.diagnosis === 'Stroke' ? 'diagnosis-stroke' : 'diagnosis-normal'
                }">
                                    ${consultation.diagnosis || 'Sin diagnóstico'}
                                </span>
                            </td>
                            <td>
                                <div style="display: flex; align-items: center;">
                                    <div class="probability-bar">
                                        <div class="probability-fill" style="width: ${Math.min(100, normalizedProb)}%; background-color: ${
                    normalizedProb > 70 ? '#DC2626' :
                        normalizedProb > 30 ? '#D97706' : '#059669'
                };"></div>
                                    </div>
                                    <strong>${normalizedProb.toFixed(1)}%</strong>
                                </div>
                            </td>
                            <td>
                                <span class="risk-badge ${
                    normalizedProb > 70 ? 'risk-high' :
                        normalizedProb > 30 ? 'risk-medium' : 'risk-low'
                }">
                                    ${normalizedProb > 70 ? 'Alto Riesgo' :
                    normalizedProb > 30 ? 'Riesgo Medio' : 'Bajo Riesgo'}
                                </span>
                            </td>
                        </tr>
                        `;
            }).join('')}
                </tbody>
            </table>

            <div class="analysis-section">
                <h2>Análisis Estadístico</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h3>Distribución por Diagnóstico</h3>
                        <ul>
                            <li>Casos de Stroke: ${stats.strokeCases} (${stats.total > 0 ? ((stats.strokeCases / stats.total) * 100).toFixed(1) : 0}%)</li>
                            <li>Casos Normales: ${stats.total - stats.strokeCases} (${stats.total > 0 ? (((stats.total - stats.strokeCases) / stats.total) * 100).toFixed(1) : 0}%)</li>
                        </ul>
                    </div>
                    <div>
                        <h3>Distribución por Nivel de Riesgo</h3>
                        <ul>
                            <li>Alto Riesgo (>70%): ${stats.highRisk} (${stats.total > 0 ? ((stats.highRisk / stats.total) * 100).toFixed(1) : 0}%)</li>
                            <li>Riesgo Medio (30-70%): ${stats.mediumRisk} (${stats.total > 0 ? ((stats.mediumRisk / stats.total) * 100).toFixed(1) : 0}%)</li>
                            <li>Bajo Riesgo (≤30%): ${stats.lowRisk} (${stats.total > 0 ? ((stats.lowRisk / stats.total) * 100).toFixed(1) : 0}%)</li>
                        </ul>
                    </div>
                </div>
                
                <h3>Resumen Clínico</h3>
                <p><strong>Tasa de Detección de Stroke:</strong> ${stats.total > 0 ? ((stats.strokeCases / stats.total) * 100).toFixed(1) : 0}%</p>
                <p><strong>Probabilidad Promedio de Stroke:</strong> ${stats.avgProbability.toFixed(1)}%</p>
                <p><strong>Casos que Requieren Atención Inmediata (>70%):</strong> ${stats.highRisk}</p>
                
                <div style="margin-top: 15px; padding: 10px; background-color: #EEF2FF; border-radius: 6px;">
                    <strong>Recomendaciones:</strong>
                    <ul style="margin-left: 20px; margin-top: 5px;">
                        ${stats.highRisk > 0 ? `<li>Seguimiento inmediato requerido para ${stats.highRisk} paciente${stats.highRisk !== 1 ? 's' : ''} de alto riesgo</li>` : ''}
                        ${stats.mediumRisk > 0 ? `<li>Monitoreo regular recomendado para ${stats.mediumRisk} paciente${stats.mediumRisk !== 1 ? 's' : ''} de riesgo medio</li>` : ''}
                        <li>Continuar con las evaluaciones preventivas regulares</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <p><strong>Sistema de Diagnóstico de Stroke</strong></p>
                <p>Reporte generado automáticamente | Confidencial - Solo para uso médico</p>
                <p>Basado en algoritmos de machine learning para predicción de stroke</p>
            </div>
        </body>
        </html>
    `;

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.open();
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }

            setShowExportMenu(false);
            toast.success('Reporte PDF generado exitosamente');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Error al generar el PDF. Por favor, intenta nuevamente.');
        }
    };

    const exportToExcel = () => {
        try {
            const csvData = [
                ['REPORTE DE GESTIÓN DE CONSULTAS - SISTEMA DE DIAGNÓSTICO DE STROKE'],
                ['Generado el:', new Date().toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })],
                [''],
                ['FILTROS APLICADOS:'],
                ...(filters.search || filters.dateRange !== 'all' || filters.riskLevel !== 'all' || filters.diagnosis !== 'all' ? [
                    ['Búsqueda:', filters.search || 'N/A'],
                    ['Rango de Fechas:', filters.dateRange === 'all' ? 'Todas las fechas' :
                        filters.dateRange === '7d' ? 'Últimos 7 días' :
                            filters.dateRange === '30d' ? 'Últimos 30 días' :
                                filters.dateRange === '90d' ? 'Últimos 90 días' : filters.dateRange],
                    ['Nivel de Riesgo:', filters.riskLevel === 'all' ? 'Todos los niveles' :
                        filters.riskLevel === 'high' ? 'Alto riesgo (>70%)' :
                            filters.riskLevel === 'medium' ? 'Riesgo medio (30-70%)' :
                                filters.riskLevel === 'low' ? 'Bajo riesgo (≤30%)' : filters.riskLevel],
                    ['Diagnóstico:', filters.diagnosis === 'all' ? 'Todos los diagnósticos' : filters.diagnosis],
                ] : [
                    ['No se aplicaron filtros']
                ]),
                [''],
                ['ESTADÍSTICAS GENERALES'],
                ['Métrica', 'Valor', 'Porcentaje'],
                ['Total de Consultas', stats.total, '100%'],
                ['Casos de Stroke', stats.strokeCases, `${stats.total > 0 ? ((stats.strokeCases / stats.total) * 100).toFixed(1) : 0}%`],
                ['Casos Normales', stats.total - stats.strokeCases, `${stats.total > 0 ? (((stats.total - stats.strokeCases) / stats.total) * 100).toFixed(1) : 0}%`],
                ['Alto Riesgo (>70%)', stats.highRisk, `${stats.total > 0 ? ((stats.highRisk / stats.total) * 100).toFixed(1) : 0}%`],
                ['Riesgo Medio (30-70%)', stats.mediumRisk, `${stats.total > 0 ? ((stats.mediumRisk / stats.total) * 100).toFixed(1) : 0}%`],
                ['Bajo Riesgo (≤30%)', stats.lowRisk, `${stats.total > 0 ? ((stats.lowRisk / stats.total) * 100).toFixed(1) : 0}%`],
                ['Probabilidad Promedio', `${stats.avgProbability.toFixed(1)}%`, 'N/A'],
                [''],
                ['LISTADO DETALLADO DE CONSULTAS'],
                ['ID Consulta', 'Fecha', 'Hora', 'Paciente', 'ID Paciente', 'Edad', 'Género', 'Hipertensión', 'Diabetes', 'Enfermedad Cardíaca', 'Fumador', 'Alcohólico', 'Diagnóstico', 'Probabilidad de Stroke (%)', 'Nivel de Riesgo'],
                ...filteredConsultations.map(consultation => {
                    const normalizedProb = normalizeProbability(consultation.probability);
                    return [
                        consultation.id,
                        new Date(consultation.date).toLocaleDateString('es-ES'),
                        new Date(consultation.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                        consultation.patient?.name || 'Paciente Desconocido',
                        consultation.patient_id,
                        consultation.patient?.age || 0,
                        consultation.patient?.gender === 'Male' ? 'Masculino' :
                            consultation.patient?.gender === 'Female' ? 'Femenino' :
                                consultation.patient?.gender === 'Other' ? 'Otro' : 'No especificado',
                        consultation.patient?.hypertension ? 'Sí' : 'No',
                        consultation.patient?.diabetes ? 'Sí' : 'No',
                        consultation.patient?.heart_disease ? 'Sí' : 'No',
                        consultation.patient?.smoker ? 'Sí' : 'No',
                        consultation.patient?.alcoholic ? 'Sí' : 'No',
                        consultation.diagnosis || 'Sin diagnóstico',
                        normalizedProb.toFixed(1),
                        normalizedProb > 70 ? 'Alto Riesgo' :
                            normalizedProb > 30 ? 'Riesgo Medio' : 'Bajo Riesgo'
                    ];
                }),
                [''],
                ['ANÁLISIS TEMPORAL'],
                ['Período', 'Consultas', 'Casos Stroke', 'Tasa de Stroke (%)'],
                // Análisis por los últimos 30 días
                ...(() => {
                    const now = new Date();
                    const periods = [
                        { name: 'Últimos 7 días', days: 7 },
                        { name: 'Últimos 30 días', days: 30 },
                        { name: 'Últimos 90 días', days: 90 }
                    ];

                    return periods.map(period => {
                        const cutoffDate = new Date(now.getTime() - period.days * 24 * 60 * 60 * 1000);
                        const periodConsultations = consultations.filter(c => new Date(c.date) >= cutoffDate);
                        const periodStrokes = periodConsultations.filter(c => c.diagnosis === 'Stroke').length;
                        const strokeRate = periodConsultations.length > 0 ? ((periodStrokes / periodConsultations.length) * 100).toFixed(1) : '0.0';

                        return [period.name, periodConsultations.length, periodStrokes, `${strokeRate}%`];
                    });
                })(),
                [''],
                ['ANÁLISIS POR FACTORES DE RIESGO'],
                ['Factor de Riesgo', 'Consultas con Factor', 'Casos Stroke con Factor', 'Correlación (%)'],
                ['Hipertensión',
                    consultations.filter(c => c.patient?.hypertension).length,
                    consultations.filter(c => c.patient?.hypertension && c.diagnosis === 'Stroke').length,
                    `${consultations.filter(c => c.patient?.hypertension).length > 0 ?
                        ((consultations.filter(c => c.patient?.hypertension && c.diagnosis === 'Stroke').length /
                            consultations.filter(c => c.patient?.hypertension).length) * 100).toFixed(1) : '0.0'}%`
                ],
                ['Diabetes',
                    consultations.filter(c => c.patient?.diabetes).length,
                    consultations.filter(c => c.patient?.diabetes && c.diagnosis === 'Stroke').length,
                    `${consultations.filter(c => c.patient?.diabetes).length > 0 ?
                        ((consultations.filter(c => c.patient?.diabetes && c.diagnosis === 'Stroke').length /
                            consultations.filter(c => c.patient?.diabetes).length) * 100).toFixed(1) : '0.0'}%`
                ],
                ['Enfermedad Cardíaca',
                    consultations.filter(c => c.patient?.heart_disease).length,
                    consultations.filter(c => c.patient?.heart_disease && c.diagnosis === 'Stroke').length,
                    `${consultations.filter(c => c.patient?.heart_disease).length > 0 ?
                        ((consultations.filter(c => c.patient?.heart_disease && c.diagnosis === 'Stroke').length /
                            consultations.filter(c => c.patient?.heart_disease).length) * 100).toFixed(1) : '0.0'}%`
                ],
                ['Fumador',
                    consultations.filter(c => c.patient?.smoker).length,
                    consultations.filter(c => c.patient?.smoker && c.diagnosis === 'Stroke').length,
                    `${consultations.filter(c => c.patient?.smoker).length > 0 ?
                        ((consultations.filter(c => c.patient?.smoker && c.diagnosis === 'Stroke').length /
                            consultations.filter(c => c.patient?.smoker).length) * 100).toFixed(1) : '0.0'}%`
                ],
                ['Alcohólico',
                    consultations.filter(c => c.patient?.alcoholic).length,
                    consultations.filter(c => c.patient?.alcoholic && c.diagnosis === 'Stroke').length,
                    `${consultations.filter(c => c.patient?.alcoholic).length > 0 ?
                        ((consultations.filter(c => c.patient?.alcoholic && c.diagnosis === 'Stroke').length /
                            consultations.filter(c => c.patient?.alcoholic).length) * 100).toFixed(1) : '0.0'}%`
                ],
                [''],
                ['ANÁLISIS POR PROBABILIDAD'],
                ['Rango de Probabilidad', 'Número de Consultas', 'Casos Stroke Confirmados', 'Precisión del Modelo (%)'],
                ['0-30% (Bajo Riesgo)', stats.lowRisk,
                    filteredConsultations.filter(c => normalizeProbability(c.probability) <= 30 && c.diagnosis === 'Stroke').length,
                    `${stats.lowRisk > 0 ?
                        ((filteredConsultations.filter(c => normalizeProbability(c.probability) <= 30 && c.diagnosis === 'Stroke').length / stats.lowRisk) * 100).toFixed(1) : '0.0'}%`
                ],
                ['30-70% (Riesgo Medio)', stats.mediumRisk,
                    filteredConsultations.filter(c => {
                        const prob = normalizeProbability(c.probability);
                        return prob > 30 && prob <= 70 && c.diagnosis === 'Stroke';
                    }).length,
                    `${stats.mediumRisk > 0 ?
                        ((filteredConsultations.filter(c => {
                            const prob = normalizeProbability(c.probability);
                            return prob > 30 && prob <= 70 && c.diagnosis === 'Stroke';
                        }).length / stats.mediumRisk) * 100).toFixed(1) : '0.0'}%`
                ],
                ['>70% (Alto Riesgo)', stats.highRisk,
                    filteredConsultations.filter(c => normalizeProbability(c.probability) > 70 && c.diagnosis === 'Stroke').length,
                    `${stats.highRisk > 0 ?
                        ((filteredConsultations.filter(c => normalizeProbability(c.probability) > 70 && c.diagnosis === 'Stroke').length / stats.highRisk) * 100).toFixed(1) : '0.0'}%`
                ],
                [''],
                ['RECOMENDACIONES CLÍNICAS'],
                ['Categoría', 'Recomendación'],
                ['Pacientes Alto Riesgo', `${stats.highRisk} paciente${stats.highRisk !== 1 ? 's requieren' : ' requiere'} seguimiento inmediato`],
                ['Pacientes Riesgo Medio', `${stats.mediumRisk} paciente${stats.mediumRisk !== 1 ? 's requieren' : ' requiere'} monitoreo regular`],
                ['Prevención', 'Continuar con evaluaciones preventivas para todos los pacientes'],
                ['Seguimiento', 'Programar revisiones periódicas según el nivel de riesgo'],
                [''],
                ['NOTAS TÉCNICAS:'],
                ['- Probabilidades normalizadas a escala 0-100%'],
                ['- Alto Riesgo: Probabilidad > 70%'],
                ['- Riesgo Medio: Probabilidad 30-70%'],
                ['- Bajo Riesgo: Probabilidad ≤ 30%'],
                ['- HTN: Hipertensión, DM: Diabetes, CVD: Enfermedad Cardiovascular'],
                ['- Modelo basado en algoritmos de machine learning'],
                [''],
                ['Reporte generado automáticamente por el Sistema de Diagnóstico de Stroke'],
                ['Confidencial - Solo para uso médico autorizado']
            ];

            const csvContent = csvData.map(row =>
                row.map(cell => {
                    const cellStr = String(cell);
                    if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
                        return `"${cellStr.replace(/"/g, '""')}"`;
                    }
                    return cellStr;
                }).join(',')
            ).join('\n');

            const blob = new Blob(['\ufeff' + csvContent], {
                type: 'text/csv;charset=utf-8;'
            });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `consultas_reporte_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setShowExportMenu(false);
            toast.success('Archivo Excel exportado exitosamente');
        } catch (error) {
            console.error('Error generating Excel:', error);
            toast.error('Error al generar el archivo Excel. Por favor, intenta nuevamente.');
        }
    };
    const getRiskColor = (probability: number) => {
        if (probability > 70) return 'text-red-600 bg-red-50 border border-red-200';
        if (probability > 30) return 'text-yellow-600 bg-yellow-50 border border-yellow-200';
        return 'text-green-600 bg-green-50 border border-green-200';
    };

    const getRiskIcon = (probability: number) => {
        if (probability > 70) return <ExclamationTriangleIcon className="w-4 h-4" />;
        if (probability > 30) return <EyeIcon className="w-4 h-4" />;
        return <ShieldCheckIcon className="w-4 h-4" />;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Cargando consultas...</p>
                </div>
            </div>
        );
    }

    if (error) {
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
                            <h1 className="text-3xl font-bold text-gray-900">Gestión de Consultas</h1>
                            <p className="text-gray-600 mt-1">Historial completo de evaluaciones y diagnósticos</p>
                        </div>

                        {/* Controles del header */}
                        <div className="flex items-center space-x-4">
                            {/* Búsqueda */}
                            <div className="relative">
                                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar paciente o diagnóstico..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                                    className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64 text-gray-900 placeholder-gray-500"
                                />
                            </div>

                            {/* Filtros */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <FunnelIcon className="w-5 h-5 mr-2" />
                                    Filtros
                                </button>

                                {showFilters && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-800 mb-3">Filtros Avanzados</h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rango de Fechas</label>
                                                    <select
                                                        value={filters.dateRange}
                                                        onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                                                    >
                                                        <option value="all">Todas las fechas</option>
                                                        <option value="7d">Últimos 7 días</option>
                                                        <option value="30d">Últimos 30 días</option>
                                                        <option value="90d">Últimos 90 días</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de Riesgo</label>
                                                    <select
                                                        value={filters.riskLevel}
                                                        onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                                                    >
                                                        <option value="all">Todos los niveles</option>
                                                        <option value="high">Alto riesgo (70%)</option>
                                                        <option value="medium">Riesgo medio (30-70%)</option>
                                                        <option value="low">Bajo riesgo (30%)</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                                                    <select
                                                        value={filters.diagnosis}
                                                        onChange={(e) => setFilters({...filters, diagnosis: e.target.value})}
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                                                    >
                                                        <option value="all">Todos los diagnósticos</option>
                                                        <option value="Stroke">Stroke</option>
                                                        <option value="Normal">Normal</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex justify-between mt-4 pt-3 border-t">
                                                <button
                                                    onClick={() => {
                                                        setFilters({
                                                            search: '',
                                                            dateRange: 'all',
                                                            riskLevel: 'all',
                                                            diagnosis: 'all',
                                                            doctor: 'all'
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

                            {/* Exportación */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                                    Exportar
                                </button>

                                {showExportMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                        <div className="py-2">
                                            <button
                                                onClick={exportToPDF}
                                                className="block w-full text-left bg-white px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                Exportar a PDF
                                            </button>
                                            <button
                                                onClick={exportToExcel}
                                                className="block w-full text-left bg-white px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                Exportar a Excel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Botón Nueva Consulta */}
                            {(user?.role === 'doctor' || user?.role === 'admin') && (
                                <Link
                                    to="/consultations/new"
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                                >
                                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                                    Nueva Consulta
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Estadísticas de resumen */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Consultas</p>
                                <p className="text-3xl font-bold">{stats.total}</p>
                            </div>
                            <DocumentTextIcon className="w-8 h-8 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm font-medium">Casos de Stroke</p>
                                <p className="text-3xl font-bold">{stats.strokeCases}</p>
                            </div>
                            <ExclamationTriangleIcon className="w-8 h-8 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm font-medium">Alto Riesgo</p>
                                <p className="text-3xl font-bold">{stats.highRisk}</p>
                            </div>
                            <FireIcon className="w-8 h-8 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Bajo Riesgo</p>
                                <p className="text-3xl font-bold">{stats.lowRisk}</p>
                            </div>
                            <ShieldCheckIcon className="w-8 h-8 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Probabilidad Promedio</p>
                                <p className="text-3xl font-bold">{stats.avgProbability.toFixed(1)}%</p>
                            </div>
                            <ChartBarIcon className="w-8 h-8 opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Tabla de consultas */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <DocumentTextIcon className="w-6 h-6 mr-2 text-blue-600" />
                                    Registro de Consultas
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Mostrando {filteredConsultations.length} de {consultations.length} consultas
                                </p>
                            </div>
                        </div>
                    </div>

                    {filteredConsultations.length === 0 ? (
                        <div className="text-center py-16">
                            <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron consultas</h3>
                            <p className="text-gray-500 mb-6">
                                {consultations.length === 0
                                    ? 'Aún no hay consultas registradas en el sistema.'
                                    : 'Prueba ajustando los filtros para encontrar lo que buscas.'
                                }
                            </p>
                            {(user?.role === 'doctor' || user?.role === 'admin') && consultations.length === 0 && (
                                <Link
                                    to="/consultations/new"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                                    Crear Primera Consulta
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factores de Riesgo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnóstico</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Riesgo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probabilidad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredConsultations.map(consultation => (
                                    <tr key={consultation.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                                    normalizeProbability(consultation.probability) > 70 ? 'bg-red-500' :
                                                        normalizeProbability(consultation.probability) > 30 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}>
                                                    {consultation.patient?.name?.charAt(0) || 'P'}
                                                </div>
                                                <div className="ml-4">
                                                    <Link
                                                        to={`/patients/${consultation.patient_id}`}
                                                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                                    >
                                                        {consultation.patient?.name || 'Paciente Desconocido'}
                                                    </Link>
                                                    <div className="text-sm text-gray-500">
                                                        {consultation.patient?.age || 0} años · {consultation.patient?.gender || 'No especificado'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {consultation.patient?.hypertension && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 border border-purple-200">HTN</span>
                                                )}
                                                {consultation.patient?.diabetes && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">DM</span>
                                                )}
                                                {consultation.patient?.heart_disease && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-200">CVD</span>
                                                )}
                                                {consultation.patient?.smoker && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 border border-orange-200">Fumador</span>
                                                )}
                                                {consultation.patient?.alcoholic && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200">Alcohólico</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(consultation.date).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(consultation.date).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    consultation.diagnosis === 'Stroke'
                                                        ? 'bg-red-100 text-red-800 border border-red-200'
                                                        : 'bg-green-100 text-green-800 border border-green-200'
                                                }`}>
                                                    {consultation.diagnosis || 'Sin diagnóstico'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(normalizeProbability(consultation.probability))}`}>
                                                {getRiskIcon(normalizeProbability(consultation.probability))}
                                                <span className="ml-1">
                                                        {(() => {
                                                            const normalizedProb = normalizeProbability(consultation.probability);
                                                            return normalizedProb > 70 ? 'Alto'
                                                                : normalizedProb > 30 ? 'Medio'
                                                                    : 'Bajo';
                                                        })()}
                                                    </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${
                                                            normalizeProbability(consultation.probability) > 70 ? 'bg-red-500' :
                                                                normalizeProbability(consultation.probability) > 30 ? 'bg-yellow-500' : 'bg-green-500'
                                                        }`}
                                                        style={{ width: `${Math.min(100, normalizeProbability(consultation.probability))}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700 min-w-[50px]">
                                                        {normalizeProbability(consultation.probability).toFixed(1)}%
                                                    </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-3">
                                                <Link
                                                    to={`/consultations/${consultation.id}`}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    title="Ver detalles"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </Link>
                                                {(user?.role === 'doctor' || user?.role === 'admin') && (
                                                    <>
                                                        <Link
                                                            to={`/consultations/${consultation.id}/edit`}
                                                            className="text-yellow-600 bg-white hover:text-yellow-900 transition-colors"
                                                            title="Editar"
                                                        >
                                                            <PencilIcon className="h-5 w-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(consultation.id)}
                                                            className="text-red-600 bg-white hover:text-red-900 transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </>
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

                {/* Paginación (opcional) */}
                {filteredConsultations.length > 20 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                                    Mostrando <span className="font-medium">1</span> a <span className="font-medium">{Math.min(20, filteredConsultations.length)}</span> de{' '}
                                    <span className="font-medium">{filteredConsultations.length}</span> resultados
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

export default Consultations;