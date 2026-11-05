"""UI Component Library and Design System for SignalDesk.

Provides SVG Lucide icons, sparklines, Plotly chart builders,
card wrappers, and topbar layouts designed to recreate the reference design.
"""

from typing import Dict, List, Optional, Any
import base64
import os
import plotly.graph_objects as go
import pandas as pd


# 1. LUCIDE ICONS (stroke-width 1.75, crisp vector rendering)
def get_svg_icon(name: str, color: str = "#0E5E44", size: int = 18) -> str:
    """Return inline SVG for requested Lucide icon."""
    icons = {
        "overview": (
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'
            f'<polyline points="9 22 9 12 15 12 15 22"/></svg>'
        ),
        "sparkles": (
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21'
            f'l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>'
            f'<path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>'
        ),
        "layers": (
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>'
            f'<path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>'
            f'<path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>'
        ),
        "bar-chart": (
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
            f'<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/>'
            f'<line x1="6" x2="6" y1="20" y2="16"/></svg>'
        ),
        "info": (
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
            f'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
        ),
        "ticket": (
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>'
            f'<path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>'
        ),
        "credit-card": (
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
            f'<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>'
        ),
        "headphones": (
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>'
            f'</svg>'
        ),
        "alert-triangle": (
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>'
            f'<line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>'
        ),
        "target": (
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
            f'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'
        ),
        "bell": (
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>'
        ),
        "check": (
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
            f'<polyline points="20 6 9 17 4 12"/></svg>'
        ),
        "arrow-right": (
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'
        ),
        "search": (
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
            f'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>'
        )
    }
    return icons.get(name, "")


def get_sparkline_svg(color: str = "#10B981", variant: int = 1) -> str:
    """Return subtle smooth SVG sparkline mimicking KPI cards."""
    curves = {
        1: "M 0 18 Q 15 10, 30 14 T 60 4 T 90 8",      # Upward green
        2: "M 0 16 Q 20 18, 40 10 T 70 8 T 90 4",      # Gentle blue
        3: "M 0 15 Q 25 8, 50 16 T 75 10 T 90 6",      # Purple wave
        4: "M 0 14 Q 20 17, 45 12 T 70 14 T 90 7"      # Red gentle
    }
    path_d = curves.get(variant, curves[1])
    return (
        f'<svg width="84" height="26" viewBox="0 0 90 22" fill="none" xmlns="http://www.w3.org/2000/svg">'
        f'<path d="{path_d}" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        f'</svg>'
    )


