/* Dashboard Empreendedorismo Digital — filtros cruzados entre todos os gráficos */
(() => {
  const PORTES = ["Todos", "MEI", "ME", "EPP"];
  const REGIOES = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];
  const CANAIS_TRAJ = ["WhatsApp", "Instagram", "Facebook", "Loja virtual própria"];
  const state = { porte: "Todos", edicao: "2026-03", canal: null, regiao: null, uf: "MA", tema: null, q: "" };
  let D = null;
  const charts = {};

  const $ = (s, el = document) => el.querySelector(s);
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const fmt = (v, d = 0) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const porteColor = (p) => ({ Todos: css("--ink"), PN: css("--ink"), MEI: css("--s1"), ME: css("--s2"), EPP: css("--s3") }[p] || css("--ink"));
  const fonte = (id) => D.fontes.find((f) => f.id === id);
  const ind = (id) => D.indicadores.find((i) => i.id === id);
  const iaPorte = () => (state.porte === "MEI" ? "MEI" : state.porte === "Todos" ? null : "MPE");
  const fade = (on, color) => (on ? color : hexAlpha(color, 0.22));

  function hexAlpha(hex, a) {
    const h = hex.replace("#", "");
    if (h.length !== 6) return hex;
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ---------- base ECharts ---------- */
  function base() {
    const text2 = css("--text-2"), line = css("--line"), muted = css("--muted");
    return {
      animationDuration: 450,
      textStyle: { fontFamily: "Inter, system-ui, sans-serif", color: text2 },
      grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
      tooltip: {
        backgroundColor: css("--surface"), borderColor: line, textStyle: { color: css("--text"), fontSize: 13 },
        extraCssText: "border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.12);",
      },
      axisCommon: {
        axisLine: { lineStyle: { color: line } }, axisTick: { show: false },
        axisLabel: { color: muted, fontSize: 12 }, splitLine: { lineStyle: { color: line, type: [3, 3] } },
      },
    };
  }
  function axis(extra) { const b = base().axisCommon; return Object.assign({}, b, extra); }
  function mk(id) {
    if (charts[id]) charts[id].dispose();
    charts[id] = echarts.init(document.getElementById(id), null, { renderer: "svg" });
    return charts[id];
  }

  /* ---------- filtros ---------- */
  function renderChips() {
    $("#f-porte").innerHTML = PORTES.map((p) =>
      `<button class="chip" data-porte="${p}" aria-pressed="${state.porte === p}">${p !== "Todos" ? `<span class="dot" style="background:${porteColor(p)}"></span>` : ""}${p === "Todos" ? "Todos (PN)" : p}</button>`).join("");
    $("#f-edicao").innerHTML = D.edicoes_canais.map((e) =>
      `<button class="chip" data-edicao="${e.data}" aria-pressed="${state.edicao === e.data}" title="${e.pesquisa}">${e.rotulo}</button>`).join("");
    $("#f-regiao").innerHTML = ["Todas", ...REGIOES].map((r) =>
      `<button class="chip" data-regiao="${r}" aria-pressed="${(state.regiao || "Todas") === r}">${r}</button>`).join("");
    const act = [];
    if (state.porte !== "Todos") act.push(["porte", `Porte: ${state.porte}`]);
    if (state.canal) act.push(["canal", `Canal: ${state.canal}`]);
    if (state.regiao) act.push(["regiao", `Região: ${state.regiao}`]);
    $("#active-filters").innerHTML = act.length
      ? act.map(([k, l]) => `<button class="chip" data-clear="${k}" title="Remover filtro">${l} ✕</button>`).join("") +
        `<button class="chip" data-clear="all">Limpar tudo</button>`
      : "";
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button.chip");
    if (!b) return;
    if (b.dataset.porte) set({ porte: b.dataset.porte });
    else if (b.dataset.edicao) set({ edicao: b.dataset.edicao });
    else if (b.dataset.regiao) set({ regiao: b.dataset.regiao === "Todas" ? null : b.dataset.regiao });
    else if (b.dataset.tema !== undefined) set({ tema: b.dataset.tema || null });
    else if (b.dataset.clear) {
      const k = b.dataset.clear;
      if (k === "all") set({ porte: "Todos", canal: null, regiao: null, edicao: "2026-03" });
      else set({ [k]: k === "porte" ? "Todos" : null });
    }
  });
  function set(patch) { Object.assign(state, patch); renderAll(); }

  /* ---------- KPIs ---------- */
  function renderKpis() {
    const p = state.porte;
    const imd = (ano, por) => D.imd_porte.find((r) => r.ano === ano && r.porte === (por === "Todos" ? "PN" : por)).pontos;
    const venda = p === "MEI" ? ind("vende_online_mei") : ind("vende_online");
    const ia = p === "MEI" ? ind("ia_mei") : p === "Todos" ? ind("ia_pn") : ind("ia_mpe");
    const comp = { Todos: "computador", MEI: "computador_mei", ME: "computador_me", EPP: "computador_epp" }[p];
    const c = ind(comp);
    const lbl = p === "Todos" ? "pequenos negócios" : p;
    const k = [
      { label: `Vendem online · ${venda.porte === "MEI" ? "MEI" : "PN"}`, value: fmt(venda.valor), unit: "%", color: porteColor(venda.porte === "MEI" ? "MEI" : "Todos"),
        delta: (p === "ME" || p === "EPP") ? "Recorte por ME/EPP não publicado; mostra PN" : `Era <b>59%</b> em mai/2020`, src: venda.fonte },
      { label: `Maturidade digital (IMD) · ${lbl}`, value: imd(2026, p), unit: "/80", color: porteColor(p),
        delta: `<b>+${imd(2026, p) - imd(2024, p)} pts</b> desde 2024`, src: "imd2026" },
      { label: `Usam IA no negócio · ${ia.porte}`, value: fmt(ia.valor), unit: "%", color: porteColor(p),
        delta: ia.porte === "MPE" ? "MPE = ME + EPP" : ia.porte === "MEI" ? "Médias e grandes: <b>63%</b>" : "MEI 42% · MPE 46%", src: ia.fonte },
      { label: `Usam computador · ${lbl}`, value: fmt(c.valor), unit: "%", color: porteColor(p),
        delta: p === "Todos" ? "<b>+6 p.p.</b> desde 2022" : `Média PN: <b>76%</b>`, src: c.fonte },
    ];
    $("#kpis").innerHTML = k.map((x) => `
      <div class="kpi" style="--kpi-color:${x.color}">
        <div class="label">${x.label}</div>
        <div class="value">${x.value}<small>${x.unit}</small></div>
        <div class="delta">${x.delta}</div>
        <div class="src" data-src="${x.src}"></div>
      </div>`).join("");
  }

  /* ---------- Série vendas online ---------- */
  function nearestEdicao(dateStr) {
    const m = (s) => { const [y, mo] = s.split("-").map(Number); return y * 12 + mo; };
    return D.edicoes_canais.reduce((best, e) => (Math.abs(m(e.data) - m(dateStr)) < Math.abs(m(best.data) - m(dateStr)) ? e : best)).data;
  }
  function renderSerie() {
    const c = mk("c-serie"), s = D.serie_vendas_online, acc = css("--s1");
    const edSel = D.edicoes_canais.find((e) => e.data === state.edicao);
    const selIdx = s.findIndex((r) => nearestEdicao(r.data) === state.edicao && Math.abs(
      (+r.data.slice(0, 4) * 12 + +r.data.slice(5)) - (+edSel.data.slice(0, 4) * 12 + +edSel.data.slice(5))) <= 1);
    const b = base();
    c.setOption({
      ...b,
      grid: { ...b.grid, top: 34 },
      tooltip: { ...b.tooltip, trigger: "axis", axisPointer: { type: "line", lineStyle: { color: css("--muted") } },
        formatter: (ps) => `<b>${ps[0].name}</b><br>${ps[0].value}% vendem por redes, app ou internet<br><span style="color:${css("--muted")}">Clique para ver os canais da edição mais próxima</span>` },
      xAxis: axis({ type: "category", data: s.map((r) => r.rotulo), boundaryGap: false, splitLine: { show: false },
        axisLabel: { color: css("--muted"), fontSize: 11, interval: (i) => [0, 4, 7, 9, 12, 15, 16].includes(i) } }),
      yAxis: axis({ type: "value", min: 50, max: 80, axisLabel: { color: css("--muted"), formatter: "{value}%" } }),
      series: [{
        type: "line", data: s.map((r, i) => ({ value: r.valor, symbolSize: i === selIdx ? 14 : 8,
          itemStyle: { color: i === selIdx ? css("--hl") : acc, borderColor: css("--surface"), borderWidth: 2 } })),
        lineStyle: { width: 2.5, color: acc }, symbol: "circle", smooth: 0.25,
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: hexAlpha(acc, .22) }, { offset: 1, color: hexAlpha(acc, 0) }]) },
        label: { show: true, formatter: (p) => ([0, 12, 16].includes(p.dataIndex) || p.dataIndex === selIdx ? `${p.value}%` : ""), position: "top", color: css("--text"), fontWeight: 700 },
        markArea: { silent: true, itemStyle: { color: hexAlpha(css("--s4"), .08) },
          label: { color: css("--muted"), fontSize: 11, position: "insideTop" },
          data: [[{ name: "Salto na pandemia", xAxis: "mai/20" }, { xAxis: "dez/21" }],
                 [{ name: "Estabilização entre 70% e 75%", xAxis: "dez/21" }, { xAxis: "mar/26" }]] },
      }],
    });
    c.on("click", (p) => {
      const ed = nearestEdicao(s[p.dataIndex].data);
      set({ edicao: ed });
      toast(`Edição dos canais: ${D.edicoes_canais.find((e) => e.data === ed).rotulo}`);
    });
  }

  /* ---------- Canais por edição ---------- */
  function renderCanais() {
    const c = mk("c-canais"), ed = D.edicoes_canais.find((e) => e.data === state.edicao);
    $("#tag-edicao").textContent = `${ed.rotulo} · ${ed.pesquisa}`;
    const rows = D.canais_venda.filter((r) => r.data === state.edicao).sort((a, b) => a.valor - b.valor);
    const acc = css("--s1"), gray = css("--muted");
    const b = base();
    c.setOption({
      ...b,
      grid: { ...b.grid, right: 44 },
      tooltip: { ...b.tooltip, trigger: "item", formatter: (p) => `<b>${p.name}</b><br>${p.value}% dos que vendem online usam este canal (${ed.rotulo})` },
      xAxis: axis({ type: "value", max: 100, axisLabel: { show: false }, splitLine: { show: false } }),
      yAxis: axis({ type: "category", data: rows.map((r) => r.canal), axisLabel: { color: css("--text-2"), fontSize: 12 } }),
      series: [{
        type: "bar", barWidth: "62%",
        data: rows.map((r) => {
          const on = !state.canal || state.canal === r.canal;
          const col = r.tipo === "nenhum" ? gray : acc;
          return { value: r.valor, itemStyle: { color: fade(on, state.canal === r.canal ? css("--hl") : col), borderRadius: [0, 4, 4, 0] } };
        }),
        label: { show: true, position: "right", formatter: "{c}%", color: css("--text"), fontWeight: 700 },
      }],
    });
    c.on("click", (p) => set({ canal: state.canal === p.name ? null : p.name }));
  }

  /* ---------- Trajetória dos canais ---------- */
  function renderTraj() {
    const c = mk("c-traj"), eds = D.edicoes_canais;
    const cols = [css("--s1"), css("--s2"), css("--s3"), css("--s4"), css("--s5")];
    const focus = state.canal && CANAIS_TRAJ.includes(state.canal) ? state.canal : null;
    $("#t-traj").textContent = focus ? `Trajetória: ${focus}` : "Trajetória dos canais entre as edições";
    const b = base();
    c.setOption({
      ...b,
      grid: { ...b.grid, right: 150, top: 40 },
      legend: { top: 0, left: 0, textStyle: { color: css("--text-2") }, itemWidth: 14, itemHeight: 8, selectedMode: false },
      tooltip: { ...b.tooltip, trigger: "axis", valueFormatter: (v) => `${v}%` },
      xAxis: axis({ type: "category", data: eds.map((e) => `${e.rotulo}\n${e.pesquisa}`), boundaryGap: false, splitLine: { show: false },
        axisLabel: { color: css("--muted"), fontSize: 11, lineHeight: 15 } }),
      yAxis: axis({ type: "value", min: 0, max: 100, axisLabel: { color: css("--muted"), formatter: "{value}%" } }),
      series: CANAIS_TRAJ.map((name, i) => {
        const on = !focus || focus === name;
        const vals = eds.map((e) => D.canais_venda.find((r) => r.canal === name && r.data === e.data).valor);
        return {
          name, type: "line", data: vals, symbol: "circle", symbolSize: on ? 9 : 6, z: on ? 5 : 1,
          lineStyle: { width: focus === name ? 4 : 2, color: fade(on, cols[i]) },
          itemStyle: { color: fade(on, cols[i]), borderColor: css("--surface"), borderWidth: 2 },
          endLabel: { show: on, formatter: (p) => `${name}  ${p.value}%`, color: css("--text"), fontWeight: 600, distance: 8 },
          label: { show: focus === name, position: "top", formatter: "{c}%", color: css("--text"), fontWeight: 700 },
          markLine: i === 0 ? { silent: true, symbol: "none", lineStyle: { color: css("--hl"), type: "dashed" }, label: { show: false },
            data: [{ xAxis: eds.findIndex((e) => e.data === state.edicao) }] } : undefined,
          emphasis: { focus: "series" },
        };
      }),
    });
    c.on("click", (p) => {
      if (p.componentType === "series") set({ canal: state.canal === p.seriesName ? null : p.seriesName, edicao: eds[p.dataIndex].data });
    });
  }

  /* ---------- IMD por porte ---------- */
  function renderImdPorte() {
    const c = mk("c-imd-porte"), anos = [2024, 2025, 2026], portes = ["PN", "MEI", "ME", "EPP"];
    const sel = state.porte === "Todos" ? null : state.porte;
    const b = base();
    c.setOption({
      ...b,
      grid: { ...b.grid, top: 40 },
      legend: { top: 0, left: 0, textStyle: { color: css("--text-2") }, itemWidth: 12, itemHeight: 8, selectedMode: false,
        data: portes.map((p) => ({ name: p === "PN" ? "Brasil (PN)" : p })) },
      tooltip: { ...b.tooltip, trigger: "item", formatter: (p) => `<b>${p.seriesName}</b> · ${p.name}<br>IMD: <b>${p.value}</b> de 80 pontos<br><span style="color:${css("--muted")}">Clique para filtrar por porte</span>` },
      xAxis: axis({ type: "category", data: anos.map(String), splitLine: { show: false }, axisLabel: { color: css("--text-2"), fontSize: 13, fontWeight: 600 } }),
      yAxis: axis({ type: "value", min: 0, max: 50, axisLabel: { color: css("--muted") } }),
      series: portes.map((p) => {
        const on = !sel || sel === p || (p === "PN" && !sel);
        const col = porteColor(p);
        return {
          name: p === "PN" ? "Brasil (PN)" : p, type: "bar", barGap: "12%", barCategoryGap: "26%",
          data: anos.map((a) => D.imd_porte.find((r) => r.ano === a && r.porte === p).pontos),
          itemStyle: { color: fade(on, col), borderRadius: [4, 4, 0, 0] },
          label: { show: true, position: "top", color: on ? css("--text") : css("--muted"), fontWeight: 700, fontSize: 12,
            formatter: (x) => (x.dataIndex === 2 || (sel === p) ? x.value : "") },
        };
      }),
    });
    c.on("click", (p) => {
      const por = p.seriesName === "Brasil (PN)" ? "Todos" : p.seriesName;
      set({ porte: state.porte === por ? "Todos" : por });
      toast(`Filtro de porte: ${por === "Todos" ? "todos os pequenos negócios" : por}`);
    });
  }

  /* ---------- IA por porte ---------- */
  function renderIA() {
    const c = mk("c-ia"), rows = D.ia_porte, sel = iaPorte();
    const cFam = css("--s7"), cUsa = css("--s1");
    const b = base();
    c.setOption({
      ...b,
      grid: { ...b.grid, top: 40 },
      legend: { top: 0, left: 0, textStyle: { color: css("--text-2") }, itemWidth: 12, itemHeight: 8, selectedMode: false },
      tooltip: { ...b.tooltip, trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: hexAlpha(css("--muted"), .08) } },
        formatter: (ps) => { const r = rows[ps[0].dataIndex];
          return `<b>${r.porte}</b><br>Familiarizados com IA: <b>${r.familiarizado}%</b><br>Usam no negócio: <b>${r.usa}%</b><br>Principal finalidade: ${r.finalidade_principal} (${r.finalidade_valor}%)`; } },
      xAxis: axis({ type: "category", data: rows.map((r) => r.porte), splitLine: { show: false }, axisLabel: { color: css("--text-2"), fontSize: 13, fontWeight: 600 } }),
      yAxis: axis({ type: "value", max: 100, axisLabel: { color: css("--muted"), formatter: "{value}%" } }),
      series: [["Familiarizados", "familiarizado", cFam], ["Usam no negócio", "usa", cUsa]].map(([name, key, col]) => ({
        name, type: "bar", barGap: "10%", barCategoryGap: "32%",
        data: rows.map((r) => ({ value: r[key], itemStyle: { color: fade(!sel || sel === r.porte, col), borderRadius: [4, 4, 0, 0] } })),
        label: { show: true, position: "top", formatter: "{c}%", color: css("--text"), fontWeight: 700, fontSize: 12 },
      })),
    });
    c.on("click", (p) => {
      const r = rows[p.dataIndex];
      if (r.porte === "MEI") set({ porte: state.porte === "MEI" ? "Todos" : "MEI" });
      toast(`${r.porte}: principal uso da IA é ${r.finalidade_principal.toLowerCase()} (${r.finalidade_valor}%)`);
    });
  }

  /* ---------- IMD por UF ---------- */
  function renderUF() {
    const c = mk("c-uf"), rows = [...D.imd_uf].sort((a, b) => a.pontos - b.pontos);
    const acc = css("--s1"), hl = css("--hl");
    const u = D.imd_uf.find((r) => r.uf === state.uf);
    const diff = u ? u.pontos - 39 : 0;
    $("#uf-detail").textContent = u ? `${u.uf} (${u.regiao}): ${fmt(u.pontos, 1)} pts · ${diff === 0 ? "igual à média Brasil (39)" : `${diff > 0 ? "+" : ""}${fmt(diff, 1)} vs Brasil`}` : "Brasil: 39 pts";
    const b = base();
    c.setOption({
      ...b,
      grid: { ...b.grid, top: 30 },
      tooltip: { ...b.tooltip, trigger: "item", formatter: (p) => { const r = rows[p.dataIndex]; return `<b>${r.uf}</b> · ${r.regiao}<br>IMD 2026: <b>${fmt(r.pontos, 1)}</b> pts`; } },
      xAxis: axis({ type: "category", data: rows.map((r) => r.uf), splitLine: { show: false },
        axisLabel: { color: css("--text-2"), fontSize: 11, interval: 0, fontWeight: 600 } }),
      yAxis: axis({ type: "value", min: 32, max: 44, axisLabel: { color: css("--muted") } }),
      series: [{
        type: "scatter",
        data: rows.map((r) => {
          const on = !state.regiao || state.regiao === r.regiao;
          const isSel = r.uf === state.uf;
          return { value: r.pontos, symbolSize: isSel ? 20 : 13,
            itemStyle: { color: isSel ? hl : fade(on, acc), borderColor: css("--surface"), borderWidth: 2 },
            label: { show: isSel || (on && !!state.regiao), position: "top", formatter: fmt(r.pontos, 1), color: css("--text"), fontWeight: 700, fontSize: 11 } };
        }),
        markLine: { silent: true, symbol: "none", lineStyle: { color: css("--muted"), type: "dashed" },
          label: { formatter: "Brasil 39", color: css("--muted"), position: "insideEndTop" }, data: [{ yAxis: 39 }] },
      }],
    });
    c.on("click", (p) => set({ uf: rows[p.dataIndex].uf }));
  }

  /* ---------- Operação ---------- */
  function renderOperacao() {
    const c = mk("c-operacao"), grupos = ["Médias e Grandes", "PN"];
    const modelos = [["Apenas ponto físico", css("--ink")], ["Físico e online", css("--s1")], ["Apenas online", css("--s3")], ["Não sabe/NA", css("--line")]];
    const b = base();
    c.setOption({
      ...b,
      grid: { ...b.grid, top: 36 },
      legend: { top: 0, left: 0, textStyle: { color: css("--text-2") }, itemWidth: 12, itemHeight: 8, selectedMode: false },
      tooltip: { ...b.tooltip, trigger: "item", formatter: (p) => `<b>${p.name === "PN" ? "Pequenos negócios" : p.name}</b><br>${p.seriesName}: <b>${fmt(p.value, 1)}%</b>` },
      xAxis: axis({ type: "value", max: 100, axisLabel: { show: false }, splitLine: { show: false } }),
      yAxis: axis({ type: "category", data: grupos.map((g) => (g === "PN" ? "Pequenos negócios" : g)), axisLabel: { color: css("--text-2"), fontWeight: 600 } }),
      series: modelos.map(([m, col]) => ({
        name: m, type: "bar", stack: "t", barWidth: "52%",
        data: grupos.map((g) => D.operacao.find((r) => r.grupo === g && r.modelo === m).valor),
        itemStyle: { color: col, borderColor: css("--surface"), borderWidth: 2 },
        label: { show: true, formatter: (p) => (p.value >= 9 ? `${fmt(p.value, 0)}%` : ""), color: m === "Não sabe/NA" ? css("--text") : "#fff", fontWeight: 700 },
      })),
    });
  }

  /* ---------- Computador por porte ---------- */
  function renderComputador() {
    const c = mk("c-computador"), cats = ["Todos", "MEI", "ME", "EPP"];
    const vals = { Todos: 76, MEI: 62, ME: 92, EPP: 96 };
    const b = base();
    c.setOption({
      ...b,
      tooltip: { ...b.tooltip, trigger: "item", formatter: (p) => `<b>${p.name}</b><br>${p.value}% usam computador no negócio (2025)` },
      xAxis: axis({ type: "category", data: cats.map((x) => (x === "Todos" ? "PN" : x)), splitLine: { show: false }, axisLabel: { color: css("--text-2"), fontWeight: 600 } }),
      yAxis: axis({ type: "value", max: 100, axisLabel: { color: css("--muted"), formatter: "{value}%" } }),
      series: [{ type: "bar", barWidth: "48%",
        data: cats.map((x) => ({ value: vals[x], itemStyle: { color: fade(state.porte === "Todos" || state.porte === x, porteColor(x)), borderRadius: [4, 4, 0, 0] } })),
        label: { show: true, position: "top", formatter: "{c}%", color: css("--text"), fontWeight: 700 } }],
    });
    c.on("click", (p) => { const x = cats[p.dataIndex]; set({ porte: state.porte === x ? "Todos" : x }); });
  }

  /* ---------- Mulheres ---------- */
  function renderMulheres() {
    const st = [
      [ind("mulheres_cresc"), "mais donas de negócio em 10 anos (homens: +11%)", "+"],
      [ind("mulheres_cnpj"), "dos novos CNPJs de 2025 foram abertos por mulheres", ""],
      [ind("mulheres_formal"), "das empreendedoras têm CNPJ, quase 4 p.p. acima dos homens", ""],
      [ind("imd_mulher"), "pontos de maturidade digital (homens: 38)", ""],
    ];
    $("#women-stats").innerHTML = st.map(([i, t, pre]) =>
      `<div class="wstat"><b>${pre}${fmt(i.valor)}${i.unidade === "%" ? "%" : ""}</b><span>${t}</span></div>`).join("");
    const pairs = [
      ["Usam computador no negócio (2025)", 75, 77, 100, "%"],
      ["Índice de Maturidade Digital (2026, 0–80)", 39, 38, 80, " pts"],
      ["Crescimento de donos de negócio em 10 anos", 27, 11, 30, "%"],
    ];
    const fem = css("--s5"), mas = css("--s1");
    $("#c-genero").style.height = "auto";
    $("#c-genero").innerHTML = `<div style="display:flex;gap:14px;font-size:12px;color:var(--text-2);margin:2px 0 10px">
        <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${fem};margin-right:6px"></i>Mulheres</span>
        <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${mas};margin-right:6px"></i>Homens</span></div>` +
      pairs.map(([t, f, m, max, u]) => `
      <div style="margin-bottom:14px">
        <div style="font-size:13px;font-weight:600;margin-bottom:6px">${t}</div>
        ${[[f, fem, "Mulheres"], [m, mas, "Homens"]].map(([v, col, who]) => `
          <div style="display:flex;align-items:center;gap:8px;margin:3px 0" title="${who}: ${v}${u}">
            <div style="flex:1;background:var(--surface-2);border-radius:4px;height:16px;overflow:hidden">
              <div style="width:${(v / max) * 100}%;height:100%;background:${col};border-radius:0 4px 4px 0;transition:width .5s"></div></div>
            <b style="width:56px;text-align:right;font-variant-numeric:tabular-nums">${v}${u}</b></div>`).join("")}
      </div>`).join("") +
      `<p class="muted" style="font-size:12px;margin:0">Escalas próprias por indicador. No IMD a diferença não é expressiva, segundo o Sebrae.</p>`;
  }

  /* ---------- Tabela ---------- */
  function renderTable() {
    const temas = [...new Set(D.indicadores.map((i) => i.tema))];
    $("#f-tema").innerHTML = [["", "Todos"], ...temas.map((t) => [t, t])].map(([v, l]) =>
      `<button class="chip" data-tema="${v}" aria-pressed="${(state.tema || "") === v}">${l}</button>`).join("");
    const q = state.q.toLowerCase();
    const p = state.porte;
    const match = (r) => p === "Todos" || r.porte === p || ((p === "ME" || p === "EPP") && r.porte === "MPE");
    const rows = D.indicadores.filter((r) =>
      (!state.tema || r.tema === state.tema) &&
      (p === "Todos" || match(r) || r.porte === "PN") &&
      (!q || `${r.tema} ${r.indicador} ${r.recorte} ${r.porte} ${fonte(r.fonte).titulo}`.toLowerCase().includes(q)));
    $("#tbl tbody").innerHTML = rows.map((r) => `
      <tr class="${p !== "Todos" && match(r) ? "hl" : ""}">
        <td>${r.tema}</td><td>${r.indicador}</td>
        <td class="num">${r.unidade === "%" ? fmt(r.valor, r.valor % 1 ? 1 : 0) + "%" : fmt(r.valor, r.valor % 1 ? 1 : 0) + " " + r.unidade}</td>
        <td>${r.porte}</td><td>${r.recorte}</td><td>${r.referencia}</td>
        <td><a href="${fonte(r.fonte).url}" target="_blank" rel="noopener">${fonte(r.fonte).orgao}</a></td>
      </tr>`).join("") || `<tr><td colspan="7" class="muted">Nenhum indicador encontrado.</td></tr>`;
  }
  $("#q").addEventListener("input", (e) => { state.q = e.target.value; renderTable(); });

  /* ---------- Fontes ---------- */
  function renderSources() {
    document.querySelectorAll("[data-src]").forEach((el) => {
      const f = fonte(el.dataset.src);
      if (f) el.innerHTML = `Fonte: <a href="${f.url}" target="_blank" rel="noopener">${f.titulo}</a> (${f.orgao}).`;
    });
    $("#sources").innerHTML = D.fontes.map((f) =>
      `<li><a href="${f.url}" target="_blank" rel="noopener">${f.titulo}</a> · ${f.orgao} · ${f.data.split("-").reverse().join("/")} · ${f.campo}</li>`).join("");
    $("#upd").textContent = D.atualizado_em.split("-").reverse().join("/");
  }

  function renderAll() {
    renderChips(); renderKpis(); renderSerie(); renderCanais(); renderTraj();
    renderImdPorte(); renderIA(); renderUF(); renderOperacao(); renderComputador();
    renderMulheres(); renderTable(); renderSources();
  }

  /* ---------- tema / impressão ---------- */
  $("#btn-theme").addEventListener("click", () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    renderAll();
  });
  try { const t = localStorage.getItem("theme"); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  $("#btn-print").addEventListener("click", () => window.print());
  window.addEventListener("beforeprint", () => Object.values(charts).forEach((c) => c.resize()));
  window.addEventListener("resize", () => Object.values(charts).forEach((c) => c.resize()));
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => renderAll());

  fetch("data/dados.json").then((r) => r.json()).then((d) => { D = d; renderAll(); })
    .catch((err) => { console.error(err); $("#kpis").innerHTML = `<div class="kpi">Não foi possível carregar os dados: ${err.message}</div>`; });
})();
