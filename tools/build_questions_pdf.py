from pathlib import Path
import shutil

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT_DIR = Path(__file__).resolve().parent.parent
DOWNLOADS_DIR = ROOT_DIR / "downloads"
DOCS_DIR = ROOT_DIR / "docs"
ASSETS_DIR = ROOT_DIR / "assets"
PDF_PATH = DOWNLOADS_DIR / "darmowy-pdf-wyrozniki.pdf"
DOCS_COPY_PATH = DOCS_DIR / "darmowy-pdf-wyrozniki.pdf"
LOGO_PATH = ASSETS_DIR / "Projekt-bez-nazwy.png"

PAGE_WIDTH, PAGE_HEIGHT = A4
BRAND = colors.HexColor("#164CA9")
BRAND_DARK = colors.HexColor("#103A81")
ACCENT = colors.HexColor("#DFD11D")
TEXT = colors.HexColor("#102142")
TEXT_MID = colors.HexColor("#46587F")
SURFACE = colors.HexColor("#EEF4FF")
SUCCESS = colors.HexColor("#7CBC52")
CTA = colors.HexColor("#F05A59")
CARD_BORDER = colors.HexColor("#D9E4FA")
CARD_FILL = colors.white
INTRO_FILL = colors.HexColor("#F4F8FF")
CTA_FILL = colors.HexColor("#FFF1F0")

QUESTIONS = [
    {
        "number": 1,
        "title": "Model finansowania - abonament vs fee for service",
        "body": [
            "To punkt, od którego warto zacząć.",
            "Abonament = placówka dostała pieniądze z góry -> terminów brakuje.",
            "Fee for service = płatność za realną wizytę -> specjalista jest dostępny.",
            "Dostępność i jakość opieki zaczyna się właśnie tutaj.",
        ],
    },
    {
        "number": 2,
        "title": "Czy możesz objąć pakietem rodziców?",
        "body": [
            "Małżonek i dzieci w polisie to dziś niemal standard. Ale możliwość objęcia rodziców to benefit, który naprawdę robi efekt WOW i wyróżnia pracodawcę na tle rynku.",
        ],
    },
    {
        "number": 3,
        "title": "Czy wiesz, czego potrzebują Twoi pracownicy?",
        "body": [
            "Pakiety \"z katalogu\" rzadko trafiają w sedno. Dlatego pierwszym krokiem powinna być ankieta potrzeb.",
        ],
        "tip": "Mamy gotowe, sprawdzone narzędzie. Chcesz to zrobić dobrze? Odezwij się.",
    },
    {
        "number": 4,
        "title": "Ile realnie czeka się na wizytę?",
        "body": [
            "Regulaminy swoje, życie swoje. Najprostszy test: sprawdź, ile czeka pacjent z pakietem, a ile prywatny klient.",
        ],
        "tip": "Mamy sprawdzony sposób, jak weryfikować dostępność w praktyce.",
    },
    {
        "number": 5,
        "title": "Kto faktycznie płaci za pakiet?",
        "body": [
            "Nawet niewielkie dopłaty pracownika mogą skutkować rezygnacją. Dane rynkowe pokazują jasno: finansowanie przez firmę zwiększa realne korzystanie z pakietu.",
        ],
    },
    {
        "number": 6,
        "title": "Czy po podpisaniu umowy ktoś się zajmie Twoją firmą?",
        "body": [
            "Agent, broker, support czy tylko infolinia? To decyduje, czy HR będzie miał wsparcie, czy zostanie sam z pytaniami pracowników.",
        ],
    },
    {
        "number": 7,
        "title": "Czy pakiet obejmuje rehabilitację i zdrowie psychiczne?",
        "body": [
            "86% Polaków ma bóle kręgosłupa (WP abcZdrowie). Tymczasem w 9 na 10 pakietów rehabilitacja nie istnieje. To kluczowe przy siedzącym trybie pracy.",
        ],
    },
]


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("AppSans", "C:/Windows/Fonts/arial.ttf"))
    pdfmetrics.registerFont(TTFont("AppSansBold", "C:/Windows/Fonts/arialbd.ttf"))


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="HeroTitle",
            parent=styles["Normal"],
            fontName="AppSansBold",
            fontSize=26,
            leading=30,
            textColor=BRAND,
            alignment=TA_LEFT,
            spaceAfter=7,
        )
    )
    styles.add(
        ParagraphStyle(
            name="HeroSubtitle",
            parent=styles["Normal"],
            fontName="AppSans",
            fontSize=14,
            leading=18,
            textColor=BRAND_DARK,
            alignment=TA_LEFT,
        )
    )
    styles.add(
        ParagraphStyle(
            name="IntroLead",
            parent=styles["Normal"],
            fontName="AppSansBold",
            fontSize=16,
            leading=20,
            textColor=BRAND_DARK,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            parent=styles["Normal"],
            fontName="AppSans",
            fontSize=11,
            leading=15,
            textColor=TEXT_MID,
        )
    )
    styles.add(
        ParagraphStyle(
            name="QuestionTitle",
            parent=styles["Normal"],
            fontName="AppSansBold",
            fontSize=15,
            leading=19,
            textColor=BRAND,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="QuestionMarker",
            parent=styles["Normal"],
            fontName="AppSansBold",
            fontSize=16,
            leading=18,
            textColor=SUCCESS,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Tip",
            parent=styles["Normal"],
            fontName="AppSansBold",
            fontSize=10.5,
            leading=14,
            textColor=BRAND_DARK,
            spaceBefore=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionTitle",
            parent=styles["Normal"],
            fontName="AppSansBold",
            fontSize=15,
            leading=19,
            textColor=BRAND,
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CtaTitle",
            parent=styles["Normal"],
            fontName="AppSansBold",
            fontSize=17,
            leading=21,
            textColor=CTA,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ContactName",
            parent=styles["Normal"],
            fontName="AppSansBold",
            fontSize=16,
            leading=19,
            textColor=BRAND,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ContactPhone",
            parent=styles["Normal"],
            fontName="AppSansBold",
            fontSize=16,
            leading=19,
            textColor=BRAND_DARK,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ContactMeta",
            parent=styles["Normal"],
            fontName="AppSans",
            fontSize=10.5,
            leading=13,
            textColor=TEXT_MID,
        )
    )
    styles.add(
        ParagraphStyle(
            name="FooterNote",
            parent=styles["Normal"],
            fontName="AppSans",
            fontSize=9,
            leading=12,
            textColor=TEXT_MID,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Website",
            parent=styles["Normal"],
            fontName="AppSans",
            fontSize=9,
            leading=12,
            textColor=TEXT_MID,
            alignment=2,
        )
    )
    return styles


