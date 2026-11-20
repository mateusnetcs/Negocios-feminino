"""
Fonte única dos dados do dashboard.

Todos os números abaixo foram conferidos nas publicações oficiais do Sebrae/DataSebrae
(links em FONTES). Rode `python3 tools/gerar_dados.py` para regenerar:
  - data/dados.json        (consumido pelo dashboard)
  - data/csv/*.csv         (uma tabela por arquivo)
  - database/schema.sql    (tabelas para PostgreSQL/Supabase)
  - database/seed.sql      (carga dos dados)
"""
import csv, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FONTES = [
    {"id": "pulso12", "titulo": "Pesquisa Pulso dos Pequenos Negócios – 12ª edição",
     "orgao": "Sebrae", "data": "2026-04-16", "campo": "fev–mar/2026, 8,2 mil empreendedores",
     "url": "https://agenciasebrae.com.br/dados/whatsapp-se-consolida-nas-vendas-on-line-enquanto-facebook-e-lojas-proprias-perdem-folego/"},
    {"id": "ds_serie", "titulo": "DataSebrae – Transformação Digital (série histórica e canais, planilha oficial)",
     "orgao": "Sebrae/Google", "data": "2026-03-01", "campo": "Impacto da Pandemia (até mai/22) e Pulso (a partir de ago/22)",
     "url": "https://datasebrae.com.br/wp-content/uploads/2026/07/grafico-terceiro-slide.xlsx"},
    {"id": "datasebrae_td", "titulo": "DataSebrae – Transformação Digital (painel)",
     "orgao": "Sebrae", "data": "2026-04-14", "campo": "Últimos dados disponíveis",
     "url": "https://datasebrae.com.br/transformacao-digital/"},
    {"id": "imd2026", "titulo": "Pesquisa Maturidade Digital dos Pequenos Negócios (IMD) 2026",
     "orgao": "Sebrae", "data": "2026-08-01", "campo": "20/jul–21/ago/2026, 7.182 entrevistas (MEI, ME, EPP)",
     "url": "https://datasebrae.com.br/wp-content/uploads/2026/09/Relatorio-Completo-da-Pesquisa-2026.pdf"},
    {"id": "ia2025", "titulo": "Sondagem Econômica MEI e MPE – Uso de IA nos negócios",
     "orgao": "Sebrae/FGV/Google", "data": "2025-11-30", "campo": "set/2025, ~5.000 empresas",
     "url": "https://datasebrae.com.br/wp-content/uploads/2026/01/Uso-de-IA-nos-negocios-2025-1.pdf"},
    {"id": "persp2026", "titulo": "Perspectivas Digitais nos Negócios",
     "orgao": "Sebrae/FGV", "data": "2026-04-15", "campo": "02–31/mar/2026, 4.967 respostas",
     "url": "https://datasebrae.com.br/wp-content/uploads/2026/07/Perspectivas-Digitais-nos-PN-2026-v2.pdf"},
    {"id": "td2025", "titulo": "Digitalização recorde: pequenos negócios atingem nível histórico em 2025",
     "orgao": "Sebrae (ASN)", "data": "2025-06-23", "campo": "Pesquisa Transformação Digital 2025",
     "url": "https://agenciasebrae.com.br/inovacao-e-tecnologia/digitalizacao-recorde-pequenos-negocios-no-brasil-atingem-nivel-historico-em-2025/"},
    {"id": "td2026", "titulo": "Transformação Digital nos Pequenos Negócios (2026) – Brasil x EUA",
     "orgao": "Sebrae", "data": "2026-05-08", "campo": "24/mar–08/mai/2026, 7.182 entrevistas, erro 1,2 p.p.",
     "url": "https://datasebrae.com.br/wp-content/uploads/2026/08/4-Relatorio-Completo-v2.pdf"},
    {"id": "td2022", "titulo": "Inclusão digital já chegou a 100% dos pequenos negócios (Transformação Digital 2022)",
     "orgao": "Sebrae (ASN)", "data": "2023-03-14", "campo": "25/jul–27/set/2022, 6.345 empreendedores",
     "url": "https://agenciasebrae.com.br/dados/inclusao-digital-ja-chegou-a-100-dos-pequenos-negocios-no-pais/"},
    {"id": "td2023", "titulo": "Sete em cada 10 pequenos negócios têm perfis nas redes sociais",
     "orgao": "Sebrae (ASN)", "data": "2023-12-19", "campo": "Transformação Digital nos Pequenos Negócios 2023",
     "url": "https://agenciasebrae.com.br/dados/sete-em-cada-10-pequenos-negocios-tem-perfis-nas-redes-sociais-instagram-e-a-plataforma-preferida/"},
    {"id": "mulheres2026", "titulo": "Mais de 10 milhões de mulheres lideram pequenos negócios",
     "orgao": "Sebrae (ASN), a partir da PNAD Contínua/IBGE", "data": "2026-11-19", "campo": "PNAD Contínua; Receita Federal (CNPJ 2025)",
     "url": "https://agenciasebrae.com.br/dados/mais-de-10-milhoes-de-mulheres-lideram-pequenos-negocios-com-avancos-em-formalizacao-e-escolaridade/"},
    {"id": "martins2024", "titulo": "MARTINS, M. R. et al. Empreendedorismo digital: tendências e gaps de pesquisa. Rev. Gestão e Desenvolvimento, v. 21, n. 2, 2024.",
     "orgao": "Literatura acadêmica", "data": "2024-01-01", "campo": "Revisão bibliométrica",
     "url": "https://doi.org/10.25112/rgd.v21i2.3724"},
    {"id": "costa2022", "titulo": "COSTA, L.; MUNHOZ, I.; PEREIRA, L. Assessing the digital maturity of micro and small enterprises. Procedia Computer Science, v. 200, p. 175-184, 2022.",
     "orgao": "Literatura acadêmica", "data": "2022-01-01", "campo": "Artigo",
     "url": "https://doi.org/10.1016/j.procs.2022.01.216"},
]

