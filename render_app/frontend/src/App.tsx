import { useState, useEffect } from "react";
import { ModelPredictionResult, MriScan, TumorType } from "./types";
import { SAMPLE_SCANS } from "./utils";
import DiagnosticVisor from "./components/DiagnosticVisor";
import ModelComparison from "./components/ModelComparison";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Layers, 
  Upload, 
  CheckCircle, 
  GraduationCap, 
  Brain,
  Menu,
  X,
  Play
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.VITE_API_HOST ? `https://${import.meta.env.VITE_API_HOST}` : undefined)
  || (typeof window !== "undefined" && window.location.hostname.endsWith("onrender.com")
    ? "https://brain-tumor-mri-api.onrender.com"
    : "http://127.0.0.1:8000");

const BACKEND_MODEL_ID: Record<string, string> = {
  resnet: "transfer",
  cnn: "baseline",
};

const CLASS_TO_TUMOR_TYPE: Record<string, TumorType> = {
  pituitary: "Pituitary",
  glioma: "Glioma",
  meningioma: "Meningioma",
  notumor: "No tumor",
};

const API_PROBABILITY_KEYS: Record<string, TumorType> = {
  pituitary: "Pituitary",
  glioma: "Glioma",
  meningioma: "Meningioma",
  notumor: "No tumor",
};

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type || "image/png" });
}

function convertProbabilities(probabilities: Record<string, number>): Record<TumorType, number> {
  return Object.entries(API_PROBABILITY_KEYS).reduce(
    (acc, [apiKey, tumorType]) => {
      acc[tumorType] = probabilities[apiKey] ?? 0;
      return acc;
    },
    {
      "Pituitary": 0,
      "Glioma": 0,
      "Meningioma": 0,
      "No tumor": 0,
    } as Record<TumorType, number>,
  );
}

