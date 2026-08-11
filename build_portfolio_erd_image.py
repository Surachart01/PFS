from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


OUT = Path("portfolio-erd.png")

W, H = 2200, 1500
BG = "#F8FAFC"
CARD = "#FFFFFF"
BORDER = "#CBD5E1"
HEADER = "#1F4D78"
HEADER_ALT = "#2E74B5"
TEXT = "#0F172A"
MUTED = "#475569"
KEY = "#D97706"
FK = "#2563EB"
LINE = "#334155"
NOTE_BG = "#EFF6FF"

FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def font(size, bold=False):
    path = FONT_BOLD if bold and Path(FONT_BOLD).exists() else FONT_REG
    return ImageFont.truetype(path, size)


title_font = font(54, True)
subtitle_font = font(26)
entity_font = font(28, True)
field_font = font(22)
field_bold = font(22, True)
small_font = font(19)
rel_font = font(21, True)


entities = {
    "USER": {
        "xy": (110, 210),
        "wh": (500, 590),
        "fields": [
            ("id", "PK"),
            ("studentId", "UK"),
            ("firstName", ""),
            ("lastName", ""),
            ("email", "UK"),
            ("passwordHash", ""),
            ("role", ""),
            ("department", ""),
            ("year", ""),
            ("status", ""),
            ("createdAt", ""),
            ("updatedAt", ""),
        ],
    },
    "PORTFOLIO": {
        "xy": (880, 210),
        "wh": (560, 550),
        "fields": [
            ("id", "PK"),
            ("userId", "FK"),
            ("title", ""),
            ("slug", "UK"),
            ("status", ""),
            ("theme", ""),
            ("styleSettings", ""),
            ("publishedAt", ""),
            ("createdAt", ""),
            ("updatedAt", ""),
        ],
    },
    "PORTFOLIO_SECTION": {
        "xy": (1540, 265),
        "wh": (540, 440),
        "fields": [
            ("id", "PK"),
            ("portfolioId", "FK"),
            ("type", ""),
            ("title", ""),
            ("visible", ""),
            ("sectionOrder", ""),
            ("content", ""),
        ],
    },
    "SECTION_ITEM": {
        "xy": (1540, 900),
        "wh": (540, 390),
        "fields": [
            ("id", "PK"),
            ("sectionId", "FK"),
            ("name", ""),
            ("description", ""),
            ("techStack", ""),
            ("link", ""),
        ],
    },
    "SESSION": {
        "xy": (110, 930),
        "wh": (500, 350),
        "fields": [
            ("id", "PK"),
            ("userId", "FK"),
            ("sessionToken", "UK"),
            ("expiresAt", ""),
            ("createdAt", ""),
        ],
    },
}


def rounded_rect(draw, xy, radius, fill, outline, width=2):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def center_of(name):
    x, y = entities[name]["xy"]
    w, h = entities[name]["wh"]
    return x + w // 2, y + h // 2


def side_point(name, side):
    x, y = entities[name]["xy"]
    w, h = entities[name]["wh"]
    if side == "right":
        return x + w, y + h // 2
    if side == "left":
        return x, y + h // 2
    if side == "top":
        return x + w // 2, y
    if side == "bottom":
        return x + w // 2, y + h
    raise ValueError(side)


def draw_entity(draw, name, data, accent=HEADER):
    x, y = data["xy"]
    w, h = data["wh"]
    rounded_rect(draw, (x, y, x + w, y + h), 18, CARD, BORDER, 3)
    draw.rounded_rectangle((x, y, x + w, y + 74), radius=18, fill=accent)
    draw.rectangle((x, y + 38, x + w, y + 74), fill=accent)
    draw.text((x + 28, y + 20), name, fill="#FFFFFF", font=entity_font)

    row_y = y + 92
    row_h = 39
    for idx, (field, marker) in enumerate(data["fields"]):
        if idx % 2 == 1:
            draw.rectangle((x + 1, row_y - 6, x + w - 1, row_y + row_h - 6), fill="#F8FAFC")
        color = TEXT
        fnt = field_font
        if marker == "PK":
            color = KEY
            fnt = field_bold
        elif marker == "FK":
            color = FK
            fnt = field_bold
        draw.text((x + 28, row_y), field, fill=color, font=fnt)
        if marker:
            badge_w = 54 if marker != "UK" else 50
            badge_x = x + w - badge_w - 28
            badge_y = row_y - 3
            badge_fill = "#FEF3C7" if marker == "PK" else "#DBEAFE" if marker == "FK" else "#E0E7FF"
            badge_text = "#92400E" if marker == "PK" else "#1D4ED8" if marker == "FK" else "#4338CA"
            draw.rounded_rectangle(
                (badge_x, badge_y, badge_x + badge_w, badge_y + 26),
                radius=8,
                fill=badge_fill,
                outline=None,
            )
            tw = draw.textlength(marker, font=small_font)
            draw.text((badge_x + (badge_w - tw) / 2, badge_y + 2), marker, fill=badge_text, font=small_font)
        row_y += row_h


