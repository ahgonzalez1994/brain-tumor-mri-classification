import json
from pathlib import Path
from typing import Dict, Optional

from PIL import Image

import torch
import torch.nn as nn
from torchvision import models, transforms


CLASS_NAMES = ["glioma", "meningioma", "notumor", "pituitary"]

CLASS_LABELS_ES = {
    "glioma": "Glioma",
    "meningioma": "Meningioma",
    "notumor": "Sin tumor",
    "pituitary": "Tumor pituitario",
}

IMAGE_SIZE = 224
BASELINE_MEAN = (0.5, 0.5, 0.5)
BASELINE_STD = (0.5, 0.5, 0.5)
IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)

MODEL_OPTIONS = {
    "baseline": {
        "id": "baseline",
        "name": "CNN Baseline",
        "description": "CNN clasica entrenada desde cero.",
        "model_path": "models/cnn_baseline_best.pth",
        "metrics_path": "outputs/metrics/cnn_baseline_metrics.json",
        "normalization": "baseline",
        "accuracy": 0.7931,
        "f1_macro": 0.7860,
    },
    "transfer": {
        "id": "transfer",
        "name": "Transfer Learning ResNet18",
        "description": "Modelo ResNet18 con transfer learning.",
        "model_path": "models/transfer_resnet18.pth",
        "metrics_path": "outputs/metrics/transfer_resnet18_metrics.json",
        "normalization": "imagenet",
        "accuracy": 0.8813,
        "f1_macro": 0.8787,
    },
}

_MODEL_CACHE: Dict[str, nn.Module] = {}


class BrainTumorBaselineCNN(nn.Module):
    def __init__(self, num_classes: int = len(CLASS_NAMES)):
        super().__init__()

        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2),

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2),

            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2),

            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2),
        )

        self.global_pool = nn.AdaptiveAvgPool2d((1, 1))

        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(p=0.4),
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.3),
            nn.Linear(128, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.global_pool(x)
        x = self.classifier(x)
        return x


def get_project_root() -> Path:
    return Path(__file__).resolve().parents[2]


def get_device() -> torch.device:
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def get_available_models():
    return [
        {
            "id": option["id"],
            "name": option["name"],
            "description": option["description"],
            "accuracy": option["accuracy"],
            "f1_macro": option["f1_macro"],
        }
        for option in MODEL_OPTIONS.values()
    ]


def check_model_files(project_root: Optional[Path] = None) -> Dict[str, bool]:
    project_root = project_root or get_project_root()

    return {
        model_id: (project_root / option["model_path"]).exists()
        for model_id, option in MODEL_OPTIONS.items()
    }


def build_baseline_model() -> nn.Module:
    return BrainTumorBaselineCNN(num_classes=len(CLASS_NAMES))


def build_transfer_model() -> nn.Module:
    model = models.resnet18(weights=None)
    num_features = model.fc.in_features

    model.fc = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(num_features, len(CLASS_NAMES)),
    )

    return model


def extract_state_dict(checkpoint):
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        return checkpoint["model_state_dict"]

    return checkpoint


def load_model(model_id: str, project_root: Optional[Path] = None) -> nn.Module:
    if model_id not in MODEL_OPTIONS:
        raise ValueError(f"Modelo no reconocido: {model_id}")

    if model_id in _MODEL_CACHE:
        return _MODEL_CACHE[model_id]

    project_root = project_root or get_project_root()
    model_path = project_root / MODEL_OPTIONS[model_id]["model_path"]

    if not model_path.exists():
        raise FileNotFoundError(f"No se encontro el archivo del modelo: {model_path}")

    if model_id == "baseline":
        model = build_baseline_model()
    elif model_id == "transfer":
        model = build_transfer_model()
    else:
        raise ValueError(f"Modelo no reconocido: {model_id}")

    device = get_device()
    checkpoint = torch.load(model_path, map_location=device)
    state_dict = extract_state_dict(checkpoint)

    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()

    _MODEL_CACHE[model_id] = model
    return model


def get_eval_transform(model_id: str):
    if model_id not in MODEL_OPTIONS:
        raise ValueError(f"Modelo no reconocido: {model_id}")

    normalization = MODEL_OPTIONS[model_id]["normalization"]

    if normalization == "imagenet":
        mean = IMAGENET_MEAN
        std = IMAGENET_STD
    else:
        mean = BASELINE_MEAN
        std = BASELINE_STD

    return transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean, std),
    ])


def preprocess_image(image: Image.Image, model_id: str) -> torch.Tensor:
    image_rgb = image.convert("RGB")
    transform = get_eval_transform(model_id)
    image_tensor = transform(image_rgb)
    return image_tensor.unsqueeze(0)


def load_metrics(model_id: str, project_root: Optional[Path] = None) -> Dict:
    if model_id not in MODEL_OPTIONS:
        raise ValueError(f"Modelo no reconocido: {model_id}")

    project_root = project_root or get_project_root()
    metrics_path = project_root / MODEL_OPTIONS[model_id]["metrics_path"]

    if not metrics_path.exists():
        return {}

    with open(metrics_path, "r", encoding="utf-8") as file:
        return json.load(file)


def predict_image(image: Image.Image, model_id: str) -> Dict:
    if model_id not in MODEL_OPTIONS:
        raise ValueError(f"Modelo no reconocido: {model_id}")

    model = load_model(model_id=model_id)
    device = get_device()
    input_tensor = preprocess_image(image=image, model_id=model_id).to(device)

    with torch.no_grad():
        logits = model(input_tensor)
        probabilities_tensor = torch.softmax(logits, dim=1).squeeze(0).cpu()

    probabilities = {
        class_name: float(probabilities_tensor[index])
        for index, class_name in enumerate(CLASS_NAMES)
    }

    sorted_probabilities = [
        {
            "class_name": class_name,
            "class_label": CLASS_LABELS_ES[class_name],
            "probability": probability,
            "probability_pct": f"{probability * 100:.2f}%",
        }
        for class_name, probability in sorted(
            probabilities.items(),
            key=lambda item: item[1],
            reverse=True,
        )
    ]

    predicted_index = int(torch.argmax(probabilities_tensor).item())
    predicted_class = CLASS_NAMES[predicted_index]
    confidence = probabilities[predicted_class]
    model_info = MODEL_OPTIONS[model_id]

    return {
        "model_id": model_id,
        "model_name": model_info["name"],
        "predicted_class": predicted_class,
        "predicted_label": CLASS_LABELS_ES[predicted_class],
        "confidence": confidence,
        "confidence_pct": f"{confidence * 100:.2f}%",
        "probabilities": probabilities,
        "sorted_probabilities": sorted_probabilities,
        "class_names": CLASS_NAMES,
        "image_size": IMAGE_SIZE,
        "metrics": load_metrics(model_id),
        "disclaimer": "Resultado academico. No usar para diagnostico clinico.",
    }
