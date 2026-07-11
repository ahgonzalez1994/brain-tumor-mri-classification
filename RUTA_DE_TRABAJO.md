# Ruta de trabajo - Proyecto Final CNN y Transfer Learning

## 1. Objetivo del proyecto

Construir un proyecto academico completo para clasificar imagenes de resonancia magnetica cerebral en cuatro clases:

- `glioma`
- `meningioma`
- `notumor`
- `pituitary`

El proyecto comparara dos enfoques:

- CNN baseline entrenada desde cero.
- Transfer learning con un modelo preentrenado liviano, preferiblemente ResNet18.

El entregable principal seran dos notebooks independientes y reproducibles. Como cierre demostrativo se construira una app en Streamlit Cloud para subir una imagen, elegir modelo y ver la prediccion.

## 2. Archivos base del proyecto

Los archivos madre que guiaran el desarrollo son:

- `01_cnn_baseline.ipynb`
- `03_transfer_learning.ipynb`
- `Indicaciones - Redes Neuronales.pdf`

Los notebooks actuales son una base de estructura y estilo, pero deben adaptarse al dataset real del proyecto. No se usaran repositorios externos de GitHub como base de implementacion.

## 3. Dataset local

La estructura del dataset ya esta dividida en training y testing:

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

Conteo verificado:

```text
Training:
  glioma       1400
  meningioma   1400
  notumor      1400
  pituitary    1400

Testing:
  glioma        400
  meningioma    400
  notumor       400
  pituitary     400
```

Total:

- 5,600 imagenes de entrenamiento.
- 1,600 imagenes de prueba.
- 7,200 imagenes en total.

Hallazgos tecnicos iniciales:

- El dataset esta balanceado por clase.
- Hay mezcla de imagenes RGB y escala de grises.
- Hay imagenes con diferentes dimensiones.
- Algunas imagenes son 512x512, pero otras son mas pequenas o no cuadradas.
- Por eso el preprocesamiento debe normalizar tamano, canales y escala numerica antes de entrenar.

## 4. Estructura de carpetas acordada

La estructura local del proyecto queda asi:

```text
Proyecto Final/
  Training/
  Testing/
  app/
  models/
  outputs/
    figures/
    metrics/
  01_cnn_baseline.ipynb
  03_transfer_learning.ipynb
  Indicaciones - Redes Neuronales.pdf
  GIT_AND_GITHUB_GUIDE.md
  requirements.txt
  RUTA_DE_TRABAJO.md
```

Uso previsto:

- `app/`: codigo de Streamlit.
- `models/`: pesos entrenados de la CNN baseline y transfer learning.
- `outputs/figures/`: graficas, matrices de confusion, ejemplos visuales, curvas de entrenamiento.
- `outputs/metrics/`: archivos JSON/CSV con metricas finales.
- `requirements.txt`: dependencias reproducibles del proyecto.
- `RUTA_DE_TRABAJO.md`: documento de coordinacion para no perder contexto.

## 5. Entorno recomendado

Se recomienda usar Conda con Python 3.11.

Nombre sugerido:

```bash
brain-tumor-cnn
```

Comandos propuestos:

```bash
conda create -n brain-tumor-cnn python=3.11 -y
conda activate brain-tumor-cnn
pip install -r requirements.txt
python -m ipykernel install --user --name brain-tumor-cnn --display-name "Python (brain-tumor-cnn)"
```

Razon para usar Python 3.11:

- Buena compatibilidad con PyTorch, torchvision, Streamlit, scikit-learn, Pillow y Jupyter.
- Menor riesgo de friccion que Python 3.12 en proyectos de deep learning.

## 6. Forma de trabajo acordada

El trabajo se realizara paso por paso.

Para cada paso de notebook se entregara:

1. Un bloque Markdown separado.
2. Un bloque de codigo separado.

No se avanzara al siguiente paso hasta finalizar el paso actual.

Cuando un bloque de codigo genere resultados que deban interpretarse, se pedira al usuario que comparta el resultado antes de escribir la explicacion final de ese paso.

