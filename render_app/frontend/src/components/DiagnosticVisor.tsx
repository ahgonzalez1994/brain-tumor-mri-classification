import React, { useState, useEffect, useRef, DragEvent, ChangeEvent } from "react";
import { MriScan, TumorType } from "../types";
import { SAMPLE_SCANS, drawBrainSlice } from "../utils";
import { motion, AnimatePresence } from "motion/react";
import { 
  Microscope, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  CloudUpload, 
  Info, 
  Play, 
  Activity, 
  Eye, 
  BriefcaseMedical, 
  CheckCircle,
  File,
  Sliders,
  Layers,
  Sparkles
} from "lucide-react";

interface DiagnosticVisorProps {
  currentScan: MriScan | null;
  onScanChange: (scan: MriScan | null) => void;
  onAnalyze: (scan: MriScan, modelType: string) => Promise<void>;
  isAnalyzing: boolean;
}

export default function DiagnosticVisor({
  currentScan,
  onScanChange,
  onAnalyze,
  isAnalyzing,
}: DiagnosticVisorProps) {
  const [modelType, setModelType] = useState<string>("resnet");
  const [showSegment, setShowSegment] = useState<boolean>(true);
  const [isT2Weighting, setIsT2Weighting] = useState<boolean>(false);
  
  // Contrast, brightness, zoom, pan state
  const [contrast, setContrast] = useState<number>(100);
  const [brightness, setBrightness] = useState<number>(100);
  const [zoom, setZoom] = useState<number>(100);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redraw canvas whenever scan or parameters change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (currentScan) {
      if (currentScan.sourceDataUrl) {
        const uploadedImage = new Image();
        uploadedImage.onload = () => {
          ctx.fillStyle = "#040406";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const scale = Math.min(
            canvas.width / uploadedImage.width,
            canvas.height / uploadedImage.height,
          );
          const drawWidth = uploadedImage.width * scale;
          const drawHeight = uploadedImage.height * scale;
          const drawX = (canvas.width - drawWidth) / 2;
          const drawY = (canvas.height - drawHeight) / 2;

          ctx.drawImage(uploadedImage, drawX, drawY, drawWidth, drawHeight);
        };
        uploadedImage.src = currentScan.sourceDataUrl;
      } else {
        drawBrainSlice(
          ctx,
          canvas.width,
          canvas.height,
          currentScan.imageType,
          currentScan.tumorType,
          showSegment && !!currentScan.tumorType,
          currentScan.tumorX,
          currentScan.tumorY,
          currentScan.tumorRadius,
          isT2Weighting
        );
      }
    } else {
      // Clear to dark backdrop if no scan
      ctx.fillStyle = "#0a0b0d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines for high-tech look
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
  }, [currentScan, showSegment, isT2Weighting]);

  // Handle zooming & panning
  const handleZoomIn = () => setZoom((z) => Math.min(z + 15, 250));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 15, 75));
  const handleResetFilters = () => {
    setContrast(100);
    setBrightness(100);
    setZoom(100);
    setPanX(0);
    setPanY(0);
    setIsT2Weighting(false);
  };

  // Canvas Mouse events for dragging / panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentScan) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => setIsDragging(false);

  // File drag & drop handlers
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/") && !file.name.endsWith(".dcm") && !file.name.endsWith(".nii")) {
      alert("Invalid format. Please upload an MRI scan image (.png, .jpg, .dcm, .nii)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const sizeKB = Math.round(file.size / 1024) + " KB";
      
      const newScan: MriScan = {
        id: "uploaded_" + Date.now(),
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        fileSize: sizeKB,
        imageType: "axial",
        sourceFile: file,
        sourceDataUrl: base64,
      };

      onScanChange(newScan);
      // Automatically analyze the uploaded file!
      onAnalyze(newScan, modelType);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Preloaded samples clicker
  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_SCANS.find((s) => s.id === sampleId);
    if (sample) {
      onScanChange(sample);
      handleResetFilters();
    }
  };

  // Primary prediction confidence metrics extraction
  const mainClass: TumorType = currentScan?.tumorType || "No tumor";
  const mainConfidence = currentScan?.confidence ? (currentScan.confidence * 100).toFixed(1) + "%" : "--";
  const probabilities = currentScan?.probabilities || {
    "Pituitary": 0,
    "Glioma": 0,
    "Meningioma": 0,
    "No tumor": 0,
  };

  // Report tabs
  const [reportTab, setReportTab] = useState<"findings" | "impression" | "recommendations">("findings");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Column: Configuration & Samples (25%) */}
      <section className="lg:col-span-3 flex flex-col gap-5">
        
        {/* Upload Zone */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-2xl text-white">
          <h2 className="text-base font-bold text-white mb-3.5 flex items-center gap-2">
            <Layers className="text-indigo-400 w-5 h-5" />
            Input Configuration
          </h2>
          
          <div className="mb-4">
            <span className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
              Upload MRI scan
            </span>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center transition-all cursor-pointer text-center group ${
                isDragOver 
                  ? "border-emerald-500 bg-emerald-500/10" 
                  : "border-white/15 bg-white/5 hover:bg-white/10"
              }`}
              onClick={() => document.getElementById("mri-file-input")?.click()}
            >
              <input
                id="mri-file-input"
                type="file"
                accept="image/*,.dcm,.nii"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <CloudUpload className="w-10 h-10 text-white/40 mb-2 group-hover:text-indigo-400 transition-colors animate-pulse" />
              <span className="text-xs font-bold text-white/80">Drag &amp; drop or click to upload</span>
              <span className="text-[10px] text-white/40 mt-1">
                Supports DICOM (.dcm), NIfTI (.nii), PNG, JPG
              </span>
            </div>
          </div>

          {/* Model Selection */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
              Model Selection
            </label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-black/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-white"
            >
              <option value="resnet" className="bg-[#16161a]">Transfer Learning ResNet18 (Best)</option>
              <option value="cnn" className="bg-[#16161a]">CNN Baseline</option>
            </select>
            <p className="text-[10px] text-white/55 mt-2 flex items-start gap-1.5 font-medium leading-relaxed">
              <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>ResNet18 utilizes transfer learning with pre-trained visual embeddings.</span>
            </p>
          </div>

          {/* Manual Run Prediction Button */}
          {currentScan && (
            <button
              onClick={() => onAnalyze(currentScan, modelType)}
              disabled={isAnalyzing}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-white/10 disabled:text-white/40 transition-all py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer border border-indigo-500/30"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Classifying Scan...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Run prediction
                </>
              )}
            </button>
          )}
        </div>

        {/* Demo Clinical Scans Panel */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-2xl text-white">
          <h3 className="text-xs font-bold text-white mb-3.5 uppercase tracking-wider border-b border-white/10 pb-2">
            Academic Demo Library
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_SCANS.map((scan) => {
              const isActive = currentScan?.id === scan.id;
              let badgeColor = "bg-white/5 text-white/60 border-white/10";
              if (scan.tumorType === "Pituitary") badgeColor = "bg-amber-500/10 text-amber-300 border-amber-500/20";
              else if (scan.tumorType === "Glioma") badgeColor = "bg-red-500/10 text-red-300 border-red-500/20";
              else if (scan.tumorType === "Meningioma") badgeColor = "bg-sky-500/10 text-sky-300 border-sky-500/20";
              else if (scan.tumorType === "No tumor") badgeColor = "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";

              return (
                <button
                  key={scan.id}
                  onClick={() => handleSelectSample(scan.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between h-24 transition-all hover:scale-[1.02] cursor-pointer ${
                    isActive 
                      ? "border-indigo-500 bg-indigo-500/20 ring-1 ring-indigo-500" 
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="text-[10px] font-bold text-white line-clamp-1 leading-tight mb-1">
                    {scan.fileName.replace("mri_slice_", "")}
                  </div>
                  <div className="flex flex-col gap-1 items-start">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border ${badgeColor}`}>
                      {scan.tumorType}
                    </span>
                    <span className="text-[9px] text-white/40 font-medium">
                      Size: {scan.fileSize}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </section>

      {/* Center Column: Diagnostic Visor (50%) */}
      <section className="lg:col-span-6 flex flex-col gap-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[24px] flex flex-col overflow-hidden shadow-2xl text-white">
          
          {/* Viewer Header */}
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              Diagnostic Visor
            </h2>
            
            <div className="flex gap-1">
              <button
                onClick={handleZoomIn}
                disabled={!currentScan}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                disabled={!currentScan}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetFilters}
                disabled={!currentScan}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                title="Reset View Parameters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MRI Viewer Interactive Canvas Container */}
          <div className="bg-[#040406] relative flex items-center justify-center p-0 select-none overflow-hidden h-[420px]">
            {/* Simulated crosshair background lines when scan is active */}
            {currentScan && (
              <div className="absolute inset-0 pointer-events-none border border-white/5 flex items-center justify-center">
                <div className="absolute w-full h-[1px] bg-white/5"></div>
                <div className="absolute h-full w-[1px] bg-white/5"></div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={512}
              height={512}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                transform: `scale(${zoom / 100}) translate(${panX}px, ${panY}px)`,
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
                cursor: currentScan ? (isDragging ? "grabbing" : "grab") : "default",
              }}
              className="max-w-full max-h-full aspect-square bg-[#040406]"
            />

            {!currentScan && (
              <div className="absolute text-center flex flex-col items-center gap-2 max-w-xs z-10 p-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-1 text-white/60">
                  <File className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white/80">
                  No scan loaded
                </p>
                <p className="text-[11px] text-white/40">
                  Select an academic demo from the library or upload a custom brain MRI to start.
                </p>
              </div>
            )}

            {/* Calibration HUD metadata when image is present */}
            {currentScan && (
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-[10px] text-white/60 border border-white/10 p-2.5 rounded-xl font-mono space-y-0.5 leading-relaxed pointer-events-none">
                <div><span className="text-white/30">FILE:</span> {currentScan.fileName}</div>
                <div><span className="text-white/30">MATRIX:</span> 512 x 512 px</div>
                <div><span className="text-white/30">WEIGHT:</span> {isT2Weighting ? "T2-Weighted (Fluid)" : "T1-Weighted (Contrast)"}</div>
                <div><span className="text-white/30">PRE:</span> RGB Normalization [0-1]</div>
              </div>
            )}

            {/* In-Visor HUD actions */}
            {currentScan && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                <button
                  onClick={() => setShowSegment((s) => !s)}
                  className={`text-[9px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    showSegment 
                      ? "bg-teal-500 text-black font-extrabold" 
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                  title="Toggle segmentation map contour overlay"
                >
                  Segment Mask
                </button>
                <button
                  onClick={() => setIsT2Weighting((t) => !t)}
                  className={`text-[9px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    isT2Weighting 
                      ? "bg-indigo-600 text-white font-extrabold border border-indigo-500/30" 
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                  title="Toggle T1/T2 Weighting simulation"
                >
                  T2 Weight
                </button>
              </div>
            )}

            {/* Analysis progress loading overlay */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-20"
                >
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-teal-400 animate-spin"></div>
                    <div className="absolute inset-2 bg-black rounded-full flex items-center justify-center">
                      <Microscope className="w-5 h-5 text-teal-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-xs font-bold text-white tracking-widest uppercase">
                      NEUROSCAN CLASSIFIER RUNNING
                    </h4>
                    <p className="text-[10px] text-white/40 mt-1 font-mono">
                      Extracting spatial deep feature maps...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Real-time Fine Tuning Panel */}
          {currentScan && (
            <div className="p-4 bg-white/5 border-t border-white/10 grid grid-cols-2 gap-4">
              <div>
                <label className="flex justify-between text-[11px] font-semibold text-white/60 mb-1">
                  <span>Contrast</span>
                  <span className="font-mono text-white/40">{contrast}%</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1 bg-white/10 rounded-full appearance-none"
                />
              </div>
              <div>
                <label className="flex justify-between text-[11px] font-semibold text-white/60 mb-1">
                  <span>Brightness</span>
                  <span className="font-mono text-white/40">{brightness}%</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1 bg-white/10 rounded-full appearance-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Diagnostic Report Tabs (Findings, Impression, Recommendations) */}
        {currentScan && currentScan.report && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-2xl text-white flex flex-col">
            <h3 className="text-xs font-bold text-white mb-3.5 uppercase tracking-wider flex items-center gap-2">
              <BriefcaseMedical className="text-indigo-400 w-4 h-4" />
              Clinical Neuroimaging Report
            </h3>
            
            {/* Tabs Selector */}
            <div className="flex border-b border-white/10 mb-4 text-xs font-bold">
              <button
                onClick={() => setReportTab("findings")}
                className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                  reportTab === "findings" 
                    ? "border-indigo-400 text-indigo-300" 
                    : "border-transparent text-white/40 hover:text-white/80"
                }`}
              >
                Findings
              </button>
              <button
                onClick={() => setReportTab("impression")}
                className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                  reportTab === "impression" 
                    ? "border-indigo-400 text-indigo-300" 
                    : "border-transparent text-white/40 hover:text-white/80"
                }`}
              >
                Impression
              </button>
              <button
                onClick={() => setReportTab("recommendations")}
                className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                  reportTab === "recommendations" 
                    ? "border-indigo-400 text-indigo-300" 
                    : "border-transparent text-white/40 hover:text-white/80"
                }`}
              >
                Recommendations
              </button>
            </div>

            {/* Tab Content */}
            <div className="text-xs text-white/70 leading-relaxed min-h-[120px] whitespace-pre-line font-normal">
              {reportTab === "findings" && currentScan.report.findings}
              {reportTab === "impression" && currentScan.report.impression}
              {reportTab === "recommendations" && currentScan.report.recommendations}
            </div>

            {/* Signature Footer */}
            <div className="border-t border-white/10 mt-4 pt-3 flex justify-between items-center text-[10px] text-white/40 font-mono">
              <div>
                ANALYZED BY: <span className="font-semibold text-white/65">{currentScan.report.analyzedBy}</span>
              </div>
              <div>
                DATE: <span className="font-semibold text-white/65">{new Date(currentScan.report.analysisDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* Right Column: Prediction Metrics & Class Probabilities (25%) */}
      <section className="lg:col-span-3 flex flex-col gap-5">
        
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-2xl text-white h-full flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-4 border-b border-white/10 pb-2.5 flex items-center gap-2">
              <Activity className="text-indigo-400 w-5 h-5" />
              Prediction Result
            </h2>

            {/* Big primary classification block */}
            <div className="text-center mb-6 py-5 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
              <p className="text-[10px] font-bold text-white/45 uppercase tracking-widest mb-1.5">
                Primary Classification
              </p>
              <p className="text-2xl font-bold text-white tracking-tight leading-none mb-2">
                {mainClass}
              </p>
              <p className="text-xs text-indigo-300 font-bold flex items-center justify-center gap-1 mt-3">
                {currentScan?.tumorType ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {mainConfidence} confidence
                  </>
                ) : (
                  <span className="text-white/40 font-normal">Run classification</span>
                )}
              </p>
            </div>

            {/* Class Probabilities Progress bars */}
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4 border-b border-white/10 pb-1.5">
              Class Probabilities
            </h3>

            <div className="space-y-4">
              {Object.keys(probabilities).map((key) => {
                const type = key as TumorType;
                const probValue = probabilities[type] * 100;
                const isPrimary = currentScan?.tumorType === type;
                
                // Color mapping
                let barColor = "bg-white/10";
                if (isPrimary) {
                  if (type === "Pituitary") barColor = "bg-amber-500";
                  else if (type === "Glioma") barColor = "bg-red-500";
                  else if (type === "Meningioma") barColor = "bg-sky-500";
                  else if (type === "No tumor") barColor = "bg-emerald-500";
                }

                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className={isPrimary ? "text-white font-bold" : "text-white/50 font-medium"}>
                        {type}
                      </span>
                      <span className={isPrimary ? "text-indigo-300 font-bold" : "text-white/30 font-mono"}>
                        {probValue.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${probValue}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${barColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-[10px] text-white/40 leading-relaxed font-medium">
            <Info className="w-3.5 h-3.5 text-indigo-400 inline-block mr-1.5 align-text-bottom" />
            Class values are processed in real-time by the selected neural model. Probability mapping sums to 1.0.
          </div>
        </div>

      </section>

    </div>
  );
}