def wrap_in_card(content, background=CARD_FILL, border=CARD_BORDER):
    card = Table([[content]], colWidths=[None])
    card.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), background),
                ("BOX", (0, 0), (-1, -1), 0.8, border),
                ("ROUNDEDCORNERS", [10, 10, 10, 10]),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    return card


def build_question(question, styles):
    check = Paragraph('&bull;', styles["QuestionMarker"])
    title = Paragraph(f'{question["number"]}. {question["title"]}', styles["QuestionTitle"])
    body_parts = [Paragraph(line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"), styles["Body"]) for line in question["body"]]
    if question.get("tip"):
        body_parts.append(Paragraph(f'Wskazówka: {question["tip"]}', styles["Tip"]))

    header = Table([[check, title]], colWidths=[10 * mm, 160 * mm])
    header.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))

    content = [header, Spacer(1, 2 * mm)]
    for paragraph in body_parts:
        content.append(paragraph)
        content.append(Spacer(1, 1.5 * mm))
    content.pop()

    return KeepTogether([wrap_in_card(content), Spacer(1, 4 * mm)])


def build_pdf():
    register_fonts()
    styles = build_styles()
    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
        title="7 pytań, które zmieniają pakiet medyczny w realne wsparcie",
        author="Benefity Zdrowotne dla Firm",
    )

    story = []
    logo = Image(str(LOGO_PATH), width=40 * mm, height=20 * mm)
    hero_text = [
        Paragraph("7 pytań, które zmieniają pakiet medyczny w realne wsparcie", styles["HeroTitle"]),
        Paragraph("(przekaż go osobie, która zajmuje się benefitami u Ciebie w pracy)", styles["HeroSubtitle"]),
    ]
    hero = Table([[hero_text, logo]], colWidths=[128 * mm, 40 * mm])
    hero.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    story.append(hero)
    story.append(Spacer(1, 4 * mm))
    story.append(Table([[" "]], colWidths=[180 * mm], style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), ACCENT), ("BOTTOMPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 0)])))
    story.append(Spacer(1, 4 * mm))

    intro = [
        Paragraph("Pakiet medyczny może być game-changerem... albo kompletną fikcją.", styles["IntroLead"]),
        Paragraph("Różnica? To, jaki i jak wybierzesz.", styles["Body"]),
    ]
    story.append(wrap_in_card(intro, background=INTRO_FILL, border=INTRO_FILL))
    story.append(Spacer(1, 4 * mm))

    for question in QUESTIONS[:4]:
        story.append(build_question(question, styles))

    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("benefityzdrowotne.pl", styles["Website"]))
    story.append(PageBreak())

    story.append(wrap_in_card([
        Paragraph("Lista pytań, która porządkuje rozmowę z dostawcą opieki medycznej", styles["SectionTitle"]),
        Paragraph("To materiał, który warto mieć pod ręką, zanim firma podpisze umowę.", styles["Body"]),
    ]))
    story.append(Spacer(1, 4 * mm))

    for question in QUESTIONS[4:]:
        story.append(build_question(question, styles))

    cta = [
        Paragraph("Chcesz sprawdzić, jak wyglądałby najlepszy pakiet w Twojej firmie?", styles["CtaTitle"]),
        Paragraph("Napisz do nas - przeprowadzimy Cię krok po kroku przez proces.", styles["Body"]),
    ]
    story.append(wrap_in_card(cta, background=CTA_FILL, border=colors.HexColor("#F9D2D1")))
    story.append(Spacer(1, 5 * mm))

    contacts_inner = Table(
        [[
            Paragraph("Patrycja Rożek", styles["ContactName"]),
            Paragraph("Joanna Ligierska-Sadło", styles["ContactName"]),
        ], [
            Paragraph("665 359 534", styles["ContactPhone"]),
            Paragraph("791 032 017", styles["ContactPhone"]),
        ], [
            Paragraph("benefityzdrowotne@gmail.com", styles["ContactMeta"]),
            Paragraph("benefityzdrowotne.pl", styles["ContactMeta"]),
        ]],
        colWidths=[87 * mm, 87 * mm],
    )
    contacts_inner.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 12), ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    story.append(contacts_inner)
    story.append(Spacer(1, 8 * mm))
    story.append(Table([[" "]], colWidths=[180 * mm], style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), ACCENT), ("BOTTOMPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 0)])))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("Benefity Zdrowotne dla Firm | praktyczne wdrożenia pakietów medycznych dla firm", styles["FooterNote"]))

    doc.build(story)
    shutil.copy2(PDF_PATH, DOCS_COPY_PATH)


if __name__ == "__main__":
    build_pdf()
