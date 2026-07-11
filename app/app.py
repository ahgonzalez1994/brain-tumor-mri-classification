from pathlib import Path

import pandas as pd
import streamlit as st
import torch
from PIL import Image

from model_utils import (
    CLASS_LABELS_ES,
    CLASS_NAMES,
    MODEL_OPTIONS,
    format_probability,
    get_device,
    get_project_root,
    get_sorted_probabilities,
    load_all_metrics,
    load_model,
    preprocess_image,
)
from ui_styles import get_custom_css


st.set_page_config(
    page_title="NeuroScan MRI Classifier",
    page_icon="MRI",
    layout="wide",
    initial_sidebar_state="expanded",
)


@st.cache_resource(show_spinner=False)
def get_cached_model(model_key: str):
    return load_model(model_key=model_key)


@st.cache_data(show_spinner=False)
def get_cached_metrics():
    return load_all_metrics(project_root=get_project_root())


def run_prediction(image: Image.Image, model_key: str) -> dict:
    model = get_cached_model(model_key)
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
    }


def metric_to_percent(value) -> str:
    if value is None:
        return "N/D"

    try:
        return f"{float(value) * 100:.2f}%"
    except TypeError:
        return "N/D"


def render_header():
    st.markdown(
        """
<div class="app-header">
    <div class="brand-block">
        <p class="eyebrow">Academic MRI Tumor Classification Demo</p>
        <h1 class="app-title">NeuroScan MRI Classifier</h1>
        <p class="app-subtitle">
            Aplicacion academica para clasificar imagenes MRI cerebrales usando dos modelos entrenados en el proyecto:
            una CNN baseline y un modelo con transfer learning basado en ResNet18.
        </p>
    </div>
    <div class="status-pill">
        <span class="status-dot"></span>
        Modelos cargados localmente
    </div>
</div>
""",
        unsafe_allow_html=True,
    )


def render_sidebar(selected_model_key: str):
    st.sidebar.markdown("## Configuracion")
    st.sidebar.markdown(
        "Selecciona el modelo que se usara para analizar la imagen MRI cargada."
    )

    model_labels = {
        model_key: MODEL_OPTIONS[model_key]["display_name"]
        for model_key in MODEL_OPTIONS
    }

    selected_label = st.sidebar.selectbox(
        "Modelo de inferencia",
        options=list(model_labels.values()),
        index=list(model_labels.keys()).index(selected_model_key),
    )

    selected_key = next(
        model_key
        for model_key, label in model_labels.items()
        if label == selected_label
    )

    st.sidebar.markdown("---")
    st.sidebar.markdown("## Clases")
    st.sidebar.markdown(
        """
<div class="class-chip-row">
    <span class="class-chip">Glioma</span>
    <span class="class-chip">Meningioma</span>
    <span class="class-chip">Sin tumor</span>
    <span class="class-chip">Tumor pituitario</span>
</div>
""",
        unsafe_allow_html=True,
    )

    st.sidebar.markdown("---")
    st.sidebar.markdown("## Nota academica")
    st.sidebar.caption(
        "Esta app es solo para demostracion academica. No debe utilizarse como herramienta de diagnostico medico."
    )

    return selected_key


def render_metric_cards(metrics: dict):
    accuracy = metric_to_percent(metrics.get("test_accuracy"))
    precision = metric_to_percent(metrics.get("test_precision_macro"))
    recall = metric_to_percent(metrics.get("test_recall_macro"))
    f1_score = metric_to_percent(metrics.get("test_f1_macro"))

    st.markdown(
        f"""
<div class="metric-grid">
    <div class="metric-card">
        <p class="metric-label">Accuracy</p>
        <p class="metric-value">{accuracy}</p>
    </div>
    <div class="metric-card">
        <p class="metric-label">Precision Macro</p>
        <p class="metric-value">{precision}</p>
    </div>
    <div class="metric-card">
        <p class="metric-label">Recall Macro</p>
        <p class="metric-value">{recall}</p>
    </div>
    <div class="metric-card">
        <p class="metric-label">F1 Macro</p>
        <p class="metric-value">{f1_score}</p>
    </div>
</div>
""",
        unsafe_allow_html=True,
    )


def render_probabilities(probabilities: dict):
    sorted_probabilities = get_sorted_probabilities(probabilities)

    rows_html = []

    for item in sorted_probabilities:
        width_pct = max(0.0, min(item["probability"] * 100, 100.0))

        rows_html.append(
            f"""
<div class="prob-row">
    <div class="prob-label">{item["class_label"]}</div>
    <div class="prob-track">
        <div class="prob-fill" style="width: {width_pct:.2f}%;"></div>
    </div>
    <div class="prob-value">{item["probability_pct"]}</div>
</div>
"""
        )

    st.markdown("".join(rows_html), unsafe_allow_html=True)


def render_model_comparison(all_metrics: dict):
    comparison_rows = []

    for model_key, metrics in all_metrics.items():
        comparison_rows.append(
            {
                "Modelo": MODEL_OPTIONS[model_key]["display_name"],
                "Accuracy": metric_to_percent(metrics.get("test_accuracy")),
                "Precision Macro": metric_to_percent(metrics.get("test_precision_macro")),
                "Recall Macro": metric_to_percent(metrics.get("test_recall_macro")),
                "F1 Macro": metric_to_percent(metrics.get("test_f1_macro")),
                "Test Loss": round(float(metrics.get("test_loss", 0)), 4)
                if metrics.get("test_loss") is not None
                else "N/D",
            }
        )

    comparison_df = pd.DataFrame(comparison_rows)
    st.dataframe(comparison_df, use_container_width=True, hide_index=True)


