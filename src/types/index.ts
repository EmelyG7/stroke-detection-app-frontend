export interface DashboardStats {
    totalPatients: number;
    totalConsultations: number;
    strokeRate: string;
    avgStrokeProbability: string;
    avgStrokeAge: string;
    riskAgeRange: string;
    monthlyStats: { year_month: string; stroke_count: number; avg_probability: number }[];
    recentConsultations: { _id: string; date: string; diagnosis: string; probability: number; patient_name: string }[];
}

export interface Patient {
    id: string;
    _id?: string;
    name: string;
    age: number;
    gender: string;
    smoker: boolean;
    alcoholic: boolean;
    hypertension: boolean;
    diabetes: boolean;
    heart_disease: boolean;
    created_at: string;
}

export interface ImageAnalysis {
    id: string;
    image_id: string;
    filename: string;
    diagnosis: string;
    confidence: number;
    probability: number;
    url: string;
    created_at: string;
}

export interface Consultation {
    id: string;
    patient_id: string;
    patient_name: string;
    date: string;
    notes?: string;
    diagnosis: string;
    probability: number;
    images: ImageAnalysis[];
    created_at: string;
}

export interface User {
    id: string;
    username: string;
    full_name: string;
    role: string;
    created_at: string;
}