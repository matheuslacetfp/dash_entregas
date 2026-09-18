const { useEffect, useMemo, useState } = React;

const SAMPLE_DELIVERIES = [
  { id: "ENT-1048", orderDate: "2024-06-18", dueDate: "2024-06-20", deliveredDate: "2024-06-20", status: "Concluída", client: "Casa & Cia", region: "Sudeste", owner: "Matheus Lacet" },
  { id: "ENT-1049", orderDate: "2024-06-18", dueDate: "2024-06-21", deliveredDate: "2024-06-22", status: "Concluída", client: "Lume Studio", region: "Sul", owner: "Rafael Lima" },
  { id: "ENT-1050", orderDate: "2024-06-19", dueDate: "2024-06-21", deliveredDate: "", status: "Atrasada", client: "Mercado Norte", region: "Norte", owner: "João Alves" },
  { id: "ENT-1051", orderDate: "2024-06-20", dueDate: "2024-06-24", deliveredDate: "2024-06-23", status: "Concluída", client: "Ateliê 27", region: "Sudeste", owner: "Matheus Lacet" },
  { id: "ENT-1052", orderDate: "2024-06-21", dueDate: "2024-06-25", deliveredDate: "", status: "Em trânsito", client: "Nativa Foods", region: "Centro-Oeste", owner: "Caio Nunes" },
  { id: "ENT-1053", orderDate: "2024-06-22", dueDate: "2024-06-26", deliveredDate: "2024-06-25", status: "Concluída", client: "Casa & Cia", region: "Sudeste", owner: "Rafael Lima" },
  { id: "ENT-1054", orderDate: "2024-06-23", dueDate: "2024-06-27", deliveredDate: "", status: "Pendente", client: "Lume Studio", region: "Sul", owner: "Matheus Lacet" },
  { id: "ENT-1055", orderDate: "2024-06-24", dueDate: "2024-06-28", deliveredDate: "2024-06-27", status: "Concluída", client: "Mercado Norte", region: "Norte", owner: "João Alves" },
  { id: "ENT-1056", orderDate: "2024-06-25", dueDate: "2024-06-29", deliveredDate: "", status: "Em trânsito", client: "Ateliê 27", region: "Sudeste", owner: "Caio Nunes" },
  { id: "ENT-1057", orderDate: "2024-06-26", dueDate: "2024-07-01", deliveredDate: "2024-07-01", status: "Concluída", client: "Nativa Foods", region: "Centro-Oeste", owner: "Rafael Lima" },
  { id: "ENT-1058", orderDate: "2024-06-27", dueDate: "2024-07-02", deliveredDate: "", status: "Pendente", client: "Casa & Cia", region: "Sudeste", owner: "Matheus Lacet" },
  { id: "ENT-1059", orderDate: "2024-06-28", dueDate: "2024-07-03", deliveredDate: "2024-07-02", status: "Concluída", client: "Lume Studio", region: "Sul", owner: "João Alves" },
];

const statusOptions = ["Todos", "Concluída", "Em trânsito", "Pendente", "Atrasada"];
const palette = { "Concluída": "#2b8a70", "Em trânsito": "#d58a3d", Pendente: "#7c7a92", Atrasada: "#c85a55" };
const ANALYSIS_COLUMNS = [
  { key: "attract", label: "Attract", helper: "Atenção", options: ["Não avaliado", "Forte gancho inicial", "Visual dinâmico", "Ritmo oscila no meio", "Arco tradicional lento"] },
  { key: "brand", label: "Brand", helper: "Marca", options: ["Não avaliado", "Marca tardia (>5s)", "Uso em contexto", "Faltar ver + ouvir marca", "Marca central na história"] },
  { key: "connect", label: "Connect", helper: "Conexão", options: ["Não avaliado", "Humano e próximo", "Formato UGC natural", "Olhar direto na lente", "Tom confiável e direto"] },
  { key: "direct", label: "Direct", helper: "CTA", options: ["Não avaliado", "CTA pouco evidente", "Texto fora de safe zone", "CTA genérico sem incentivo", "Comando claro ao final"] },
];
const INITIAL_ANALYSES = [
  { id: "R9Z3tYW616Y", title: "Vídeo 1", status: "Em análise", attract: "Forte gancho inicial", brand: "Marca tardia (>5s)", connect: "Humano e próximo", direct: "CTA pouco evidente" },
  { id: "u3UvBUofAk", title: "Vídeo 2", status: "Aprovado", attract: "Visual dinâmico", brand: "Uso em contexto", connect: "Formato UGC natural", direct: "Texto fora de safe zone" },
  { id: "nWd7isSaOQ", title: "Vídeo 3", status: "Ajustes", attract: "Ritmo oscila no meio", brand: "Faltar ver + ouvir marca", connect: "Olhar direto na lente", direct: "CTA genérico sem incentivo" },
  { id: "4KAnf4EdE4", title: "Vídeo 4", status: "Reprovado", attract: "Arco tradicional lento", brand: "Marca central na história", connect: "Tom confiável e direto", direct: "Comando claro ao final" },
];
const VALIDATION_COLORS = ["Amarelo", "Verde", "Vermelho"];
const COLOR_HEX = { Amarelo: "#e7b94c", Verde: "#45c58a", Vermelho: "#ed777f", Azul: "#70a9ef" };
const ANALYSIS_STATUS_OPTIONS = ["Em análise", "Aprovado", "Ajustes", "Reprovado"];
const STATUS_COLOR_DEFAULTS = { "Em análise": "Azul", Aprovado: "Verde", Ajustes: "Amarelo", Reprovado: "Vermelho" };
const supabaseClient = window.SUPABASE_CONFIG?.url?.includes("supabase.co") && window.SUPABASE_CONFIG?.anonKey && !window.SUPABASE_CONFIG.anonKey.startsWith("SUA-")
  ? window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey)
  : null;

