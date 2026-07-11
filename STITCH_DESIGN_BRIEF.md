# Brief detallado para Google Stitch - NeuroScan MRI Classifier

## Objetivo

Crear una **interfaz web completa**, no una guia de estilos, para una aplicacion academica de clasificacion de tumores cerebrales en imagenes MRI.

La interfaz debe parecer una app real y usable, tipo dashboard medico moderno. Debe permitir subir una imagen, elegir un modelo de clasificacion y mostrar resultados de inferencia.

## Prompt principal para Stitch

Disena una interfaz web completa tipo dashboard medico profesional para una aplicacion academica llamada **NeuroScan MRI Classifier**.

La aplicacion clasifica imagenes MRI cerebrales en cuatro clases:

- Glioma
- Meningioma
- No tumor
- Pituitary

La pantalla debe ser una app funcional, no una landing page, no una guia de componentes y no un style guide. Debe mostrar la experiencia principal desde el primer viewport.

## Layout requerido

Disena una sola pantalla principal de dashboard con estas zonas:

### 1. Header superior

Debe incluir:

- Nombre de la app: **NeuroScan MRI Classifier**
- Subtitulo pequeno: **Academic MRI Tumor Classification Demo**
- Estado del sistema: **Models loaded**
- Boton secundario pequeno: **View README**
- Boton primario: **Run prediction**

El header debe verse serio, limpio y profesional. No debe parecer marketing ni hero page.

### 2. Panel izquierdo - Carga y configuracion

Panel fijo o card principal a la izquierda con:

- Seccion **Upload MRI image**
- Dropzone grande para subir imagen `.jpg`, `.jpeg` o `.png`
- Icono de upload o imagen medica
- Texto: **Drag and drop an MRI image or browse files**
- Debajo, selector de modelo con dos opciones:
  - **CNN Baseline**
  - **Transfer Learning ResNet18**
- Pequena descripcion segun modelo:
  - CNN Baseline: trained from scratch
  - ResNet18: ImageNet pretrained + partial fine-tuning
- Boton claro: **Analyze image**

El panel debe parecer una herramienta clinica academica, no un formulario generico.

### 3. Panel central - Preview de imagen

Zona central grande para mostrar la imagen MRI subida.

Debe incluir:

- Titulo: **MRI Preview**
- Imagen MRI enmarcada en un visor oscuro o neutral
- Placeholder cuando no hay imagen: un recuadro elegante con texto **Upload an MRI scan to begin**
- Pequenos metadatos visibles debajo de la imagen:
  - File name
  - Input size
  - Preprocessing: RGB, 224x224, normalized

El visor debe sentirse medico/radiologico, con buen contraste y mucho espacio visual.

### 4. Panel derecho - Resultado de prediccion

Panel derecho con los resultados principales:

- Titulo: **Prediction Result**
- Clase predicha grande y destacada, por ejemplo: **Pituitary**
- Confianza grande, por ejemplo: **96.4% confidence**
- Indicador visual tipo status:
  - Verde/azul para resultado estable
  - Amarillo si la confianza es baja
- Barra horizontal de probabilidades por clase:
  - Glioma
  - Meningioma
  - No tumor
  - Pituitary
- Cada clase debe tener porcentaje visible.

Debe haber un pequeno disclaimer dentro del panel:

**Academic demo only. Not for clinical diagnosis.**

### 5. Seccion inferior - Comparacion de modelos

Debajo de los tres paneles principales, incluir una seccion horizontal con metricas comparativas:

Titulo:

**Model Performance on Testing Set**

Debe incluir dos cards comparativas:

#### CNN Baseline

- Accuracy: 79.31%
- F1 Macro: 78.60%
- Precision Macro: 81.93%
- Recall Macro: 79.31%

#### Transfer Learning ResNet18

- Accuracy: 88.13%
- F1 Macro: 87.87%
- Precision Macro: 88.95%
- Recall Macro: 88.13%

Debe quedar visualmente claro que ResNet18 supera al baseline. Puede incluir una etiqueta discreta:

**Best overall model**

### 6. Seccion opcional inferior - Confusion matrix preview

Si cabe en la pantalla o en un segundo bloque visible al hacer scroll, incluir:

- Mini preview de matriz de confusion.
- Texto breve: **Most remaining confusion occurs between glioma and meningioma.**

No debe sobrecargar el dashboard.

## Estilo visual

### Direccion general

Estilo:

- Profesional
- Clinico
- Academico
- Moderno
- Limpio
- Sobrio
- Con apariencia de producto real

No debe parecer:

- Landing page de marketing
- Plantilla generica
- Guia de colores
- Presentacion tipo PowerPoint
- App futurista exagerada
- Dashboard financiero