# % dos pequenos negócios que vendem por redes sociais, app ou internet
SERIE_VENDAS_ONLINE = [
    ("2020-05", "mai/20", 59), ("2020-06", "jun/20", 64), ("2020-07", "jul/20", 66),
    ("2020-08", "ago/20", 67), ("2020-11", "nov/20", 70), ("2021-03", "mar/21", 69),
    ("2021-06", "jun/21", 67), ("2021-12", "dez/21", 74), ("2022-05", "mai/22", 71),
    ("2022-08", "ago/22", 73), ("2023-01", "jan/23", 71), ("2023-04", "abr/23", 69),
    ("2023-07", "jul/23", 75), ("2023-11", "nov/23", 72), ("2024-02", "fev/24", 70),
    ("2024-11", "nov/24", 72), ("2026-03", "mar/26", 73),
]

# "Por qual desses canais você vende?" (múltipla escolha, entre os que vendem online)
EDICOES_CANAIS = [
    ("2021-11", "nov/21", "13ª Impacto da Pandemia"),
    ("2023-01", "jan/23", "2ª Pulso"),
    ("2024-11", "nov/24", "9ª Pulso"),
    ("2026-03", "mar/26", "12ª Pulso"),
]
CANAIS = [
    ("WhatsApp", "rede", [84, 82, 81, 82]),
    ("Instagram", "rede", [51, 57, 60, 57]),
    ("Facebook", "rede", [42, 40, 34, 30]),
    ("Loja virtual própria", "loja", [14, 11, 13, 10]),
    ("Mercado Livre", "marketplace", [7, 6, 8, 7]),
    ("Apps de entrega/serviços", "app", [6, 7, 6, 7]),
    ("OLX", "marketplace", [5, 4, 4, 3]),
    ("Magalu", "marketplace", [3, 2, 3, 1]),
    ("Amazon", "marketplace", [1, 1, 2, 1]),
    ("Americanas", "marketplace", [1, 1, 1, 0]),
    ("Nenhum dos citados", "nenhum", [10, 6, 7, 6]),
]

