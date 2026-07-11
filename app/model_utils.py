import json
from pathlib import Path
from typing import Dict, List, Optional

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

MODEL_OPTIONS = {
    "transfer_resnet18": {
        "display_name": "Transfer Learning - ResNet18",
        "model_path": "models/transfer_resnet18.pth",
        "metrics_path": "outputs/metrics/transfer_resnet18_metrics.json",
        "normalization": "imagenet",
        "description": "Modelo con transfer learning basado en ResNet18.",
    },
    "cnn_baseline": {
        "display_name": "CNN Baseline",
        "model_path": "models/cnn_baseline_best.pth",
        "metrics_path": "outputs/metrics/cnn_baseline_metrics.json",
        "normalization": "baseline",
        "description": "CNN clasica entrenada desde cero.",
    },
}

IMAGE_SIZE = 224
BASELINE_MEAN = (0.5, 0.5, 0.5)
BASELINE_STD = (0.5, 0.5, 0.5)
IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


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
    return Path(__file__).resolve().parents[1]


def get_device() -> torch.device:
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


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


def load_model(model_key: str, project_root: Optional[Path] = None) -> nn.Module:
    if model_key not in MODEL_OPTIONS:
        raise ValueError(f"Modelo no reconocido: {model_key}")

    project_root = project_root or get_project_root()
    model_path = project_root / MODEL_OPTIONS[model_key]["model_path"]

    if not model_path.exists():
        raise FileNotFoundError(f"No se encontro el archivo del modelo: {model_path}")

    if model_key == "cnn_baseline":
        model = build_baseline_model()
    elif model_key == "transfer_resnet18":
        model = build_transfer_model()
    else:
        raise ValueError(f"Modelo no reconocido: {model_key}")

    device = get_device()
    checkpoint = torch.load(model_path, map_location=device)
    state_dict = extract_state_dict(checkpoint)

    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()

    return model


def get_eval_transform(model_key: str):
    if model_key not in MODEL_OPTIONS:
        raise ValueError(f"Modelo no reconocido: {model_key}")

    normalization = MODEL_OPTIONS[model_key]["normalization"]

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


def preprocess_image(image: Image.Image, model_key: str) -> torch.Tensor:
    image_rgb = image.convert("RGB")
    transform = get_eval_transform(model_key)
    image_tensor = transform(image_rgb)
    image_tensor = image_tensor.unsqueeze(0)

    return image_tensor


def predict_image(
    image: Image.Image,
    model_key: str,
    project_root: Optional[Path] = None,
) -> Dict:
    model = load_model(model_key=model_key, project_root=project_root)
    device = get_device()

    input_tensor = preprocess_image(image=image, model_key=model_key).to(device)

    with torch.no_grad():
        logits = model(input_tensor)
        probabilities_tensor = torch.softmax(logits, dim=1).squeeze(0).cpu()

    probabilities = {
        class_name: float(probabilities_tensor[index])
        for index, class_name in enumerate(CLASS_NAMES)
    }

    predicted_index = int(torch.argmax(probabilities_tensor).item())
    predicted_class = CLASS_NAMES[predicted_index]
    confidence = probabilities[predicted_class]

    return {
        "model_key": model_key,
        "model_name": MODEL_OPTIONS[model_key]["display_name"],
        "predicted_class": predicted_class,
        "predicted_label": CLASS_LABELS_ES[predicted_class],
        "confidence": confidence,
        "probabilities": probabilities,
        "class_names": CLASS_NAMES,
        "image_size": IMAGE_SIZE,
    }


def load_metrics(model_key: str, project_root: Optional[Path] = None) -> Dict:
    if model_key not in MODEL_OPTIONS:
        raise ValueError(f"Modelo no reconocido: {model_key}")

    project_root = project_root or get_project_root()
    metrics_path = project_root / MODEL_OPTIONS[model_key]["metrics_path"]

    if not metrics_path.exists():
        return {}

    with open(metrics_path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_all_metrics(project_root: Optional[Path] = None) -> Dict[str, Dict]:
    return {
        model_key: load_metrics(model_key=model_key, project_root=project_root)
        for model_key in MODEL_OPTIONS
    }


def format_probability(value: float) -> str:
    return f"{value * 100:.2f}%"


def get_sorted_probabilities(probabilities: Dict[str, float]) -> List[Dict]:
    sorted_items = sorted(
        probabilities.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    return [
        {
            "class_name": class_name,
            "class_label": CLASS_LABELS_ES[class_name],
            "probability": probability,
            "probability_pct": format_probability(probability),
        }
        for class_name, probability in sorted_items
    ]


def get_model_summary(model_key: str) -> Dict:
    if model_key not in MODEL_OPTIONS:
        raise ValueError(f"Modelo no reconocido: {model_key}")

    return MODEL_OPTIONS[model_key]