### Paleta

Usar una paleta medica sobria:

- Fondo principal: gris muy claro o blanco frio
- Superficies/cards: blanco o azul muy claro
- Primario: azul medico profundo
- Secundario: verde/teal clinico
- Texto principal: azul muy oscuro o slate
- Texto secundario: gris azulado
- Bordes: gris azulado suave

Evitar:

- Morado dominante
- Gradientes fuertes
- Neon
- Naranja/marron como color principal
- Fondos oscuros excesivos

### Tipografia

Tipografia sans-serif moderna, similar a:

- Inter
- IBM Plex Sans
- SF Pro
- Roboto

Jerarquia:

- Titulo de app claro pero no gigante
- Labels pequenos y legibles
- Resultados principales grandes
- Metricas compactas y escaneables

### Cards y componentes

Usar cards con:

- Bordes sutiles
- Radio moderado, no exagerado
- Sombra muy suave
- Mucho orden visual
- Buen espaciado interno

No usar demasiadas cards anidadas. Cada card debe tener una funcion clara.

## Contenido exacto recomendado

Usar estos textos visibles:

- **NeuroScan MRI Classifier**
- **Academic MRI Tumor Classification Demo**
- **Upload MRI image**
- **Drag and drop an MRI image or browse files**
- **Model selection**
- **CNN Baseline**
- **Transfer Learning ResNet18**
- **MRI Preview**
- **Prediction Result**
- **Class probabilities**
- **Model Performance on Testing Set**
- **Academic demo only. Not for clinical diagnosis.**
- **Best overall model**
- **Preprocessing: RGB, 224x224, normalized**

## Datos de ejemplo para mostrar en el mockup

Usar datos simulados pero realistas:

Prediccion de ejemplo:

- Predicted class: **Pituitary**
- Confidence: **96.4%**

Probabilidades:

- Glioma: 1.8%
- Meningioma: 1.1%
- No tumor: 0.7%
- Pituitary: 96.4%

Metricas:

CNN Baseline:

- Accuracy: 79.31%
- F1 Macro: 78.60%
- Precision Macro: 81.93%
- Recall Macro: 79.31%

Transfer Learning ResNet18:

- Accuracy: 88.13%
- F1 Macro: 87.87%
- Precision Macro: 88.95%
- Recall Macro: 88.13%

## Restricciones importantes

La salida debe ser una **pantalla de aplicacion completa**, no una coleccion de componentes.

Debe evitar:

- Generar solo paletas de colores.
- Generar solo botones y tipografia.
- Generar solo una guia de estilos.
- Generar componentes sueltos sin layout.
- Inventar secciones no pedidas.
- Poner graficos financieros.
- Usar mucho texto explicativo.
- Hacer una landing page con hero.

Debe incluir:

- Header.
- Uploader.
- Selector de modelo.
- Preview de MRI.
- Resultado de prediccion.
- Probabilidades por clase.
- Comparacion de modelos.
- Disclaimer academico.

## Prompt alternativo si Stitch vuelve a fallar

Create a full web app dashboard screen, not a style guide. The app is called **NeuroScan MRI Classifier** and is an academic tool for brain MRI tumor classification.

The screen must show the actual product UI:

1. Top header with app name, system status and action button.
2. Left panel for image upload and model selection.
3. Center panel for MRI preview.
4. Right panel for prediction result, confidence and class probabilities.
5. Bottom section comparing CNN Baseline vs Transfer Learning ResNet18 metrics.

Use a clean clinical design system: white/cool gray background, medical blue primary color, teal/green secondary color, subtle borders, compact dashboard cards, professional typography.

Use these exact classes: Glioma, Meningioma, No tumor, Pituitary.

Use these exact models: CNN Baseline and Transfer Learning ResNet18.

Use these metrics:

- CNN Baseline: Accuracy 79.31%, F1 Macro 78.60%.
- ResNet18: Accuracy 88.13%, F1 Macro 87.87%.

Show a sample prediction:

- Predicted class: Pituitary.
- Confidence: 96.4%.

Include the text: **Academic demo only. Not for clinical diagnosis.**

Do not create a style guide. Do not create only colors/buttons. Do not create a marketing landing page. Create the full app screen.

## Que exportar o compartir

Idealmente exportar o compartir:

- Captura completa de la pantalla.
- Codigo HTML/CSS/React si Stitch lo permite.
- Paleta de colores si la muestra.
- Cualquier archivo generado por Stitch.

Si Stitch solo da captura, esa captura sera suficiente para implementar la app en Streamlit con CSS personalizado.

