# Clasificacion de Tumores Cerebrales con CNN y Transfer Learning

Proyecto final de la asignatura **Redes Neuronales y Deep Learning**.

Este proyecto implementa y compara dos enfoques de vision por computadora para clasificar imagenes de resonancia magnetica cerebral en cuatro clases:

- `glioma`
- `meningioma`
- `notumor`
- `pituitary`

El objetivo principal es evaluar el rendimiento de una CNN entrenada desde cero frente a un modelo basado en transfer learning con ResNet18.

## Estructura del proyecto

```text
Proyecto Final/
  Training/
    glioma/
    meningioma/
    notumor/
    pituitary/
  Testing/
    glioma/
    meningioma/
    notumor/
    pituitary/
  app/
  render_app/
    backend/
    frontend/
  models/
    cnn_baseline_best.pth
    transfer_resnet18.pth
  outputs/
    figures/
    metrics/
  01-Tumor_CNN_Baseline.ipynb
  02-Tumor_Transfer_Learning.ipynb
  requirements.txt
  RUTA_DE_TRABAJO.md
  RUTA_RENDER_REACT_FASTAPI.md
  README.md
```

## Dataset

El dataset esta dividido en dos carpetas principales:

- `Training/`: utilizado para entrenamiento y validacion.
- `Testing/`: utilizado exclusivamente para evaluacion final.

Nota para GitHub: estas carpetas pueden mantenerse localmente y no necesariamente subirse al repositorio debido al volumen de imagenes. Los notebooks esperan esta estructura si se desea reproducir el entrenamiento completo.

Distribucion verificada:

| Conjunto | glioma | meningioma | notumor | pituitary | Total |
|---|---:|---:|---:|---:|---:|
| Training | 1400 | 1400 | 1400 | 1400 | 5600 |
| Testing | 400 | 400 | 400 | 400 | 1600 |
| Total | 1800 | 1800 | 1800 | 1800 | 7200 |

Durante el EDA se identifico que las imagenes presentan diferentes dimensiones y modos de color (`L`, `RGB`, `RGBA`, `P`). Por esta razon, ambos notebooks aplican un pipeline de preprocesamiento que convierte las imagenes a `RGB`, redimensiona a `224x224`, transforma a tensor y normaliza los valores.

## Entorno recomendado

Se recomienda utilizar Python 3.11 con Conda.

```bash
conda create -n tumor_cnn_baseline python=3.11 -y
conda activate tumor_cnn_baseline
pip install -r requirements.txt
python -m ipykernel install --user --name tumor_cnn_baseline --display-name "Python (tumor_cnn_baseline)"
```

El kernel usado en los notebooks es:

```text
Python (tumor_cnn_baseline)
```

## Notebooks principales

### 1. CNN Baseline

Archivo:

```text
01-Tumor_CNN_Baseline.ipynb
```

Este notebook implementa una CNN desde cero en PyTorch. Incluye:

- Analisis exploratorio del dataset.
- Preprocesamiento y data augmentation.
- Split train/validation desde `Training/`.
- Entrenamiento de una CNN propia.
- Early stopping y scheduler de learning rate.
- Evaluacion en `Testing/`.
- Matriz de confusion.
- Inferencia sobre 10 imagenes representativas.
- Guardado de modelo, metricas y figuras.

Modelo guardado:

```text
models/cnn_baseline_best.pth
```

Metricas guardadas:

```text
outputs/metrics/cnn_baseline_metrics.json
```

### 2. Transfer Learning

Archivo:

```text
02-Tumor_Transfer_Learning.ipynb
```

Este notebook implementa transfer learning con ResNet18 preentrenado en ImageNet. Incluye:

- Misma estructura general del baseline.
- Normalizacion con medias y desviaciones estandar de ImageNet.
- Entrenamiento inicial con la red base congelada.
- Fine-tuning parcial descongelando `layer4` y la cabeza clasificadora.
- Evaluacion en `Testing/`.
- Matriz de confusion.
- Inferencia sobre 10 imagenes representativas.
- Comparacion final contra la CNN baseline.

Modelo guardado:

```text
models/transfer_resnet18.pth
```

Metricas guardadas:

```text
outputs/metrics/transfer_resnet18_metrics.json
```

## Resultados principales

| Modelo | Test Loss | Accuracy | Precision Macro | Recall Macro | F1 Macro |
|---|---:|---:|---:|---:|---:|
| CNN Baseline | 0.6702 | 0.7931 | 0.8193 | 0.7931 | 0.7860 |
| Transfer Learning ResNet18 | 0.4356 | 0.8813 | 0.8895 | 0.8813 | 0.8787 |

El modelo con transfer learning supero al baseline en todas las metricas principales:

- Mejora en accuracy: `+0.0881`
- Mejora en precision macro: `+0.0702`
- Mejora en recall macro: `+0.0881`
- Mejora en F1 macro: `+0.0927`

## Interpretacion general

La CNN baseline logro un desempeno razonable para un modelo entrenado desde cero, especialmente en las clases `notumor` y `pituitary`. Sin embargo, tuvo mayor dificultad para diferenciar algunos casos de `glioma` y `meningioma`.

El modelo ResNet18 con transfer learning y fine-tuning parcial obtuvo mejores resultados generales. Esto sugiere que las caracteristicas aprendidas previamente por una red profunda pueden aportar valor incluso en un dominio especializado como imagenes medicas, aunque exista un desfase de dominio frente a ImageNet.

## Artefactos generados

Figuras principales:

```text
outputs/figures/cnn_baseline_training_curves.png
outputs/figures/cnn_baseline_confusion_matrix.png
outputs/figures/cnn_baseline_inference_10_samples.png
outputs/figures/transfer_resnet18_training_curves.png
outputs/figures/transfer_resnet18_confusion_matrix.png
outputs/figures/transfer_resnet18_inference_10_samples.png
outputs/figures/baseline_vs_transfer_metrics_comparison.png
```

Metricas principales:

```text
outputs/metrics/cnn_baseline_metrics.json
outputs/metrics/cnn_baseline_confusion_matrix.csv
outputs/metrics/cnn_baseline_inference_10_samples.csv
outputs/metrics/transfer_resnet18_metrics.json
outputs/metrics/transfer_resnet18_confusion_matrix.csv
outputs/metrics/transfer_resnet18_inference_10_samples.csv
```

## Ejecucion local

### Notebooks

1. Activar el entorno:

```bash
conda activate tumor_cnn_baseline
```

2. Abrir Jupyter:

```bash
jupyter lab
```

3. Ejecutar los notebooks en este orden:

```text
01-Tumor_CNN_Baseline.ipynb
02-Tumor_Transfer_Learning.ipynb
```

El segundo notebook carga las metricas generadas por el baseline para realizar la comparacion final.

## App Streamlit

La carpeta `app/` contiene una aplicacion web local desarrollada con Streamlit para probar los modelos entrenados sin volver a ejecutar los notebooks.

App en vivo:

```text
https://ahg-nxp-brain-tumor-mri.streamlit.app/
```

Estructura principal:

```text
app/
  app.py
  model_utils.py
  ui_styles.py
  assets/
```

La app permite:

- Subir una imagen MRI en formato `jpg`, `jpeg` o `png`.
- Elegir entre `CNN Baseline` y `Transfer Learning - ResNet18`.
- Aplicar el mismo preprocesamiento usado en los notebooks.
- Mostrar la clase predicha.
- Mostrar confianza y probabilidades por clase.
- Mostrar metricas resumidas y comparacion entre modelos.

Modelos utilizados por la app:

```text
models/cnn_baseline_best.pth
models/transfer_resnet18.pth
```

Para ejecutar la app localmente:

```bash
conda activate tumor_cnn_baseline
streamlit run app/app.py
```

Si el comando anterior no funciona, puede ejecutarse con:

```bash
python -m streamlit run app/app.py
```

La app no entrena modelos; solo carga los checkpoints ya guardados en `models/` y realiza inferencia sobre imagenes nuevas cargadas por el usuario.

## App avanzada React + FastAPI

Adicionalmente, la carpeta `render_app/` contiene una version web avanzada probada localmente. Esta version separa la interfaz y la inferencia:

```text
render_app/
  backend/
    main.py
    model_utils.py
    requirements.txt
  frontend/
    src/
    package.json
    vite.config.ts
```

Arquitectura:

- `backend/`: API con FastAPI que carga los modelos PyTorch reales desde `models/`.
- `frontend/`: interfaz React/Vite basada en el prototipo visual de Google AI Studio, depurada para conservar solo funciones justificadas por el proyecto.

La app avanzada permite:

- Subir una imagen MRI.
- Ejecutar inferencia real con `CNN Baseline` o `Transfer Learning ResNet18`.
- Comparar ambos modelos sobre la misma imagen activa.
- Consultar metricas globales del conjunto de testing.
- Ver matrices de confusion reales guardadas en `outputs/metrics/`.

Para ejecutar el backend:

```bash
conda activate tumor_cnn_baseline
cd render_app/backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Para ejecutar el frontend en otra terminal:

```bash
cd render_app/frontend
npm install
npm run dev
```

Luego abrir la URL local indicada por Vite, por ejemplo:

```text
http://127.0.0.1:3000/
```

Esta version se mantiene como fase avanzada local y base para un posible despliegue futuro en Render. El flujo detallado esta documentado en:

```text
RUTA_RENDER_REACT_FASTAPI.md
```

## Despliegue en Streamlit Cloud

La app fue desplegada en Streamlit Cloud y puede probarse desde:

```text
https://ahg-nxp-brain-tumor-mri.streamlit.app/
```

Configuracion usada para el despliegue:

- Repositorio: `ahgonzalez1994/brain-tumor-mri-classification`
- Branch: `main`
- Archivo principal:

```text
app/app.py
```

Nota importante: `models/transfer_resnet18.pth` pesa mas de 100 MB. GitHub puede rechazar archivos mayores a ese limite si se suben de forma tradicional. Para despliegue puede ser necesario usar Git LFS o alojar el modelo externamente y descargarlo durante el inicio de la app.

## Limitaciones

- El proyecto tiene fines academicos y no debe utilizarse como herramienta diagnostica.
- Las imagenes de prueba provienen del dataset disponible; no se realizo validacion clinica externa.
- Aunque transfer learning mejoro los resultados, todavia existen confusiones entre algunas clases tumorales, especialmente `glioma` y `meningioma`.
- El rendimiento puede variar si se usan imagenes externas con resolucion, contraste, equipo o protocolo de adquisicion diferente.
- La app Streamlit depende de los archivos `.pth` generados por los notebooks; si los modelos no estan disponibles, la inferencia no podra ejecutarse.

## Disclaimer

Este proyecto es exclusivamente academico. Los resultados no sustituyen la evaluacion de profesionales de salud ni deben utilizarse para tomar decisiones medicas.
