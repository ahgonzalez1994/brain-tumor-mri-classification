# Ruta de trabajo - Version mejorada con React, FastAPI y Render

Este documento es la bitacora tecnica para la fase mejorada del proyecto. Su objetivo es conservar el contexto, ordenar las decisiones y evitar que la version de Render se mezcle con la entrega principal ya terminada.

La entrega principal ya esta cubierta con:

- `01-Tumor_CNN_Baseline.ipynb`
- `02-Tumor_Transfer_Learning.ipynb`
- `app/` con Streamlit
- modelos `.pth` en `models/`
- metricas y figuras en `outputs/`
- repositorio GitHub publicado
- app Streamlit desplegada en `https://ahg-nxp-brain-tumor-mri.streamlit.app/`

Esta nueva fase es opcional/mejorada y busca convertir el prototipo visual creado con Google AI Studio en una web app mas profesional conectada con los modelos reales del proyecto.

---

## 1. Objetivo de esta fase

Construir una version web mas pulida que use:

- Frontend React/Vite basado en `MRI Scanner V2`.
- Backend Python/FastAPI para cargar los modelos entrenados.
- Modelos reales:
  - `models/cnn_baseline_best.pth`
  - `models/transfer_resnet18.pth`
- Despliegue en Render como version avanzada del proyecto.

La idea no es reemplazar los notebooks ni Streamlit. La idea es sumar una version mas profesional para demostracion.

---

## 2. Principio de trabajo

Trabajaremos paso por paso, igual que en la fase anterior.

Reglas de avance:

1. No avanzar al siguiente paso hasta validar el paso actual.
2. Mantener `main` estable.
3. Crear una rama nueva para esta fase.
4. No tocar los notebooks finales salvo que sea estrictamente necesario.
5. Reutilizar la logica ya validada en `app/model_utils.py`.
6. Separar frontend, backend y despliegue.
7. Probar primero localmente.
8. Desplegar en Render solo cuando la app funcione localmente.

Rama sugerida:

```bash
git checkout -b react-fastapi-render
```

---

## 3. Contexto tecnico actual

### Dataset

El dataset local esta en:

- `Training/`
- `Testing/`

Estas carpetas no se suben a GitHub porque son pesadas y no son necesarias para la app desplegada. La app solo necesita los modelos entrenados.

### Clases del modelo

Orden usado por los notebooks y por la app:

```text
glioma
meningioma
notumor
pituitary
```

Este orden debe mantenerse igual en backend, frontend, metricas y visualizacion.

### Modelos

Los modelos ya estan entrenados:

```text
models/cnn_baseline_best.pth
models/transfer_resnet18.pth
```

Estan manejados con Git LFS porque el modelo de transfer learning pesa alrededor de 100 MB.

### Metricas principales

CNN Baseline:

- Accuracy: 0.7931
- Precision macro: 0.8193
- Recall macro: 0.7931
- F1 macro: 0.7860

Transfer Learning ResNet18:

- Accuracy: 0.8813
- Precision macro: 0.8895
- Recall macro: 0.8813
- F1 macro: 0.8787

Conclusion base:

El modelo con transfer learning es el mejor candidato para inferencia por defecto, pero la app debe permitir comparar o seleccionar ambos modelos.

---

## 4. Estado de `MRI Scanner V2`

La carpeta `MRI Scanner V2` contiene un prototipo React/Vite generado con Google AI Studio.

Archivos importantes:

- `package.json`
- `index.html`
- `server.ts`
- `src/`
- `vite.config.ts`
- `tsconfig.json`

Este prototipo se ve mas profesional que Streamlit porque usa React, componentes visuales, animaciones y una interfaz mas personalizada.

Limitacion actual:

El endpoint `/api/predict` de `server.ts` no usa nuestros modelos PyTorch. Actualmente usa Gemini si existe `GEMINI_API_KEY` o una simulacion si no existe la clave.

Decision:

Para esta fase, la prediccion debe venir de nuestros modelos reales, no de Gemini ni de una simulacion.

---

## 5. Arquitectura objetivo

Arquitectura recomendada:

```text
Usuario
  |
  v
Frontend React/Vite
  |
  | POST /predict con imagen y modelo seleccionado
  v
Backend FastAPI
  |
  | carga modelo .pth
  | aplica preprocesamiento correcto
  | ejecuta inferencia PyTorch
  v
Respuesta JSON
  |
  v
Frontend muestra clase, confianza, probabilidades y notas academicas
```

Separacion propuesta:

```text
render_app/
  backend/
    main.py
    model_utils.py
    requirements.txt
  frontend/
    package.json
    index.html
    src/
    vite.config.ts
    tsconfig.json
  README.md
render.yaml
```

Motivo:

