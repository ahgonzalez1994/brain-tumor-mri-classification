from io import BytesIO

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from model_utils import check_model_files, get_available_models, predict_image


app = FastAPI(
    title="Brain Tumor MRI Classifier API",
    description="Academic API for MRI brain tumor classification with PyTorch models.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"^(http://(localhost|127\.0\.0\.1):\d+|https://.*\.onrender\.com)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    model_files = check_model_files()

    return {
        "status": "ok",
        "service": "brain-tumor-api",
        "models_ready": all(model_files.values()),
        "model_files": model_files,
        "message": "Backend funcionando. Los modelos se cargan bajo demanda al ejecutar /predict.",
    }


@app.get("/")
def root():
    return {
        "service": "brain-tumor-api",
        "health": "/health",
        "models": "/models",
        "docs": "/docs",
        "predict": "/predict",
    }


@app.get("/models")
def list_models():
    return {
        "models": get_available_models(),
        "default_model": "transfer",
        "disclaimer": "Uso academico. No usar para diagnostico clinico.",
    }


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    model_id: str = Form("transfer"),
):
    if model_id not in {"baseline", "transfer"}:
        raise HTTPException(
            status_code=400,
            detail="Modelo no reconocido. Usa 'baseline' o 'transfer'.",
        )

    try:
        image_bytes = await file.read()
        image = Image.open(BytesIO(image_bytes))
        result = predict_image(image=image, model_id=model_id)
    except UnidentifiedImageError as exc:
        raise HTTPException(
            status_code=400,
            detail="El archivo enviado no pudo abrirse como imagen valida.",
        ) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error al ejecutar inferencia con el modelo: {exc}",
        ) from exc

    result["uploaded_filename"] = file.filename
    return result
