# Clasificacion de Tumores Cerebrales en Imagenes MRI mediante CNN y Transfer Learning

Proyecto final de la asignatura **Redes Neuronales y Deep Learning**.

| Campo | Detalle |
|---|---|
| Universidad | UAM - Universidad Americana |
| Docente | Freddy Luis López Barrios |
| Estudiantes | Ariel Herrera y Naxalia Amanda Pérez Zamora |
| Fecha de entrega | 15/07/2026 |
| Repositorio | https://github.com/ahgonzalez1994/brain-tumor-mri-classification |

## Resumen

Este proyecto implementa y compara dos enfoques de vision por computadora para la clasificacion de imagenes de resonancia magnetica cerebral. El objetivo principal es evaluar el desempeno de una CNN entrenada desde cero frente a un modelo basado en **transfer learning** con ResNet18.

El problema se formula como una tarea de clasificacion multiclase con cuatro categorias:

| Clase | Descripcion |
|---|---|
| `glioma` | Imagenes asociadas a glioma |
| `meningioma` | Imagenes asociadas a meningioma |
| `notumor` | Imagenes sin tumor |
| `pituitary` | Imagenes asociadas a tumor pituitario |

> **Nota academica:** este proyecto tiene fines exclusivamente formativos. Los resultados no sustituyen la evaluacion de profesionales de salud ni deben utilizarse para diagnostico clinico.

## Aplicaciones desplegadas

| Plataforma | Enlace | Proposito |
|---|---|---|
| Streamlit Cloud | https://ahg-nxp-brain-tumor-mri.streamlit.app/ | App estable para subir imagenes y comparar predicciones de los modelos |
| Render React + FastAPI | https://brain-tumor-mri-web.onrender.com/ | Version avanzada con interfaz React y API FastAPI para inferencia PyTorch |

En Render, el primer acceso puede tardar entre 30 y 60 segundos si el backend se encuentra en reposo por inactividad del plan gratuito.

## Objetivos

| Tipo | Objetivo |
|---|---|
| General | Implementar y comparar arquitecturas CNN para clasificacion de imagenes medicas, evaluando el impacto del aprendizaje por transferencia. |
| Especifico 1 | Realizar un analisis exploratorio del dataset, considerando distribucion de clases, dimensiones y modos de color. |
| Especifico 2 | Construir una CNN baseline desde cero con PyTorch. |
| Especifico 3 | Implementar transfer learning con ResNet18 y fine-tuning parcial. |
| Especifico 4 | Evaluar ambos modelos en un conjunto de prueba independiente. |
| Especifico 5 | Desplegar una aplicacion web academica para probar inferencia sobre imagenes nuevas. |

## Dataset

El dataset se encuentra organizado en dos carpetas principales:

| Carpeta | Uso |
|---|---|
| `Training/` | Entrenamiento y validacion |
| `Testing/` | Evaluacion final del modelo |

Distribucion verificada:

| Conjunto | glioma | meningioma | notumor | pituitary | Total |
|---|---:|---:|---:|---:|---:|
| Training | 1400 | 1400 | 1400 | 1400 | 5600 |
| Testing | 400 | 400 | 400 | 400 | 1600 |
| Total | 1800 | 1800 | 1800 | 1800 | 7200 |

Durante el EDA se identifico que las imagenes presentan distintas dimensiones y modos de color (`L`, `RGB`, `RGBA`, `P`). Por ello, ambos notebooks aplican un pipeline de preprocesamiento que convierte las imagenes a RGB, redimensiona a `224x224`, transforma a tensor y normaliza los valores.

## Metodologia

| Etapa | Descripcion |
|---|---|
| EDA | Validacion de carpetas, conteo de imagenes, distribucion por clase, revision visual y analisis tecnico de dimensiones/canales. |
| Preprocesamiento | Conversion a RGB, redimensionamiento a `224x224`, normalizacion y preparacion de tensores. |
| Data augmentation | Uso de rotaciones, traslaciones ligeras y flips durante entrenamiento para mejorar robustez. |
| Particion | Separacion reproducible en entrenamiento, validacion y testing final. |
| Entrenamiento baseline | CNN propia entrenada desde cero con regularizacion, Batch Normalization, Dropout, scheduler y early stopping. |
| Transfer learning | ResNet18 preentrenada, entrenamiento inicial con base congelada y fine-tuning parcial de capas profundas. |
| Evaluacion | Accuracy, precision macro, recall macro, F1 macro, matriz de confusion e inferencia sobre 10 imagenes representativas. |

## Notebooks principales

| Notebook | Descripcion |
|---|---|
| `01-Tumor_CNN_Baseline.ipynb` | CNN baseline entrenada desde cero. Incluye EDA, preprocesamiento, entrenamiento, evaluacion e inferencia. |
| `02-Tumor_Transfer_Learning.ipynb` | Transfer learning con ResNet18. Incluye entrenamiento inicial, fine-tuning parcial, evaluacion y comparacion contra baseline. |