- `app/` queda reservado para Streamlit.
- `MRI Scanner V2/` queda como fuente/prototipo original.
- `render_app/` sera la version limpia y mantenible para Render.

---

## 6. Backend FastAPI

El backend tendra la responsabilidad de:

- Recibir una imagen.
- Recibir el modelo elegido: `baseline` o `transfer`.
- Convertir la imagen a RGB.
- Redimensionar a `224x224`.
- Aplicar la normalizacion correcta segun el modelo.
- Cargar el modelo correspondiente.
- Ejecutar inferencia en CPU.
- Retornar probabilidades y prediccion.

Endpoints previstos:

```text
GET /health
GET /models
POST /predict
```

Respuesta esperada de `/health`:

```json
{
  "status": "ok",
  "models_loaded": true
}
```

Respuesta esperada de `/models`:

```json
{
  "models": [
    {
      "id": "baseline",
      "name": "CNN Baseline",
      "accuracy": 0.7931
    },
    {
      "id": "transfer",
      "name": "Transfer Learning ResNet18",
      "accuracy": 0.8813
    }
  ]
}
```

Respuesta esperada de `/predict`:

```json
{
  "model_id": "transfer",
  "predicted_class": "pituitary",
  "predicted_label": "Pituitary",
  "confidence": 0.9632,
  "probabilities": {
    "glioma": 0.012,
    "meningioma": 0.019,
    "notumor": 0.006,
    "pituitary": 0.963
  },
  "disclaimer": "Resultado academico. No usar para diagnostico clinico."
}
```

Notas tecnicas:

- Usar `torch.no_grad()`.
- Usar `model.eval()`.
- Cargar en CPU por compatibilidad con Render free.
- Cachear modelos en memoria para no recargarlos en cada request.
- Mantener el mismo preprocesamiento de los notebooks y de Streamlit.

---

## 7. Frontend React

El frontend debe partir de `MRI Scanner V2`, pero limpiando la logica simulada.

Responsabilidades del frontend:

- Permitir subir una imagen MRI.
- Permitir seleccionar modelo:
  - CNN Baseline
  - Transfer Learning ResNet18
- Enviar la imagen al backend.
- Mostrar:
  - clase predicha
  - confianza
  - barras de probabilidades
  - comparacion breve de modelos
  - disclaimer academico
- Mantener una apariencia profesional tipo dashboard academico.

Cambios necesarios:

1. Reemplazar llamadas locales a Gemini/simulacion.
2. Usar una variable de entorno para el backend:

```text
VITE_API_URL=http://localhost:8000
```

3. En Render, esa variable apuntara al backend desplegado:

```text
VITE_API_URL=https://nombre-backend.onrender.com
```

4. El frontend no debe contener claves secretas.
5. El frontend no debe cargar los `.pth`; eso pertenece al backend.

---

## 8. Render: estrategia de despliegue

Render es una plataforma comercial con capa gratuita. No es open source. Para este proyecto se usara solo como hosting.

Limitaciones esperadas del plan gratuito:

- El backend puede dormir tras inactividad.
- El primer request puede tardar mas por cold start.
- Puede haber limites de RAM/build time.
- PyTorch puede hacer que el deploy sea pesado.

Por eso la estrategia correcta es:

1. Dejar Streamlit como version publica estable.
2. Usar Render como version avanzada experimental/profesional.
3. Si Render free falla por memoria, mantener esta fase como demo local o considerar un plan pago pequeno.

Servicios propuestos en Render:

```text
Servicio 1: Backend FastAPI
  tipo: Web Service
  runtime: Python
  plan: Free

Servicio 2: Frontend React
  tipo: Static Site
  runtime: Node/Vite build
  plan: Free
```

Motivo:

- Es mas claro separar API y frontend.
- El frontend puede servirse como sitio estatico.
- El backend queda dedicado a inferencia.

Alternativa:

Usar Docker y servir frontend + backend en un solo servicio. Esta opcion se deja como alternativa si la separacion causa problemas, pero no sera el primer intento.

---

## 9. `render.yaml` previsto

La configuracion final probablemente usara un Blueprint con dos servicios:

```yaml
services:
  - type: web
    name: brain-tumor-api
    runtime: python
    plan: free
    rootDir: render_app/backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT

  - type: static
    name: brain-tumor-react
    rootDir: render_app/frontend
    buildCommand: npm ci && npm run build
    staticPublishPath: dist
    envVars:
      - key: VITE_API_URL
        value: https://brain-tumor-api.onrender.com
```

Nota:

El valor final de `VITE_API_URL` puede cambiar segun el nombre real del servicio creado en Render.

---

## 10. Flujo cronologico de trabajo

### Paso 1 - Crear rama de trabajo

Objetivo:

Proteger `main` y trabajar en una rama separada.

Acciones:

```bash
git checkout main
git pull origin main
git checkout -b react-fastapi-render
```

Validacion:

```bash
git branch
```

Resultado esperado:

La rama activa debe ser `react-fastapi-render`.

---

### Paso 2 - Crear estructura `render_app/`

Objetivo:

Separar la version avanzada de la app Streamlit.

Estructura esperada:

```text
render_app/
  backend/
  frontend/
```

Validacion:

Confirmar que `app/` sigue intacto y que `render_app/` existe.

---

### Paso 3 - Preparar backend FastAPI

Objetivo:

Crear el backend minimo con:

- `/health`
- `/models`
- `/predict`

Archivos esperados:

```text
render_app/backend/main.py
render_app/backend/model_utils.py
render_app/backend/requirements.txt
```

Primera validacion local:

```bash
cd render_app/backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Probar:

```text
http://127.0.0.1:8000/health
```

Resultado esperado:

El backend responde sin cargar la interfaz.

---

### Paso 4 - Conectar backend con modelos reales

Objetivo:

Reutilizar arquitectura y preprocesamiento de `app/model_utils.py`.

Puntos criticos:

- CNN Baseline debe usar normalizacion `(0.5, 0.5, 0.5)`.
- Transfer Learning debe usar normalizacion ImageNet.
- La arquitectura de ResNet18 debe coincidir con el notebook.
- La arquitectura baseline debe coincidir con el notebook.
- El orden de clases debe ser identico.

Validacion:

Subir una imagen local via Swagger:

```text
http://127.0.0.1:8000/docs
```

Resultado esperado:

El endpoint `/predict` devuelve JSON con clase y probabilidades.

---

### Paso 5 - Preparar frontend React

Objetivo:

Copiar la parte util de `MRI Scanner V2` hacia:

```text
render_app/frontend/
```

No copiar:

- `node_modules/`
- archivos temporales
- claves `.env`

Si se copia `package-lock.json`, usar `npm ci`.

Validacion local:

```bash
cd render_app/frontend
npm install
npm run dev
```

Resultado esperado:

La interfaz abre en navegador y mantiene el diseno profesional.

---

### Paso 6 - Reemplazar prediccion simulada por llamada al backend

Objetivo:

Eliminar o ignorar el endpoint de Gemini/simulacion y usar FastAPI.

Flujo esperado:

```text
Imagen subida en React
  -> FormData
  -> POST {VITE_API_URL}/predict
  -> respuesta JSON
  -> renderizar resultado
```

Validacion:

1. Backend corriendo en `http://127.0.0.1:8000`.
2. Frontend corriendo en `http://localhost:3000`.
3. Subir imagen.
4. Elegir modelo.
5. Ver prediccion real.

---

### Paso 7 - Mejorar UX academica

Objetivo:

Que la app se vea profesional, pero sin prometer diagnostico medico.

Elementos requeridos:

- Titulo claro.
- Selector de modelo.
- Upload de imagen.
- Preview de imagen.
- Resultado principal.
- Probabilidades por clase.
- Comparacion breve baseline vs transfer.
- Aviso visible:

```text
Uso academico. No usar para diagnostico clinico.
```

No agregar:

- Texto que afirme diagnostico medico real.
- Explicaciones clinicas demasiado definitivas.
- Campos innecesarios de paciente si no se usan.

---

### Paso 8 - Crear pruebas manuales locales

Objetivo:

Evitar subir algo roto a GitHub/Render.

Checklist local:

- `/health` responde.
- `/models` responde.
- `/predict` funciona con baseline.
- `/predict` funciona con transfer.
- Frontend sube imagen correctamente.
- Frontend muestra probabilidades.
- Frontend maneja errores si backend esta apagado.
- No hay claves secretas en el codigo.
- No se subio `node_modules`.
- No se subio dataset.

---

### Paso 9 - Crear `render.yaml`

Objetivo:

Definir despliegue reproducible.

Archivo:

```text
render.yaml
```

Validacion local:

Si Render CLI esta disponible:

```bash
render blueprints validate
```

Si no esta disponible:

Validar manualmente estructura, indentacion YAML, rootDir, buildCommand y startCommand.

---

### Paso 10 - Commit y push de la rama

Objetivo:

Subir la fase avanzada sin tocar `main` directamente.

Comandos:

```bash
git status
git add render_app render.yaml RUTA_RENDER_REACT_FASTAPI.md
git commit -m "Add React FastAPI Render workflow"
git push origin react-fastapi-render
```

Resultado esperado:

La rama aparece en GitHub.

---

### Paso 11 - Pull request hacia `main`

Objetivo:

Revisar los cambios antes de integrarlos.

Checklist antes del PR:

