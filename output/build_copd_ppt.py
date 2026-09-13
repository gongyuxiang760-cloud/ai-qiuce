#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
COPD护理个案 PPT（27页）
- 全矢量形状 + 可编辑文字
- 统一配色 / 字号 / 页眉导航
- 可直接用 WPS / PowerPoint 打开编辑
"""

from __future__ import annotations

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree

# ---------- Design tokens ----------
NAVY = RGBColor(0x1E, 0x3A, 0x8A)
BLUE = RGBColor(0x2E, 0x5B, 0xB9)
LIGHT = RGBColor(0xE8, 0xF0, 0xFE)
PALE = RGBColor(0xF5, 0xF8, 0xFC)
RED = RGBColor(0xD3, 0x2F, 0x2F)
GREEN = RGBColor(0x2E, 0x7D, 0x32)
GRAY = RGBColor(0x4A, 0x55, 0x68)
GRAY_L = RGBColor(0x90, 0xA0, 0xB0)
BLACK = RGBColor(0x1A, 0x1A, 0x1A)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
AMBER = RGBColor(0xFF, 0xC1, 0x07)

FONT = "微软雅黑"
W, H = Inches(13.333), Inches(7.5)
NAV_TABS = ["前言背景", "病例介绍", "护理过程", "总结展望"]
ASSESS_NAV = ["疾病症状", "整体健康评估", "生理功能", "自理能力ICF评估", "风险与并发症"]


# ---------- Low-level helpers ----------
def style_run(run, size=14, bold=False, color=BLACK):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = FONT
    rPr = run._r.get_or_add_rPr()
    ea = rPr.find(qn("a:ea"))
    if ea is None:
        ea = etree.SubElement(rPr, qn("a:ea"))
    ea.set("typeface", FONT)


def add_text(slide, left, top, width, height, text, size=14, bold=False, color=BLACK,
             align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    tf.word_wrap = True
    try:
        tf._txBody.bodyPr.set(
            "anchor",
            {MSO_ANCHOR.TOP: "t", MSO_ANCHOR.MIDDLE: "ctr", MSO_ANCHOR.BOTTOM: "b"}.get(anchor, "t"),
        )
    except Exception:
        pass
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    style_run(run, size, bold, color)
    return box


def add_paragraph(tf, text, size=14, bold=False, color=BLACK, align=PP_ALIGN.LEFT, before=0, after=4):
    p = tf.add_paragraph()
    p.alignment = align
    p.space_before = Pt(before)
    p.space_after = Pt(after)
    run = p.add_run()
    run.text = text
    style_run(run, size, bold, color)
    return p


def shape_fill(shape, color):
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()


def shape_line(shape, color, width_pt=1):
    shape.line.color.rgb = color
    shape.line.width = Pt(width_pt)


def add_rect(slide, left, top, width, height, fill=None, border=None, border_w=1):
    sh = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    if fill is not None:
        shape_fill(sh, fill)
    else:
        sh.fill.background()
    if border is not None:
        shape_line(sh, border, border_w)
    else:
        sh.line.fill.background()
    return sh


def add_round(slide, left, top, width, height, fill=None, border=None, border_w=1):
    sh = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    if fill is not None:
        shape_fill(sh, fill)
    else:
        sh.fill.background()
    if border is not None:
        shape_line(sh, border, border_w)
    else:
        sh.line.fill.background()
    return sh


def add_oval(slide, left, top, width, height, fill=None, border=None, border_w=1):
    sh = slide.shapes.add_shape(MSO_SHAPE.OVAL, left, top, width, height)
    if fill is not None:
        shape_fill(sh, fill)
    else:
        sh.fill.background()
    if border is not None:
        shape_line(sh, border, border_w)
    else:
        sh.line.fill.background()
    return sh


def add_pill(slide, left, top, width, height, text, fill=LIGHT, text_color=NAVY, size=12, bold=True):
    add_round(slide, left, top, width, height, fill=fill)
    add_text(slide, left, top, width, height, text, size=size, bold=bold, color=text_color,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


def add_card(slide, left, top, width, height, fill=WHITE, border=BLUE, border_w=1.25):
    return add_round(slide, left, top, width, height, fill=fill, border=border, border_w=border_w)


def add_header(slide, title, active=0):
    add_rect(slide, 0, 0, W, Inches(0.72), fill=NAVY)
    add_text(slide, Inches(0.35), Inches(0.12), Inches(4.2), Inches(0.5),
             f"▶▶  {title}", size=22, bold=True, color=WHITE, anchor=MSO_ANCHOR.MIDDLE)
    left = Inches(6.2)
    tw = Inches(1.7)
    for i, t in enumerate(NAV_TABS):
        x = left + tw * i
        c = WHITE if i == active else RGBColor(0xB0, 0xC4, 0xE8)
        add_text(slide, x, Inches(0.15), tw, Inches(0.4), t, size=12, bold=(i == active),
                 color=c, align=PP_ALIGN.CENTER)
        if i == active:
            add_rect(slide, x + Inches(0.35), Inches(0.55), Inches(1.0), Inches(0.06), fill=AMBER)
        if i < 3:
            add_rect(slide, x + tw - Inches(0.02), Inches(0.22), Inches(0.015), Inches(0.3),
                     fill=RGBColor(0x4A, 0x6F, 0xC0))


def add_footer(slide, text):
    add_text(slide, Inches(0.4), Inches(7.05), Inches(12.5), Inches(0.4), text, size=9, color=GRAY_L)


def add_progress(slide, left, top, width, height, pct, label, value, bar=RED):
    add_text(slide, left, top - Inches(0.28), width, Inches(0.28), label, size=11, color=GRAY)
    add_round(slide, left, top, width, height, fill=RGBColor(0xE0, 0xE6, 0xEF))
    fw = width * pct
    if fw > Inches(0.05):
        add_round(slide, left, top, fw, height, fill=bar)
    add_text(slide, left + width + Inches(0.1), top - Inches(0.08), Inches(0.8), height + Inches(0.1),
             value, size=14, bold=True, color=bar, anchor=MSO_ANCHOR.MIDDLE)


def add_side_nav(slide, active):
    add_card(slide, Inches(0.3), Inches(1.0), Inches(2.4), Inches(5.8), fill=PALE, border=NAVY, border_w=1.5)
    add_text(slide, Inches(0.4), Inches(1.15), Inches(2.2), Inches(0.4), "评估维度",
             size=14, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
    for i, t in enumerate(ASSESS_NAV):
        y = Inches(1.7) + Inches(i * 0.85)
        bg = NAVY if i == active else WHITE
        tc = WHITE if i == active else GRAY
        add_round(slide, Inches(0.45), y, Inches(2.1), Inches(0.7), fill=bg, border=NAVY, border_w=1)
        add_text(slide, Inches(0.45), y, Inches(2.1), Inches(0.7), t, size=12, bold=True, color=tc,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


def add_skyline(slide, y0=Inches(5.5), color=RGBColor(0x4A, 0x6A, 0x90)):
    add_rect(slide, 0, y0, W, H - y0, fill=RGBColor(0xB8, 0xCB, 0xE0))
    specs = [(0.3, 1.2), (1.2, 1.5), (2.3, 1.0), (3.5, 1.4), (4.8, 1.1),
             (6.0, 1.6), (7.3, 1.2), (8.6, 1.5), (10.0, 1.1), (11.4, 1.3)]
    for x, hgt in specs:
        add_rect(slide, Inches(x), H - Inches(hgt), Inches(0.9), Inches(hgt), fill=color)


def add_lab_table(slide, title, cols, data, left, top, width):
    add_text(slide, left, top, width, Inches(0.4), title, size=16, bold=True, color=NAVY)
    th = Inches(0.42)
    cw = [width * 0.35, width * 0.32, width * 0.33]
    y = top + Inches(0.5)
    add_rect(slide, left, y, width, th, fill=NAVY)
    x = left
    for i, c in enumerate(cols):
        add_text(slide, x, y, cw[i], th, c, size=12, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        x += cw[i]
    for ri, row in enumerate(data):
        y2 = y + th * (ri + 1)
        bg = LIGHT if ri % 2 == 0 else WHITE
        add_rect(slide, left, y2, width, th, fill=bg, border=RGBColor(0xD0, 0xD8, 0xE8), border_w=0.5)
        x = left
        for i, cell in enumerate(row):
            col = RED if i == 1 and ("↑" in cell or "↓" in cell) else BLACK
            add_text(slide, x, y2, cw[i], th, cell, size=12, bold=(i == 1), color=col,
                     align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
            x += cw[i]


def blank_slide(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_rect(s, 0, 0, W, H, fill=WHITE)
    return s


def build():
    prs = Presentation()
    prs.slide_width = W
    prs.slide_height = H

    # ===== 1 封面 =====
    s = blank_slide(prs)
    add_text(s, Inches(4.5), Inches(0.3), Inches(4.5), Inches(1.2), "202X", size=72, bold=True,
             color=RGBColor(0xD0, 0xDC, 0xF0), align=PP_ALIGN.CENTER)
    add_text(s, Inches(2), Inches(0.55), Inches(9.3), Inches(0.8), "循证为护  通肺康固",
             size=36, bold=True, color=GREEN, align=PP_ALIGN.CENTER)
    add_text(s, Inches(2), Inches(1.35), Inches(9.3), Inches(0.45), "·基于高级健康评估·",
             size=18, bold=True, color=RED, align=PP_ALIGN.CENTER)
    add_rect(s, 0, Inches(2.1), W, Inches(2.6), fill=NAVY)
    add_text(s, Inches(1), Inches(2.35), Inches(11.3), Inches(0.7), "一例慢性阻塞性肺疾病患者",
             size=32, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(s, Inches(1), Inches(3.05), Inches(11.3), Inches(0.6), "的个案护理",
             size=32, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_round(s, Inches(3.2), Inches(3.85), Inches(3.2), Inches(0.45), fill=WHITE)
    add_text(s, Inches(3.2), Inches(3.85), Inches(3.2), Inches(0.45), "汇报人：李小护 PPT",
             size=13, bold=True, color=BLACK, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    add_round(s, Inches(6.8), Inches(3.85), Inches(3.2), Inches(0.45), fill=WHITE)
    add_text(s, Inches(6.8), Inches(3.85), Inches(3.2), Inches(0.45), "时间：202X.XX.XX",
             size=13, bold=True, color=BLACK, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    add_skyline(s, y0=Inches(5.0), color=RGBColor(0x3D, 0x5A, 0x80))
    add_text(s, Inches(0.4), Inches(7.1), Inches(12), Inches(0.3),
             "护理个案汇报  ·  高级健康评估  ·  多重风险管控",
             size=11, color=WHITE, align=PP_ALIGN.CENTER)

    # ===== 2 目录 =====
    s = blank_slide(prs)
    add_rect(s, 0, 0, W, H, fill=PALE)
    add_round(s, Inches(0.5), Inches(0.5), Inches(3.8), Inches(3.8), fill=NAVY)
    add_text(s, Inches(0.7), Inches(1.5), Inches(0.6), Inches(2.2), "CONTENTS",
             size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(s, Inches(1.3), Inches(1.6), Inches(2.6), Inches(1.5), "目录",
             size=54, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    for i, (num, cn, en) in enumerate([
        ("01", "前言背景", "Background of the Preface"),
        ("02", "病例介绍", "Case introduction"),
        ("03", "护理过程", "Nursing process"),
        ("04", "总结展望", "Summary and Outlook"),
    ]):
        y = Inches(0.6) + Inches(i * 1.15)
        add_round(s, Inches(5.2), y, Inches(0.85), Inches(0.85), fill=WHITE, border=NAVY, border_w=1)
        add_text(s, Inches(5.2), y, Inches(0.85), Inches(0.85), num, size=22, bold=True, color=NAVY,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, Inches(6.3), y + Inches(0.05), Inches(6), Inches(0.45), cn, size=26, bold=True)
        add_text(s, Inches(6.3), y + Inches(0.5), Inches(6), Inches(0.35), en, size=12, color=GRAY_L)
        if i < 3:
            add_rect(s, Inches(6.3), y + Inches(1.0), Inches(5.5), Inches(0.015),
                     fill=RGBColor(0xD0, 0xD8, 0xE0))
    add_skyline(s)

    # ===== 3 疾病介绍 =====
    s = blank_slide(prs)
    add_header(s, "疾病介绍", 0)
    add_round(s, Inches(0.4), Inches(1.0), Inches(12.5), Inches(1.35), fill=PALE, border=BLUE, border_w=1.5)
    box = add_text(s, Inches(0.6), Inches(1.1), Inches(12.1), Inches(1.15), "", size=13)
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = "▶  慢性阻塞性肺疾病（COPD）是一种以持续性呼吸道症状和气流受限为特征的慢性肺部疾病，其气流受限通常呈进行性发展，与"
    style_run(r, 13, False, BLACK)
    r2 = p.add_run(); r2.text = "慢性支气管炎"; style_run(r2, 13, True, RED)
    r3 = p.add_run(); r3.text = "和"; style_run(r3, 13, False, BLACK)
    r4 = p.add_run(); r4.text = "肺气肿"; style_run(r4, 13, True, RED)
    r5 = p.add_run(); r5.text = "密切相关。"; style_run(r5, 13, False, BLACK)
    add_paragraph(tf, "▶  COPD是全球范围内导致死亡和致残的主要原因之一，严重影响患者的生活质量[1]。", 13, before=8)

    add_card(s, Inches(0.4), Inches(2.55), Inches(6.1), Inches(2.35), border=RGBColor(0xC5, 0xD0, 0xE0))
    add_text(s, Inches(0.6), Inches(2.65), Inches(5.7), Inches(0.4), "COPD的典型症状", size=16, bold=True, color=BLUE)
    for i, t in enumerate(["呼吸困难", "慢性咳嗽", "咳痰", "气短"]):
        add_pill(s, Inches(0.7) + Inches(i * 1.4), Inches(3.2), Inches(1.25), Inches(0.4), t)
    for i, label in enumerate(["胸闷", "咳嗽", "咳痰", "气促"]):
        add_oval(s, Inches(0.9) + Inches(i * 1.4), Inches(3.85), Inches(0.85), Inches(0.85),
                 fill=[RGBColor(0xFF, 0xCD, 0xD2), RGBColor(0xC8, 0xE6, 0xC9),
                       RGBColor(0xBB, 0xDE, 0xFB), RGBColor(0xFF, 0xE0, 0xB2)][i])
        add_text(s, Inches(0.9) + Inches(i * 1.4), Inches(4.0), Inches(0.85), Inches(0.55),
                 label, size=11, bold=True, color=NAVY, align=PP_ALIGN.CENTER)

    add_card(s, Inches(6.8), Inches(2.55), Inches(6.1), Inches(2.35), border=RGBColor(0xC5, 0xD0, 0xE0))
    add_text(s, Inches(7.0), Inches(2.65), Inches(5.7), Inches(0.4), "COPD的其他诱因", size=16, bold=True, color=BLUE)
    for i, (t, c) in enumerate([("过敏原刺激", RGBColor(0xF8, 0xBB, 0xD0)),
                                ("年龄增长", RGBColor(0xB3, 0xE5, 0xFC)),
                                ("内分泌失调", RGBColor(0xDC, 0xED, 0xC8))]):
        add_oval(s, Inches(7.3) + Inches(i * 1.85), Inches(3.3), Inches(1.2), Inches(1.2), fill=c)
        add_text(s, Inches(7.15) + Inches(i * 1.85), Inches(4.55), Inches(1.5), Inches(0.3),
                 t, size=12, bold=True, color=NAVY, align=PP_ALIGN.CENTER)

    add_round(s, Inches(0.4), Inches(5.1), Inches(12.5), Inches(1.7), fill=PALE, border=BLUE, border_w=1.5)
    add_oval(s, Inches(0.7), Inches(5.35), Inches(1.1), Inches(1.1), fill=RED)
    add_text(s, Inches(0.7), Inches(5.6), Inches(1.1), Inches(0.6), "禁烟", size=16, bold=True,
             color=WHITE, align=PP_ALIGN.CENTER)
    add_text(s, Inches(2.0), Inches(5.25), Inches(5), Inches(0.35), "吸烟是最主要的危险因素", size=14, bold=True)
    add_progress(s, Inches(2.0), Inches(5.9), Inches(4.2), Inches(0.28), 0.9, "吸烟史", "90%")
    for i, t in enumerate(["空气污染", "遗传因素", "职业暴露", "呼吸道感染"]):
        add_pill(s, Inches(7.5) + Inches((i % 2) * 2.5), Inches(5.4) + Inches((i // 2) * 0.55),
                 Inches(2.3), Inches(0.42), t)
    add_footer(s, "[1]毛冰佳等.海南医学,2025,36(6):883-888  [3]赵丹丹等.全科护理,2025,23(1):134-137")

    # ===== 4 流行病学 =====
    s = blank_slide(prs)
    add_header(s, "疾病介绍", 0)
    add_round(s, Inches(0.4), Inches(1.0), Inches(12.5), Inches(1.55), fill=PALE, border=BLUE, border_w=1.5)
    add_text(s, Inches(0.6), Inches(1.05), Inches(12.1), Inches(0.85),
             "COPD是全球四大慢性疾病之一，位列世界三大死因；根据WHO数据，全球约有3亿人患有COPD，其中约70%的患者未被诊断。"
             "在中国，COPD的患病率约为10%，且呈逐年上升趋势[2]。", size=13)
    add_progress(s, Inches(0.8), Inches(2.1), Inches(4.5), Inches(0.22), 0.7, "未被诊断", "70%")
    add_progress(s, Inches(7.0), Inches(2.1), Inches(4.5), Inches(0.22), 0.1, "中国COPD的患病率", "10%")

    rows = [
        ["非洲", "最高(13.9%)，西南部为热点区"],
        ["美洲", "近年稳定在14.5%左右"],
        ["欧洲", "12.4%，东欧平原为高发区"],
        ["东南亚/西太平洋", "最低(8.8%~9.7%)但中国、印度负担沉重"],
    ]
    tw, th = Inches(6.2), Inches(0.42)
    tx, ty = Inches(0.4), Inches(2.85)
    add_rect(s, tx, ty, tw, th, fill=NAVY)
    add_text(s, tx, ty, Inches(1.8), th, "地区", size=12, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    add_text(s, tx + Inches(1.8), ty, Inches(4.4), th, "患病率特点", size=12, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    for i, row in enumerate(rows):
        y = ty + th * (i + 1)
        bg = LIGHT if i % 2 == 0 else WHITE
        add_rect(s, tx, y, tw, th, fill=bg, border=RGBColor(0xD0, 0xD8, 0xE8), border_w=0.75)
        add_text(s, tx, y, Inches(1.8), th, row[0], size=11, bold=True, color=NAVY,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, tx + Inches(1.8), y, Inches(4.4), th, row[1], size=11, anchor=MSO_ANCHOR.MIDDLE)

    for i, (val, lab) in enumerate([("13.6%", "中国40岁以上人群患病率"), ("8.6%", "20岁以上人群总体患病率")]):
        add_oval(s, Inches(0.7) + Inches(i * 2.8), Inches(5.2), Inches(1.5), Inches(1.5),
                 fill=WHITE, border=RED, border_w=2.5)
        add_text(s, Inches(0.7) + Inches(i * 2.8), Inches(5.55), Inches(1.5), Inches(0.5),
                 val, size=22, bold=True, color=RED, align=PP_ALIGN.CENTER)
        add_text(s, Inches(0.5) + Inches(i * 2.8), Inches(6.75), Inches(2.0), Inches(0.35),
                 lab, size=10, color=GRAY, align=PP_ALIGN.CENTER)

    add_card(s, Inches(7.0), Inches(2.85), Inches(5.9), Inches(3.85), fill=PALE)
    add_text(s, Inches(7.2), Inches(3.0), Inches(5.5), Inches(0.4), "全球疾病负担概览（矢量示意）",
             size=14, bold=True, color=NAVY)
    for i, lab in enumerate(["非洲 13.9%", "美洲 14.5%", "欧洲 12.4%", "东南亚 8.8~9.7%"]):
        add_pill(s, Inches(7.4) + Inches((i % 2) * 2.6), Inches(3.55) + Inches((i // 2) * 0.7),
                 Inches(2.4), Inches(0.5), lab, fill=RGBColor(0xFF, 0xCD, 0xD2), text_color=RED)
    add_text(s, Inches(7.3), Inches(5.15), Inches(5.4), Inches(1.2),
             "65岁以上人群占比增加直接推高发病率。\n风险因素：吸烟、职业暴露、环境颗粒物、\n室内空气污染、环境臭氧等。",
             size=12, color=GRAY)
    add_footer(s, "[2]张艳.中文科技期刊数据库(文摘版)医药卫生,2025(2):158-161")

    # ===== 5 疾病危害 =====
    s = blank_slide(prs)
    add_header(s, "疾病危害", 0)
    add_text(s, Inches(0.2), Inches(1.2), Inches(0.55), Inches(2.2), "对患者的危害",
             size=13, bold=True, align=PP_ALIGN.CENTER)
    for i, (t, d) in enumerate([("生理功能受限", "咳嗽 · 炎症 · 卧床"),
                                ("经济负担重", "医疗支出增加"),
                                ("生活质量下降", "乏力 · 疼痛 · 活动受限")]):
        add_card(s, Inches(1.0) + Inches(i * 4.0), Inches(1.1), Inches(3.7), Inches(2.0), border=NAVY)
        add_text(s, Inches(1.1) + Inches(i * 4.0), Inches(1.25), Inches(3.5), Inches(0.45),
                 t, size=16, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
        add_oval(s, Inches(2.15) + Inches(i * 4.0), Inches(1.85), Inches(1.2), Inches(1.2),
                 fill=[RGBColor(0xFF, 0xEC, 0xB3), RGBColor(0xC8, 0xE6, 0xC9),
                       RGBColor(0xBB, 0xDE, 0xFB)][i])
        add_text(s, Inches(1.1) + Inches(i * 4.0), Inches(2.7), Inches(3.5), Inches(0.3),
                 d, size=11, color=GRAY, align=PP_ALIGN.CENTER)
    for i, (t, d) in enumerate([
        ("呼吸系统", "气道炎症造成肺功能减退、气体交换障碍；急性发作可并发肺炎。"),
        ("心血管系统", "慢性缺氧诱发肺动脉高压、肺心病，合并心脑血管疾病风险升高。"),
        ("全身性", "吸烟叠加致病，肺癌风险倍增；长期缺氧可诱发骨质疏松、肌肉萎缩。"),
    ]):
        add_card(s, Inches(0.4) + Inches(i * 4.25), Inches(3.4), Inches(4.0), Inches(3.2), fill=PALE)
        add_text(s, Inches(0.55) + Inches(i * 4.25), Inches(3.55), Inches(3.7), Inches(0.4),
                 t, size=16, bold=True, color=BLUE, align=PP_ALIGN.CENTER)
        add_text(s, Inches(0.6) + Inches(i * 4.25), Inches(4.1), Inches(3.6), Inches(1.5), d, size=13)
        add_oval(s, Inches(1.7) + Inches(i * 4.25), Inches(5.6), Inches(1.2), Inches(1.2),
                 fill=WHITE, border=BLUE, border_w=1.5)
        add_text(s, Inches(1.7) + Inches(i * 4.25), Inches(5.9), Inches(1.2), Inches(0.6),
                 ["肺", "心", "骨"][i], size=18, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
    add_footer(s, "[4]李爱华等.中华养生保健,2025,43(7):185-189")

    # ===== 6 病例介绍 =====
    s = blank_slide(prs)
    add_header(s, "病例介绍", 1)
    add_card(s, Inches(0.4), Inches(1.1), Inches(4.0), Inches(5.6), fill=PALE, border=NAVY, border_w=2)
    add_oval(s, Inches(1.55), Inches(1.4), Inches(1.7), Inches(1.7), fill=LIGHT, border=NAVY, border_w=2)
    add_text(s, Inches(1.55), Inches(1.85), Inches(1.7), Inches(0.7), "男", size=28, bold=True,
             color=NAVY, align=PP_ALIGN.CENTER)
    for i, (k, v) in enumerate([("姓名", "姚××"), ("性别", "男"), ("年龄", "69岁"),
                                ("主诉", "咳嗽、咳痰伴气短3年，加重1个月")]):
        y = Inches(3.4) + Inches(i * 0.7)
        add_text(s, Inches(0.7), y, Inches(3.4), Inches(0.3), k, size=12, color=GRAY)
        add_text(s, Inches(0.7), y + Inches(0.28), Inches(3.4), Inches(0.35), v,
                 size=16 if i < 3 else 13, bold=True)
    for i, (t, d) in enumerate([
        ("现病史", "患者于3年前开始出现咳嗽、咳痰，冬季加重，未系统治疗。1个月前因感冒后症状加重，出现明显气短，夜间不能平卧，遂来院就诊。"),
        ("既往史", "有30年吸烟史，已戒烟5年；既往有慢性支气管炎病史；无高血压、糖尿病等慢性病史。"),
        ("入院诊断", "慢性阻塞性肺疾病急性加重期"),
    ]):
        y = Inches(1.1) + Inches(i * 1.9)
        add_card(s, Inches(4.7), y, Inches(8.2), Inches(1.7))
        add_rect(s, Inches(4.7), y, Inches(0.18), Inches(1.7), fill=NAVY if i < 2 else RED)
        add_text(s, Inches(5.2), y + Inches(0.15), Inches(7.4), Inches(0.4), t, size=16, bold=True,
                 color=NAVY if i < 2 else RED)
        add_text(s, Inches(5.2), y + Inches(0.55), Inches(7.4), Inches(1.0), d, size=13)

    # ===== 7 体格检查 =====
    s = blank_slide(prs)
    add_header(s, "体格检查", 1)
    for i, (k, v) in enumerate([("T", "37.7℃"), ("P", "110次/分"), ("R", "22次/分"), ("Bp", "135/85mmHg")]):
        add_card(s, Inches(0.5) + Inches(i * 3.2), Inches(1.05), Inches(2.95), Inches(1.15), fill=NAVY, border=NAVY)
        add_text(s, Inches(0.5) + Inches(i * 3.2), Inches(1.15), Inches(2.95), Inches(0.4), k,
                 size=14, bold=True, color=RGBColor(0xB0, 0xC4, 0xE8), align=PP_ALIGN.CENTER)
        add_text(s, Inches(0.5) + Inches(i * 3.2), Inches(1.5), Inches(2.95), Inches(0.55), v,
                 size=20, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    findings = [
        ("1", "神清，精神萎靡，表情焦虑；端坐呼吸，口唇及甲床发绀；体型消瘦。"),
        ("2", "颈静脉怒张，桶状胸，肋间隙增宽，呼吸费力伴辅助呼吸肌参与。"),
        ("3", "语颤减弱，双侧对称；双肺呈过清音；肝浊音界下移。"),
        ("4", "双侧呼吸音普遍减弱；双肺可闻及散在哮鸣音。"),
        ("5", "腹软，无压痛、反跳痛。肝肋下约2cm可触及，质软缘钝，轻触痛，脾未触及，移动性浊音阴性。"),
        ("6", "双下肢胫前轻度指凹性水肿(+)，四肢肌力、肌张力正常。"),
    ]
    for i, (n, t) in enumerate(findings):
        col, row = i % 3, i // 3
        x, y = Inches(0.4) + Inches(col * 4.25), Inches(2.5) + Inches(row * 2.15)
        add_card(s, x, y, Inches(4.05), Inches(1.95), fill=PALE)
        add_oval(s, x + Inches(0.2), y + Inches(0.25), Inches(0.55), Inches(0.55), fill=NAVY)
        add_text(s, x + Inches(0.2), y + Inches(0.3), Inches(0.55), Inches(0.45), n,
                 size=16, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        add_text(s, x + Inches(0.9), y + Inches(0.25), Inches(2.95), Inches(1.5), t, size=12)

    # ===== 8 实验室检查 =====
    s = blank_slide(prs)
    add_header(s, "实验室检查", 1)
    add_lab_table(s, "血常规", ["项目", "结果", "参考值"],
                  [["白细胞", "15.2×10⁹/L ↑", "4–10×10⁹/L"],
                   ["中性粒细胞比例", "88% ↑", "50%–70%"],
                   ["CRP", "45 mg/L ↑", "<10 mg/L"]],
                  Inches(0.5), Inches(1.1), Inches(5.9))
    add_lab_table(s, "动脉血气分析", ["项目", "结果", "参考值"],
                  [["pH", "7.30 ↓", "7.35–7.45"],
                   ["PaO₂", "55 mmHg ↓", "80–100 mmHg"],
                   ["PaCO₂", "65 mmHg ↑", "35–45 mmHg"],
                   ["HCO₃⁻", "28 mmol/L", "22–27 mmol/L"]],
                  Inches(6.9), Inches(1.1), Inches(5.9))
    add_card(s, Inches(0.5), Inches(5.5), Inches(12.3), Inches(1.3),
             fill=RGBColor(0xFF, 0xEB, 0xEE), border=RED)
    add_text(s, Inches(0.7), Inches(5.65), Inches(12), Inches(0.35), "结果解读", size=14, bold=True, color=RED)
    add_text(s, Inches(0.7), Inches(6.05), Inches(12), Inches(0.55),
             "血常规提示感染；血气分析提示Ⅱ型呼吸衰竭伴失代偿性呼吸性酸中毒（低氧血症 + 高碳酸血症）。", size=13)

    # ===== 9 辅助检查 =====
    s = blank_slide(prs)
    add_header(s, "辅助检查", 1)
    for i, (t, items, col) in enumerate([
        ("心电图", ["肺性P波", "右心室肥厚"], NAVY),
        ("肺功能", ["FEV₁ 1.2 L", "FVC 2.1 L", "FEV₁/FVC 0.57"], BLUE),
        ("痰培养", ["铜绿假单胞菌阳性"], RED),
    ]):
        add_card(s, Inches(0.4) + Inches(i * 4.25), Inches(1.15), Inches(4.05), Inches(3.0),
                 border=col, border_w=2)
        add_rect(s, Inches(0.4) + Inches(i * 4.25), Inches(1.15), Inches(4.05), Inches(0.55), fill=col)
        add_text(s, Inches(0.4) + Inches(i * 4.25), Inches(1.2), Inches(4.05), Inches(0.45),
                 t, size=18, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        for j, it in enumerate(items):
            add_pill(s, Inches(0.7) + Inches(i * 4.25), Inches(2.0) + Inches(j * 0.6),
                     Inches(3.4), Inches(0.48), "▶  " + it, size=13)
    add_card(s, Inches(0.4), Inches(4.4), Inches(12.5), Inches(2.3), fill=PALE, border=NAVY, border_w=2)
    add_rect(s, Inches(0.4), Inches(4.4), Inches(2.2), Inches(2.3), fill=NAVY)
    add_text(s, Inches(0.4), Inches(5.15), Inches(2.2), Inches(0.7), "胸部CT",
             size=20, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(s, Inches(2.9), Inches(4.8), Inches(9.7), Inches(1.5),
             "双肺多发肺大疱、弥漫性肺气肿，右下肺斑片状浸润影（提示感染）。\n"
             "结合心电图提示右心室肥厚，符合慢性肺源性心脏病表现。", size=16)

    # ===== 10 诊疗经过 =====
    s = blank_slide(prs)
    add_header(s, "诊疗经过", 1)
    dates = ["7-29", "7-30", "7-31", "8-01", "8-02", "8-04"]
    labels = ["入院", "培养回报", "抗感染调整", "吸入强化", "序贯治疗", "出院"]
    details = [
        "COPD急性加重，咳黄脓痰、气促，血氧88%；低流量吸氧；头孢曲松、沙丁胺醇雾化",
        "发热、氧合差；痰培养铜绿假单胞菌阳性；加甲泼尼龙，停用头孢曲松",
        "左氧氟沙星抗感染",
        "加沙美特罗/氟替卡松吸入",
        "痰量减少，血氧改善；抗生素改为口服序贯维持",
        "症状好转出院；吸入剂＋家庭氧疗，预约肺康复门诊",
    ]
    add_rect(s, Inches(0.8), Inches(2.0), Inches(11.7), Inches(0.08), fill=NAVY)
    for i, d in enumerate(dates):
        x = Inches(1.0) + Inches(i * 2.0)
        add_oval(s, x, Inches(1.8), Inches(0.5), Inches(0.5), fill=RED if i in (0, 5) else NAVY)
        add_text(s, x - Inches(0.4), Inches(1.25), Inches(1.3), Inches(0.4), d,
                 size=14, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
        add_text(s, x - Inches(0.5), Inches(2.4), Inches(1.5), Inches(0.35), labels[i],
                 size=12, bold=True, color=RED if i in (0, 5) else BLACK, align=PP_ALIGN.CENTER)
        y = Inches(2.95) if i % 2 == 0 else Inches(4.85)
        add_card(s, x - Inches(0.55), y, Inches(1.9), Inches(1.7),
                 fill=LIGHT if i % 2 == 0 else PALE)
        add_text(s, x - Inches(0.45), y + Inches(0.1), Inches(1.7), Inches(1.5), details[i], size=10)

    # ===== 11 高级健康评估-诊断 =====
    s = blank_slide(prs)
    add_header(s, "高级健康评估", 2)
    add_side_nav(s, 0)
    add_card(s, Inches(2.95), Inches(1.0), Inches(9.95), Inches(5.8))
    add_text(s, Inches(3.2), Inches(1.15), Inches(4), Inches(0.4), "诊断", size=18, bold=True, color=NAVY)
    for i, d in enumerate(["COPD急性加重期", "肺源性心脏病（右心衰竭）", "铜绿假单胞菌性肺炎"]):
        add_pill(s, Inches(3.2), Inches(1.7) + Inches(i * 0.6), Inches(5.5), Inches(0.5), d, size=14)
    add_text(s, Inches(9.0), Inches(1.15), Inches(3.5), Inches(0.4), "症状体征", size=16, bold=True, color=NAVY)
    for i, t in enumerate([
        "1. 咳嗽咳黄脓痰、静息气短(SpO₂88%)、端坐呼吸",
        "2. 桶状胸、双肺哮鸣音+湿啰音、P2亢进",
        "3. 颈静脉怒张、肝大肋下2cm、下肢凹陷性水肿",
    ]):
        add_text(s, Inches(9.0), Inches(1.7) + Inches(i * 0.85), Inches(3.6), Inches(0.8), t, size=12)
    labs = [("血气分析", "pH 7.32\nPaO₂ 55\nPaCO₂ 55"),
            ("血常规", "WBC 12.5×10⁹/L\n中性粒 88%"),
            ("痰培养", "铜绿假单胞菌\n阳性"),
            ("肺功能", "FEV₁ 1.2L\nFVC 2.1L\n比值 0.57")]
    for i, (t, d) in enumerate(labs):
        add_card(s, Inches(3.2) + Inches(i * 2.35), Inches(4.0), Inches(2.2), Inches(2.4),
                 fill=PALE, border=NAVY)
        add_rect(s, Inches(3.2) + Inches(i * 2.35), Inches(4.0), Inches(2.2), Inches(0.45), fill=NAVY)
        add_text(s, Inches(3.2) + Inches(i * 2.35), Inches(4.05), Inches(2.2), Inches(0.35),
                 t, size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        add_text(s, Inches(3.3) + Inches(i * 2.35), Inches(4.6), Inches(2.0), Inches(1.6),
                 d, size=13, bold=True, align=PP_ALIGN.CENTER)

    # ===== 12 整体健康评估 =====
    s = blank_slide(prs)
    add_header(s, "高级健康评估", 2)
    add_side_nav(s, 1)
    rows12 = [
        ("生命体征", "T 37.8℃，P 110次/分，R 28次/分，BP 135/85 mmHg"),
        ("意识/神志", "神志清醒，定向力正常"),
        ("睡眠", "夜间因呼吸困难无法平卧，端坐呼吸"),
        ("饮食食欲", "食欲一般，进食量减少50%，气促影响进食"),
        ("营养状况", "消瘦，BMI 17.2，白蛋白 32 g/L ↓"),
        ("大小便", "尿量800 ml/24h（少尿），轻微便秘"),
        ("皮肤/口腔舌苔", "口唇发绀，下肢皮肤张力高（水肿）"),
        ("肌力/活动度", "肌力4级，床边活动气促加重"),
        ("语言行为", "言语简短（气促所致），治疗配合度差"),
        ("心理情绪", "情绪稳定，对康复有信心，无焦虑/抑郁表现"),
        ("社会关系与支持", "配偶陪护，子女外地工作"),
    ]
    for i, (k, v) in enumerate(rows12):
        y = Inches(1.0) + Inches(i * 0.52)
        bg = LIGHT if i % 2 == 0 else WHITE
        add_rect(s, Inches(2.95), y, Inches(2.6), Inches(0.48), fill=NAVY if i % 2 == 0 else BLUE)
        add_text(s, Inches(2.95), y, Inches(2.6), Inches(0.48), k, size=12, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_rect(s, Inches(5.55), y, Inches(7.35), Inches(0.48), fill=bg,
                 border=RGBColor(0xD0, 0xD8, 0xE8), border_w=0.5)
        add_text(s, Inches(5.7), y, Inches(7.1), Inches(0.48), v, size=12, anchor=MSO_ANCHOR.MIDDLE)

    # ===== 13 生理功能 =====
    s = blank_slide(prs)
    add_header(s, "高级健康评估", 2)
    add_side_nav(s, 2)
    for i, (k, v) in enumerate([
        ("神经系统", "意识清醒，病理征阴性（-）。"),
        ("呼吸系统", "活动后呼吸困难加重，听诊双肺哮鸣音及湿啰音。"),
        ("循环系统", "右心衰竭，颈静脉怒张 + 肝大 + 水肿。"),
        ("消化系统", "肝淤血损伤 ALT 68 U/L，AST 72 U/L。"),
        ("泌尿系统", "尿量减少 800 ml/24h。"),
        ("血液系统", "白细胞升高，WBC 12.5×10⁹/L。"),
        ("电解质/酸碱平衡", "失代偿性呼吸性酸中毒（pH 7.32），血钾 4.0 mmol/L。"),
    ]):
        y = Inches(1.1) + Inches(i * 0.75)
        add_card(s, Inches(2.95), y, Inches(9.95), Inches(0.65), fill=PALE if i % 2 == 0 else WHITE)
        add_pill(s, Inches(3.1), y + Inches(0.1), Inches(2.6), Inches(0.45), k,
                 fill=NAVY, text_color=WHITE)
        add_text(s, Inches(5.9), y + Inches(0.1), Inches(6.8), Inches(0.45), v, size=13,
                 anchor=MSO_ANCHOR.MIDDLE)

    # ===== 14 自理能力 =====
    s = blank_slide(prs)
    add_header(s, "高级健康评估", 2)
    add_side_nav(s, 3)
    icf = [
        ("认知功能", "MMSE评分28分，认知功能正常。"),
        ("吞咽功能", "饮水试验1级，安全吞咽正常。"),
        ("躯体活动与移动", "Barthel指数45分，重度依赖。"),
        ("自理能力", "洗漱、穿衣、如厕需全程协助。"),
        ("排泄功能", "尿便控制可，但如厕需搀扶。"),
        ("交流能力", "能理解医护指导，可有效表达需求。"),
        ("社会能力", "家庭角色明确，社会适应良好。"),
    ]
    for i, (k, v) in enumerate(icf):
        col, row = i % 2, i // 2
        if i == 6:
            x, y, w = Inches(2.95), Inches(1.1) + Inches(3 * 1.4), Inches(9.95)
        else:
            x = Inches(2.95) + Inches(col * 5.05)
            y = Inches(1.1) + Inches(row * 1.4)
            w = Inches(4.85)
        add_card(s, x, y, w, Inches(1.25), border=NAVY)
        add_text(s, x + Inches(0.2), y + Inches(0.15), w - Inches(0.4), Inches(0.35),
                 k, size=14, bold=True, color=NAVY)
        add_text(s, x + Inches(0.2), y + Inches(0.55), w - Inches(0.4), Inches(0.55), v, size=13)

    # ===== 15 风险 =====
    s = blank_slide(prs)
    add_header(s, "高级健康评估", 2)
    add_side_nav(s, 4)
    risk_headers = ["评估项目", "评分", "风险"]
    risk_rows = [
        ["跌倒/坠床风险", "55分", "高风险"],
        ["VTE风险评估", "5分", "高风险"],
        ["Braden压疮风险评估", "14分", "高风险"],
        ["营养风险评估", "NRS 2002：4分", "中风险"],
        ["感染风险", "铜绿假单胞菌阳性", "菌血症风险"],
        ["疾病潜在并发症", "心肾综合征、急性心衰", "需密切监测"],
    ]
    tx, ty, tw, th = Inches(2.95), Inches(1.15), Inches(9.95), Inches(0.55)
    cw = [Inches(3.6), Inches(3.2), Inches(3.15)]
    add_rect(s, tx, ty, tw, th, fill=NAVY)
    x = tx
    for i, hname in enumerate(risk_headers):
        add_text(s, x, ty, cw[i], th, hname, size=14, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        x += cw[i]
    for ri, row in enumerate(risk_rows):
        y = ty + th * (ri + 1)
        bg = RGBColor(0xFF, 0xEB, 0xEE) if "高" in row[2] else (
            RGBColor(0xFF, 0xF8, 0xE1) if "中" in row[2] else LIGHT)
        add_rect(s, tx, y, tw, th, fill=bg, border=RGBColor(0xD0, 0xD8, 0xE8), border_w=0.5)
        x = tx
        for i, cell in enumerate(row):
            col = RED if i == 2 and "高" in cell else BLACK
            add_text(s, x, y, cw[i], th, cell, size=13, bold=(i == 2), color=col,
                     align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
            x += cw[i]
    add_text(s, Inches(2.95), Inches(6.5), Inches(9.95), Inches(0.4),
             "提示：跌倒、VTE、压疮均为高风险，需同步实施多重风险管控。", size=13, bold=True, color=RED)

    # ===== 16 循证 =====
    s = blank_slide(prs)
    add_header(s, "循证护理", 2)
    steps = [
        ("提出问题", "围绕气体交换受损、清理呼吸道无效、多重并发症风险提出PICO问题。"),
        ("查找文献", "在知网、万方、维普、中华医学会检索关键词；主题词+自由词；2020–2025年1月；可获取全文。"),
        ("检索结果", "数据库检索 n=112 → 阅读文题摘要 n=80 → 全文阅读 n=36 → 最终纳入 n=11。"),
        ("循证依据", "形成气体交换管理、排痰护理、跌倒/VTE/压疮防控等循证护理措施。"),
    ]
    for i, (t, d) in enumerate(steps):
        y = Inches(1.1) + Inches(i * 1.4)
        add_oval(s, Inches(0.5), y + Inches(0.25), Inches(0.9), Inches(0.9), fill=NAVY)
        add_text(s, Inches(0.5), y + Inches(0.4), Inches(0.9), Inches(0.6), str(i + 1),
                 size=22, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        if i < 3:
            add_rect(s, Inches(0.88), y + Inches(1.15), Inches(0.12), Inches(0.5), fill=LIGHT)
        add_card(s, Inches(1.7), y, Inches(11.1), Inches(1.2), fill=PALE)
        add_text(s, Inches(2.0), y + Inches(0.15), Inches(10.5), Inches(0.35), t, size=16, bold=True, color=NAVY)
        add_text(s, Inches(2.0), y + Inches(0.55), Inches(10.5), Inches(0.55), d, size=13)
    for i, (lab, n) in enumerate([("知网", "45"), ("万方", "26"), ("维普", "18"), ("中华医学会", "23")]):
        add_pill(s, Inches(3.0) + Inches(i * 2.4), Inches(6.55), Inches(2.2), Inches(0.4),
                 f"{lab} n={n}", size=11)

    # ===== 17 健康问题 =====
    s = blank_slide(prs)
    add_header(s, "健康问题", 2)
    for i, (lab, col) in enumerate([("P  健康问题", NAVY), ("E  相关因素", BLUE), ("S  症状和体征", RED)]):
        add_rect(s, Inches(0.4) + Inches(i * 4.25), Inches(1.05), Inches(4.05), Inches(0.55), fill=col)
        add_text(s, Inches(0.4) + Inches(i * 4.25), Inches(1.05), Inches(4.05), Inches(0.55),
                 lab, size=16, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    problems = [
        ("P1：气体交换受损",
         "与COPD导致的肺气肿改变、血流比例失调及铜绿假单胞菌感染加重炎症反应有关",
         "活动后气短（需辅助呼吸）；夜间不能平卧；SpO₂下降；桶状胸"),
        ("P2：清理呼吸道无效",
         "与痰液黏稠、咳嗽无力及支气管痉挛有关",
         "咳痰不畅、痰液黏稠；肺部听诊湿啰音；无效咳嗽"),
        ("P3：多重并发症风险",
         "与患者活动耐力下降、血栓风险有关",
         "跌倒/坠床、VTE、压疮 Braden 风险均为高风险"),
    ]
    for i, (p, e, ss) in enumerate(problems):
        y = Inches(1.8) + Inches(i * 1.65)
        for j, txt in enumerate([p, e, ss]):
            add_card(s, Inches(0.4) + Inches(j * 4.25), y, Inches(4.05), Inches(1.45),
                     fill=PALE if j == 0 else WHITE)
            add_text(s, Inches(0.55) + Inches(j * 4.25), y + Inches(0.2), Inches(3.75), Inches(1.1),
                     txt, size=13, bold=(j == 0), color=NAVY if j == 0 else BLACK)

    # ===== 18 =====
    s = blank_slide(prs)
    add_header(s, "护理措施", 2)
    add_pill(s, Inches(0.4), Inches(1.0), Inches(3.2), Inches(0.45), "诊断一  气体交换受损",
             fill=NAVY, text_color=WHITE, size=14)
    add_pill(s, Inches(3.8), Inches(1.0), Inches(3.2), Inches(0.45), "气体交换 + 感染控制", size=13)
    add_text(s, Inches(0.4), Inches(1.6), Inches(12.5), Inches(0.4),
             "如何处理患者的气体交换受损症状，改善患者呼吸？", size=15, bold=True, color=GRAY)
    add_card(s, Inches(0.4), Inches(2.15), Inches(12.5), Inches(4.5), fill=PALE, border=NAVY)
    add_text(s, Inches(0.7), Inches(2.35), Inches(8), Inches(0.4), "急性期 · 氧疗精准化管理",
             size=16, bold=True, color=NAVY)
    for i, t in enumerate([
        "▶ 给予文丘里面罩吸氧，根据动脉血气（每4小时监测）调整氧流量，维持 SpO₂ 88%–92%",
        "▶ 床头悬挂“低流量吸氧”警示牌，班班交接氧疗参数",
        "▶ 密切观察呼吸频率、节律、发绀及意识变化",
        "▶ 结合循证证据实施无创通气相关护理（必要时）",
    ]):
        add_text(s, Inches(0.8), Inches(3.0) + Inches(i * 0.55), Inches(11.8), Inches(0.5), t, size=14)
    add_footer(s, "[6]王亮等.临床合理用药,2025,18(16):5-7,26")

    # ===== 19 =====
    s = blank_slide(prs)
    add_header(s, "护理措施", 2)
    add_pill(s, Inches(0.4), Inches(1.0), Inches(3.2), Inches(0.45), "诊断一  气体交换受损",
             fill=NAVY, text_color=WHITE, size=14)
    add_pill(s, Inches(3.8), Inches(1.0), Inches(2.2), Inches(0.45), "急性期",
             fill=RED, text_color=WHITE, size=13)
    for i, (t, items) in enumerate([
        ("抗感染护理", [
            "静脉输注左氧氟沙星（0.5 g q12h）",
            "输注前核查皮试结果，控制滴速（60滴/分）",
            "输注后观察皮疹、消化道反应",
            "单间隔离：专用听诊器、体温计",
            "医疗垃圾用双层黄色袋密封",
        ]),
        ("环境管理", [
            "保持病房空气清新",
            "温度控制在22–24℃",
            "湿度维持在50%–60%",
            "定期进行空气消毒",
            "适宜温湿度减少呼吸道刺激，改善舒适度[7]",
        ]),
    ]):
        add_card(s, Inches(0.4) + Inches(i * 6.4), Inches(1.7), Inches(6.1), Inches(4.9),
                 border=BLUE, border_w=2)
        add_rect(s, Inches(0.4) + Inches(i * 6.4), Inches(1.7), Inches(6.1), Inches(0.6), fill=NAVY)
        add_text(s, Inches(0.4) + Inches(i * 6.4), Inches(1.8), Inches(6.1), Inches(0.4),
                 t, size=18, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        for j, it in enumerate(items):
            add_text(s, Inches(0.7) + Inches(i * 6.4), Inches(2.55) + Inches(j * 0.65),
                     Inches(5.5), Inches(0.55), "●  " + it, size=14)
    add_footer(s, "[7]王婷婷等.中西医结合护理(中英文),2025,11(3):41-44")

    # ===== 20 =====
    s = blank_slide(prs)
    add_header(s, "护理措施", 2)
    add_pill(s, Inches(0.4), Inches(1.0), Inches(3.2), Inches(0.45), "诊断一  气体交换受损",
             fill=NAVY, text_color=WHITE, size=14)
    add_pill(s, Inches(3.8), Inches(1.0), Inches(2.2), Inches(0.45), "好转期",
             fill=GREEN, text_color=WHITE, size=13)
    add_card(s, Inches(0.4), Inches(1.65), Inches(7.8), Inches(5.0), fill=PALE)
    add_text(s, Inches(0.7), Inches(1.85), Inches(7), Inches(0.4), "呼吸训练 · 强化措施",
             size=16, bold=True, color=NAVY)
    for i, t in enumerate([
        "▶ 指导缩唇呼吸 + 腹式呼吸组合训练",
        "  半卧位，鼻吸气2秒 → 缩唇呼气4–6秒（吸呼比1:2）",
        "  每日3次 × 10分钟",
        "▶ 缩唇呼吸：吸呼比1:3，5分钟/次，3次/日",
        "▶ 腹式呼吸：仰卧屈膝，手置腹部感受起伏",
        "▶ 训练后立即监测 RR、SpO₂ 并记录",
        "▶ 氧疗降阶梯：改为鼻导管吸氧（2 L/min）",
        "▶ 强化感染控制：晨起深部吸痰送培养至连续2次阴性",
        "▶ 口腔护理 bid（氯己定漱口水）",
    ]):
        add_text(s, Inches(0.7), Inches(2.4) + Inches(i * 0.42), Inches(7.3), Inches(0.4), t, size=13)
    add_card(s, Inches(8.5), Inches(1.65), Inches(4.4), Inches(5.0), border=GREEN, border_w=2)
    add_text(s, Inches(8.5), Inches(1.8), Inches(4.4), Inches(0.4), "效果评价",
             size=16, bold=True, color=GREEN, align=PP_ALIGN.CENTER)
    for i, (d, r) in enumerate([
        ("第3天", "SpO₂ 94%（静息）\n痰量减少50%"),
        ("第7天", "PaO₂ 68 mmHg\n痰培养转阴"),
        ("结论", "氧合恢复，感染源控制\n护理有效"),
    ]):
        y = Inches(2.4) + Inches(i * 1.3)
        add_pill(s, Inches(8.8), y, Inches(3.8), Inches(0.4), d)
        add_text(s, Inches(8.8), y + Inches(0.45), Inches(3.8), Inches(0.7), r,
                 size=13, bold=True, align=PP_ALIGN.CENTER)

    # ===== 21 =====
    s = blank_slide(prs)
    add_header(s, "护理措施", 2)
    add_pill(s, Inches(0.4), Inches(1.0), Inches(3.5), Inches(0.45), "诊断二  清理呼吸道无效",
             fill=NAVY, text_color=WHITE, size=14)
    add_pill(s, Inches(4.1), Inches(1.0), Inches(3.2), Inches(0.45), "排痰 + 压疮预防", size=13)
    add_text(s, Inches(0.4), Inches(1.6), Inches(12.5), Inches(0.4),
             "如何处理患者痰液黏稠、咳嗽无力症状，改善通气？", size=15, bold=True, color=GRAY)
    add_card(s, Inches(0.4), Inches(2.15), Inches(12.5), Inches(4.5), fill=PALE, border=NAVY)
    add_text(s, Inches(0.7), Inches(2.35), Inches(8), Inches(0.4), "急性期 · 排痰物理治疗",
             size=16, bold=True, color=NAVY)
    for i, t in enumerate([
        "▶ 雾化吸入：布地奈德 2 mg + 异丙托溴铵 500 μg，bid",
        "▶ 面罩式雾化器使用后以75%酒精擦拭",
        "▶ 体位引流：根据病变部位取头低足高15°侧卧位",
        "▶ 餐前10分钟引流，同步叩击背部",
        "▶ 结合高频振动排痰系统与时效性激励模式[8]",
        "▶ 鼓励有效咳嗽，观察痰量、性状及颜色",
    ]):
        add_text(s, Inches(0.8), Inches(3.0) + Inches(i * 0.5), Inches(11.8), Inches(0.45), t, size=14)
    add_footer(s, "[8]王春霞.中国科技期刊数据库医药,2025(3):183-186")

    # ===== 22 =====
    s = blank_slide(prs)
    add_header(s, "护理措施", 2)
    add_pill(s, Inches(0.4), Inches(1.0), Inches(3.5), Inches(0.45), "诊断二  清理呼吸道无效",
             fill=NAVY, text_color=WHITE, size=14)
    for i, (t, items) in enumerate([
        ("训练排痰", ["深吸气 → 屏气3秒 → 用力咳出", "指导坐位呼吸联合排痰技术"]),
        ("压疮预防整合", ["气垫床＋泡沫敷料减压", "定时翻身，检查骨突皮肤"]),
        ("营养支持协作", ["营养科定制高蛋白流质饮食", "少量多次补水，稀释痰液"]),
    ]):
        add_card(s, Inches(0.4) + Inches(i * 4.25), Inches(1.7), Inches(4.05), Inches(2.8))
        add_rect(s, Inches(0.4) + Inches(i * 4.25), Inches(1.7), Inches(4.05), Inches(0.55), fill=NAVY)
        add_text(s, Inches(0.4) + Inches(i * 4.25), Inches(1.8), Inches(4.05), Inches(0.4),
                 t, size=15, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        for j, it in enumerate(items):
            add_text(s, Inches(0.6) + Inches(i * 4.25), Inches(2.5) + Inches(j * 0.7),
                     Inches(3.7), Inches(0.6), "●  " + it, size=13)
    add_card(s, Inches(0.4), Inches(4.75), Inches(12.5), Inches(1.9), border=GREEN, border_w=2)
    add_text(s, Inches(0.7), Inches(4.9), Inches(3), Inches(0.4), "效果评价", size=16, bold=True, color=GREEN)
    add_text(s, Inches(0.7), Inches(5.4), Inches(11.8), Inches(1.0),
             "第3天：日均痰排量40 ml，骶部皮肤完整，减压装置起效。\n"
             "第7天：自主咳嗽能力提升，Braden评分→17分。护理有效。", size=13)
    add_footer(s, "[9]苏凤华.中外医疗,2025,44(1):113-116")

    # ===== 23 =====
    s = blank_slide(prs)
    add_header(s, "护理措施", 2)
    add_pill(s, Inches(0.4), Inches(1.0), Inches(3.5), Inches(0.45), "诊断三  多重并发症风险",
             fill=NAVY, text_color=WHITE, size=14)
    add_pill(s, Inches(4.1), Inches(1.0), Inches(3.8), Inches(0.45), "跌倒 + VTE + 心肾监测", size=13)
    add_text(s, Inches(0.4), Inches(1.6), Inches(12.5), Inches(0.4),
             "如何处理患者活动耐力下降导致的跌倒风险？", size=15, bold=True, color=GRAY)
    add_card(s, Inches(0.4), Inches(2.15), Inches(12.5), Inches(4.5), fill=PALE, border=NAVY)
    add_text(s, Inches(0.7), Inches(2.35), Inches(8), Inches(0.4), "急性期 · 跌倒三级防控",
             size=16, bold=True, color=NAVY)
    for i, t in enumerate([
        "▶ 病房地面保持干燥，设置防滑标识，通道无障碍物，确保活动空间通畅[10]",
        "▶ 用药监护：呋塞米注射后30分钟内床旁监护，防体位性低血压",
        "▶ 床栏保护，呼叫器置于触手可及处，落实高危跌倒标识",
        "▶ 协助如厕与转移，避免夜间独自下床",
        "▶ 家属参与风险管理，强化健康教育",
    ]):
        add_text(s, Inches(0.8), Inches(3.0) + Inches(i * 0.55), Inches(11.8), Inches(0.5), t, size=14)
    add_footer(s, "[10]秦娟等.中文科技期刊数据库(文摘版)医药卫生,2025(6):177-180")

    # ===== 24 =====
    s = blank_slide(prs)
    add_header(s, "护理措施", 2)
    add_pill(s, Inches(0.4), Inches(1.0), Inches(3.5), Inches(0.45), "诊断三  多重并发症风险",
             fill=NAVY, text_color=WHITE, size=14)
    add_card(s, Inches(0.4), Inches(1.65), Inches(6.2), Inches(5.0))
    add_text(s, Inches(0.6), Inches(1.8), Inches(5.8), Inches(0.4), "VTE预防组合", size=16, bold=True, color=NAVY)
    for i, t in enumerate([
        "1. 抗凝：依诺肝素40 mg皮下注射，距脐周≥5 cm，按压5 min",
        "2. 穿戴梯度弹力袜，每日检查下肢皮肤",
        "3. 每小时踝泵运动10–15次",
        "4. 每日下床活动3次，每次15–20 min",
        "5. 渐进式活动：踝泵→床边坐立→扶行训练",
        "6. 活动时监测Borg呼吸困难评分",
    ]):
        add_text(s, Inches(0.7), Inches(2.4) + Inches(i * 0.55), Inches(5.7), Inches(0.5), t, size=12)
    add_card(s, Inches(6.9), Inches(1.65), Inches(6.0), Inches(2.6), fill=PALE, border=NAVY)
    add_text(s, Inches(7.1), Inches(1.8), Inches(5.6), Inches(0.4), "心肾功能监测", size=16, bold=True, color=NAVY)
    add_text(s, Inches(7.1), Inches(2.35), Inches(5.6), Inches(1.6),
             "持续心电监护，复查心电图、心超评估心功能；刻度器具记录出入量，每班汇总；"
             "低盐低脂优质蛋白饮食，维持水电解质，减轻心肾负担。", size=13)
    add_card(s, Inches(6.9), Inches(4.45), Inches(6.0), Inches(2.2), border=GREEN, border_w=2)
    add_text(s, Inches(7.1), Inches(4.6), Inches(5.6), Inches(0.35), "效果评价", size=15, bold=True, color=GREEN)
    add_text(s, Inches(7.1), Inches(5.1), Inches(5.6), Inches(1.3),
             "第3天：跌倒评分→45分，下肢周径差<1 cm。\n第7天：独立行走10 m，24h尿量1500 ml。护理有效。",
             size=13)
    add_footer(s, "[11]张蒙等.海军医学杂志,2025,46(2):200-204")

    # ===== 25 总结 =====
    s = blank_slide(prs)
    add_header(s, "总结", 3)
    summaries = [
        ("动态风险评估", "用Morse量表评估跌倒风险，Padua量表评估VTE风险，结合心肾功能指标动态判断多重并发症风险等级。"),
        ("多学科协作", "医护协同调整方案，强化患者及家属健康教育，营养干预助力心肾负担减轻。"),
        ("精准监测管理", "持续监护生命体征，记录出入量，复查心肾功能指标，及时发现异常变化。"),
        ("分层预防干预", "实施环境改造防跌倒，运用弹力袜与踝泵运动防VTE，通过控制活动与用药规避风险。"),
    ]
    for i, (t, d) in enumerate(summaries):
        col, row = i % 2, i // 2
        x = Inches(0.4) + Inches(col * 6.45)
        y = Inches(1.2) + Inches(row * 2.75)
        add_card(s, x, y, Inches(6.2), Inches(2.5), border=NAVY, border_w=2)
        add_rect(s, x, y, Inches(6.2), Inches(0.65), fill=NAVY)
        add_text(s, x, y + Inches(0.1), Inches(6.2), Inches(0.45), f"{i+1:02d}  {t}",
                 size=18, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        add_text(s, x + Inches(0.3), y + Inches(0.9), Inches(5.6), Inches(1.4), d, size=14)

    # ===== 26 参考文献 =====
    s = blank_slide(prs)
    add_header(s, "参考文献", 3)
    refs = [
        "[1] 毛冰佳,朱玉芬,张繁.基于微信平台的家庭参与式风险管理护理模式在稳定期慢性阻塞性肺疾病中的应用[J].海南医学,2025,36(6):883-888.",
        "[2] 张艳.在慢性阻塞性肺疾病患者中应用护理质量专科监测指标对吸入剂使用正确率的影响[J].中文科技期刊数据库(文摘版)医药卫生,2025(2):158-161.",
        "[3] 赵丹丹,许晓霞,沈霞,等.常规护理联合呼吸操对稳定期慢性阻塞性肺疾病病人的影响[J].全科护理,2025,23(1):134-137.",
        "[4] 李爱华,刘敏,董洁.高频振动排痰系统结合时效性激励模式在重症慢性阻塞性肺疾病伴呼吸衰竭中的应用[J].中华养生保健,2025,43(7):185-189.",
        "[5] 赵晓花.探讨慢性阻塞性肺疾病急性加重期患者中应用体外膈肌刺激疗法联合促排痰护理的效果分析[J].中文科技期刊数据库(引文版)医药卫生,2025(5):188-191.",
        "[6] 王亮,王保兰,姜洁,等.大剂量氨溴索联合左氧氟沙星治疗老年慢性阻塞性肺疾病合并重症肺炎的临床效果[J].临床合理用药,2025,18(16):5-7,26.",
        "[7] 王婷婷,王海兄.基于行为转变理论的肺康复护理结合脐灸在慢性阻塞性肺疾病患者中的应用[J].中西医结合护理(中英文),2025,11(3):41-44.",
        "[8] 王春霞.医护与家属协同护理模式对慢性阻塞性肺疾病急性加重期患者的影响分析[J].中国科技期刊数据库医药,2025(3):183-186.",
        "[9] 苏凤华.综合护理对改善矽肺合并慢性阻塞性肺疾病患者生活质量的影响[J].中外医疗,2025,44(1):113-116.",
        "[10] 秦娟,罗丹,韩正风.老年慢性阻塞性肺疾病患者的衰弱评估及分级护理干预[J].中文科技期刊数据库(文摘版)医药卫生,2025(6):177-180.",
        "[11] 张蒙,张东亚,蒋波.积极心理学团体护理干预对慢性阻塞性肺疾病患者心理健康水平及主观幸福感的影响[J].海军医学杂志,2025,46(2):200-204.",
    ]
    box = add_text(s, Inches(0.5), Inches(1.0), Inches(12.3), Inches(5.8), "", size=11)
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    r = p.add_run(); r.text = refs[0]; style_run(r, 11, False, BLACK)
    for ref in refs[1:]:
        add_paragraph(tf, ref, size=11, before=6, after=2)

    # ===== 27 封底 =====
    s = blank_slide(prs)
    add_text(s, Inches(4.5), Inches(0.8), Inches(4.5), Inches(1.0), "202X", size=64, bold=True,
             color=RGBColor(0xD0, 0xDC, 0xF0), align=PP_ALIGN.CENTER)
    add_text(s, Inches(2), Inches(1.0), Inches(9.3), Inches(0.7), "循证为护  通肺康固",
             size=34, bold=True, color=GREEN, align=PP_ALIGN.CENTER)
    add_text(s, Inches(2), Inches(1.75), Inches(9.3), Inches(0.4), "·基于高级健康评估·",
             size=16, bold=True, color=RED, align=PP_ALIGN.CENTER)
    add_rect(s, 0, Inches(2.5), W, Inches(2.4), fill=NAVY)
    add_text(s, Inches(1), Inches(3.0), Inches(11.3), Inches(0.7), "以循证护肺，以温情暖心",
             size=36, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(s, Inches(1), Inches(3.8), Inches(11.3), Inches(0.5), "感谢聆听  ·  敬请指正",
             size=18, color=RGBColor(0xB0, 0xC4, 0xE8), align=PP_ALIGN.CENTER)
    add_round(s, Inches(5.0), Inches(5.2), Inches(3.3), Inches(0.5), fill=LIGHT)
    add_text(s, Inches(5.0), Inches(5.2), Inches(3.3), Inches(0.5), "时间：202X.XX.XX",
             size=14, bold=True, color=NAVY, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    add_skyline(s, y0=Inches(6.0), color=RGBColor(0x4A, 0x6A, 0x90))

    out_dir = "/workspace/output"
    os.makedirs(out_dir, exist_ok=True)
    pptx_path = os.path.join(out_dir, "COPD护理个案_高级健康评估_27页.pptx")
    prs.save(pptx_path)
    print(f"Saved: {pptx_path}")
    print(f"Slides: {len(prs.slides)}")
    return pptx_path


if __name__ == "__main__":
    build()
