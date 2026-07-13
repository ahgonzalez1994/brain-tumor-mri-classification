import { Patient, ResearchPaper, TumorType } from "./types";

// Static metrics for comparison
export const resnetMetrics = {
  name: "ResNet18 (Transfer Learning)",
  accuracy: 88.13,
  precision: 88.95,
  recall: 88.13,
  f1Score: 87.87,
};

export const cnnMetrics = {
  name: "CNN Baseline",
  accuracy: 79.31,
  precision: 81.93,
  recall: 79.31,
  f1Score: 78.60,
};

// High-quality brain MRI rendering function on HTML5 canvas
export function drawBrainSlice(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  type: 'axial' | 'sagittal' | 'coronal',
  tumorType?: TumorType,
  showSegment?: boolean,
  tumorX: number = 50,
  tumorY: number = 50,
  tumorRadius: number = 15,
  isT2Weighting: boolean = false
) {
  // Clear canvas
  ctx.fillStyle = "#0c0d10";
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  
  // Center brain
  const cx = width / 2;
  const cy = height / 2;
  const radiusX = width * 0.38;
  const radiusY = height * 0.44;

  // 1. Draw outer skull (cortical bone is black, subcutaneous fat is bright white/gray)
  ctx.shadowColor = "rgba(255, 255, 255, 0.05)";
  ctx.shadowBlur = 15;
  ctx.fillStyle = "#1e222b"; // Subcutaneous fat
  ctx.beginPath();
  ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark skull bone layer
  ctx.fillStyle = "#0a0b0d";
  ctx.beginPath();
  ctx.ellipse(cx, cy, radiusX - 6, radiusY - 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Brain tissue outer border
  ctx.fillStyle = isT2Weighting ? "#333b4d" : "#282a32"; // Gray matter outer layer
  ctx.beginPath();
  ctx.ellipse(cx, cy, radiusX - 12, radiusY - 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // White matter interior (axial pattern)
  ctx.fillStyle = isT2Weighting ? "#181d24" : "#454854"; // White matter is darker in T2, lighter in T1
  ctx.beginPath();
  ctx.ellipse(cx, cy, radiusX - 30, radiusY - 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw some cerebral gyri / folds (symmetric lobes)
  ctx.strokeStyle = isT2Weighting ? "#45536c" : "#1f2128";
  ctx.lineWidth = 1.5;

  const drawFolds = (side: 'left' | 'right') => {
    const dir = side === 'left' ? -1 : 1;
    for (let i = 0; i < 7; i++) {
      const yOffset = cy - radiusY * 0.6 + i * (radiusY * 0.2);
      ctx.beginPath();
      ctx.moveTo(cx + dir * 5, yOffset);
      ctx.bezierCurveTo(
        cx + dir * (radiusX * 0.4), yOffset - 10,
        cx + dir * (radiusX * 0.8), yOffset + 5,
        cx + dir * (radiusX * 0.7), yOffset + 20
      );
      ctx.stroke();
    }
  };
  drawFolds('left');
  drawFolds('right');

  // Longitudinal fissure (midline separator)
  ctx.beginPath();
  ctx.strokeStyle = isT2Weighting ? "#5e7193" : "#14151a";
  ctx.lineWidth = 2.5;
  ctx.moveTo(cx, cy - radiusY + 12);
  ctx.lineTo(cx, cy + radiusY - 12);
  ctx.stroke();

  // 2. Draw lateral ventricles (fluid-filled - bright on T2, very dark on T1)
  ctx.fillStyle = isT2Weighting ? "#93c5fd" : "#0d0e12";
  ctx.beginPath();
  // Left ventricle (butterfly wing)
  ctx.moveTo(cx - 2, cy - 40);
  ctx.bezierCurveTo(cx - 28, cy - 50, cx - 35, cy - 10, cx - 8, cy + 15);
  ctx.bezierCurveTo(cx - 4, cy + 8, cx - 2, cy, cx - 2, cy - 40);
  // Right ventricle (butterfly wing)
  ctx.moveTo(cx + 2, cy - 40);
  ctx.bezierCurveTo(cx + 28, cy - 50, cx + 35, cy - 10, cx + 8, cy + 15);
  ctx.bezierCurveTo(cx + 4, cy + 8, cx + 2, cy, cx + 2, cy - 40);
  ctx.fill();

  // Brain stem / thalamus structures (center)
  ctx.fillStyle = isT2Weighting ? "#2c3444" : "#5a5f6e";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 30, 20, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isT2Weighting ? "#4c5567" : "#717684";
  ctx.beginPath();
  ctx.ellipse(cx - 14, cy + 15, 12, 16, 0.2, 0, Math.PI * 2);
  ctx.ellipse(cx + 14, cy + 15, 12, 16, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // 3. Draw tumor lesion if configured
  if (tumorType && tumorType !== "No tumor") {
    // Translate relative tumor percentage coordinate to canvas absolute coordinates
    const tx = width * (tumorX / 100);
    const ty = height * (tumorY / 100);
    const tr = width * (tumorRadius / 100);

    // Core necrotic/cystic fluid (heterogeneous look)
    const tumorGrad = ctx.createRadialGradient(tx, ty, tr * 0.1, tx, ty, tr);
    
    if (tumorType === "Glioma") {
      // Infiltrative ring-enhancing look
      tumorGrad.addColorStop(0, "#1c1c1f"); // Necrotic center (dark on T1)
      tumorGrad.addColorStop(0.3, "#3d3e45");
      tumorGrad.addColorStop(0.7, "#eaebf0"); // Bright hyperintense rim
      tumorGrad.addColorStop(1, "rgba(90, 100, 110, 0)"); // Fading border (vasogenic edema)
      
      // Draw irregular edema ring around it
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.arc(tx, ty, tr * 1.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (tumorType === "Meningioma") {
      // Uniform, intensely enhancing well-circumscribed dural-based mass
      tumorGrad.addColorStop(0, "#ffffff");
      tumorGrad.addColorStop(0.5, "#dcdfe6");
      tumorGrad.addColorStop(0.9, "#a8b1c4");
      tumorGrad.addColorStop(1, "rgba(50, 60, 70, 0)");
      
      // Dural tail connection (extra line)
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(tx + tr * 1.5, ty - tr * 0.5, cx + radiusX * 0.8, cy);
      ctx.stroke();
    } else if (tumorType === "Pituitary") {
      // Near center sella area
      tumorGrad.addColorStop(0, "#ffffff");
      tumorGrad.addColorStop(0.6, "#cdd3e0");
      tumorGrad.addColorStop(0.9, "#808ca8");
      tumorGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    }

    ctx.fillStyle = tumorGrad;
    ctx.beginPath();
    
    // Make glioma irregular shaped
    if (tumorType === "Glioma") {
      ctx.moveTo(tx + tr, ty);
      for (let theta = 0; theta < Math.PI * 2; theta += 0.3) {
        const offset = (Math.sin(theta * 6) * 0.15 + Math.cos(theta * 3) * 0.08) * tr;
        const xPos = tx + Math.cos(theta) * (tr + offset);
        const yPos = ty + Math.sin(theta) * (tr + offset);
        ctx.lineTo(xPos, yPos);
      }
    } else {
      ctx.arc(tx, ty, tr, 0, Math.PI * 2);
    }
    ctx.closePath();
    ctx.fill();

    // 4. Draw active segmentation overlay mask (clinical verde/teal neon)
    if (showSegment) {
      ctx.shadowColor = "#14b8a6";
      ctx.shadowBlur = 10;
      ctx.strokeStyle = "#0df5ce";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      
      if (tumorType === "Glioma") {
        ctx.moveTo(tx + tr, ty);
        for (let theta = 0; theta < Math.PI * 2; theta += 0.2) {
          const offset = (Math.sin(theta * 6) * 0.15 + Math.cos(theta * 3) * 0.08) * tr;
          const xPos = tx + Math.cos(theta) * (tr + offset + 3);
          const yPos = ty + Math.sin(theta) * (tr + offset + 3);
          ctx.lineTo(xPos, yPos);
        }
      } else {
        ctx.arc(tx, ty, tr + 3, 0, Math.PI * 2);
      }
      ctx.closePath();
      ctx.stroke();
      
      // Add crosshair over center of tumor
      ctx.strokeStyle = "rgba(13, 245, 206, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx - tr * 1.5, ty);
      ctx.lineTo(tx + tr * 1.5, ty);
      ctx.moveTo(tx, ty - tr * 1.5);
      ctx.lineTo(tx, ty + tr * 1.5);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// 4 Preconfigured Academic Sample scans for the Visor
export const SAMPLE_SCANS = [
  {
    id: "scan_pituitary_1",
    fileName: "mri_slice_pituitary_adenoma.dcm",
    uploadedAt: "2026-07-09T14:22:00-07:00",
    fileSize: "512 KB",
    imageType: "axial" as const,
    tumorType: "Pituitary" as const,
    tumorX: 50,
    tumorY: 62,
    tumorRadius: 10,
    confidence: 0.964,
    probabilities: {
      "Pituitary": 0.964,
      "Glioma": 0.018,
      "Meningioma": 0.011,
      "No tumor": 0.007
    },
    report: {
      findings: "Axial T1-weighted post-contrast sequence demonstrates a well-demarcated, intensely enhancing mass lesion within the sella turcica, measuring approximately 1.4 cm. The lesion shows moderate superior expansion with mild abutment of the optic chiasm. Normal pituitary gland structure is compressed laterally. No cavernous sinus invasion is observed, with normal bilateral carotid flow voids preserved. Ventricular system is within normal limits for age with no evidence of hydrocephalus or midline shift.",
      impression: "Intrasellar enhancing mass consistent with a Pituitary Macroadenoma. Mild superior extension with optical chiasm contact, but no apparent structural mass effect or carotid encasement.",
      recommendations: "1. Visual field perimetry testing is advised to rule out subclinical bitemporal hemianopsia.\n2. Serum hormone profiling including prolactin, ACTH, GH, cortisol, and thyroid panel.\n3. Referral to endocrinology and neurosurgery for academic clinical consensus review.",
      analyzedBy: "ResNet18-V2 + Gemini Multimodal",
      analysisDate: "2026-07-09T14:25:12-07:00"
    }
  },
  {
    id: "scan_glioma_1",
    fileName: "mri_slice_glioblastoma_multiforme.dcm",
    uploadedAt: "2026-07-08T10:15:00-07:00",
    fileSize: "768 KB",
    imageType: "axial" as const,
    tumorType: "Glioma" as const,
    tumorX: 38,
    tumorY: 45,
    tumorRadius: 17,
    confidence: 0.912,
    probabilities: {
      "Pituitary": 0.012,
      "Glioma": 0.912,
      "Meningioma": 0.064,
      "No tumor": 0.012
    },
    report: {
      findings: "High-resolution MRI images reveal a large, infiltrative, heterogeneous lesion in the left frontoparietal lobe. The lesion displays high signal intensity on T2/FLAIR with irregular, thick ring-enhancement following contrast administration. Associated moderate vasogenic edema is present, resulting in partial compression of the left lateral ventricle and an approximate 4mm rightward midline shift. Cortical sulci in the left hemisphere are effaced. No acute intracranial hemorrhage or territorial infarction detected.",
      impression: "Large infiltrative ring-enhancing left frontoparietal mass lesion, highly suggestive of high-grade Glioma (e.g., glioblastoma/astrocytoma) with associated mass effect and midline shift.",
      recommendations: "1. Advanced MR spectroscopy or perfusion imaging to better characterize cellular density.\n2. High-dose corticosteroid therapy (dexamethasone) to address vasogenic edema as clinically indicated.\n3. Urgent neurosurgical consultation for biopsy/resection planning.",
      analyzedBy: "ResNet18-V2 + Gemini Multimodal",
      analysisDate: "2026-07-08T10:19:30-07:00"
    }
  },
  {
    id: "scan_meningioma_1",
    fileName: "mri_slice_convexity_meningioma.nii",
    uploadedAt: "2026-07-06T16:45:00-07:00",
    fileSize: "1.2 MB",
    imageType: "axial" as const,
    tumorType: "Meningioma" as const,
    tumorX: 68,
    tumorY: 35,
    tumorRadius: 13,
    confidence: 0.895,
    probabilities: {
      "Pituitary": 0.005,
      "Glioma": 0.041,
      "Meningioma": 0.895,
      "No tumor": 0.059
    },
    report: {
      findings: "There is a dural-based, extra-axial mass lesion along the right cerebral convexity. The lesion is sharply circumscribed, isointense on T1-weighted images, and exhibits homogenous intense enhancement on post-contrast sequences. A distinct 'dural tail' sign is visualized. The adjacent brain parenchyma shows mild compression with a narrow cerebrospinal fluid cleft present, and minimal surrounding vasogenic edema. No deep white matter invasion or bony erosion is seen.",
      impression: "Extra-axial, dural-based enhancing mass along the right cerebral convexity, characteristic of a Meningioma (likely benign, WHO Grade I). Mild localized compressive mass effect without ventricular compromise.",
      recommendations: "1. Serial surveillance MRI in 6 months to assess rate of volumetric growth.\n2. Neurosurgical consultation to discuss conservative observation versus elective surgical resection based on patient symptomatology.",
      analyzedBy: "ResNet18-V2 + Gemini Multimodal",
      analysisDate: "2026-07-06T16:51:04-07:00"
    }
  },
  {
    id: "scan_normal_1",
    fileName: "mri_slice_healthy_brain_baseline.png",
    uploadedAt: "2026-07-05T09:30:00-07:00",
    fileSize: "420 KB",
    imageType: "axial" as const,
    tumorType: "No tumor" as const,
    tumorX: 50,
    tumorY: 50,
    tumorRadius: 0,
    confidence: 0.981,
    probabilities: {
      "Pituitary": 0.004,
      "Glioma": 0.008,
      "Meningioma": 0.007,
      "No tumor": 0.981
    },
    report: {
      findings: "Symmetric, normal configuration of the cerebral cortex, cerebellum, and brainstem. There is no evidence of intra- or extra-axial mass lesions, restricted diffusion, or abnormal parenchymal enhancement. Ventricles and sulci are normal in size and appearance for the patient's age. The midline is centered with no mass effect. Major intracranial arterial structures show intact flow voids. Mastoid air cells and paranasal sinuses are clear.",
      impression: "Unremarkable MRI of the brain. No intracranial mass lesion, abnormal enhancement, or findings suggestive of neoplastic processes.",
      recommendations: "1. No acute neuroimaging follow-up required. Normal academic screening baseline established.",
      analyzedBy: "ResNet18-V2 + Gemini Multimodal",
      analysisDate: "2026-07-05T09:34:40-07:00"
    }
  }
];

// Mock academic research library papers
export const RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: "paper_1",
    title: "Deep Learning for Brain Tumor Classification on MRI Images: A Review",
    authors: "R. Gonzalez, M. K. Al-Saeed, S. J. Patel",
    journal: "Journal of Medical Neuroimaging Research",
    year: 2024,
    doi: "10.1016/j.medneuro.2024.01.015",
    summary: "This comprehensive review compares classic CNN architectures with modern transfer learning techniques (ResNet, EfficientNet, ViTs) on Brain Tumor datasets like BraTS and Figshare. It highlights why deep architectures like ResNet18 show significantly higher precision in differentiating extra-axial Meningiomas from Pituitary tumors due to fine-grained spatial feature extraction.",
    url: "https://arxiv.org/abs/2304.09811"
  },
  {
    id: "paper_2",
    title: "Transfer Learning on Small Datasets for Neuroradiology Decision Support",
    authors: "L. Chen, F. Müller, A. Kenshin",
    journal: "Academic Neuroradiology Quarterly",
    year: 2023,
    doi: "10.1109/ANQ.2023.2359",
    summary: "A study on utilizing ResNet18 pre-trained on ImageNet with fine-tuning for diagnostic MRI classification. This research proves that even with less than 3,000 unique sagittal and axial DICOM scans, transferring weights yields 88.1% accuracy on four classes (Glioma, Meningioma, Pituitary, Normal), whereas baseline simple CNNs flatten around 79.3%.",
    url: "https://arxiv.org/abs/2209.11210"
  },
  {
    id: "paper_3",
    title: "Diagnostic Challenges in Pituitary Micro vs. Macroadenomas on T1 Contrast",
    authors: "S. Thorne, H. Cho, G. Bennett",
    journal: "Annals of Clinical Endocrinological Imaging",
    year: 2025,
    doi: "10.1210/acei.2025.101",
    summary: "The authors analyze cases where clinical neural networks misclassify pituitary tumors as meningiomas or vice versa, demonstrating that the focal sella-turcica origin is the prime spatial distinguishing coordinate. Suggests combining bounding-box segmentation maps to guide medical trainees during diagnosis.",
    url: "https://pubmed.ncbi.nlm.nih.gov/3028392"
  },
  {
    id: "paper_4",
    title: "Automated Segmentation of Glioma Edema Boundaries on FLAIR Sequences",
    authors: "T. J. Vance, L. P. Robinson",
    journal: "Computerized Medical Imaging and Graphics",
    year: 2022,
    doi: "10.1016/j.compmedimag.2022.102049",
    summary: "Focuses on the clinical importance of isolating active glioma tumors from surrounding vasogenic edema using automatic contouring. Features detailed comparison charts of false-positive boundaries in simple CNN baseline segmentation models vs advanced ResNets.",
    url: "https://doi.org/10.1016/j.compmedimag.2022.102049"
  }
];

// Mock clinical patients with imaging history
export const CLINICAL_PATIENTS: Patient[] = [
  {
    id: "pat_01",
    name: "Eleanor Vance",
    age: 42,
    gender: "F",
    medicalId: "MRN-849-2311",
    scans: [
      SAMPLE_SCANS[0] // Pituitary
    ],
    primaryDiagnosis: "Pituitary",
    lastVisit: "2026-07-09"
  },
  {
    id: "pat_02",
    name: "Arthur Pendelton",
    age: 58,
    gender: "M",
    medicalId: "MRN-335-9014",
    scans: [
      SAMPLE_SCANS[1] // Glioma
    ],
    primaryDiagnosis: "Glioma",
    lastVisit: "2026-07-08"
  },
  {
    id: "pat_03",
    name: "Isabella Cruz",
    age: 31,
    gender: "F",
    medicalId: "MRN-119-4822",
    scans: [
      SAMPLE_SCANS[2] // Meningioma
    ],
    primaryDiagnosis: "Meningioma",
    lastVisit: "2026-07-06"
  },
  {
    id: "pat_04",
    name: "Marcus Aurelius",
    age: 49,
    gender: "M",
    medicalId: "MRN-554-1002",
    scans: [
      SAMPLE_SCANS[3] // Normal Healthy
    ],
    primaryDiagnosis: "No tumor",
    lastVisit: "2026-07-05"
  },
  {
    id: "pat_05",
    name: "Timothy Finch",
    age: 26,
    gender: "M",
    medicalId: "MRN-772-3341",
    scans: [],
    primaryDiagnosis: undefined,
    lastVisit: "2026-07-10"
  }
];