function mapRemoteVideo(row) {
  return { id: row.id, title: row.title, status: row.status, attract: row.attract, brand: row.brand, connect: row.connect, direct: row.direct };
}

function mapRemoteDelivery(row) {
  return { id: row.id, orderDate: row.order_date, dueDate: row.due_date, deliveredDate: row.delivered_date || "", status: row.status, client: row.client, region: row.region || "Sem região", owner: row.owner || "Sem responsável" };
}

function mapRemoteHistory(row) {
  return { id: row.id, title: row.title, videoId: row.video_id, status: row.status, addedAt: formatDateTime(new Date(row.added_at)) };
}

function defaultOptionColor(option) {
  if (option === "Não avaliado" || option.includes("oscila") || option.includes("tard")) return "Amarelo";
  if (option.includes("pouco") || option.includes("fora") || option.includes("genérico") || option.includes("Faltar") || option.includes("lento")) return "Vermelho";
  return "Verde";
}

function optionScore(color) {
  return color === "Verde" ? 5 : color === "Vermelho" ? -5 : 0;
}

function isWithinPeriod(item, period, referenceDate) {
  const orderDate = parseDate(item.orderDate);
  if (!orderDate) return false;
  if (period === "Este mês") return orderDate.getFullYear() === referenceDate.getFullYear() && orderDate.getMonth() === referenceDate.getMonth();
  const days = period === "Últimos 7 dias" ? 7 : 30;
  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);
  return orderDate >= startDate && orderDate <= referenceDate;
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value) {
  const date = parseDate(value);
  return date ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date).replace(" de ", " ") : "-";
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date).replace(" de ", " ");
}