def render_uploaded_image_info(image: Image.Image, uploaded_file):
    width, height = image.size

    st.markdown(
        f"""
<div class="panel">
    <p class="section-title">Imagen cargada</p>
    <p class="section-caption">
        Archivo: <strong>{uploaded_file.name}</strong><br>
        Dimensiones originales: <strong>{width} x {height}</strong><br>
        Modo original detectado: <strong>{image.mode}</strong>
    </p>
</div>
""",
        unsafe_allow_html=True,
    )


def main():
    st.markdown(get_custom_css(), unsafe_allow_html=True)

    default_model_key = "transfer_resnet18"
    selected_model_key = render_sidebar(default_model_key)

    render_header()

    all_metrics = get_cached_metrics()
    selected_metrics = all_metrics.get(selected_model_key, {})

    left_col, right_col = st.columns([0.42, 0.58], gap="large")

    with left_col:
        st.markdown(
            """
<div class="panel panel-strong">
    <p class="section-title">Input Configuration</p>
    <p class="section-caption">
        Sube una imagen MRI en formato JPG, JPEG o PNG. La app aplicara el mismo preprocesamiento usado en los notebooks.
    </p>
</div>
""",
            unsafe_allow_html=True,
        )

        uploaded_file = st.file_uploader(
            "Subir imagen MRI",
            type=["jpg", "jpeg", "png"],
            label_visibility="collapsed",
        )

        st.markdown(
            f"""
<div class="panel">
    <p class="section-title">Modelo seleccionado</p>
    <p class="section-caption">
        <strong>{MODEL_OPTIONS[selected_model_key]["display_name"]}</strong><br>
        {MODEL_OPTIONS[selected_model_key]["description"]}
    </p>
</div>
""",
            unsafe_allow_html=True,
        )

        if selected_metrics:
            render_metric_cards(selected_metrics)

    with right_col:
        if uploaded_file is None:
            st.markdown(
                """
<div class="panel">
    <p class="section-title">Diagnostic Visor</p>
    <p class="section-caption">
        Esperando imagen. Cuando cargues una MRI, aqui se mostrara la vista previa y el resultado del modelo.
    </p>
</div>
""",
                unsafe_allow_html=True,
            )

            st.markdown(
                """
<div class="notice">
    Esta aplicacion replica la etapa de inferencia del proyecto. La imagen sera convertida a RGB,
    redimensionada a 224x224 y normalizada segun el modelo seleccionado.
</div>
""",
                unsafe_allow_html=True,
            )

        else:
            image = Image.open(uploaded_file)
            image_rgb = image.convert("RGB")

            st.image(
                image_rgb,
                caption="Vista previa de la imagen cargada",
                use_container_width=True,
            )

            render_uploaded_image_info(image, uploaded_file)

            run_button = st.button("Ejecutar prediccion", type="primary")

            if run_button:
                with st.spinner("Analizando imagen con el modelo seleccionado..."):
                    prediction = run_prediction(
                        image=image,
                        model_key=selected_model_key,
                    )

                st.markdown(
                    f"""
<div class="result-card">
    <p class="result-label">Resultado principal</p>
    <p class="result-class">{prediction["predicted_label"]}</p>
    <div class="result-confidence">
        Confianza: {format_probability(prediction["confidence"])}
    </div>
</div>
""",
                    unsafe_allow_html=True,
                )

                st.markdown(
                    """
<div class="panel">
    <p class="section-title">Distribucion de probabilidades</p>
    <p class="section-caption">
        Probabilidad asignada por el modelo a cada una de las cuatro clases del proyecto.
    </p>
</div>
""",
                    unsafe_allow_html=True,
                )

                render_probabilities(prediction["probabilities"])

                probability_df = pd.DataFrame(
                    [
                        {
                            "Clase": CLASS_LABELS_ES[class_name],
                            "Probabilidad": probability,
                            "Probabilidad (%)": format_probability(probability),
                        }
                        for class_name, probability in prediction["probabilities"].items()
                    ]
                ).sort_values("Probabilidad", ascending=False)

                st.dataframe(
                    probability_df,
                    use_container_width=True,
                    hide_index=True,
                )

                st.markdown(
                    """
<div class="notice">
    Resultado generado para fines academicos. No representa una conclusion medica ni sustituye evaluacion profesional.
</div>
""",
                    unsafe_allow_html=True,
                )

    st.markdown("---")

    st.markdown(
        """
<div class="panel">
    <p class="section-title">Comparacion general de modelos</p>
    <p class="section-caption">
        Metricas finales obtenidas sobre el conjunto Testing, segun los resultados guardados desde los notebooks.
    </p>
</div>
""",
        unsafe_allow_html=True,
    )

    render_model_comparison(all_metrics)

    st.markdown(
        """
<div class="notice">
    El modelo Transfer Learning - ResNet18 fue el mejor modelo en las pruebas finales del proyecto,
    con mayor accuracy y F1 macro que la CNN baseline.
</div>
""",
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()