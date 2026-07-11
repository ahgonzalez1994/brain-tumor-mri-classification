def get_custom_css() -> str:
    return """
<style>
    :root {
        --bg-main: #0f1117;
        --bg-panel: #171923;
        --bg-panel-soft: #1f2230;
        --bg-card: #202434;
        --border-soft: rgba(255, 255, 255, 0.10);
        --border-strong: rgba(112, 91, 255, 0.45);
        --text-main: #f7f7fb;
        --text-muted: #a7abb8;
        --text-soft: #d2d5df;
        --primary: #705bff;
        --primary-soft: rgba(112, 91, 255, 0.18);
        --secondary: #18d6a3;
        --secondary-soft: rgba(24, 214, 163, 0.14);
        --warning: #f4b860;
        --danger: #ff5d73;
    }

    .stApp {
        background:
            radial-gradient(circle at top left, rgba(112, 91, 255, 0.14), transparent 34rem),
            radial-gradient(circle at top right, rgba(24, 214, 163, 0.10), transparent 30rem),
            var(--bg-main);
        color: var(--text-main);
    }

    [data-testid="stSidebar"] {
        background: #151722;
        border-right: 1px solid var(--border-soft);
    }

    [data-testid="stSidebar"] * {
        color: var(--text-main);
    }

    .main .block-container {
        max-width: 1280px;
        padding-top: 2rem;
        padding-bottom: 3rem;
    }

    h1, h2, h3 {
        letter-spacing: 0;
        color: var(--text-main);
    }

    p, li, label, span {
        color: var(--text-soft);
    }

    .app-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.25rem;
        padding: 1.4rem 1.5rem;
        border: 1px solid var(--border-soft);
        border-radius: 18px;
        background: linear-gradient(135deg, rgba(32, 36, 52, 0.98), rgba(23, 25, 35, 0.98));
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28);
        margin-bottom: 1.35rem;
    }

    .brand-block {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .eyebrow {
        color: var(--secondary);
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08rem;
        text-transform: uppercase;
        margin: 0;
    }

    .app-title {
        margin: 0;
        color: var(--text-main);
        font-size: clamp(1.7rem, 3vw, 2.5rem);
        line-height: 1.05;
        font-weight: 850;
    }

    .app-subtitle {
        max-width: 760px;
        margin: 0.45rem 0 0;
        color: var(--text-muted);
        font-size: 0.98rem;
        line-height: 1.55;
    }

    .status-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        padding: 0.72rem 1rem;
        border-radius: 999px;
        background: var(--secondary-soft);
        border: 1px solid rgba(24, 214, 163, 0.38);
        color: var(--secondary);
        font-size: 0.86rem;
        font-weight: 800;
        white-space: nowrap;
    }

    .status-dot {
        width: 0.62rem;
        height: 0.62rem;
        border-radius: 999px;
        background: var(--secondary);
        box-shadow: 0 0 18px rgba(24, 214, 163, 0.9);
    }

    .panel {
        border: 1px solid var(--border-soft);
        border-radius: 16px;
        background: rgba(23, 25, 35, 0.96);
        padding: 1.15rem;
        box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22);
        margin-bottom: 1rem;
    }

    .panel-strong {
        border: 1px solid var(--border-strong);
        background: linear-gradient(145deg, rgba(32, 36, 52, 0.98), rgba(19, 21, 31, 0.98));
    }

    .section-title {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        color: var(--text-main);
        font-size: 1.05rem;
        font-weight: 850;
        margin: 0 0 0.65rem;
    }

    .section-caption {
        color: var(--text-muted);
        font-size: 0.88rem;
        line-height: 1.5;
        margin: 0 0 1rem;
    }

    .result-card {
        border: 1px solid var(--border-strong);
        border-radius: 18px;
        background:
            linear-gradient(145deg, rgba(112, 91, 255, 0.16), rgba(24, 214, 163, 0.08)),
            rgba(32, 36, 52, 0.98);
        padding: 1.25rem;
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.30);
    }

    .result-label {
        color: var(--text-muted);
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.08rem;
        font-weight: 850;
        margin: 0 0 0.35rem;
    }

    .result-class {
        color: var(--text-main);
        font-size: clamp(1.8rem, 4vw, 3rem);
        line-height: 1;
        font-weight: 900;
        margin: 0;
    }

    .result-confidence {
        display: inline-flex;
        margin-top: 0.85rem;
        padding: 0.55rem 0.75rem;
        border-radius: 999px;
        background: var(--secondary-soft);
        border: 1px solid rgba(24, 214, 163, 0.36);
        color: var(--secondary);
        font-size: 0.96rem;
        font-weight: 850;
    }

    .metric-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.85rem;
        margin-top: 0.8rem;
    }

    .metric-card {
        border: 1px solid var(--border-soft);
        border-radius: 14px;
        background: rgba(32, 36, 52, 0.92);
        padding: 0.95rem;
    }

    .metric-label {
        color: var(--text-muted);
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.06rem;
        font-weight: 800;
        margin: 0 0 0.25rem;
    }

    .metric-value {
        color: var(--text-main);
        font-size: 1.2rem;
        font-weight: 850;
        margin: 0;
    }

    .prob-row {
        display: grid;
        grid-template-columns: 140px 1fr 72px;
        align-items: center;
        gap: 0.75rem;
        margin: 0.7rem 0;
    }

    .prob-label {
        color: var(--text-soft);
        font-weight: 800;
        font-size: 0.92rem;
    }

    .prob-track {
        height: 0.72rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .prob-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--primary), var(--secondary));
    }

    .prob-value {
        color: var(--text-main);
        font-weight: 850;
        font-size: 0.9rem;
        text-align: right;
    }

    .notice {
        border: 1px solid rgba(244, 184, 96, 0.36);
        border-radius: 14px;
        background: rgba(244, 184, 96, 0.10);
        padding: 0.95rem 1rem;
        color: #ffd99a;
        font-size: 0.88rem;
        line-height: 1.5;
        margin-top: 1rem;
    }

    .small-muted {
        color: var(--text-muted);
        font-size: 0.82rem;
        line-height: 1.45;
    }

    .class-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        margin-top: 0.8rem;
    }

    .class-chip {
        border: 1px solid var(--border-soft);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-soft);
        padding: 0.45rem 0.7rem;
        font-size: 0.83rem;
        font-weight: 750;
    }

    div[data-testid="stFileUploader"] {
        border: 1px dashed rgba(255, 255, 255, 0.22);
        border-radius: 16px;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.035);
    }

    div[data-testid="stFileUploader"] section {
        background: transparent;
        border: none;
    }

    div[data-testid="stFileUploader"] button {
        border-radius: 999px;
        border: 1px solid var(--border-soft);
        background: var(--primary);
        color: white;
        font-weight: 800;
    }

    .stButton > button {
        width: 100%;
        border-radius: 999px;
        border: 1px solid rgba(112, 91, 255, 0.58);
        background: linear-gradient(90deg, #705bff, #4b7dff);
        color: white;
        font-weight: 850;
        padding: 0.78rem 1rem;
        box-shadow: 0 14px 30px rgba(112, 91, 255, 0.22);
    }

    .stButton > button:hover {
        border-color: rgba(24, 214, 163, 0.75);
        box-shadow: 0 18px 36px rgba(24, 214, 163, 0.12);
    }

    div[data-baseweb="select"] > div {
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.06);
        border-color: var(--border-soft);
    }

    [data-testid="stImage"] img {
        border-radius: 16px;
        border: 1px solid var(--border-soft);
    }

    [data-testid="stMetric"] {
        border: 1px solid var(--border-soft);
        border-radius: 14px;
        background: rgba(32, 36, 52, 0.92);
        padding: 0.8rem;
    }

    [data-testid="stMetricLabel"] {
        color: var(--text-muted);
    }

    [data-testid="stMetricValue"] {
        color: var(--text-main);
    }

    hr {
        border-color: var(--border-soft);
        margin: 1.4rem 0;
    }

    @media (max-width: 900px) {
        .app-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .status-pill {
            white-space: normal;
        }

        .metric-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .prob-row {
            grid-template-columns: 110px 1fr 64px;
        }
    }

    @media (max-width: 620px) {
        .main .block-container {
            padding-left: 1rem;
            padding-right: 1rem;
        }

        .metric-grid {
            grid-template-columns: 1fr;
        }

        .prob-row {
            grid-template-columns: 1fr;
            gap: 0.35rem;
        }

        .prob-value {
            text-align: left;
        }
    }
</style>
"""