# IMD (0–80 pontos)
IMD_PORTE = {  # ano: {porte: pontos}
    2024: {"PN": 35, "MEI": 31, "ME": 40, "EPP": 42},
    2025: {"PN": 37, "MEI": 33, "ME": 41, "EPP": 44},
    2026: {"PN": 39, "MEI": 35, "ME": 43, "EPP": 46},
}
IMD_UF_2026 = [
    ("PE", 33.8), ("AC", 34.6), ("ES", 35.7), ("PB", 35.9), ("PA", 36.3), ("PI", 36.5),
    ("DF", 36.9), ("BA", 37.0), ("RR", 37.4), ("MT", 37.5), ("RJ", 37.7), ("RS", 37.8),
    ("MG", 37.9), ("MS", 38.3), ("SC", 38.3), ("AL", 38.6), ("AP", 38.7), ("TO", 39.0),
    ("RO", 39.0), ("MA", 39.0), ("CE", 39.0), ("GO", 39.5), ("SE", 39.7), ("PR", 39.8),
    ("SP", 40.1), ("AM", 40.8), ("RN", 42.4),
]
REGIAO = {"AC": "Norte", "AM": "Norte", "AP": "Norte", "PA": "Norte", "RO": "Norte", "RR": "Norte", "TO": "Norte",
          "AL": "Nordeste", "BA": "Nordeste", "CE": "Nordeste", "MA": "Nordeste", "PB": "Nordeste", "PE": "Nordeste",
          "PI": "Nordeste", "RN": "Nordeste", "SE": "Nordeste", "DF": "Centro-Oeste", "GO": "Centro-Oeste",
          "MS": "Centro-Oeste", "MT": "Centro-Oeste", "ES": "Sudeste", "MG": "Sudeste", "RJ": "Sudeste",
          "SP": "Sudeste", "PR": "Sul", "RS": "Sul", "SC": "Sul"}
IMD_PERFIL_2026 = [
    ("sexo", "Feminino", 39), ("sexo", "Masculino", 38),
    ("idade", "Até 34 anos", 44), ("idade", "65 anos ou mais", 37),
    ("escolaridade", "Pós-graduação", 45), ("escolaridade", "Até fundamental", 35),
]

# Uso de IA (set/2025) — % por porte
IA_PORTE = [
    # porte, familiarizado, usa_no_negocio, usa_pouco_ou_frequente, finalidade_principal, valor_finalidade
    ("MEI", 87, 42, 48, "Marketing e divulgação", 74),
    ("MPE", 96, 46, 70, "Marketing e divulgação", 59),
    ("Médias e Grandes", 99, 63, 83, "Análise de dados", 67),
]

# Como o negócio opera (mar/2026) — %
OPERACAO = [
    ("PN", "Apenas ponto físico", 42.7), ("PN", "Físico e online", 38.5),
    ("PN", "Apenas online", 11.8), ("PN", "Não sabe/NA", 7.0),
    ("Médias e Grandes", "Apenas ponto físico", 44.7), ("Médias e Grandes", "Físico e online", 45.3),
    ("Médias e Grandes", "Apenas online", 9.5), ("Médias e Grandes", "Não sabe/NA", 0.5),
]