function mapPredictionResult(data: any): ModelPredictionResult {
  return {
    modelId: data.model_id,
    modelName: data.model_name,
    predictedClass: CLASS_TO_TUMOR_TYPE[data.predicted_class] || "No tumor",
    confidence: data.confidence,
    confidencePct: data.confidence_pct,
    probabilities: convertProbabilities(data.probabilities || {}),
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"visor" | "compare">("visor");
  const [currentScan, setCurrentScan] = useState<MriScan | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Set the first sample as default on startup to avoid starting completely blank
  useEffect(() => {
    if (!currentScan) {
      setCurrentScan(SAMPLE_SCANS[0]);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const runBackendPrediction = async (
    scan: MriScan,
    modelType: string,
  ): Promise<ModelPredictionResult> => {
    let fileForPrediction = scan.sourceFile;

    if (!fileForPrediction) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas context is not available");
      }

      const { drawBrainSlice } = await import("./utils");
      drawBrainSlice(
        ctx,
        512,
        512,
        scan.imageType,
        scan.tumorType,
        false,
        scan.tumorX,
        scan.tumorY,
        scan.tumorRadius,
      );

      fileForPrediction = await dataUrlToFile(canvas.toDataURL("image/png"), `${scan.id}.png`);
    }

    const formData = new FormData();
    formData.append("file", fileForPrediction);
    formData.append("model_id", BACKEND_MODEL_ID[modelType] || "transfer");

    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || "Prediction API call returned non-200 status");
    }

    const data = await response.json();
    return mapPredictionResult(data);
  };

  const handleAnalyze = async (scan: MriScan, modelType: string) => {
    setIsAnalyzing(true);
    
    try {
      const prediction = await runBackendPrediction(scan, modelType);

      setCurrentScan({
        ...scan,
        tumorType: prediction.predictedClass,
        confidence: prediction.confidence,
        probabilities: prediction.probabilities,
        report: {
          findings: `Prediccion generada por ${prediction.modelName}. La imagen fue preprocesada a 224x224 pixeles y evaluada con el pipeline validado en los notebooks del proyecto.`,
          impression: `Resultado academico: ${prediction.predictedClass} con ${prediction.confidencePct} de confianza.`,
          recommendations: "Resultado academico. No usar para diagnostico clinico. Validar siempre con criterio clinico profesional y estudios complementarios.",
          analyzedBy: prediction.modelName,
          analysisDate: new Date().toISOString(),
        },
      });

      triggerToast(`Clasificacion real: ${prediction.predictedClass} (${prediction.confidencePct}) via ${prediction.modelName}`);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Error desconocido";
      triggerToast(`Error: ${message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper trigger to open a file uploader from the sidebar button
  const triggerSidebarUpload = () => {
    document.getElementById("mri-file-input")?.click();
    setActiveTab("visor");
  };

  return (
    <div className="bg-[#09090b] min-h-screen flex flex-col font-sans text-white selection:bg-indigo-500/30 selection:text-white relative overflow-x-hidden">
      
      {/* Decorative Background Mesh */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 bg-[#16161a]/95 border border-white/10 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-[60] backdrop-blur-md"
          >
            <CheckCircle className="text-emerald-400 w-4 h-4 flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Clinical Navigation Bar */}
      <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 flex justify-between items-center w-full px-6 md:px-8 h-16 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 md:hidden transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Brain className="text-indigo-400 w-6 h-6 flex-shrink-0" />
          <div>
            <h1 className="text-base md:text-lg font-bold text-white m-0 tracking-tight leading-tight">
              NeuroScan MRI Classifier
            </h1>
            <p className="text-[10px] md:text-xs font-semibold text-white/50 m-0 uppercase tracking-wider">
              Academic MRI Tumor Classification Demo
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>System Status: Models Loaded</span>
          </div>

          {currentScan && (
            <button
              onClick={() => handleAnalyze(currentScan, "resnet")}
              disabled={isAnalyzing}
              className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-white/10 disabled:text-white/40 transition-all px-4.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer border border-indigo-500/30"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run prediction</span>
            </button>
          )}

          <div className="hidden lg:block text-[10px] font-semibold text-white/35 border-l border-white/10 pl-4 uppercase tracking-wider">
            Local PyTorch Inference
          </div>
        </div>
      </header>

      {/* Main Structural Body */}
      <div className="flex flex-1 relative">
        
        {/* Side Navigation Bar */}
        <nav className={`backdrop-blur-xl bg-white/5 border-r border-white/10 flex flex-col h-[calc(100vh-4rem)] fixed left-0 top-16 z-40 w-64 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="px-5 py-4 flex-1">
            <ul className="space-y-1.5 mt-2">
              <li>
                <button
                  onClick={() => { setActiveTab("visor"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-bold text-xs cursor-pointer ${
                    activeTab === "visor"
                      ? "text-indigo-300 bg-white/10 border-r-4 border-indigo-500 shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Diagnostic Visor</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab("compare"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-bold text-xs cursor-pointer ${
                    activeTab === "compare"
                      ? "text-indigo-300 bg-white/10 border-r-4 border-indigo-500 shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Model Performance</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Sidebar Footer Upload Trigger */}
          <div className="p-4 border-t border-white/10 bg-black/10">
            <button
              onClick={triggerSidebarUpload}
              className="w-full bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-colors py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Upload MRI Scan</span>
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 ml-0 md:ml-64 p-6 md:p-8 w-full min-h-[calc(100vh-4rem)] pb-24 overflow-y-auto z-10">
          <div className="max-w-7xl mx-auto">
            {activeTab === "visor" && (
              <DiagnosticVisor
                currentScan={currentScan}
                onScanChange={setCurrentScan}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
              />
            )}

            {activeTab === "compare" && (
              <ModelComparison
                currentScan={currentScan}
                onRunModelPrediction={runBackendPrediction}
              />
            )}

          </div>
        </main>
      </div>

      {/* Persistent Academic Disclaimer Footer */}
      <footer className="backdrop-blur-xl bg-white/5 border-t border-white/10 flex flex-col md:flex-row justify-between items-center w-full px-6 md:px-8 py-4 z-40 fixed bottom-0 ml-0 md:ml-64 md:max-w-[calc(100%-16rem)] shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left mb-2.5 md:mb-0">
          <span className="bg-white/10 text-indigo-300 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-white/10 flex items-center gap-1.5 uppercase tracking-wide">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Academic Use Only</span>
          </span>
          <p className="text-[11px] font-medium text-white/50 m-0">
            © 2026 NeuroScan MRI Classifier. Academic Use Only. Not for clinical diagnosis.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold text-white/45">
          <span>Baseline CNN</span>
          <span>Transfer Learning ResNet18</span>
          <span>FastAPI + React</span>
        </div>
      </footer>

    </div>
  );
}
