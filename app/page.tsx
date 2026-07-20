"use client";

import { useState } from "react";
import { Shield, FileText, Plus, Trash2, Copy, Printer, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface MembroEquipe {
  patente: string;
  nome: string;
  matricula: string;
}

interface Suspeito {
  nome: string;
  rg: string;
  outros: string;
}

interface FormData {
  unidade: string;
  numeroBopm: string;
  equipe: {
    motorista: MembroEquipe;
    chefe: MembroEquipe;
    auxiliar: MembroEquipe;
    seguranca: MembroEquipe;
  };
  suspeitos: Suspeito[];
  local: string;
  dataHora: string;
  veiculo: string;
  itensApreendidos: string;
  descricao: string;
}

const membroVazio = (): MembroEquipe => ({ patente: "", nome: "", matricula: "" });
const suspeitoVazio = (): Suspeito => ({ nome: "", rg: "", outros: "" });

const cargoLabels: Record<string, string> = {
  motorista: "Motorista",
  chefe: "Chefe de Equipe",
  auxiliar: "Auxiliar",
  seguranca: "Segurança",
};

// Patentes da Força Tática — hierarquia completa PM/PMESP
const PATENTES_PRACAS = [
  { value: "Sd", label: "Sd — Soldado" },
  { value: "Cb", label: "Cb — Cabo" },
  { value: "3° Sgt", label: "3° Sgt — Terceiro-Sargento" },
  { value: "2° Sgt", label: "2° Sgt — Segundo-Sargento" },
  { value: "1° Sgt", label: "1° Sgt — Primeiro-Sargento" },
  { value: "Sub Ten", label: "Sub Ten — Subtenente" },
];

const PATENTES_OFICIAIS = [
  { value: "2° Ten", label: "2° Ten — Segundo-Tenente" },
  { value: "1° Ten", label: "1° Ten — Primeiro-Tenente" },
  { value: "Cap", label: "Cap — Capitão" },
  { value: "Maj", label: "Maj — Major" },
  { value: "Ten Cel", label: "Ten Cel — Tenente-Coronel" },
  { value: "Cel", label: "Cel — Coronel" },
];

const PATENTES_CIVIS = [
  { value: "Ag", label: "Ag — Agente" },
  { value: "Inv", label: "Inv — Investigador" },
  { value: "Esc", label: "Esc — Escrivão" },
  { value: "Del", label: "Del — Delegado" },
];

const TODAS_PATENTES = [
  { group: "Praças", items: PATENTES_PRACAS },
  { group: "Oficiais", items: PATENTES_OFICIAIS },
  { group: "Polícia Civil / Civil", items: PATENTES_CIVIS },
];

export default function Home() {
  const [form, setForm] = useState<FormData>({
    unidade: "",
    numeroBopm: "",
    equipe: {
      motorista: membroVazio(),
      chefe: membroVazio(),
      auxiliar: membroVazio(),
      seguranca: membroVazio(),
    },
    suspeitos: [suspeitoVazio()],
    local: "",
    dataHora: new Date().toISOString().slice(0, 16),
    veiculo: "",
    itensApreendidos: "",
    descricao: "",
  });

  const [bopm, setBopm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [equipeOpen, setEquipeOpen] = useState(true);
  const [suspeitoOpen, setSuspeitoOpen] = useState(true);
  const [ocorrenciaOpen, setOcorrenciaOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  function setMembro(cargo: keyof FormData["equipe"], field: keyof MembroEquipe, value: string) {
    setForm((f) => ({
      ...f,
      equipe: { ...f.equipe, [cargo]: { ...f.equipe[cargo], [field]: value } },
    }));
  }

  function setSuspeito(idx: number, field: keyof Suspeito, value: string) {
    setForm((f) => {
      const s = [...f.suspeitos];
      s[idx] = { ...s[idx], [field]: value };
      return { ...f, suspeitos: s };
    });
  }

  function addSuspeito() {
    setForm((f) => ({ ...f, suspeitos: [...f.suspeitos, suspeitoVazio()] }));
  }

  function removeSuspeito(idx: number) {
    setForm((f) => ({ ...f, suspeitos: f.suspeitos.filter((_, i) => i !== idx) }));
  }

  async function gerarBopm() {
    if (!form.descricao.trim()) {
      setError("Preencha a descrição da ocorrência.");
      return;
    }
    setError("");
    setLoading(true);
    setBopm("");
    try {
      const res = await fetch("/api/gerar-bopm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro desconhecido");
      setBopm(data.bopm);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar BOPM.");
    } finally {
      setLoading(false);
    }
  }

  function copiar() {
    navigator.clipboard.writeText(bopm);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function imprimir() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>BOPM</title><style>
      body{font-family:monospace;padding:2rem;background:#fff;color:#000;white-space:pre-wrap;line-height:1.6}
    </style></head><body>${bopm.replace(/\n/g, "<br>")}</body></html>`);
    win.document.close();
    win.print();
  }

  const inputClass =
    "w-full bg-[#21262d] border border-[#30363d] text-[#e6edf3] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] placeholder-[#8b949e]";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-[#8b949e] mb-1";

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header className="border-b border-[#30363d] bg-[#161b22] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded bg-[#4a7c59]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-widest uppercase text-[#e6edf3]">
              BOPM — Boletim de Ocorrência Policial
            </h1>
            <p className="text-xs text-[#8b949e]">Sistema de Geração com Inteligência Artificial</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-[#4a7c59]/20 text-[#4a7c59] border border-[#4a7c59]/40 px-2 py-1 rounded uppercase tracking-wide font-semibold">
              IA Ativa
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — FORM */}
        <div className="space-y-4">
          {/* Unidade / Número */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Unidade *</label>
                <input
                  className={inputClass}
                  placeholder="Ex: TÁTICO COMANDO"
                  value={form.unidade}
                  onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>N° do BOPM</label>
                <input
                  className={inputClass}
                  placeholder="Ex: 09011"
                  value={form.numeroBopm}
                  onChange={(e) => setForm({ ...form, numeroBopm: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* EQUIPE */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
            <button
              onClick={() => setEquipeOpen(!equipeOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#21262d] transition-colors"
            >
              <span className="text-sm font-bold uppercase tracking-widest text-[#4a7c59]">
                👥 Equipe
              </span>
              {equipeOpen ? <ChevronUp className="w-4 h-4 text-[#8b949e]" /> : <ChevronDown className="w-4 h-4 text-[#8b949e]" />}
            </button>
            {equipeOpen && (
              <div className="px-4 pb-4 space-y-4 border-t border-[#30363d]">
                {(Object.keys(form.equipe) as (keyof FormData["equipe"])[]).map((cargo) => (
                  <div key={cargo} className="pt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8b949e] mb-2">
                      {cargoLabels[cargo]}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-[#8b949e] mb-1">Patente</label>
                        <select
                          className={`${inputClass} cursor-pointer`}
                          value={form.equipe[cargo].patente}
                          onChange={(e) => setMembro(cargo, "patente", e.target.value)}
                        >
                          <option value="">Selecionar</option>
                          {TODAS_PATENTES.map((group) => (
                            <optgroup key={group.group} label={group.group}>
                              {group.items.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[#8b949e] mb-1">Nome</label>
                        <input
                          className={inputClass}
                          placeholder="Nome completo"
                          value={form.equipe[cargo].nome}
                          onChange={(e) => setMembro(cargo, "nome", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#8b949e] mb-1">Matrícula</label>
                        <input
                          className={inputClass}
                          placeholder="Ex: 3255"
                          value={form.equipe[cargo].matricula}
                          onChange={(e) => setMembro(cargo, "matricula", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SUSPEITO(S) */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
            <button
              onClick={() => setSuspeitoOpen(!suspeitoOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#21262d] transition-colors"
            >
              <span className="text-sm font-bold uppercase tracking-widest text-[#d29922]">
                🎯 Suspeito(s)
              </span>
              {suspeitoOpen ? <ChevronUp className="w-4 h-4 text-[#8b949e]" /> : <ChevronDown className="w-4 h-4 text-[#8b949e]" />}
            </button>
            {suspeitoOpen && (
              <div className="px-4 pb-4 border-t border-[#30363d]">
                {form.suspeitos.map((s, idx) => (
                  <div key={idx} className="pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
                        Suspeito {idx + 1}
                      </p>
                      {form.suspeitos.length > 1 && (
                        <button
                          onClick={() => removeSuspeito(idx)}
                          className="text-[#da3633] hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="block text-xs text-[#8b949e] mb-1">Nome</label>
                        <input
                          className={inputClass}
                          placeholder="Nome completo"
                          value={s.nome}
                          onChange={(e) => setSuspeito(idx, "nome", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#8b949e] mb-1">RG</label>
                        <input
                          className={inputClass}
                          placeholder="RG ou documento"
                          value={s.rg}
                          onChange={(e) => setSuspeito(idx, "rg", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[#8b949e] mb-1">Observações</label>
                      <input
                        className={inputClass}
                        placeholder="Características, vínculos, etc."
                        value={s.outros}
                        onChange={(e) => setSuspeito(idx, "outros", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addSuspeito}
                  className="mt-3 flex items-center gap-1.5 text-xs text-[#4a7c59] hover:text-[#5a9c6a] transition-colors font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar suspeito
                </button>
              </div>
            )}
          </div>

          {/* OCORRÊNCIA */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
            <button
              onClick={() => setOcorrenciaOpen(!ocorrenciaOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#21262d] transition-colors"
            >
              <span className="text-sm font-bold uppercase tracking-widest text-[#58a6ff]">
                📋 Ocorrência
              </span>
              {ocorrenciaOpen ? <ChevronUp className="w-4 h-4 text-[#8b949e]" /> : <ChevronDown className="w-4 h-4 text-[#8b949e]" />}
            </button>
            {ocorrenciaOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-[#30363d] pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Local *</label>
                    <input
                      className={inputClass}
                      placeholder="Endereço, bairro, cidade - UF"
                      value={form.local}
                      onChange={(e) => setForm({ ...form, local: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Data e Hora</label>
                    <input
                      type="datetime-local"
                      className={inputClass}
                      value={form.dataHora}
                      onChange={(e) => setForm({ ...form, dataHora: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Veículo Envolvido</label>
                  <input
                    className={inputClass}
                    placeholder="Modelo, cor, placa (opcional)"
                    value={form.veiculo}
                    onChange={(e) => setForm({ ...form, veiculo: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Itens Apreendidos</label>
                  <input
                    className={inputClass}
                    placeholder="Ex: 36kg maconha, 2 pistolas calibre .40"
                    value={form.itensApreendidos}
                    onChange={(e) => setForm({ ...form, itensApreendidos: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Descrição da Ocorrência *</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={5}
                    placeholder="Descreva brevemente o que aconteceu. A IA vai completar o BOPM com linguagem técnica e formal..."
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  />
                  <p className="text-xs text-[#8b949e] mt-1">
                    💡 Quanto mais detalhes, melhor o relatório gerado pela IA.
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-[#da3633]/10 border border-[#da3633]/40 rounded px-3 py-2 text-sm text-[#da3633]">
              {error}
            </div>
          )}

          <button
            onClick={gerarBopm}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#4a7c59] hover:bg-[#3d6b4a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-sm px-4 py-3 rounded transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando BOPM com IA...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Gerar BOPM com IA
              </>
            )}
          </button>
        </div>

        {/* RIGHT — RESULT */}
        <div className="sticky top-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4a7c59]" />
                <span className="text-sm font-bold uppercase tracking-widest text-[#e6edf3]">
                  Relatório Gerado
                </span>
              </div>
              {bopm && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copiar}
                    title="Copiar"
                    className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors px-2 py-1 rounded hover:bg-[#21262d]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "Copiado!" : "Copiar"}
                  </button>
                  <button
                    onClick={imprimir}
                    title="Imprimir"
                    className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors px-2 py-1 rounded hover:bg-[#21262d]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 min-h-[500px]">
              {loading && (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#8b949e]">
                  <Loader2 className="w-8 h-8 animate-spin text-[#4a7c59]" />
                  <p className="text-sm">A IA está redigindo o BOPM...</p>
                  <p className="text-xs">Aguarde alguns segundos</p>
                </div>
              )}
              {!loading && !bopm && (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#8b949e]">
                  <Shield className="w-12 h-12 text-[#30363d]" />
                  <p className="text-sm text-center">
                    Preencha o formulário e clique em<br />
                    <strong className="text-[#4a7c59]">Gerar BOPM com IA</strong>
                  </p>
                  <p className="text-xs text-center text-[#8b949e]">
                    O relatório completo será gerado<br />automaticamente com linguagem policial formal
                  </p>
                </div>
              )}
              {!loading && bopm && (
                <pre
                  className="whitespace-pre-wrap text-sm text-[#e6edf3] font-mono leading-relaxed"
                  style={{ fontFamily: "'Geist Mono', 'Courier New', monospace" }}
                >
                  {bopm}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
