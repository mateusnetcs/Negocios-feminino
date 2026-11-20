# Empreendedorismo Digital — Dashboard

Dashboard interativo sobre empreendedorismo digital nos pequenos negócios brasileiros, com recorte de gênero. Todos os números foram conferidos em publicações oficiais do **Sebrae** e do **DataSebrae**.

Projeto de Iniciação Científica 2025/2026 da UEMASUL, apresentado na **IX SAPIENS**.

**Site:** https://mateusnetcs.github.io/Negocios-feminino/

## O que tem

- **Filtros cruzados:**
  - Clicar em um porte (MEI, ME ou EPP) atualiza os indicadores do topo, o IMD, o uso de IA, o uso de computador e a tabela.
  - Clicar em um ponto da série histórica escolhe a edição da pesquisa de canais.
  - Clicar em um canal destaca a trajetória dele entre as edições.
  - Clicar em uma região ou estado destaca esses dados no gráfico do IMD por estado.
- **Seções:**
  - Canais de venda: série 2020–2026 e 4 edições da pergunta "por qual canal você vende?".
  - Maturidade digital (IMD 2024–2026, por porte e por UF).
  - Inteligência artificial e modelo de operação.
  - Mulheres empreendedoras.
  - Literatura acadêmica.
- **Explorador de dados:** busca, filtro por tema e download em JSON, CSV ou SQL.
- **Banner IX SAPIENS:** versão final (.pptx editável e PDF) e o modelo original.
- Botão de impressão com layout próprio e temas claro e escuro.

## Estrutura

```
index.html            página
assets/               CSS, JS e ECharts 5.5.1 (vendorizado)
data/dados.json       base padronizada consumida pelo site
data/csv/             uma tabela por arquivo
database/schema.sql   tabelas PostgreSQL/Supabase (com RLS de leitura pública)
database/seed.sql     carga dos dados
banner/               banner final (.pptx, .pdf, .png) e modelo original
tools/gerar_dados.py  FONTE ÚNICA dos dados: edite aqui e rode o script
tools/gerar_banner.py gera o banner a partir do modelo
```

## Atualizar os dados

1. Edite os valores em `tools/gerar_dados.py`. Cada valor aponta para uma fonte cadastrada em `FONTES`.
2. Rode `python3 tools/gerar_dados.py`. O script regenera o JSON, os CSVs e os SQLs.
3. Faça commit e push. O GitHub Pages publica o site automaticamente.

## Banco de dados (Supabase)

No SQL Editor do Supabase, rode `database/schema.sql` e depois `database/seed.sql`. As tabelas ficam com leitura pública via RLS.

## Rodar localmente

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Principais fontes

- Sebrae. *Pesquisa Pulso dos Pequenos Negócios*, 12ª ed., 2026.
- DataSebrae. *Transformação Digital*: série histórica e canais (planilha oficial).
- Sebrae. *Maturidade Digital dos Pequenos Negócios (IMD)*, 2026.
- Sebrae/FGV/Google. *Uso de IA nos negócios*, set. 2025.
- Sebrae/FGV. *Perspectivas Digitais nos Negócios*, mar. 2026.
- Agência Sebrae: Transformação Digital 2022, 2023 e 2025; *Mais de 10 milhões de mulheres lideram pequenos negócios* (2026).

A lista completa, com links, está no rodapé do site e em `data/csv/fontes.csv`.