function formatCurrentDate(date) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function getGreeting(date) {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function getVisitorCookie() {
  const cookie = document.cookie.split("; ").find((item) => item.startsWith("fluxo_visitor_name="));
  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
}

function saveVisitorCookie(name) {
  document.cookie = `fluxo_visitor_name=${encodeURIComponent(name)}; max-age=31536000; path=/; SameSite=Lax`;
}

function normalizeRows(rows) {
  return rows.map((row, index) => ({
    id: row.id || row["ID da entrega"] || row["ID"] || `ENT-${index + 1}`,
    orderDate: row.orderDate || row["Data do pedido"] || row["Data pedido"] || "",
    dueDate: row.dueDate || row["Data prevista"] || row["Prazo"] || "",
    deliveredDate: row.deliveredDate || row["Data de entrega"] || "",
    status: row.status || row["Status"] || "Pendente",
    client: row.client || row["Cliente"] || "Sem cliente",
    region: row.region || row["Região"] || row["Regiao"] || "Sem região",
    owner: row.owner || row["Responsável"] || row["Responsavel"] || "Sem responsável",
  }));
}

function csvToRows(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((header) => header.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
}

function StatusBadge({ status }) {
  return <span className={`status status-${status.toLowerCase().replace(" ", "-")}`}><span className="status-dot" />{status}</span>;
}

function KpiCard({ label, value, detail, tone, icon }) {
  return <article className={`kpi-card ${tone}`}>
    <div className="kpi-top"><span>{label}</span><span className="kpi-icon">{icon}</span></div>
    <strong>{value}</strong>
    <small>{detail}</small>
  </article>;
}

function EmptyState() {
  return <div className="empty-state"><strong>Nenhuma entrega encontrada</strong><span>Ajuste os filtros para visualizar outros registros.</span></div>;
}

function ContentAnalysis({ analyses, history, onChange, onAdd, onDelete, onEdit, onUndo, canUndo }) {
  const [columnFilters, setColumnFilters] = useState({ attract: "Todos", brand: "Todos", connect: "Todos", direct: "Todos" });
  const [validationOptions, setValidationOptions] = useState(() => Object.fromEntries(ANALYSIS_COLUMNS.map((column) => [column.key, [...column.options]])));
  const [optionSettings, setOptionSettings] = useState(() => Object.fromEntries(ANALYSIS_COLUMNS.flatMap((column) => column.options.map((option) => [`${column.key}:${option}`, { color: defaultOptionColor(option), score: optionScore(defaultOptionColor(option)) }]))));
  const [statusOptions, setStatusOptions] = useState(ANALYSIS_STATUS_OPTIONS);
  const [statusColors, setStatusColors] = useState(STATUS_COLOR_DEFAULTS);
  const [isCreating, setIsCreating] = useState(false);
  const [isManagingOptions, setIsManagingOptions] = useState(false);
  const [isManagingStatuses, setIsManagingStatuses] = useState(false);
  const [optionStage, setOptionStage] = useState("attract");
  const [optionDraft, setOptionDraft] = useState("");
  const [optionColorDraft, setOptionColorDraft] = useState("Amarelo");
  const [editingOption, setEditingOption] = useState(null);
  const [editingOptionDraft, setEditingOptionDraft] = useState("");
  const [editingOptionColor, setEditingOptionColor] = useState("Amarelo");
  const [statusDraft, setStatusDraft] = useState("");
  const [statusColorDraft, setStatusColorDraft] = useState("Azul");
  const [editingStatus, setEditingStatus] = useState(null);
  const [editingStatusDraft, setEditingStatusDraft] = useState("");
  const [editingStatusColor, setEditingStatusColor] = useState("Azul");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ title: "", id: "", status: "Em análise", attract: "Não avaliado", brand: "Não avaliado", connect: "Não avaliado", direct: "Não avaliado" });

  const visibleAnalyses = analyses.filter((analysis) => ANALYSIS_COLUMNS.every((column) => columnFilters[column.key] === "Todos" || analysis[column.key] === columnFilters[column.key]));

  useEffect(() => {
    if (!supabaseClient) return undefined;
    let active = true;
    async function loadCatalogs() {
      const [optionsResult, statusesResult] = await Promise.all([
        supabaseClient.from("validation_options").select("*").order("created_at"),
        supabaseClient.from("video_statuses").select("*").order("created_at"),
      ]);
      if (!active || optionsResult.error || statusesResult.error) return;
      if (optionsResult.data?.length) {
        setValidationOptions(Object.fromEntries(ANALYSIS_COLUMNS.map((column) => [column.key, optionsResult.data.filter((item) => item.stage === column.key).map((item) => item.label)])));
        setOptionSettings(Object.fromEntries(optionsResult.data.map((item) => [`${item.stage}:${item.label}`, { color: item.color, score: item.score }])));
      }
      if (statusesResult.data?.length) {
        setStatusOptions(statusesResult.data.map((item) => item.name));
        setStatusColors(Object.fromEntries(statusesResult.data.map((item) => [item.name, item.color])));
      }
    }
    loadCatalogs();
    let refreshTimer;
    const refreshCatalogsSoon = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(loadCatalogs, 80);
    };
    const channel = supabaseClient.channel(`catalog-realtime-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "validation_options" }, refreshCatalogsSoon)
      .on("postgres_changes", { event: "*", schema: "public", table: "video_statuses" }, refreshCatalogsSoon)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") console.info("Supabase realtime: catálogos conectados");
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") console.error(`Supabase realtime catálogo: ${status}`);
      });
    return () => { active = false; window.clearTimeout(refreshTimer); supabaseClient.removeChannel(channel); };
  }, []);

  function getOptionSettings(columnKey, option) {
    const fallbackColor = defaultOptionColor(option);
    return optionSettings[`${columnKey}:${option}`] || { color: fallbackColor, score: optionScore(fallbackColor) };
  }

  function analysisScore(analysis) {
    return ANALYSIS_COLUMNS.reduce((sum, column) => sum + getOptionSettings(column.key, analysis[column.key]).score, 0);
  }

  function optionsFor(columnKey) {
    return validationOptions[columnKey] || ["Não avaliado"];
  }

  function statusColor(status) {
    return statusColors[status] || "Azul";
  }

  function addStatus(event) {
    event.preventDefault();
    const value = statusDraft.trim();
    if (!value || statusOptions.includes(value)) return;
    setStatusOptions((current) => [...current, value]);
    setStatusColors((current) => ({ ...current, [value]: statusColorDraft }));
    if (supabaseClient) supabaseClient.from("video_statuses").insert({ name: value, color: statusColorDraft });
    setStatusDraft("");
    setStatusColorDraft("Azul");
  }

  function saveStatus(oldValue) {
    const value = editingStatusDraft.trim();
    if (!value || (value !== oldValue && statusOptions.includes(value))) return;
    const color = editingStatusColor;
    setStatusOptions((current) => current.map((status) => status === oldValue ? value : status));
    setStatusColors((current) => { const next = { ...current, [value]: color }; delete next[oldValue]; return next; });
    if (supabaseClient) supabaseClient.from("video_statuses").update({ name: value, color }).eq("name", oldValue);
    analyses.filter((analysis) => analysis.status === oldValue).forEach((analysis) => onChange(analysis.id, "status", value));
    setEditingStatus(null);
  }

  function deleteStatus(value) {
    if (statusOptions.length <= 1) return;
    const fallback = statusOptions.find((status) => status !== value) || statusOptions[0];
    setStatusOptions((current) => current.filter((status) => status !== value));
    setStatusColors((current) => { const next = { ...current }; delete next[value]; return next; });
    if (supabaseClient) supabaseClient.from("video_statuses").delete().eq("name", value);
    analyses.filter((analysis) => analysis.status === value).forEach((analysis) => onChange(analysis.id, "status", fallback));
  }

  function addOption(event) {
    event.preventDefault();
    const value = optionDraft.trim();
    if (!value || optionsFor(optionStage).includes(value)) return;
    setValidationOptions((current) => ({ ...current, [optionStage]: [...optionsFor(optionStage), value] }));
    setOptionSettings((current) => ({ ...current, [`${optionStage}:${value}`]: { color: optionColorDraft, score: optionScore(optionColorDraft) } }));
    if (supabaseClient) supabaseClient.from("validation_options").insert({ stage: optionStage, label: value, color: optionColorDraft, score: optionScore(optionColorDraft) });
    setOptionDraft("");
    setOptionColorDraft("Amarelo");
  }

  function saveOption(columnKey, oldValue) {
    const value = editingOptionDraft.trim();
    if (!value || (value !== oldValue && optionsFor(columnKey).includes(value))) return;
    const settings = { color: editingOptionColor, score: optionScore(editingOptionColor) };
    setValidationOptions((current) => ({ ...current, [columnKey]: current[columnKey].map((option) => option === oldValue ? value : option) }));
    setOptionSettings((current) => { const next = { ...current, [`${columnKey}:${value}`]: settings }; delete next[`${columnKey}:${oldValue}`]; return next; });
    if (supabaseClient) supabaseClient.from("validation_options").update({ label: value, color: settings.color, score: settings.score }).eq("stage", columnKey).eq("label", oldValue);
    analyses.filter((analysis) => analysis[columnKey] === oldValue).forEach((analysis) => onChange(analysis.id, columnKey, value));
    setEditingOption(null);
  }

  function deleteOption(columnKey, value) {
    const currentOptions = optionsFor(columnKey);
    if (currentOptions.length <= 1) return;
    const fallback = currentOptions.find((option) => option !== value) || "Não avaliado";
    setValidationOptions((current) => ({ ...current, [columnKey]: currentOptions.filter((option) => option !== value) }));
    setOptionSettings((current) => { const next = { ...current }; delete next[`${columnKey}:${value}`]; return next; });
    if (supabaseClient) supabaseClient.from("validation_options").delete().eq("stage", columnKey).eq("label", value);
    analyses.filter((analysis) => analysis[columnKey] === value).forEach((analysis) => onChange(analysis.id, columnKey, fallback));
  }

  function startCreate() {
    setDraft({ title: `Vídeo ${analyses.length + 1}`, id: "", status: statusOptions[0], attract: "Não avaliado", brand: "Não avaliado", connect: "Não avaliado", direct: "Não avaliado" });
    setIsCreating(true);
  }

  function saveNew(event) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.id.trim()) return;
    onAdd({ ...draft, title: draft.title.trim(), id: draft.id.trim() });
    setIsCreating(false);
  }

  function startEdit(analysis) {
    setEditingId(analysis.id);
    setDraft({ ...analysis });
  }

  function saveEdit(event) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.id.trim()) return;
    onEdit(editingId, { ...draft, title: draft.title.trim(), id: draft.id.trim() });
    setEditingId(null);
  }

  function cancelForm() {
    setIsCreating(false);
    setEditingId(null);
  }

  function renderForm(isEdit = false) {
    return <form className="analysis-item-form" onSubmit={isEdit ? saveEdit : saveNew}><input aria-label="Nome do vídeo" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Nome do vídeo" /><input aria-label="ID do vídeo" value={draft.id} onChange={(event) => setDraft({ ...draft, id: event.target.value })} placeholder="ID ou link curto" /><select aria-label="Status do vídeo" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select>{ANALYSIS_COLUMNS.map((column) => <select key={column.key} aria-label={`${column.label} da validação`} value={draft[column.key]} onChange={(event) => setDraft({ ...draft, [column.key]: event.target.value })}>{optionsFor(column.key).map((option) => <option key={option}>{option}</option>)}</select>)}<button className="analysis-save" type="submit">Salvar</button><button className="analysis-cancel" type="button" onClick={cancelForm}>Cancelar</button></form>;
  }

  return <section className="content-analysis panel" id="content-analysis">
    <div className="panel-header content-analysis-heading"><div><p className="eyebrow">ANÁLISE DE CONTEÚDO</p><h2>Matriz de aderência ao guia</h2><p>Valide cada peça antes de liberar para a próxima etapa.</p></div><div className="analysis-actions"><span className="analysis-count">{visibleAnalyses.length} de {analyses.length} vídeos</span><button className="analysis-undo" type="button" onClick={onUndo} disabled={!canUndo} title={canUndo ? "Restaurar o último vídeo excluído" : "Nenhuma exclusão recente para desfazer"}>↶ Desfazer última exclusão</button><button className="analysis-manage" type="button" onClick={() => setIsManagingOptions(!isManagingOptions)}>{isManagingOptions ? "Fechar opções" : "Gerenciar opções"}</button><button className="analysis-add" type="button" onClick={startCreate}>+ Novo vídeo</button></div></div>
    {isManagingOptions && <div className="options-manager"><div className="options-manager-title"><strong>Opções de validação</strong><span>Crie, edite ou remova labels. Amarelo = 0, Verde = +5, Vermelho = -5.</span></div><form className="option-create-form" onSubmit={addOption}><select aria-label="Etapa da opção" value={optionStage} onChange={(event) => setOptionStage(event.target.value)}>{ANALYSIS_COLUMNS.map((column) => <option key={column.key} value={column.key}>{column.label} ({column.helper})</option>)}</select><input aria-label="Nova opção" value={optionDraft} onChange={(event) => setOptionDraft(event.target.value)} placeholder="Digite uma nova opção" /><select aria-label="Cor da nova opção" value={optionColorDraft} onChange={(event) => setOptionColorDraft(event.target.value)}>{VALIDATION_COLORS.map((color) => <option key={color}>{color}</option>)}</select><span className="option-score-preview">{optionScore(optionColorDraft) > 0 ? "+" : ""}{optionScore(optionColorDraft)} pts</span><button className="analysis-save" type="submit">Adicionar opção</button></form><div className="option-list">{ANALYSIS_COLUMNS.map((column) => <div className="option-group" key={column.key}><strong>{column.label}</strong><div>{optionsFor(column.key).map((option) => { const settings = getOptionSettings(column.key, option); return editingOption === `${column.key}:${option}` ? <span className="option-edit" key={option}><input autoFocus aria-label={`Editar opção ${option}`} value={editingOptionDraft} onChange={(event) => setEditingOptionDraft(event.target.value)} /><select aria-label={`Cor da opção ${option}`} value={editingOptionColor} onChange={(event) => setEditingOptionColor(event.target.value)}>{VALIDATION_COLORS.map((color) => <option key={color}>{color}</option>)}</select><span>{optionScore(editingOptionColor) > 0 ? "+" : ""}{optionScore(editingOptionColor)} pts</span><button type="button" onClick={() => saveOption(column.key, option)}>Salvar</button><button type="button" onClick={() => setEditingOption(null)}>Cancelar</button></span> : <span className="option-chip" key={option}><i className="option-color-dot" style={{ background: COLOR_HEX[settings.color] }} /><span>{option}</span><b>{settings.score > 0 ? "+" : ""}{settings.score}</b><button type="button" onClick={() => { setEditingOption(`${column.key}:${option}`); setEditingOptionDraft(option); setEditingOptionColor(settings.color); }} aria-label={`Editar opção ${option}`}>Editar</button><button type="button" onClick={() => deleteOption(column.key, option)} aria-label={`Excluir opção ${option}`}>×</button></span>; })}</div></div>)}</div></div>}
    {isManagingStatuses && <div className="options-manager status-manager"><div className="options-manager-title"><strong>Status dos vídeos</strong><span>Crie, edite ou remova tags. Escolha azul, vermelho, verde ou amarelo.</span></div><form className="option-create-form" onSubmit={addStatus}><input aria-label="Novo status" value={statusDraft} onChange={(event) => setStatusDraft(event.target.value)} placeholder="Digite um novo status" /><select aria-label="Cor do novo status" value={statusColorDraft} onChange={(event) => setStatusColorDraft(event.target.value)}>{Object.keys(COLOR_HEX).map((color) => <option key={color}>{color}</option>)}</select><span className="option-color-preview" style={{ background: COLOR_HEX[statusColorDraft] }} /><button className="analysis-save" type="submit">Adicionar status</button></form><div className="option-list"><div className="option-group"><strong>Status</strong><div>{statusOptions.map((status) => editingStatus === status ? <span className="option-edit" key={status}><input autoFocus aria-label={`Editar status ${status}`} value={editingStatusDraft} onChange={(event) => setEditingStatusDraft(event.target.value)} /><select aria-label={`Cor do status ${status}`} value={editingStatusColor} onChange={(event) => setEditingStatusColor(event.target.value)}>{Object.keys(COLOR_HEX).map((color) => <option key={color}>{color}</option>)}</select><button type="button" onClick={() => saveStatus(status)}>Salvar</button><button type="button" onClick={() => setEditingStatus(null)}>Cancelar</button></span> : <span className="option-chip" key={status}><i className="option-color-dot" style={{ background: COLOR_HEX[statusColor(status)] }} /><span>{status}</span><button type="button" onClick={() => { setEditingStatus(status); setEditingStatusDraft(status); setEditingStatusColor(statusColor(status)); }} aria-label={`Editar status ${status}`}>Editar</button><button type="button" onClick={() => deleteStatus(status)} aria-label={`Excluir status ${status}`}>×</button></span>)}</div></div></div></div>}
    {isCreating && renderForm()}
    <div className="analysis-status-grid"><div className="analysis-status-heading"><div><p className="eyebrow">STATUS DOS VÍDEOS</p><h3>Andamento das peças</h3></div><button className="analysis-manage" type="button" onClick={() => setIsManagingStatuses(!isManagingStatuses)}>{isManagingStatuses ? "Fechar status" : "Gerenciar status"}</button></div><div className="analysis-status-list">{analyses.map((analysis) => <div className="analysis-status-item" key={analysis.id} style={{ borderColor: `${COLOR_HEX[statusColor(analysis.status)]}55` }}><span><strong>{analysis.title}</strong><small>{analysis.id}</small></span><label className="analysis-status-tag" style={{ color: COLOR_HEX[statusColor(analysis.status)], borderColor: `${COLOR_HEX[statusColor(analysis.status)]}55`, background: `${COLOR_HEX[statusColor(analysis.status)]}12` }}><i style={{ background: COLOR_HEX[statusColor(analysis.status)] }} /><select aria-label={`Status de ${analysis.title}`} value={analysis.status} onChange={(event) => onChange(analysis.id, "status", event.target.value)}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label></div>)}</div></div>
    <div className="analysis-history"><div><p className="eyebrow">HISTÓRICO</p><h3>Vídeos adicionados</h3></div><div className="history-list">{history.length ? history.map((item) => <div className="history-item" key={item.id}><span className="history-dot" /><div><strong>{item.title}</strong><small>{item.videoId} · {item.status}</small></div><time>{item.addedAt}</time></div>) : <span className="history-empty">Nenhum vídeo adicionado ainda.</span>}</div></div>
    <div className="analysis-table-wrap"><table className="analysis-table"><thead><tr><th>VÍDEO ANALISADO<div className="analysis-filter-label">Filtrar na coluna</div></th>{ANALYSIS_COLUMNS.map((column) => <th key={column.key}><span>{column.label}</span><small>({column.helper})</small><select className="analysis-filter" aria-label={`Filtrar ${column.label}`} value={columnFilters[column.key]} onChange={(event) => setColumnFilters({ ...columnFilters, [column.key]: event.target.value })}><option>Todos</option>{optionsFor(column.key).map((option) => <option key={option}>{option}</option>)}</select></th>)}<th className="analysis-score-head">SCORE</th><th className="analysis-actions-head">AÇÕES</th></tr></thead><tbody>{visibleAnalyses.map((analysis) => editingId === analysis.id ? <tr key={analysis.id}><td colSpan={7}>{renderForm(true)}</td></tr> : <tr key={analysis.id}><th scope="row"><strong>{analysis.title}</strong><small>({analysis.id})</small></th>{ANALYSIS_COLUMNS.map((column) => { const settings = getOptionSettings(column.key, analysis[column.key]); return <td key={column.key}><span className="analysis-choice"><i style={{ background: COLOR_HEX[settings.color] }} /><select className={`analysis-select ${analysis[column.key] === "Não avaliado" ? "is-empty" : ""}`} aria-label={`${analysis.title}: ${column.label}`} value={analysis[column.key]} onChange={(event) => onChange(analysis.id, column.key, event.target.value)}>{optionsFor(column.key).map((option) => <option key={option}>{option}</option>)}</select></span></td>; })}<td className="analysis-score"><strong>{analysisScore(analysis)}/20</strong></td><td className="analysis-row-actions"><button type="button" onClick={() => startEdit(analysis)} aria-label={`Editar ${analysis.title}`}>Editar</button><button type="button" onClick={() => onDelete(analysis.id)} aria-label={`Excluir ${analysis.title}`}>Excluir</button></td></tr>)}</tbody></table>{!visibleAnalyses.length && <EmptyState />}</div>
  </section>;
}

function App() {
  const [deliveries, setDeliveries] = useState(SAMPLE_DELIVERIES);
  const [analyses, setAnalyses] = useState(INITIAL_ANALYSES);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [lastDeletedAnalysis, setLastDeletedAnalysis] = useState(null);
  const [visitorName, setVisitorName] = useState(() => getVisitorCookie());
  const [nameDraft, setNameDraft] = useState("");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [filters, setFilters] = useState({ period: "Últimos 30 dias", status: "Todos", client: "Todos" });
  const [sheetUrl, setSheetUrl] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [notice, setNotice] = useState({ type: "info", text: "Dados de demonstração carregados" });
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const options = useMemo(() => ({
    clients: ["Todos", ...new Set(deliveries.map((item) => item.client))],
  }), [deliveries]);

  const dataReferenceDate = useMemo(() => deliveries.reduce((latest, item) => {
    const orderDate = parseDate(item.orderDate);
    return orderDate && (!latest || orderDate > latest) ? orderDate : latest;
  }, null) || new Date(), [deliveries]);

  const filtered = useMemo(() => deliveries.filter((item) => (
    isWithinPeriod(item, filters.period, dataReferenceDate) &&
    (filters.status === "Todos" || item.status === filters.status) &&
    (filters.client === "Todos" || item.client === filters.client)
  )), [deliveries, filters, dataReferenceDate]);

  const metrics = useMemo(() => {
    const completed = filtered.filter((item) => item.status === "Concluída");
    const onTime = completed.filter((item) => parseDate(item.deliveredDate) <= parseDate(item.dueDate)).length;
    return {
      total: filtered.length,
      completed: completed.length,
      pending: filtered.filter((item) => ["Pendente", "Em trânsito"].includes(item.status)).length,
      late: filtered.filter((item) => item.status === "Atrasada").length,
      punctuality: completed.length ? Math.round((onTime / completed.length) * 100) : 0,
    };
  }, [filtered]);

  const statusCounts = statusOptions.slice(1).map((status) => ({ status, count: filtered.filter((item) => item.status === status).length }));

  useEffect(() => {
    const clock = window.setInterval(() => setCurrentDate(new Date()), 60000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const interval = window.setInterval(() => {
      setLastUpdated(new Date());
      setNotice({ type: "success", text: "Dados atualizados automaticamente" });
    }, 30000);
    return () => window.clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    if (!supabaseClient) return undefined;
    let active = true;

    async function loadRemoteData() {
      const [deliveriesResult, videosResult, historyResult] = await Promise.all([
        supabaseClient.from("deliveries").select("*").order("order_date", { ascending: false }),
        supabaseClient.from("content_videos").select("*").order("created_at", { ascending: true }),
        supabaseClient.from("video_history").select("*").order("added_at", { ascending: false }),
      ]);
      if (!active) return;
      const firstError = deliveriesResult.error || videosResult.error || historyResult.error;
      if (firstError) {
        setNotice({ type: "error", text: `Supabase: ${firstError.message}` });
        return;
      }
      setDeliveries((deliveriesResult.data || []).map(mapRemoteDelivery));
      setAnalyses((videosResult.data || []).map(mapRemoteVideo));
      setAnalysisHistory((historyResult.data || []).map(mapRemoteHistory));
      setNotice({ type: "success", text: "Dados sincronizados com o Supabase" });
    }

    loadRemoteData();
    let refreshTimer;
    const refreshRemoteSoon = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(loadRemoteData, 100);
    };
    const channel = supabaseClient.channel(`dashboard-realtime-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "deliveries" }, refreshRemoteSoon)
      .on("postgres_changes", { event: "*", schema: "public", table: "content_videos" }, refreshRemoteSoon)
      .on("postgres_changes", { event: "*", schema: "public", table: "video_history" }, refreshRemoteSoon)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setNotice({ type: "success", text: "Realtime conectado: dados atualizados automaticamente" });
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setNotice({ type: "error", text: `Realtime indisponível: ${status}` });
      });
    return () => {
      active = false;
      window.clearTimeout(refreshTimer);
      supabaseClient.removeChannel(channel);
    };
  }, []);

  async function loadSheet() {
    if (!sheetUrl) {
      setNotice({ type: "error", text: "Informe a URL publicada da planilha" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(sheetUrl);
      if (!response.ok) throw new Error("Não foi possível acessar a planilha");
      const text = await response.text();
      const rows = normalizeRows(sheetUrl.includes("csv") ? csvToRows(text) : JSON.parse(text));
      if (!rows.length) throw new Error("A planilha não possui linhas válidas");
      setDeliveries(rows);
      setLastUpdated(new Date());
      setNotice({ type: "success", text: `${rows.length} entregas importadas com sucesso` });
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Erro ao conectar com a planilha" });
    } finally {
      setIsLoading(false);
    }
  }

  function refreshData() {
    setIsLoading(true);
    window.setTimeout(() => {
      setLastUpdated(new Date());
      setIsLoading(false);
      setNotice({ type: "success", text: "Dados atualizados com sucesso" });
    }, 500);
  }

  function exportCsv() {
    const header = "ID,Data do pedido,Data prevista,Data de entrega,Status,Cliente";
    const body = filtered.map((item) => [item.id, item.orderDate, item.dueDate, item.deliveredDate, item.status, item.client].map((value) => `"${value}"`).join(","));
    const blob = new Blob([[header, ...body].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "entregas-filtradas.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice({ type: "success", text: `${filtered.length} registros exportados` });
  }

  function confirmName(event) {
    event.preventDefault();
    const name = nameDraft.trim();
    if (name) {
      saveVisitorCookie(name);
      setVisitorName(name);
    }
  }

  function updateAnalysis(id, column, value) {
    setAnalyses((current) => current.map((analysis) => analysis.id === id ? { ...analysis, [column]: value } : analysis));
    if (supabaseClient && ["status", "attract", "brand", "connect", "direct"].includes(column)) {
      supabaseClient.from("content_videos").update({ [column]: value }).eq("id", id).then(({ error }) => {
        if (error) setNotice({ type: "error", text: `Não foi possível salvar: ${error.message}` });
      });
    }
  }

  function addAnalysis(analysis) {
    const syncedAnalysis = { ...analysis, status: analysis.status || "Em análise" };
    setAnalyses((current) => [...current, syncedAnalysis]);
    setAnalysisHistory((current) => [{ id: `${syncedAnalysis.id}-${Date.now()}`, title: syncedAnalysis.title, videoId: syncedAnalysis.id, status: syncedAnalysis.status, addedAt: formatDateTime(new Date()) }, ...current]);
    if (supabaseClient) {
      supabaseClient.from("content_videos").insert({ id: syncedAnalysis.id, title: syncedAnalysis.title, status: syncedAnalysis.status, attract: syncedAnalysis.attract, brand: syncedAnalysis.brand, connect: syncedAnalysis.connect, direct: syncedAnalysis.direct }).then(({ error }) => {
        if (error) setNotice({ type: "error", text: `Não foi possível adicionar: ${error.message}` });
      });
      supabaseClient.from("video_history").insert({ video_id: syncedAnalysis.id, title: syncedAnalysis.title, status: syncedAnalysis.status }).then(({ error }) => {
        if (error) setNotice({ type: "error", text: `Histórico não salvo: ${error.message}` });
      });
    }
    setNotice({ type: "success", text: `${syncedAnalysis.title} adicionado à matriz e ao status` });
  }

  function editAnalysis(id, analysis) {
    setAnalyses((current) => current.map((item) => item.id === id ? analysis : item));
    if (supabaseClient) {
      supabaseClient.from("content_videos").update({ id: analysis.id, title: analysis.title, status: analysis.status, attract: analysis.attract, brand: analysis.brand, connect: analysis.connect, direct: analysis.direct }).eq("id", id).then(({ error }) => {
        if (error) setNotice({ type: "error", text: `Não foi possível editar: ${error.message}` });
      });
    }
    setNotice({ type: "success", text: `${analysis.title} atualizado` });
  }

  function deleteAnalysis(id) {
    const analysis = analyses.find((item) => item.id === id);
    setLastDeletedAnalysis(analysis || null);
    setAnalyses((current) => current.filter((item) => item.id !== id));
    if (supabaseClient) supabaseClient.from("content_videos").delete().eq("id", id).then(({ error }) => {
      if (error) setNotice({ type: "error", text: `Não foi possível excluir: ${error.message}` });
    });
    setNotice({ type: "success", text: `${analysis?.title || "Item"} excluído da matriz` });
  }

  function undoDeleteAnalysis() {
    if (!lastDeletedAnalysis || analyses.some((item) => item.id === lastDeletedAnalysis.id)) return;
    setAnalyses((current) => [...current, lastDeletedAnalysis]);
    if (supabaseClient) supabaseClient.from("content_videos").upsert({ id: lastDeletedAnalysis.id, title: lastDeletedAnalysis.title, status: lastDeletedAnalysis.status, attract: lastDeletedAnalysis.attract, brand: lastDeletedAnalysis.brand, connect: lastDeletedAnalysis.connect, direct: lastDeletedAnalysis.direct }).then(({ error }) => {
      if (error) setNotice({ type: "error", text: `Não foi possível restaurar: ${error.message}` });
    });
    setLastDeletedAnalysis(null);
    setNotice({ type: "success", text: `${lastDeletedAnalysis.title} restaurado na matriz` });
  }

  return <>
    {!visitorName && <div className="welcome-backdrop"><form className="welcome-modal" onSubmit={confirmName}><span className="welcome-mark">↗</span><p className="eyebrow">FLUXO DE ENTREGAS</p><h2>Antes de começar</h2><p>Como podemos chamar você?</p><input autoFocus value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} placeholder="Digite seu nome" aria-label="Seu nome" /><button className="button primary" type="submit">Entrar no painel <span>→</span></button></form></div>}
    <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">↗</span><span>fluxo<span className="brand-accent">.</span></span></div>
      <div className="workspace"><span className="workspace-avatar">OP</span><div><strong>Operações</strong><small>Painel principal</small></div><span className="chevron">⌄</span></div>
      <nav className="nav"><span className="nav-label">VISÃO GERAL</span><a className="nav-item active" href="#dashboard"><span>▦</span>Dashboard</a><a className="nav-item" href="#deliveries"><span>↗</span>Entregas</a><a className="nav-item" href="#clients"><span>◉</span>Clientes</a><span className="nav-label nav-spaced">GESTÃO</span><a className="nav-item" href="#reports"><span>▤</span>Relatórios</a><a className="nav-item" href="#settings"><span>⚙</span>Configurações</a></nav>
      <div className="sidebar-bottom"><div className="help-box"><span className="help-icon">?</span><strong>Precisa de ajuda?</strong><small>Veja como conectar sua planilha</small><button onClick={() => setNotice({ type: "info", text: "Use uma URL publicada em CSV ou JSON" })}>Ver documentação <span>→</span></button></div><div className="user"><span className="user-avatar">MC</span><div><strong>Matheus Lacet</strong><small>Administrador</small></div><span className="more">•••</span></div></div>
    </aside>

    <main className="main-content" id="dashboard">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Dashboard de entregas</strong></div><div className="top-actions"><button className="icon-button" title="Notificações">♧<i /></button><button className="icon-button" title="Ajuda">?</button><button className="profile-button"><span className="user-avatar small">{visitorName.slice(0, 2).toUpperCase()}</span><span>{visitorName}</span><span>⌄</span></button></div></header>
      <section className="page-heading"><div><p className="eyebrow">{formatCurrentDate(currentDate)}</p><h1>{getGreeting(currentDate)}, {visitorName} <span>✦</span></h1><p className="subtitle">Acompanhe o pulso das suas entregas em um só lugar.</p></div><div className="heading-actions"><button className="button secondary" onClick={refreshData}><span className={isLoading ? "spin" : ""}>↻</span> Atualizar dados</button><button className="button primary" onClick={exportCsv}><span>⇩</span> Exportar</button></div></section>

      <div className={`notice ${notice.type}`}><span>{notice.type === "error" ? "!" : notice.type === "success" ? "✓" : "i"}</span>{notice.text}<button onClick={() => setNotice({ type: "info", text: "Dados de demonstração carregados" })}>×</button></div>

      <ContentAnalysis analyses={analyses} history={analysisHistory} onChange={updateAnalysis} onAdd={addAnalysis} onDelete={deleteAnalysis} onEdit={editAnalysis} onUndo={undoDeleteAnalysis} canUndo={Boolean(lastDeletedAnalysis)} />

      <footer><span>Última atualização: <strong>{formatDateTime(lastUpdated)}</strong></span><label className="refresh-toggle"><input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} /><span className="toggle" />Atualização automática</label></footer>
    </main>
    </div>
  </>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