def image_to_base64(filepath: str) -> str:
    """Read an image from disk and return data URI string."""
    if os.path.exists(filepath):
        with open(filepath, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
        ext = os.path.splitext(filepath)[1].replace(".", "").lower()
        mime = "image/png" if ext == "png" else f"image/{ext}"
        return f"data:{mime};base64,{encoded}"
    return ""


# 2. HERO BANNER COMPONENT
def render_hero_banner(
    hero_img_path: str,
    latest_classified: Optional[Dict[str, str]] = None
) -> str:
    """Construct HTML markup for the hero banner matching ui.png."""
    img_uri = image_to_base64(hero_img_path)

    classified_cat = latest_classified.get("category", "Billing & Payment") if latest_classified else "Billing & Payment"
    classified_prio = latest_classified.get("priority", "High") if latest_classified else "High"
    prio_class = "sd-badge-high" if classified_prio == "High" else ("sd-badge-med" if classified_prio == "Medium" else "sd-badge-low")

    overlay_card = f"""
    <div class="sd-floating-badge">
      <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700; font-size: 0.85rem; color: #1E293B; margin-bottom: 0.5rem;">
        <span style="color: #0E5E44;">{get_svg_icon('check', color='#0E5E44', size=16)}</span>
        <span>Ticket Classified</span>
      </div>
      <div style="font-size: 0.75rem; color: #64748B; margin-bottom: 0.3rem;">
        • Category: <b style="color: #1E293B;">{classified_cat}</b>
      </div>
      <div style="font-size: 0.75rem; color: #64748B; display: flex; align-items: center; gap: 0.4rem;">
        • Priority: <span class="{prio_class}">{classified_prio}</span>
      </div>
    </div>
    """

    hero_html = f"""
    <div class="sd-hero-card">
      <div class="sd-hero-content">
        <div class="sd-hero-title">Welcome to <span>SignalDesk</span></div>
        <div class="sd-hero-sub">
          AI-powered support ticket intelligence that classifies, prioritizes and analyzes customer queries in seconds.
        </div>
        <div class="sd-hero-buttons">
          <a href="?page=analyze" target="_self" style="text-decoration: none;">
            <button class="stButton" style="background-color: #0E5E44; color: white; border: none; border-radius: 10px; padding: 0.65rem 1.4rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; box-shadow: 0 4px 12px rgba(14,94,68,0.18);">
              {get_svg_icon('sparkles', color='#FFFFFF', size=16)} Analyze a Ticket →
            </button>
          </a>
          <a href="?page=about" target="_self" style="text-decoration: none;">
            <button class="sd-btn-secondary" style="border: 1px solid #D5E0D7; background: #FFFFFF; color: #1E293B; border-radius: 10px; padding: 0.65rem 1.25rem; font-weight: 600; cursor: pointer;">
              ▷ See How it Works
            </button>
          </a>
        </div>
      </div>
      {overlay_card}
      <div class="sd-hero-image-wrap">
        <img class="sd-hero-image" src="{img_uri}" alt="Customer Support Specialist"/>
      </div>
    </div>
    """
    return hero_html


# 3. KPI CARDS ROW BUILDER
def render_kpi_card_html(
    title: str,
    value_str: str,
    trend_str: str,
    icon_name: str,
    sparkline_color: str,
    sparkline_variant: int = 1,
    info_tooltip: Optional[str] = None
) -> str:
    """Build single KPI card with real data."""
    icon_svg = get_svg_icon(icon_name, color="#475569", size=18)
    sparkline_svg = get_sparkline_svg(color=sparkline_color, variant=sparkline_variant)
    info_icon = f'<span title="{info_tooltip}" style="cursor: pointer; color: #94A3B8;">{get_svg_icon("info", color="#94A3B8", size=15)}</span>' if info_tooltip else ""

    return f"""
    <div class="sd-kpi-card">
      <div class="sd-kpi-header">
        <span class="sd-kpi-icon">{icon_svg}</span>
        <span>{title}</span>
      </div>
      <div class="sd-kpi-val">{value_str}</div>
      <div class="sd-kpi-footer">
        <span class="sd-trend-pill">↑ {trend_str}</span>
        {sparkline_svg}
        {info_icon}
      </div>
    </div>
    """


# 4. PLOTLY CHARTS MATCHING THE DESIGN
def build_category_donut_chart(category_counts: Dict[str, int]) -> go.Figure:
    """Build minimalist Donut chart with real category counts and center total."""
    labels = list(category_counts.keys())
    values = list(category_counts.values())
    total_val = sum(values)

    # Cohesive botanical / teal / slate / warm palette matching UI design
    palette = [
        "#0E5E44",  # Botanical green
        "#14B8A6",  # Muted teal
        "#0284C7",  # Slate blue
        "#F59E0B",  # Amber
        "#8B5CF6",  # Lavender/Violet
        "#64748B"   # Cool Charcoal
    ]
    colors = palette[:len(labels)]

    fig = go.Figure(data=[
        go.Pie(
            labels=labels,
            values=values,
            hole=0.68,
            marker=dict(colors=colors, line=dict(color="#FFFFFF", width=2)),
            textinfo="none",
            hoverinfo="label+value+percent",
            direction="clockwise",
            sort=False
        )
    ])

    fig.update_layout(
        showlegend=True,
        legend=dict(
            orientation="v",
            yanchor="middle",
            y=0.5,
            xanchor="left",
            x=1.02,
            font=dict(family="Plus Jakarta Sans", size=12, color="#1E293B")
        ),
        annotations=[
            dict(
                text=f"<b style='font-size:22px; color:#1E293B;'>{total_val:,}</b><br><span style='font-size:12px; color:#64748B;'>Tickets</span>",
                x=0.5,
                y=0.5,
                showarrow=False,
                font=dict(family="Plus Jakarta Sans")
            )
        ],
        margin=dict(t=10, b=10, l=10, r=10),
        height=260,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)"
    )
    return fig