# Indicadores pontuais (cards / tabela)
INDICADORES = [
    # id, tema, indicador, valor, unidade, porte, recorte, referencia, fonte
    ("vende_online", "Canais", "Pequenos negócios que vendem por redes, app ou internet", 73, "%", "PN", "Brasil", "mar/2026", "pulso12"),
    ("vende_online_mei", "Canais", "MEI que vendem por redes, app ou internet", 75, "%", "MEI", "Brasil", "mar/2026", "pulso12"),
    ("whatsapp", "Canais", "Dos que vendem online, vendem pelo WhatsApp", 82, "%", "PN", "Brasil", "mar/2026", "ds_serie"),
    ("instagram", "Canais", "Dos que vendem online, vendem pelo Instagram", 57, "%", "PN", "Brasil", "mar/2026", "ds_serie"),
    ("facebook", "Canais", "Dos que vendem online, vendem pelo Facebook", 30, "%", "PN", "Brasil", "mar/2026", "ds_serie"),
    ("perfil_redes", "Presença", "Têm perfil/página em redes sociais", 73, "%", "PN", "Brasil", "2023", "td2023"),
    ("perfil_instagram", "Presença", "Têm perfil no Instagram", 64, "%", "PN", "Brasil", "2023", "td2023"),
    ("perfil_facebook", "Presença", "Têm perfil no Facebook", 41, "%", "PN", "Brasil", "2023", "td2023"),
    ("site_proprio", "Presença", "Têm site próprio", 10, "%", "PN", "Brasil", "2023", "td2023"),
    ("catalogo", "Presença", "Exibem catálogo de produtos/serviços na página", 50, "%", "PN", "Brasil", "2023", "td2023"),
    ("beleza", "Setores", "Setor de beleza com presença em redes", 83, "%", "PN", "Beleza", "2023", "td2023"),
    ("alimenticia", "Setores", "Indústria alimentícia com presença em redes", 82, "%", "PN", "Alimentícia", "2023", "td2023"),
    ("eco_criativa", "Setores", "Economia criativa com presença em redes", 79, "%", "PN", "Economia criativa", "2023", "td2023"),
    ("pix", "Pagamentos", "Aceitam Pix", 84, "%", "PN", "Brasil", "2022", "td2022"),
    ("dinheiro", "Pagamentos", "Aceitam dinheiro", 73, "%", "PN", "Brasil", "2022", "td2022"),
    ("cartao", "Pagamentos", "Aceitam cartão (crédito ou débito)", 61, "%", "PN", "Brasil", "2022", "td2022"),
    ("software_gestao", "Tecnologia", "Usam software de gestão", 50, "%", "PN", "Brasil", "2022", "td2022"),
    ("pandemia", "Contexto", "Concordam que a pandemia acelerou as vendas digitais", 65, "%", "PN", "Brasil", "2022", "td2022"),
    ("computador", "Tecnologia", "Usam computador no negócio", 76, "%", "PN", "Brasil", "2025", "td2025"),
    ("computador_mei", "Tecnologia", "Usam computador no negócio", 62, "%", "MEI", "Brasil", "2025", "td2025"),
    ("computador_me", "Tecnologia", "Usam computador no negócio", 92, "%", "ME", "Brasil", "2025", "td2025"),
    ("computador_epp", "Tecnologia", "Usam computador no negócio", 96, "%", "EPP", "Brasil", "2025", "td2025"),
    ("computador_mulher", "Mulheres", "Mulheres empreendedoras que usam computador", 75, "%", "PN", "Feminino", "2025", "td2025"),
    ("computador_homem", "Mulheres", "Homens empreendedores que usam computador", 77, "%", "PN", "Masculino", "2025", "td2025"),
    ("computador_2026", "Tecnologia", "Usam computador no negócio", 75, "%", "PN", "Brasil", "2026", "td2026"),
    ("internet", "Tecnologia", "Usam internet (conexão própria ou de terceiros)", 98, "%", "PN", "Brasil", "2025", "td2025"),
    ("apps_integrativos", "Tecnologia", "Usam apps/softwares integrativos de gestão", 47, "%", "PN", "Brasil", "2025", "td2025"),
    ("apps_integrativos_2018", "Tecnologia", "Usam apps/softwares integrativos de gestão", 27, "%", "PN", "Brasil", "2018", "td2025"),
    ("ia_pn", "IA", "Pequenos negócios que já usam IA no dia a dia", 44, "%", "PN", "Brasil", "2025", "datasebrae_td"),
    ("ia_mei", "IA", "Usam IA no negócio", 42, "%", "MEI", "Brasil", "set/2025", "ia2025"),
    ("ia_mpe", "IA", "Usam IA no negócio", 46, "%", "MPE", "Brasil", "set/2025", "ia2025"),
    ("ia_mge", "IA", "Usam IA no negócio", 63, "%", "Médias e Grandes", "Brasil", "set/2025", "ia2025"),
    ("imd", "Maturidade", "Índice de Maturidade Digital (0–80)", 39, "pts", "PN", "Brasil", "2026", "imd2026"),
    ("imd_ma", "Maturidade", "Índice de Maturidade Digital (0–80)", 39.0, "pts", "PN", "Maranhão", "2026", "imd2026"),
    ("imd_mulher", "Mulheres", "IMD das empreendedoras (0–80)", 39, "pts", "PN", "Feminino", "2026", "imd2026"),
    ("imd_homem", "Mulheres", "IMD dos empreendedores (0–80)", 38, "pts", "PN", "Masculino", "2026", "imd2026"),
    ("investir_digital", "Perspectivas", "Pretendem investir em digitalização nos próximos 6 meses", 34.3, "%", "PN", "Brasil", "mar/2026", "persp2026"),
    ("prioridade_mkt", "Perspectivas", "Prioridade de investimento: marketing e vendas", 37.8, "%", "PN", "Brasil", "mar/2026", "persp2026"),
    ("tudo_em_um_vendas", "Perspectivas", "Querem que uma ferramenta 'tudo em um' aumente as vendas", 54.2, "%", "PN", "Brasil", "mar/2026", "persp2026"),
    ("mulheres_donas", "Mulheres", "Mulheres donas de pequenos negócios", 10.3, "milhões", "PN", "Feminino", "2025", "mulheres2026"),
    ("mulheres_cresc", "Mulheres", "Crescimento do nº de donas de negócio em 10 anos", 27, "%", "PN", "Feminino", "2015–2025", "mulheres2026"),
    ("homens_cresc", "Mulheres", "Crescimento do nº de donos de negócio em 10 anos", 11, "%", "PN", "Masculino", "2015–2025", "mulheres2026"),
    ("mulheres_cnpj", "Mulheres", "Novos CNPJs (MEI e MPE) abertos por mulheres", 42, "%", "PN", "Feminino", "2025", "mulheres2026"),
    ("mulheres_formal", "Mulheres", "Empreendedoras com CNPJ (formalizadas)", 37, "%", "PN", "Feminino", "2025", "mulheres2026"),
]