def draw_relation(draw, p1, p2, label, start_card, end_card, bend=None):
    if bend:
        points = [p1, bend, p2]
        draw.line(points, fill=LINE, width=4, joint="curve")
        label_x = bend[0] + 18
        label_y = bend[1] - 36
    else:
        draw.line((p1, p2), fill=LINE, width=4)
        label_x = (p1[0] + p2[0]) // 2 - 28
        if abs(p1[1] - p2[1]) < 60:
            label_y = min(p1[1], p2[1]) - 58
        else:
            label_y = (p1[1] + p2[1]) // 2 - 42

    def dot(pt):
        x, y = pt
        draw.ellipse((x - 8, y - 8, x + 8, y + 8), fill=LINE)

    dot(p1)
    dot(p2)
    draw.text((p1[0] + 10, p1[1] - 30), start_card, fill=LINE, font=rel_font)
    draw.text((p2[0] - 58, p2[1] - 30), end_card, fill=LINE, font=rel_font)

    tw = draw.textlength(label, font=rel_font)
    draw.rounded_rectangle(
        (label_x - 10, label_y - 6, label_x + tw + 10, label_y + 26),
        radius=8,
        fill=BG,
        outline=None,
    )
    draw.text((label_x, label_y), label, fill=LINE, font=rel_font)


def main():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    draw.text((95, 70), "ER Diagram - Online Portfolio System", fill=HEADER, font=title_font)
    draw.text(
        (98, 132),
        "Computer Engineering Student Portfolio | Next.js + MongoDB",
        fill=MUTED,
        font=subtitle_font,
    )

    draw_entity(draw, "USER", entities["USER"], HEADER)
    draw_entity(draw, "PORTFOLIO", entities["PORTFOLIO"], HEADER_ALT)
    draw_entity(draw, "PORTFOLIO_SECTION", entities["PORTFOLIO_SECTION"], HEADER)
    draw_entity(draw, "SECTION_ITEM", entities["SECTION_ITEM"], HEADER_ALT)
    draw_entity(draw, "SESSION", entities["SESSION"], HEADER)

    draw_relation(
        draw,
        side_point("USER", "right"),
        side_point("PORTFOLIO", "left"),
        "owns",
        "1",
        "0..1",
    )
    draw_relation(
        draw,
        side_point("USER", "bottom"),
        side_point("SESSION", "top"),
        "has",
        "1",
        "0..N",
    )
    draw_relation(
        draw,
        side_point("PORTFOLIO", "right"),
        side_point("PORTFOLIO_SECTION", "left"),
        "embeds",
        "1",
        "0..N",
    )
    draw_relation(
        draw,
        side_point("PORTFOLIO_SECTION", "bottom"),
        side_point("SECTION_ITEM", "top"),
        "contains",
        "1",
        "0..N",
    )

    note_x, note_y, note_w, note_h = 760, 1125, 680, 150
    draw.rounded_rectangle((note_x, note_y, note_x + note_w, note_y + note_h), radius=18, fill=NOTE_BG, outline="#BFDBFE", width=2)
    draw.text((note_x + 28, note_y + 26), "MongoDB design note", fill="#1D4ED8", font=field_bold)
    draw.text((note_x + 28, note_y + 64), "PORTFOLIO_SECTION and SECTION_ITEM can be", fill=TEXT, font=small_font)
    draw.text((note_x + 28, note_y + 92), "embedded arrays inside the PORTFOLIO document.", fill=TEXT, font=small_font)

    legend_x, legend_y = 108, 1345
    for i, (label, fill, text) in enumerate(
        [
            ("PK = Primary Key", "#FEF3C7", "#92400E"),
            ("FK = Foreign Key", "#DBEAFE", "#1D4ED8"),
            ("UK = Unique Key", "#E0E7FF", "#4338CA"),
        ]
    ):
        x = legend_x + i * 290
        draw.rounded_rectangle((x, legend_y, x + 42, legend_y + 28), radius=8, fill=fill)
        draw.text((x + 54, legend_y + 2), label, fill=text, font=small_font)

    img.save(OUT, "PNG", optimize=True)


if __name__ == "__main__":
    main()