No se pedira resultado al usuario para bloques puramente preparatorios, por ejemplo:

- Imports.
- Definicion de constantes.
- Creacion de funciones auxiliares.
- Configuracion de semillas.

Si un bloque produce conteos, tablas, graficas, metricas, entrenamiento o evaluacion, entonces si se pedira el resultado antes de continuar.

## 7. Estructura identica para ambos notebooks

Los dos notebooks deben tener estructura practicamente identica para que la comparacion sea clara.

Estructura base:

1. Titulo y objetivo del notebook.
2. Contexto del problema.
3. Configuracion del entorno.
4. Imports y semillas.
5. Rutas y parametros globales.
6. EDA del dataset.
7. Preprocesamiento.
8. Data augmentation.
9. Carga de datasets y dataloaders.
10. Definicion del modelo.
11. Funciones de entrenamiento y evaluacion.
12. Entrenamiento.
13. Curvas de entrenamiento.
14. Evaluacion en test.
15. Matriz de confusion.
16. Reporte de clasificacion.
17. Inferencia sobre 10 imagenes representativas.
18. Guardado de modelo, metricas y figuras.
19. Conclusiones del notebook.

La diferencia principal sera la seccion de modelo:

- En baseline: arquitectura CNN propia desde cero.
- En transfer learning: modelo preentrenado con cabeza clasificadora adaptada a 4 clases.

## 8. Notebook 1 - CNN baseline

Archivo:

```text
01_cnn_baseline.ipynb
```

Objetivo:

Entrenar una CNN propia desde cero para clasificar las cuatro clases del dataset.

Decisiones tecnicas previstas:

- Input size inicial: 224x224.
- Convertir todo a 3 canales.
- Normalizacion consistente.
- Split de validacion desde `Training/`.
- Mantener `Testing/` exclusivamente para evaluacion final.
- Usar `CrossEntropyLoss`.
- Usar optimizador Adam.
- Incluir Batch Normalization.
- Incluir Dropout.
- Implementar Early Stopping.
- Guardar el mejor modelo por validation loss.

Artefactos esperados:

- `models/cnn_baseline.pth`
- `outputs/metrics/cnn_baseline_metrics.json`
- `outputs/figures/cnn_baseline_training_curves.png`
- `outputs/figures/cnn_baseline_confusion_matrix.png`

## 9. Notebook 2 - Transfer learning

Archivo:

```text
03_transfer_learning.ipynb
```

Objetivo:

Entrenar un modelo con transfer learning y compararlo contra la CNN baseline.

Decisiones tecnicas previstas:

- Modelo sugerido: ResNet18.
- Pesos preentrenados de ImageNet.
- Input size: 224x224.
- Normalizacion ImageNet.
- Congelar capas base al inicio.
- Entrenar cabeza clasificadora para 4 clases.
- Si los resultados lo justifican, hacer fine-tuning parcial de las ultimas capas.
- Guardar el mejor modelo por validation loss.

Artefactos esperados:

- `models/transfer_resnet18.pth`
- `outputs/metrics/transfer_resnet18_metrics.json`
- `outputs/figures/transfer_resnet18_training_curves.png`
- `outputs/figures/transfer_resnet18_confusion_matrix.png`

## 10. EDA que se documentara

El EDA sera visual y tecnico, apropiado para imagenes.

Puntos incluidos:

- Conteo por clase y split.
- Confirmacion de balance del dataset.
- Ejemplos visuales por clase.
- Revision de dimensiones de imagen.
- Revision de canales RGB vs escala de grises.
- Identificacion de necesidad de resize.
- Identificacion de necesidad de convertir a 3 canales.
- Justificacion de normalizacion.
- Discusion breve de overfitting en imagenes medicas.
- Discusion breve de domain gap para transfer learning con ImageNet.

## 11. Inferencia sobre 10 imagenes

El PDF pide validar el modelo final mediante inferencia sobre una muestra de diez imagenes externas o representativas.

