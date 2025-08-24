from pathlib import Path
from io import BytesIO
from typing import Dict, Any

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PyPDF2 import PdfReader, PdfWriter


class CharacterPDFService:
    """
    Service to generate a filled character sheet PDF from a template.

    Strategy:
    - If the template has AcroForm fields, try to populate known fields.
    - Otherwise, overlay a simple text layer with key character info.
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.template_path = project_root / "db" / "HOJA DE PERSONAJE DND 2024 IMPRIMIR.pdf"
        # Optional: register a basic font (fallback to default if not found)
        try:
            font_path = str((project_root / "templates" / "css" / "global" / "fonts" / "Inter-Regular.ttf"))
            if Path(font_path).exists():
                pdfmetrics.registerFont(TTFont("Inter", font_path))
                self.font_name = "Inter"
            else:
                self.font_name = "Helvetica"
        except Exception:
            self.font_name = "Helvetica"

    def _write_overlay(self, character: Dict[str, Any], page_size) -> BytesIO:
        packet = BytesIO()
        c = canvas.Canvas(packet, pagesize=page_size)
        c.setFont(self.font_name, 11)

        # Simple overlay positions (top-left block). Can be tuned later.
        width, height = page_size
        y = height - 50
        x = 40
        lines = [
            f"Nombre: {character.get('name', '')}",
            f"Jugador: {character.get('player_name', '')}",
            f"Nivel: {character.get('level', 1)}  EXP: {character.get('experience', 0)}",
            f"Raza: {character.get('race_name', '')}",
            f"Clase: {character.get('class_name', '')}",
            f"Alineamiento: {character.get('alignment_name', '')}",
            "Atributos:",
            f"  STR {character.get('attributes', {}).get('strength', '')}",
            f"  DEX {character.get('attributes', {}).get('dexterity', '')}",
            f"  CON {character.get('attributes', {}).get('constitution', '')}",
            f"  INT {character.get('attributes', {}).get('intelligence', '')}",
            f"  WIS {character.get('attributes', {}).get('wisdom', '')}",
            f"  CHA {character.get('attributes', {}).get('charisma', '')}",
        ]
        for line in lines:
            c.drawString(x, y, line)
            y -= 14

        c.save()
        packet.seek(0)
        return packet

    def generate_pdf(self, character: Dict[str, Any]) -> bytes:
        if not self.template_path.exists():
            raise FileNotFoundError(f"Template PDF not found: {self.template_path}")

        template_reader = PdfReader(str(self.template_path))
        writer = PdfWriter()

        # Overlay on first page
        page0 = template_reader.pages[0]
        page_size = letter
        try:
            media_box = page0.mediabox
            page_size = (float(media_box.width), float(media_box.height))
        except Exception:
            pass

        overlay_stream = self._write_overlay(character, page_size)
        overlay_reader = PdfReader(overlay_stream)
        page0.merge_page(overlay_reader.pages[0])
        writer.add_page(page0)

        for i in range(1, len(template_reader.pages)):
            writer.add_page(template_reader.pages[i])

        output = BytesIO()
        writer.write(output)
        return output.getvalue()

    def save_pdf(self, output_bytes: bytes, rel_output_path: Path) -> Path:
        abs_path = (self.project_root / rel_output_path).resolve()
        abs_path.parent.mkdir(parents=True, exist_ok=True)
        with open(abs_path, "wb") as f:
            f.write(output_bytes)
        return abs_path