def main():
    data = {
        "atualizado_em": "2026-11-20",
        "fontes": FONTES,
        "serie_vendas_online": [{"data": d, "rotulo": r, "valor": v, "fonte": "ds_serie"} for d, r, v in SERIE_VENDAS_ONLINE],
        "edicoes_canais": [{"data": d, "rotulo": r, "pesquisa": p} for d, r, p in EDICOES_CANAIS],
        "canais_venda": [
            {"canal": c, "tipo": t, "data": EDICOES_CANAIS[i][0], "valor": v, "fonte": "ds_serie"}
            for c, t, vals in CANAIS for i, v in enumerate(vals)
        ],
        "imd_porte": [{"ano": a, "porte": p, "pontos": v, "fonte": "imd2026"} for a, d in IMD_PORTE.items() for p, v in d.items()],
        "imd_uf": [{"uf": u, "regiao": REGIAO[u], "pontos": v, "ano": 2026, "fonte": "imd2026"} for u, v in IMD_UF_2026],
        "imd_perfil": [{"dimensao": d, "grupo": g, "pontos": v, "ano": 2026, "fonte": "imd2026"} for d, g, v in IMD_PERFIL_2026],
        "ia_porte": [{"porte": p, "familiarizado": f, "usa": u, "usa_pouco_ou_frequente": pf,
                      "finalidade_principal": fp, "finalidade_valor": fv, "fonte": "ia2025"} for p, f, u, pf, fp, fv in IA_PORTE],
        "operacao": [{"grupo": g, "modelo": m, "valor": v, "fonte": "persp2026"} for g, m, v in OPERACAO],
        "indicadores": [dict(zip(["id", "tema", "indicador", "valor", "unidade", "porte", "recorte", "referencia", "fonte"], row)) for row in INDICADORES],
    }
    os.makedirs(f"{ROOT}/data/csv", exist_ok=True)
    with open(f"{ROOT}/data/dados.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)

    tables = {k: v for k, v in data.items() if isinstance(v, list)}
    for name, rows in tables.items():
        with open(f"{ROOT}/data/csv/{name}.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader(); w.writerows(rows)

    # SQL (PostgreSQL / Supabase)
    os.makedirs(f"{ROOT}/database", exist_ok=True)
    def coltype(v):
        return "numeric" if isinstance(v, (int, float)) else "text"
    schema, seed = ["-- Gerado por tools/gerar_dados.py\n"], ["-- Gerado por tools/gerar_dados.py\n"]
    for name, rows in tables.items():
        cols = list(rows[0].keys())
        defs = ",\n  ".join(f"{c} {coltype(rows[0][c])}" for c in cols)
        schema.append(f"create table if not exists {name} (\n  pk bigserial primary key,\n  {defs}\n);\n")
        schema.append(f"alter table {name} enable row level security;\n"
                      f"create policy \"leitura publica {name}\" on {name} for select using (true);\n")
        def lit(v):
            if isinstance(v, (int, float)): return str(v)
            return "'" + str(v).replace("'", "''") + "'"
        values = ",\n".join("(" + ", ".join(lit(r[c]) for c in cols) + ")" for r in rows)
        seed.append(f"insert into {name} ({', '.join(cols)}) values\n{values};\n")
    open(f"{ROOT}/database/schema.sql", "w", encoding="utf-8").write("\n".join(schema))
    open(f"{ROOT}/database/seed.sql", "w", encoding="utf-8").write("\n".join(seed))
    print("ok:", {k: len(v) for k, v in tables.items()})


if __name__ == "__main__":
    main()