Plan:

- Seleccionar 10 imagenes representativas desde `Testing/`.
- Mantener mezcla de las cuatro clases.
- Ejecutar inferencia con baseline.
- Ejecutar inferencia con transfer learning.
- Mostrar imagen, etiqueta real, prediccion y confianza.
- Guardar resultados en una tabla.

Artefacto esperado:

- `outputs/metrics/inference_10_samples.csv`

## 12. Comparacion final

Se compararan ambos enfoques usando:

- Accuracy.
- Precision macro.
- Recall macro.
- F1 macro.
- Matriz de confusion.
- Observaciones sobre errores frecuentes.
- Tiempo aproximado de entrenamiento si se registra.
- Facilidad de despliegue.

La conclusion debe responder:

- Cual modelo tuvo mejor desempeno.
- Si transfer learning ayudo o no.
- Que tradeoffs tuvo cada enfoque.
- Que limitaciones mantiene el proyecto.

## 13. Streamlit app

Carpeta:

```text
app/
```

Objetivo:

Construir una demo web ligera para Streamlit Cloud.

Funciones minimas:

- Subir imagen MRI.
- Elegir modelo: CNN baseline o transfer learning.
- Mostrar preview de la imagen.
- Ejecutar preprocesamiento compatible con el modelo elegido.
- Mostrar clase predicha.
- Mostrar confianza del modelo.
- Mostrar probabilidades por clase.
- Mostrar metricas resumidas del proyecto.
- Incluir disclaimer academico/no medico.

Funciones opcionales:

- Comparar ambos modelos con la misma imagen.
- Mostrar matriz de confusion guardada.
- Mostrar curvas de entrenamiento guardadas.
- Mejorar UI/UX con inspiracion de Google Stitch.

No se entrenaran modelos dentro de la app.

## 14. README final

El README se hara al final, cuando existan resultados reales.

Debe incluir:

- Descripcion del proyecto.
- Dataset y clases.
- Estructura del repositorio.
- Instalacion del entorno.
- Ejecucion de notebooks.
- Ejecucion de Streamlit local.
- Resultados principales.
- Link de Streamlit Cloud.
- Limitaciones.
- Disclaimer academico.

## 15. Orden cronologico de ejecucion

Fase 1 - Preparacion:

- Crear estructura de carpetas.
- Crear `requirements.txt`.
- Crear `RUTA_DE_TRABAJO.md`.
- Crear entorno Conda.
- Instalar dependencias.
- Registrar kernel Jupyter.

Fase 2 - Baseline:

- Adaptar notebook baseline paso por paso.
- Ejecutar EDA.
- Entrenar CNN desde cero.
- Evaluar en test.
- Guardar artefactos.

Fase 3 - Transfer learning:

- Adaptar notebook transfer paso por paso.
- Reusar estructura del baseline.
- Entrenar cabeza clasificadora.
- Evaluar en test.
- Guardar artefactos.

Fase 4 - Comparacion:

- Consolidar metricas.
- Comparar modelos.
- Ejecutar inferencia de 10 imagenes.
- Redactar conclusiones.

Fase 5 - App:

- Crear Streamlit app.
- Integrar modelos guardados.
- Integrar metricas y visuales.
- Probar localmente.
- Preparar deploy en Streamlit Cloud.

Fase 6 - Documentacion:

- Crear README final.
- Revisar dependencias.
- Verificar rutas relativas.
- Revisar que notebooks ejecuten en orden.
- Preparar repositorio privado de GitHub.

## 16. Criterios de finalizacion

El proyecto se considerara listo cuando:

- Los dos notebooks esten completos y ejecutables.
- Ambos modelos hayan sido evaluados sobre `Testing/`.
- Existan metricas comparables.
- Exista inferencia sobre 10 imagenes.
- Los modelos esten guardados.
- La app Streamlit pueda cargar al menos un modelo y predecir.
- El README explique como reproducir el trabajo.
- El repositorio este organizado para entrega.

