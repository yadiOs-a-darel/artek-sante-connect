"""Génération QR code et PDF pour ordonnances numériques."""

from __future__ import annotations

import io
from datetime import datetime
from typing import Any
from xml.sax.saxutils import escape

import qrcode
from qrcode.constants import ERROR_CORRECT_M

from app.config import settings


def build_verify_url(qr_code: str) -> str:
    base = settings.BASE_URL.rstrip("/")
    return f"{base}/api/v1/ordonnances/verify/{qr_code}"


def generate_qr_png_bytes(data: str) -> bytes:
    qr = qrcode.QRCode(version=1, error_correction=ERROR_CORRECT_M, box_size=8, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#00A651", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


def generate_qr_png_for_ordonnance(qr_code: str) -> bytes:
    return generate_qr_png_bytes(build_verify_url(qr_code))


def _format_medicaments(medicaments: list[Any]) -> tuple[list[dict[str, str]], str]:
    rows: list[dict[str, str]] = []
    instructions = ""
    for item in medicaments or []:
        if not isinstance(item, dict):
            continue
        if item.get("instructions"):
            instructions = str(item["instructions"])
            continue
        if item.get("nom"):
            rows.append(
                {
                    "nom": str(item.get("nom", "")),
                    "dosage": str(item.get("dosage", "")),
                    "frequence": str(item.get("frequence", "")),
                    "duree": str(item.get("duree", "")),
                }
            )
    return rows, instructions


def generate_ordonnance_pdf(
    *,
    qr_code: str,
    medicaments: list[Any],
    patient_label: str,
    medecin_label: str,
    ordonnance_id: str,
) -> bytes:
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
        from reportlab.lib.units import cm
        from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
    except ImportError as exc:
        raise RuntimeError(
            "reportlab est requis pour générer les PDF. pip install reportlab"
        ) from exc

    meds, instructions = _format_medicaments(medicaments)
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1.5 * cm, bottomMargin=1.5 * cm)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "Title",
        parent=styles["Heading1"],
        textColor=colors.HexColor("#00A651"),
        fontSize=18,
        spaceAfter=12,
    )
    body = styles["Normal"]

    story: list[Any] = []
    story.append(Paragraph("ARTEK Connect Santé", title_style))
    story.append(Paragraph("Ordonnance numérique", body))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(f"<b>Médecin :</b> {escape(medecin_label)}", body))
    story.append(Paragraph(f"<b>Patient :</b> {escape(patient_label)}", body))
    story.append(
        Paragraph(
            f"<b>Date :</b> {datetime.utcnow().strftime('%d/%m/%Y %H:%M')} UTC",
            body,
        )
    )
    story.append(Paragraph(f"<b>Référence :</b> {escape(ordonnance_id)}", body))
    story.append(Spacer(1, 0.6 * cm))

    if meds:
        table_data = [["Médicament", "Dosage", "Fréquence", "Durée"]]
        for m in meds:
            table_data.append([m["nom"], m["dosage"], m["frequence"], m["duree"]])
        table = Table(table_data, colWidths=[5 * cm, 3 * cm, 3.5 * cm, 3 * cm])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#00A651")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
                ]
            )
        )
        story.append(table)
    else:
        story.append(Paragraph("Aucun médicament renseigné.", body))

    if instructions:
        story.append(Spacer(1, 0.5 * cm))
        story.append(Paragraph(f"<b>Instructions :</b> {escape(instructions)}", body))

    story.append(Spacer(1, 0.8 * cm))
    qr_bytes = generate_qr_png_for_ordonnance(qr_code)
    qr_img = Image(io.BytesIO(qr_bytes), width=4 * cm, height=4 * cm)
    story.append(qr_img)
    story.append(Paragraph(f"<b>Code pharmacie :</b> {escape(qr_code)}", body))
    story.append(
        Paragraph(
            "Présentez ce code en pharmacie pour vérification.",
            ParagraphStyle("muted", parent=body, textColor=colors.grey),
        )
    )

    doc.build(story)
    return buffer.getvalue()


def pdf_url_for_ordonnance(ordonnance_id: str) -> str:
    return f"/api/v1/ordonnances/{ordonnance_id}/pdf"
