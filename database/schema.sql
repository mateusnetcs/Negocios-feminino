-- Gerado por tools/gerar_dados.py

create table if not exists fontes (
  pk bigserial primary key,
  id text,
  titulo text,
  orgao text,
  data text,
  campo text,
  url text
);

alter table fontes enable row level security;
create policy "leitura publica fontes" on fontes for select using (true);

create table if not exists serie_vendas_online (
  pk bigserial primary key,
  data text,
  rotulo text,
  valor numeric,
  fonte text
);

alter table serie_vendas_online enable row level security;
create policy "leitura publica serie_vendas_online" on serie_vendas_online for select using (true);

create table if not exists edicoes_canais (
  pk bigserial primary key,
  data text,
  rotulo text,
  pesquisa text
);

alter table edicoes_canais enable row level security;
create policy "leitura publica edicoes_canais" on edicoes_canais for select using (true);

create table if not exists canais_venda (
  pk bigserial primary key,
  canal text,
  tipo text,
  data text,
  valor numeric,
  fonte text
);

alter table canais_venda enable row level security;
create policy "leitura publica canais_venda" on canais_venda for select using (true);

create table if not exists imd_porte (
  pk bigserial primary key,
  ano numeric,
  porte text,
  pontos numeric,
  fonte text
);

alter table imd_porte enable row level security;
create policy "leitura publica imd_porte" on imd_porte for select using (true);

create table if not exists imd_uf (
  pk bigserial primary key,
  uf text,
  regiao text,
  pontos numeric,
  ano numeric,
  fonte text
);

alter table imd_uf enable row level security;
create policy "leitura publica imd_uf" on imd_uf for select using (true);

create table if not exists imd_perfil (
  pk bigserial primary key,
  dimensao text,
  grupo text,
  pontos numeric,
  ano numeric,
  fonte text
);

alter table imd_perfil enable row level security;
create policy "leitura publica imd_perfil" on imd_perfil for select using (true);

create table if not exists ia_porte (
  pk bigserial primary key,
  porte text,
  familiarizado numeric,
  usa numeric,
  usa_pouco_ou_frequente numeric,
  finalidade_principal text,
  finalidade_valor numeric,
  fonte text
);

alter table ia_porte enable row level security;
create policy "leitura publica ia_porte" on ia_porte for select using (true);

create table if not exists operacao (
  pk bigserial primary key,
  grupo text,
  modelo text,
  valor numeric,
  fonte text
);

alter table operacao enable row level security;
create policy "leitura publica operacao" on operacao for select using (true);

create table if not exists indicadores (
  pk bigserial primary key,
  id text,
  tema text,
  indicador text,
  valor numeric,
  unidade text,
  porte text,
  recorte text,
  referencia text,
  fonte text
);

alter table indicadores enable row level security;
create policy "leitura publica indicadores" on indicadores for select using (true);