- La app Streamlit sigue funcionando.
- README no queda desactualizado.
- `render_app/` esta documentado.
- `.gitignore` excluye `node_modules`, `dist`, `.env`, dataset y prototipos originales.
- Los modelos `.pth` siguen bajo Git LFS.

---

### Paso 12 - Deploy en Render

Objetivo:

Desplegar backend y frontend.

Opcion recomendada:

Usar Blueprint desde GitHub con `render.yaml`.

Flujo:

1. Entrar a Render.
2. Crear nuevo Blueprint.
3. Conectar repositorio GitHub.
4. Seleccionar rama.
5. Confirmar servicios.
6. Aplicar deploy.
7. Esperar build del backend.
8. Esperar build del frontend.
9. Actualizar `VITE_API_URL` si Render asigna una URL distinta.

Validacion:

- Abrir URL del backend `/health`.
- Abrir URL del frontend.
- Subir una imagen.
- Confirmar prediccion real.

---

### Paso 13 - Actualizar README principal

Objetivo:

Documentar la version avanzada sin confundirla con Streamlit.

Agregar seccion:

```text
Version web avanzada
```

Contenido:

- Link a Streamlit como version estable.
- Link a Render como version avanzada.
- Explicacion breve de React + FastAPI.
- Nota sobre cold start si se usa Render free.

---

## 11. Riesgos y mitigaciones

### Riesgo 1 - Render free no soporta bien PyTorch

Posible causa:

- Dependencias pesadas.
- Memoria insuficiente.
- Build lento.

Mitigacion:

- Usar CPU solamente.
- Mantener dependencias minimas.
- Evitar instalar Jupyter en backend Render.
- Separar requirements del backend.
- Mantener Streamlit como version estable.

### Riesgo 2 - Cold start

Posible causa:

- Servicio gratuito duerme por inactividad.

Mitigacion:

- Explicar que el primer acceso puede tardar.
- No usar Render free como entorno critico.

### Riesgo 3 - Error por Git LFS

Posible causa:

- Render no descarga archivos LFS correctamente o tarda demasiado.

Mitigacion:

- Confirmar que Git LFS esta activo.
- Verificar logs de build.
- Considerar descargar modelos desde release asset si fuera necesario.

### Riesgo 4 - Diferencia entre preprocesamiento local y backend

Posible causa:

- Normalizacion incorrecta.
- Orden de clases incorrecto.
- Arquitectura no coincide con checkpoint.

Mitigacion:

- Reutilizar `app/model_utils.py` como fuente.
- Probar las mismas imagenes en Streamlit y FastAPI.
- Comparar probabilidades aproximadas.

### Riesgo 5 - CORS entre frontend y backend

Posible causa:

- Frontend y backend viven en dominios distintos.

Mitigacion:

- Configurar `CORSMiddleware` en FastAPI.
- Permitir local y dominio de Render.

---

## 12. Variables de entorno

Backend:

```text
MODEL_DIR=../../models
ALLOW_ORIGINS=http://localhost:3000,https://frontend-render-url.onrender.com
```

Frontend:

```text
VITE_API_URL=http://127.0.0.1:8000
```

Render frontend:

```text
VITE_API_URL=https://backend-render-url.onrender.com
```

No usar:

```text
GEMINI_API_KEY
```

a menos que en el futuro se quiera agregar una explicacion generativa opcional. Para esta fase, la prediccion debe ser PyTorch.

---

## 13. Criterio de exito

La version Render se considera lista cuando:

- El frontend React carga correctamente.
- El backend FastAPI carga ambos modelos.
- La app permite elegir CNN Baseline o Transfer Learning.
- La app permite subir imagen MRI.
- La app devuelve prediccion real usando `.pth`.
- Se muestran probabilidades por clase.
- Hay disclaimer academico.
- La version esta documentada en README.
- La app esta desplegada o, si Render free falla, queda funcional localmente y explicado el motivo.

---

## 14. Relacion con la entrega principal

Esta fase no cambia la entrega principal.

Entrega principal:

- notebooks
- metricas
- figuras
- modelos entrenados
- Streamlit Cloud
- GitHub

Version avanzada:

- React/Vite
- FastAPI
- Render
- interfaz mas profesional

Si algo falla en Render, el proyecto sigue completo gracias a Streamlit y los notebooks.

---

## 15. Primer paso real cuando retomemos

Cuando iniciemos esta fase, el primer bloque de trabajo sera:

1. Confirmar que el repo local esta limpio.
2. Crear la rama `react-fastapi-render`.
3. Crear `render_app/backend`.
4. Crear backend minimo FastAPI con `/health`.
5. Ejecutarlo localmente.

No se debe empezar copiando toda la app React hasta que el backend minimo este funcionando.

