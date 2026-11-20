import sys
from lxml import etree
from pptx import Presentation
from pptx.util import Cm, Pt
from pptx.dml.color import RGBColor
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LABEL_POSITION
from pptx.enum.text import PP_ALIGN, MSO_AUTO_SIZE
from pptx.oxml.ns import qn

SRC, OUT = sys.argv[1], sys.argv[2]
BODY = Pt(54)            # tamanho original do texto do template
FONT = "Calibri"         # fonte do tema do template
BLUE = RGBColor(0x04, 0x35, 0xDA)
GREEN = RGBColor(0x2E, 0x9E, 0x3E)
NAVY = RGBColor(0x02, 0x1E, 0x5D)

prs = Presentation(SRC)
s = prs.slides[0]
shapes = [sh for sh in s.shapes if sh.has_text_frame]

def find(prefix):
    for sh in shapes:
        if sh.text_frame.text.strip().startswith(prefix):
            return sh
    raise KeyError(prefix)

def place(sh, x, y, w, h):
    sh.left, sh.top, sh.width, sh.height = Cm(x), Cm(y), Cm(w), Cm(h)

def set_paras(sh, paras):
    """Troca só o texto, mantendo o mesmo tamanho (54 pt), fonte e alinhamento do template.
    paras: lista de str ou lista de (texto, negrito)."""
    tf = sh.text_frame
    tf.auto_size = MSO_AUTO_SIZE.NONE
    body = tf._txBody
    ps = body.findall(qn('a:p'))
    tmpl_pPr = ps[0].find(qn('a:pPr'))
    for p in ps[1:]:
        body.remove(p)
    for r in ps[0].findall(qn('a:r')) + ps[0].findall(qn('a:br')):
        ps[0].remove(r)
    for i, para in enumerate(paras):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
            if tmpl_pPr is not None:
                p._p.insert(0, etree.fromstring(etree.tostring(tmpl_pPr)))
        runs = [(para, False)] if isinstance(para, str) else para
        for text, bold in runs:
            r = p.add_run()
            r.text = text
            r.font.size = BODY
            if bold:
                r.font.bold = True

# ---------------- grade (cm) ----------------
LX, RX, CW = 7.5, 47.0, 35.5
FW = RX + CW - LX          # 75 cm
HH = 2.8                   # altura das faixas de título (originais)

# Linha 1: Introdução | Materiais e Métodos
place(find('INTRODUÇÃO'), LX, 29.3, CW, HH)
place(find('MATERIAIS E MÉTODOS'), RX, 29.3, CW, HH)
intro, metodo = find('Apresentação da pe'), find('Apresentar metodol')
place(intro, LX, 32.4, CW, 19.6)
place(metodo, RX, 32.4, CW, 19.6)

set_paras(intro, [
    "Redes sociais, Pix e comércio eletrônico já fazem parte da rotina dos pequenos "
    "negócios (COSTA et al., 2022), mas essa migração ocorreu de forma improvisada. "
    "Este estudo analisa a evolução do empreendedorismo digital no Brasil entre 2021 e 2026."
])
set_paras(metodo, [
    "Pesquisa exploratório-descritiva, de abordagem mista, com revisão bibliográfica e "
    "dados secundários do Sebrae/DataSebrae (2021–2026), organizados em um dashboard "
    "analítico desenvolvido na UEMASUL, com critérios de inclusão explícitos."
])

# Linha 2: Resultados (largura total)
place(find('RESULTADOS E DISCU'), LX, 52.6, FW, HH)

cy, ch, gap = 55.9, 23.6, 1.2
cw = (FW - gap) / 2