def build_priority_bar_chart(priority_counts: Dict[str, int]) -> go.Figure:
    """Build minimalist vertical bar chart for High, Medium, Low priorities."""
    tiers = ["High", "Medium", "Low"]
    counts = [priority_counts.get(t, 0) for t in tiers]

    # Matching the reference colors: coral/rose, warm amber, emerald green
    tier_colors = [
        "#F87171",  # High (soft coral)
        "#FBBF24",  # Medium (amber)
        "#34D399"   # Low (soft emerald)
    ]

    fig = go.Figure(data=[
        go.Bar(
            x=tiers,
            y=counts,
            text=[f"{c:,}" for c in counts],
            textposition="outside",
            textfont=dict(family="Plus Jakarta Sans", size=12, color="#1E293B"),
            marker=dict(
                color=tier_colors,
                cornerradius=8,
                line=dict(width=0)
            ),
            width=0.55
        )
    ])

    max_c = max(counts) if counts else 100
    fig.update_layout(
        yaxis=dict(
            range=[0, max_c * 1.25],
            gridcolor="#F1F5F2",
            showgrid=True,
            zeroline=False,
            tickfont=dict(family="Plus Jakarta Sans", size=11, color="#64748B")
        ),
        xaxis=dict(
            tickfont=dict(family="Plus Jakarta Sans", size=12, color="#1E293B"),
            showgrid=False
        ),
        margin=dict(t=25, b=10, l=10, r=10),
        height=260,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)"
    )
    return fig


# 5. RECENT TICKETS LIST COMPONENT
def render_recent_tickets_html(tickets_df: pd.DataFrame, limit: int = 4) -> str:
    """Build HTML for Recent Tickets component matching ui.png."""
    items_html = []
    category_icons = {
        "Billing & Payment": "credit-card",
        "Technical Support": "headphones",
        "Product Issues": "layers",
        "Account & Service": "overview",
        "Order & Delivery": "ticket",
        "General Inquiry": "sparkles"
    }

    recent_slice = tickets_df.head(limit)
    for idx, row in recent_slice.iterrows():
        cat = str(row.get("category", "General Inquiry"))
        prio = str(row.get("priority", "Medium"))
        text = str(row.get("ticket_text", ""))
        
        # Format text preview
        title_snip = text.replace("\n", " ").strip()
        if len(title_snip) > 34:
            title_snip = title_snip[:34] + "..."

        prio_class = "sd-badge-high" if prio == "High" else ("sd-badge-med" if prio == "Medium" else "sd-badge-low")
        icon_name = category_icons.get(cat, "ticket")
        icon_svg = get_svg_icon(icon_name, color="#0E5E44", size=16)

        # Relative time mock calculation for realism
        minutes_ago = (idx + 1) * 6 + 2

        item_str = f"""
        <div class="sd-recent-item">
          <div class="sd-recent-left">
            <div class="sd-recent-icon">{icon_svg}</div>
            <div style="overflow: hidden;">
              <div class="sd-recent-title" title="{text}">{title_snip}</div>
              <div class="sd-recent-sub">{cat} • {minutes_ago} min ago</div>
            </div>
          </div>
          <div>
            <span class="{prio_class}">{prio}</span>
          </div>
        </div>
        """
        items_html.append(item_str)

    return "".join(items_html)