Ambos notebooks cuentan con portada academica, indice, introduccion, desarrollo metodologico, interpretacion de resultados y conclusiones.

## Resultados principales

| Modelo | Test Loss | Accuracy | Precision Macro | Recall Macro | F1 Macro |
|---|---:|---:|---:|---:|---:|
| CNN Baseline | 0.6702 | 0.7931 | 0.8193 | 0.7931 | 0.7860 |
| Transfer Learning ResNet18 | 0.4356 | 0.8813 | 0.8895 | 0.8813 | 0.8787 |

Comparacion del modelo ResNet18 frente al baseline:

| Metrica | Mejora absoluta |
|---|---:|
| Accuracy | +0.0881 |
| Precision macro | +0.0702 |
| Recall macro | +0.0881 |
| F1 macro | +0.0927 |

El modelo con transfer learning obtuvo mejores resultados generales, lo que sugiere que las representaciones aprendidas por ResNet18 aportan valor al clasificar imagenes MRI, aun considerando el desfase de dominio entre ImageNet e imagenes medicas.

## Estructura del repositorio

```text
Proyecto Final/
  app/                         # App Streamlit
  render_app/                  # App avanzada React + FastAPI
    backend/
    frontend/
  models/                      # Checkpoints entrenados
  outputs/
    figures/                   # Graficos generados
    metrics/                   # Metricas y matrices exportadas
  01-Tumor_CNN_Baseline.ipynb
  02-Tumor_Transfer_Learning.ipynb
  requirements.txt
  render.yaml
  RUTA_DE_TRABAJO.md
  RUTA_RENDER_REACT_FASTAPI.md
  README.md
```

## Artefactos generados

| Tipo | Archivos principales |
|---|---|
| Modelos | `models/cnn_baseline_best.pth`, `models/transfer_resnet18.pth` |
| Metricas | `outputs/metrics/cnn_baseline_metrics.json`, `outputs/metrics/transfer_resnet18_metrics.json` |
| Matrices de confusion | `outputs/metrics/cnn_baseline_confusion_matrix.csv`, `outputs/metrics/transfer_resnet18_confusion_matrix.csv` |
| Figuras | `outputs/figures/cnn_baseline_confusion_matrix.png`, `outputs/figures/transfer_resnet18_confusion_matrix.png`, `outputs/figures/baseline_vs_transfer_metrics_comparison.png` |
| HTML academico | `entregables_html/01-Tumor_CNN_Baseline.html`, `entregables_html/02-Tumor_Transfer_Learning.html` |

## Entorno recomendado

Se recomienda utilizar Python 3.11 con Conda.

```bash
conda create -n tumor_cnn_baseline python=3.11 -y
conda activate tumor_cnn_baseline
pip install -r requirements.txt
python -m ipykernel install --user --name tumor_cnn_baseline --display-name "Python (tumor_cnn_baseline)"
```

Kernel recomendado:

```text
Python (tumor_cnn_baseline)
```

## Ejecucion de notebooks

```bash
conda activate tumor_cnn_baseline
jupyter lab
```

Orden recomendado:

```text
01-Tumor_CNN_Baseline.ipynb
02-Tumor_Transfer_Learning.ipynb
```

El segundo notebook utiliza metricas generadas por el baseline para realizar la comparacion final.

## Ejecucion de la app Streamlit

```bash
conda activate tumor_cnn_baseline
streamlit run app/app.py
```

Si el comando anterior no funciona:

```bash
python -m streamlit run app/app.py
```

## Ejecucion local de React + FastAPI

Backend:

```bash
conda activate tumor_cnn_baseline
cd render_app/backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Frontend, en otra terminal:

```bash
cd render_app/frontend
npm install
npm run dev
```

Luego abrir la URL indicada por Vite, por ejemplo:

```text
http://127.0.0.1:3000/
```

## Despliegue

| Plataforma | Configuracion |
|---|---|
| Streamlit Cloud | Repositorio `ahgonzalez1994/brain-tumor-mri-classification`, branch `main`, archivo principal `app/app.py`. |
| Render | Blueprint definido en `render.yaml`, con servicios `brain-tumor-mri-api` y `brain-tumor-mri-web`. |

## Limitaciones

- El proyecto es academico y no constituye una herramienta diagnostica.
- No se realizo validacion clinica externa.
- El rendimiento puede variar con imagenes externas provenientes de otros equipos, protocolos o resoluciones.
- El modelo ResNet18 parte de pesos entrenados en ImageNet, por lo que existe un desfase de dominio frente a imagenes medicas.
- La app depende de los checkpoints `.pth`; si no estan disponibles, la inferencia no puede ejecutarse.

## Conclusiones

La CNN baseline logro un desempeno razonable para un modelo entrenado desde cero. Sin embargo, el enfoque de transfer learning con ResNet18 y fine-tuning parcial supero al baseline en todas las metricas principales. Este resultado respalda el uso de arquitecturas preentrenadas como punto de partida en problemas de vision artificial medica, siempre que se acompanen de validacion rigurosa, interpretacion cuidadosa y delimitacion academica de su uso.