def style_chart(gframe, title, highlight):
    chart = gframe.chart
    chart.has_legend = False
    chart.font.size = BODY
    chart.font.name = FONT
    chart.has_title = True
    tf = chart.chart_title.text_frame
    tf.text = title
    for p in tf.paragraphs:
        for r in p.runs:
            r.font.size = BODY; r.font.bold = True; r.font.name = FONT
            r.font.color.rgb = NAVY
    plot = chart.plots[0]
    plot.gap_width = 40
    plot.has_data_labels = True
    dl = plot.data_labels
    dl.number_format = '0"%"'; dl.number_format_is_linked = False
    dl.position = XL_LABEL_POSITION.OUTSIDE_END
    dl.font.size = BODY; dl.font.bold = True; dl.font.name = FONT
    ser = plot.series[0]
    ser.format.fill.solid(); ser.format.fill.fore_color.rgb = BLUE
    pt = ser.points[highlight]
    pt.format.fill.solid(); pt.format.fill.fore_color.rgb = GREEN
    va = chart.value_axis
    va.maximum_scale = 100; va.minimum_scale = 0
    va.visible = False
    va.has_major_gridlines = False
    ca = chart.category_axis
    ca.tick_labels.font.size = BODY; ca.tick_labels.font.name = FONT
    ca.format.line.color.rgb = RGBColor(0xBF, 0xC4, 0xD0)
    # moldura discreta
    sp = chart._chartSpace
    spPr = sp.find(qn('c:spPr'))
    if spPr is None:
        spPr = etree.SubElement(sp, qn('c:spPr'))
        sp.remove(spPr)
        sp.find(qn('c:chart')).addnext(spPr)
    spPr.clear()
    A = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"'
    spPr.append(etree.fromstring(f'<a:noFill {A}/>'))
    spPr.append(etree.fromstring(
        f'<a:ln {A} w="28575"><a:solidFill><a:srgbClr val="BFC4D0"/></a:solidFill></a:ln>'))

d1 = CategoryChartData()
d1.categories = ["mai/20", "dez/21", "jul/23", "nov/24", "mar/26"]
d1.add_series("% que vendem online", (59, 74, 75, 72, 73))
g1 = s.shapes.add_chart(XL_CHART_TYPE.COLUMN_CLUSTERED, Cm(LX), Cm(cy), Cm(cw), Cm(ch), d1)
g1.name = "Gráfico evolução"
style_chart(g1, "% dos pequenos negócios que vendem online", 4)

d2 = CategoryChartData()
d2.categories = ["Loja virtual", "Facebook", "Instagram", "WhatsApp"]
d2.add_series("% das vendas online", (10, 30, 57, 82))
g2 = s.shapes.add_chart(XL_CHART_TYPE.BAR_CLUSTERED, Cm(LX + cw + gap), Cm(cy), Cm(cw), Cm(ch), d2)
g2.name = "Gráfico canais"
style_chart(g2, "Dos que vendem online, % que usa cada canal (mar/26)", 3)

disc = find('Gráficos; tabelas,')
place(disc, LX, cy + ch + 0.3, FW, 7.4)
set_paras(disc, [[
    ("Fonte: Sebrae/DataSebrae. ", True),
    ("A parcela que vende online passou de 59% para 73%. O WhatsApp lidera e o Facebook "
     "caiu de 42% (2021) para 30%. Cada negócio pode usar mais de um canal.", False)
]])

# Linha 3: Conclusões | Referências
r3 = cy + ch + 8.0
place(find('CONCLUSÕES'), LX, r3, CW, HH)
place(find('REFERÊNCIAS'), RX, r3, CW, HH)
conc, refs = find('Apreciação final s'), find('Inserir as referên')
place(conc, LX, r3 + 3.1, CW, 112.8 - (r3 + 3.1))
place(refs, RX, r3 + 3.1, CW, 112.8 - (r3 + 3.1))

set_paras(conc, [
    "A presença online tornou-se essencial para os pequenos negócios. O desafio agora é "
    "qualificar e planejar os canais de venda, com mais capacitação em gestão comercial. "
    "O IMD 2026 (39 de 80 pontos) confirma esse desafio. Limitação: dados secundários."
])
set_paras(refs, [
    "COSTA, L. et al. Procedia Computer Science, v. 200, 2022.",
    "MARTINS, M. R. et al. Rev. Gestão e Desenvolvimento, v. 21, 2024.",
    "SEBRAE. Pesquisa Pulso. 12. ed. Brasília, 2026.",
    "SEBRAE. Maturidade Digital dos PN (IMD). 2026.",
])

prs.save(OUT)
print("saved", OUT, "row3 at", r3)
