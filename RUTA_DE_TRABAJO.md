# Ruta de trabajo actualizada - Proyecto Final CNN y Transfer Learning

## 1. Objetivo del proyecto

Construir un proyecto academico completo para clasificar imagenes de resonancia magnetica cerebral en cuatro clases:

- `glioma`
- `meningioma`
- `notumor`
- `pituitary`

El proyecto compara dos enfoques:

- Una CNN baseline entrenada desde cero.
- Un modelo con transfer learning basado en ResNet18.

Ademas de los notebooks, se incluye una app en Streamlit para cargar una imagen MRI, elegir el modelo y visualizar la prediccion.

## 2. Entregables principales

Los entregables finales del proyecto son:

```text
01-Tumor_CNN_Baseline.ipynb
02-Tumor_Transfer_Learning.ipynb
app/app.py
app/model_utils.py
app/ui_styles.py
README.md
requirements.txt
models/cnn_baseline_best.pth
models/transfer_resnet18.pth
outputs/
```

Los notebooks originales usados como referencia local fueron:

```text
01_cnn_baseline.ipynb
03_transfer_learning.ipynb
```

Estos notebooks de referencia no forman parte del entregable principal en GitHub.

## 3. Dataset

El dataset local esta organizado en:

```text
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
```

Distribucion verificada:

| Conjunto | glioma | meningioma | notumor | pituitary | Total |
|---|---:|---:|---:|---:|---:|
| Training | 1400 | 1400 | 1400 | 1400 | 5600 |
| Testing | 400 | 400 | 400 | 400 | 1600 |
| Total | 1800 | 1800 | 1800 | 1800 | 7200 |

Hallazgos tecnicos:

- El dataset esta balanceado por clase.
- Existen imagenes con diferentes dimensiones.
- Existen modos de color `L`, `RGB`, `RGBA` y `P`.
- Se justifica convertir todo a `RGB`, redimensionar a `224x224` y normalizar antes de la inferencia.

Nota para GitHub: `Training/` y `Testing/` se mantienen fuera del repositorio por volumen. Los notebooks esperan esas carpetas localmente si se desea reproducir el entrenamiento completo.

## 4. Entorno

Entorno usado:

```text
tumor_cnn_baseline
```

Version recomendada:

```text
Python 3.11
```

Comandos base:

```bash
conda create -n tumor_cnn_baseline python=3.11 -y
conda activate tumor_cnn_baseline
pip install -r requirements.txt
python -m ipykernel install --user --name tumor_cnn_baseline --display-name "Python (tumor_cnn_baseline)"
```

## 5. Notebook CNN baseline

Archivo final:

```text
01-Tumor_CNN_Baseline.ipynb
```

Contenido principal:

- Validacion de estructura del dataset.
- Conteo de imagenes por clase y split.
- EDA visual y tecnico.
- Conversion a `RGB`.
- Redimensionamiento a `224x224`.
- Normalizacion con media y desviacion `(0.5, 0.5, 0.5)`.
- Data augmentation para entrenamiento.
- Split train/validation desde `Training/`.
- Evaluacion final exclusiva en `Testing/`.
- CNN propia con bloques Conv2D, BatchNorm, ReLU y MaxPool.
- Entrenamiento con `CrossEntropyLoss`, Adam, weight decay y scheduler.
- Early stopping por validation loss.
- Matriz de confusion.
- Inferencia sobre 10 imagenes representativas.
- Guardado de modelo, metricas y figuras.

Resultado final en Testing:

| Metrica | Valor |
|---|---:|
| Test Loss | 0.6702 |
| Accuracy | 0.7931 |
| Precision Macro | 0.8193 |
| Recall Macro | 0.7931 |
| F1 Macro | 0.7860 |

Modelo guardado:

```text
models/cnn_baseline_best.pth
```

## 6. Notebook Transfer Learning

Archivo final:

```text
02-Tumor_Transfer_Learning.ipynb
```

Contenido principal:

- Misma estructura general del notebook baseline.
- Uso de ResNet18 preentrenado en ImageNet.
- Conversion a `RGB`.
- Redimensionamiento a `224x224`.
- Normalizacion con media y desviacion de ImageNet.
- Entrenamiento inicial con backbone congelado y cabeza clasificadora adaptada a 4 clases.
- Fine-tuning parcial descongelando `layer4` y `fc`.
- Evaluacion final exclusiva en `Testing/`.
- Matriz de confusion.
- Inferencia sobre 10 imagenes representativas.
- Comparacion contra la CNN baseline.

Resultado final en Testing:

| Metrica | Valor |
|---|---:|
| Test Loss | 0.4356 |
| Accuracy | 0.8813 |
| Precision Macro | 0.8895 |
| Recall Macro | 0.8813 |
| F1 Macro | 0.8787 |

Modelo guardado:

```text
models/transfer_resnet18.pth
```

## 7. Comparacion final

| Modelo | Test Loss | Accuracy | Precision Macro | Recall Macro | F1 Macro |
|---|---:|---:|---:|---:|---:|
| CNN Baseline | 0.6702 | 0.7931 | 0.8193 | 0.7931 | 0.7860 |
| Transfer Learning ResNet18 | 0.4356 | 0.8813 | 0.8895 | 0.8813 | 0.8787 |

Conclusiones tecnicas:

- ResNet18 con transfer learning fue superior en todas las metricas principales.
- La CNN baseline fue util como punto de comparacion y obtuvo resultados razonables.
- La mayor dificultad del baseline se observo en confusiones entre `glioma` y `meningioma`.
- El transfer learning aprovecho caracteristicas visuales preentrenadas y mejoro la generalizacion.

## 8. App Streamlit

Carpeta:

```text
app/
```

Archivos:

```text
app/app.py
app/model_utils.py
app/ui_styles.py
```

Funciones implementadas:

- Subida de imagen MRI en formato `jpg`, `jpeg` o `png`.
- Selector entre `CNN Baseline` y `Transfer Learning - ResNet18`.
- Preview de la imagen cargada.
- Lectura de dimensiones y modo original de la imagen.
- Preprocesamiento compatible con el modelo elegido.
- Carga de modelos `.pth`.
- Prediccion de clase.
- Confianza del modelo.
- Probabilidades por clase.
- Comparacion de metricas finales.
- Disclaimer academico/no medico.

Ejecucion local:

```bash
conda activate tumor_cnn_baseline
streamlit run app/app.py
```

Alternativa:

```bash
python -m streamlit run app/app.py
```

La app no entrena modelos. Solo carga los checkpoints ya generados por los notebooks.

## 9. Git y GitHub

Se inicializo un repositorio Git local y se realizo un primer commit:

```text
Add brain tumor classification project
```

Repositorio remoto:

```text
https://github.com/ahgonzalez1994/brain-tumor-mri-classification
```

Se activo Git LFS para archivos `.pth`:

```text
*.pth filter=lfs diff=lfs merge=lfs -text
```

Los modelos quedaron manejados por LFS:

```text
models/cnn_baseline_best.pth
models/transfer_resnet18.pth
```

Archivos/carpetas excluidas del repositorio:

```text
Training/
Testing/
MRI Scanner V1/
MRI Scanner V2/
.vscode/
Indicaciones - Redes Neuronales.pdf
01_cnn_baseline.ipynb
03_transfer_learning.ipynb
```

## 10. Despliegue Streamlit Cloud

La app fue desplegada en Streamlit Cloud.

Link publico:

```text
https://ahg-nxp-brain-tumor-mri.streamlit.app/
```

Configuracion usada:

- Repositorio: `ahgonzalez1994/brain-tumor-mri-classification`
- Branch: `main`
- Archivo principal:

```text
app/app.py
```

El enlace tambien fue agregado al apartado `About` del repositorio en GitHub como website del proyecto.

## 11. Criterios de finalizacion

El proyecto se considera completo cuando:

- Los dos notebooks finales estan completos.
- Ambos modelos fueron evaluados con `Testing/`.
- Las metricas comparativas estan guardadas.
- Las figuras principales estan en `outputs/figures/`.
- La app Streamlit funciona localmente.
- El README explica ejecucion local, resultados y despliegue.
- El repositorio esta en GitHub.
- La app queda desplegada en Streamlit Cloud.
