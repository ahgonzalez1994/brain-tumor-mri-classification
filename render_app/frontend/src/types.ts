export type TumorType = 'Pituitary' | 'Glioma' | 'Meningioma' | 'No tumor';

export interface MriScan {
  id: string;
  fileName: string;
  uploadedAt: string;
  fileSize: string;
  imageType: 'axial' | 'sagittal' | 'coronal';
  sourceFile?: File;
  sourceDataUrl?: string;
  contrast?: number;
  brightness?: number;
  zoom?: number;
  tumorType?: TumorType;
  confidence?: number;
  probabilities?: Record<TumorType, number>;
  report?: ClinicalReport;
  // Canvas rendering parameters for mock tumor visual simulation
  tumorX?: number; // Center of tumor relative to canvas (0-100)
  tumorY?: number;
  tumorRadius?: number;
}

export interface ClinicalReport {
  findings: string;
  impression: string;
  recommendations: string;
  analyzedBy: string;
  analysisDate: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  medicalId: string;
  scans: MriScan[];
  primaryDiagnosis?: TumorType;
  lastVisit: string;
}

export interface ModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface ModelPredictionResult {
  modelId: 'baseline' | 'transfer';
  modelName: string;
  predictedClass: TumorType;
  confidence: number;
  confidencePct: string;
  probabilities: Record<TumorType, number>;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
  summary: string;
  url: string;
}
