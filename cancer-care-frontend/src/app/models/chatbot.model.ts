export interface Message {
  role: 'user' | 'assistant';
  content: string;
  stressAnalysis?: StressAnalysis;
}

export interface Alert {
  _id: string;
  patientId?: string;
  patientName: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'viewed' | 'handled' | 'resolved';
  description?: string;
  type: string;
  createdAt: Date;
  context?: string;
  resolvedAt?: Date;
  patient?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    cancerType?: string;
  };
}

export interface PatientReport {
  patientName: string;
  patientId: string;  // required now
  totalSessions: number;
  averageStress: number;
  maxStress?: number;
  totalMessages?: number;
  alertsCount?: number;
  alertsByType?: Record<string, number>;
  recentAlerts?: Alert[];
  recommendations: string[];
  alerts: Alert[];
  stressTrend: {
    level: number;
    timestamp: Date;
  }[];
}

export interface StressAnalysis {
  detected: boolean;
  score: number;
  level?: 'low' | 'medium' | 'high';
  keywords?: string[];
}

export interface PrescriptionScanResult {
  medications: string[];
  dosages: string[];
  instructions?: string;
  rawText?: string;
}
