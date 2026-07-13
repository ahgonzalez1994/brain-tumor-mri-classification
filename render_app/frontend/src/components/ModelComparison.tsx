import { useState } from "react";
import { resnetMetrics, cnnMetrics } from "../utils";
import { ModelPredictionResult, MriScan, TumorType } from "../types";
import { 
  TrendingUp, 
  Verified, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Loader2,
  PlayCircle,
  Database,
  FileCheck2
} from "lucide-react";

const confusionMatrices = {
  resnet: [
    [283, 81, 34, 2],
    [9, 340, 33, 18],
    [0, 3, 397, 0],
    [1, 8, 1, 390],
  ],
  cnn: [
    [230, 94, 62, 14],
    [1, 268, 84, 47],
    [0, 2, 397, 1],
    [0, 15, 11, 374],
  ]
};

const classes = ["Glioma", "Meningioma", "No tumor", "Pituitary"];

interface ModelComparisonProps {
  currentScan: MriScan | null;
  onRunModelPrediction: (scan: MriScan, modelType: string) => Promise<ModelPredictionResult>;
}

const orderedTumorClasses: TumorType[] = ["Pituitary", "Glioma", "Meningioma", "No tumor"];

export default function ModelComparison({
  currentScan,
  onRunModelPrediction,
}: ModelComparisonProps) {
  const [matrixModel, setMatrixModel] = useState<"resnet" | "cnn">("resnet");
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [comparisonResults, setComparisonResults] = useState<{
    transfer: ModelPredictionResult;
    baseline: ModelPredictionResult;
  } | null>(null);
  const activeMatrix = confusionMatrices[matrixModel];

  // Sum up cells for calculations/totals
  const totalSamples = activeMatrix.reduce((acc, row) => acc + row.reduce((rAcc, val) => rAcc + val, 0), 0);
  const correctSamples = activeMatrix.reduce((acc, row, idx) => acc + row[idx], 0);
  const calculatedAccuracy = ((correctSamples / totalSamples) * 100).toFixed(2);

  const runImageComparison = async () => {
    if (!currentScan) {
      setComparisonError("Primero carga una imagen en Diagnostic Visor.");
      return;
    }

    setIsComparing(true);
    setComparisonError(null);

    try {
      const [transfer, baseline] = await Promise.all([
        onRunModelPrediction(currentScan, "resnet"),
        onRunModelPrediction(currentScan, "cnn"),
      ]);

      setComparisonResults({ transfer, baseline });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setComparisonError(message);
    } finally {
      setIsComparing(false);
    }
  };

  const renderImageResultCard = (
    title: string,
    result: ModelPredictionResult | undefined,
    isRecommended = false,
  ) => (
    <div className={`backdrop-blur-xl bg-white/5 rounded-[24px] p-5 shadow-2xl border ${
      isRecommended ? "border-teal-500/30" : "border-white/10"
    }`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          {isRecommended ? (
            <Verified className="text-teal-400 w-5 h-5" />
          ) : (
            <TrendingUp className="text-white/40 w-5 h-5" />
          )}
          {title}
        </h3>
        {isRecommended && (
          <span className="bg-teal-500/15 border border-teal-500/30 text-teal-300 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
            Best global
          </span>
        )}
      </div>

      {result ? (
        <>
          <div className="bg-black/25 border border-white/10 rounded-2xl p-4 mb-4">
            <p className="text-[10px] font-bold text-white/45 uppercase tracking-widest mb-1">
              Prediction for active image
            </p>
            <div className="flex items-end justify-between gap-3">
              <p className="text-2xl font-bold text-white leading-none">
                {result.predictedClass}
              </p>
              <p className="text-sm font-bold text-indigo-300">
                {result.confidencePct}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {orderedTumorClasses.map((className) => {
              const value = result.probabilities[className] || 0;
              const pct = value * 100;
              const isWinner = result.predictedClass === className;

              return (
                <div key={className}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className={isWinner ? "text-white" : "text-white/50"}>
                      {className}
                    </span>
                    <span className={isWinner ? "text-indigo-300" : "text-white/35 font-mono"}>
                      {pct.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isWinner ? "bg-indigo-500" : "bg-white/20"}`}
                      style={{ width: `${Math.max(pct, 0.5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="border border-dashed border-white/15 rounded-2xl p-5 text-center text-xs text-white/45 leading-relaxed">
          Ejecuta la comparacion para ver la prediccion de este modelo sobre la imagen activa.
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 text-white">
      
      {/* Top Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-1">
          Model Performance
        </h1>
        <p className="text-xs md:text-sm text-white/60">
          Comparacion entre CNN Baseline y Transfer Learning ResNet18 usando prediccion individual y resultados globales del conjunto de testing.
        </p>
      </div>

      {/* Active Image Real Comparison */}
      <section className="backdrop-blur-xl bg-indigo-500/5 border border-indigo-500/20 rounded-[24px] p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="text-indigo-400 w-5 h-5" />
              Active Image Prediction Comparison
            </h2>
            <p className="text-xs text-white/55 mt-1 leading-relaxed">
              Ejecuta ambos modelos sobre la misma imagen activa para comparar prediccion, confianza y probabilidades de esa imagen especifica.
            </p>
            {currentScan && (
              <p className="text-[10px] text-white/35 mt-2 font-mono">
                FILE: {currentScan.fileName}
              </p>
            )}
          </div>

          <button
            onClick={runImageComparison}
            disabled={isComparing || !currentScan}
            className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-white/10 disabled:text-white/35 transition-all px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer border border-indigo-500/30"
          >
            {isComparing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Comparing models...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                Compare active image
              </>
            )}
          </button>
        </div>

        {!currentScan && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-5 text-xs text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Carga una imagen en Diagnostic Visor antes de comparar ambos modelos.
          </div>
        )}

        {comparisonError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-5 text-xs text-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {comparisonError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderImageResultCard("Transfer Learning ResNet18", comparisonResults?.transfer, true)}
          {renderImageResultCard("CNN Baseline", comparisonResults?.baseline)}
        </div>

        {comparisonResults && (
          <div className="mt-5 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white/65 flex items-start gap-2 leading-relaxed">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            Ambos resultados provienen del backend FastAPI y de los checkpoints PyTorch reales del proyecto.
          </div>
        )}
      </section>

      {/* Side-by-Side Global Model Metrics Cards */}
      <div className="border-b border-white/10 pb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="text-indigo-400 w-5 h-5" />
          Global Test Set Metrics
        </h2>
        <p className="text-xs text-white/55 mt-1">
          Metricas calculadas en el conjunto de testing final: 1600 imagenes, 400 por clase.
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ResNet18 (Best) */}
        <div className="backdrop-blur-xl bg-white/5 border-2 border-teal-500/30 rounded-[24px] p-5 relative shadow-2xl">
          <div className="absolute -top-3 right-5 bg-teal-500/20 border border-teal-500/40 text-teal-300 px-3 py-1 rounded-full text-[9px] font-bold shadow-md uppercase tracking-wider">
            Best overall model
          </div>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Verified className="text-teal-400 w-5 h-5" />
            ResNet18 (Transfer Learning)
          </h3>
          
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-6">
            <div className="flex justify-between items-center border-b border-white/10 border-dashed pb-1.5">
              <span className="text-xs font-semibold text-white/50">Accuracy</span>
              <span className="text-sm font-bold text-white">{resnetMetrics.accuracy}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 border-dashed pb-1.5">
              <span className="text-xs font-semibold text-white/50">F1 Score</span>
              <span className="text-sm font-bold text-white">{resnetMetrics.f1Score}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 border-dashed pb-1.5">
              <span className="text-xs font-semibold text-white/50">Precision</span>
              <span className="text-sm font-bold text-white">{resnetMetrics.precision}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 border-dashed pb-1.5">
              <span className="text-xs font-semibold text-white/50">Recall</span>
              <span className="text-sm font-bold text-white">{resnetMetrics.recall}%</span>
            </div>
          </div>
        </div>

        {/* CNN Baseline */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-white/40 w-5 h-5" />
            CNN Baseline (Simple Model)
          </h3>
          
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-6">
            <div className="flex justify-between items-center border-b border-white/10 border-dashed pb-1.5">
              <span className="text-xs font-semibold text-white/50">Accuracy</span>
              <span className="text-sm font-medium text-white/80">{cnnMetrics.accuracy}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 border-dashed pb-1.5">
              <span className="text-xs font-semibold text-white/50">F1 Score</span>
              <span className="text-sm font-medium text-white/80">{cnnMetrics.f1Score}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 border-dashed pb-1.5">
              <span className="text-xs font-semibold text-white/50">Precision</span>
              <span className="text-sm font-medium text-white/80">{cnnMetrics.precision}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 border-dashed pb-1.5">
              <span className="text-xs font-semibold text-white/50">Recall</span>
              <span className="text-sm font-medium text-white/80">{cnnMetrics.recall}%</span>
            </div>
          </div>
        </div>

      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[20px] p-4">
          <FileCheck2 className="text-indigo-400 w-5 h-5 mb-3" />
          <p className="text-[10px] font-bold text-white/45 uppercase tracking-widest mb-1">
            Evaluation Split
          </p>
          <p className="text-sm font-bold text-white">1600 testing images</p>
          <p className="text-xs text-white/45 mt-1">Balanced: 400 images per class.</p>
        </div>
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[20px] p-4">
          <FileCheck2 className="text-teal-400 w-5 h-5 mb-3" />
          <p className="text-[10px] font-bold text-white/45 uppercase tracking-widest mb-1">
            Best Validation
          </p>
          <p className="text-sm font-bold text-white">ResNet18 val loss: 0.1702</p>
          <p className="text-xs text-white/45 mt-1">Fine tuning over layer4 and classifier head.</p>
        </div>
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[20px] p-4">
          <FileCheck2 className="text-sky-400 w-5 h-5 mb-3" />
          <p className="text-[10px] font-bold text-white/45 uppercase tracking-widest mb-1">
            Notebook Evidence
          </p>
          <p className="text-sm font-bold text-white">Curves kept in notebooks</p>
          <p className="text-xs text-white/45 mt-1">This app shows only values available from saved project outputs.</p>
        </div>
      </section>

      {/* Interactive Confusion Matrix Panel */}
      <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-2xl text-white">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-3 mb-5">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Verified className="text-indigo-400 w-4.5 h-4.5" />
              Test Set Confusion Matrix
            </h3>
            <p className="text-xs text-white/50 mt-1">
              Matrices reales generadas desde `outputs/metrics` sobre el conjunto de testing final.
            </p>
          </div>

          <div className="flex gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setMatrixModel("resnet")}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                matrixModel === "resnet"
                  ? "bg-white/10 text-white shadow-xs border border-white/10"
                  : "text-white/60 hover:text-white"
              }`}
            >
              ResNet18 Matrix
            </button>
            <button
              onClick={() => setMatrixModel("cnn")}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                matrixModel === "cnn"
                  ? "bg-white/10 text-white shadow-xs border border-white/10"
                  : "text-white/60 hover:text-white"
              }`}
            >
              CNN Baseline Matrix
            </button>
          </div>
        </div>

        {/* The 4x4 Grid Matrix */}
        <div className="overflow-x-auto">
          <div className="min-w-[480px] max-w-xl mx-auto flex flex-col items-center">
            
            {/* Predicted Labels Header */}
            <div className="text-center font-bold text-xs text-indigo-300 mb-3 uppercase tracking-wider">
              Predicted Class
            </div>

            <div className="grid grid-cols-5 gap-1.5 w-full">
              
              {/* Empty top-left cell */}
              <div className="flex items-center justify-center font-bold text-xs text-white/40">
                True Class
              </div>
              
              {/* Class column headers */}
              {classes.map((cls) => (
                <div key={cls} className="text-center font-bold text-[9px] text-white/50 py-1 uppercase tracking-wide leading-tight">
                  {cls}
                </div>
              ))}

              {/* Rows */}
              {classes.map((rowClass, rIdx) => (
                <div key={rowClass} className="contents">
                  
                  {/* Row header */}
                  <div className="text-left font-bold text-[9px] text-white/50 flex items-center uppercase tracking-wide px-1">
                    {rowClass}
                  </div>

                  {/* Grid cells */}
                  {classes.map((colClass, cIdx) => {
                    const value = activeMatrix[rIdx][cIdx];
                    const isDiagonal = rIdx === cIdx;
                    
                    // Intensity color map
                    let cellBg = "bg-white/5 text-white/40 border border-white/5";
                    if (isDiagonal) {
                      if (value > 120) cellBg = "bg-emerald-600/60 text-white font-extrabold border border-emerald-500/20";
                      else if (value > 100) cellBg = "bg-emerald-500/50 text-white font-extrabold border border-emerald-400/20";
                      else cellBg = "bg-emerald-400/40 text-emerald-100 font-extrabold border border-emerald-300/20";
                    } else if (value > 15) {
                      cellBg = "bg-red-500/30 text-red-200 font-semibold border border-red-500/20";
                    } else if (value > 5) {
                      cellBg = "bg-red-500/20 text-red-300 font-medium border border-red-500/10";
                    } else if (value > 0) {
                      cellBg = "bg-red-500/10 text-red-400/80 border border-red-500/5";
                    }

                    return (
                      <div
                        key={colClass}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs transition-all hover:scale-[1.04] shadow-md select-none ${cellBg}`}
                        title={`True: ${rowClass}, Predicted: ${colClass} - Count: ${value}`}
                      >
                        <span className="text-sm font-bold">{value}</span>
                        <span className="text-[8px] opacity-75 mt-0.5 font-mono">
                          {((value / totalSamples) * 100).toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Matrix calculated summary */}
            <div className="w-full mt-5 bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center text-[10px] font-mono text-white/50">
              <div>DIAGONAL CORRECT: <span className="font-semibold text-white/80">{correctSamples} / {totalSamples}</span></div>
              <div>ACCURACY: <span className="font-bold text-emerald-400">{calculatedAccuracy}%</span></div>
            </div>

          </div>
        </div>
      </section>

      {/* Error Analysis Box */}
      <section className="backdrop-blur-xl bg-amber-500/5 border border-amber-500/20 rounded-[24px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-3">
          <AlertTriangle className="text-amber-400 w-10 h-10 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              Error Analysis Note
            </h4>
            <p className="text-xs text-white/70 mt-1 leading-relaxed">
              En ambos modelos, la mayor confusion restante ocurre entre <span className="font-bold text-white">glioma</span> y <span className="font-bold text-white">meningioma</span>. El baseline clasifica 94 gliomas como meningioma, mientras que ResNet18 reduce parcialmente ese error a 81 casos y mejora el rendimiento global.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
