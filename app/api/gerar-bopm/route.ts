import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface MembroEquipe {
  patente: string;
  nome: string;
  matricula: string;
}

interface Suspeito {
  nome: string;
  rg: string;
  outros?: string;
}

interface DadosOcorrencia {
  unidade: string;
  numeroBopm?: string;
  equipe: {
    motorista?: MembroEquipe;
    chefe?: MembroEquipe;
    auxiliar?: MembroEquipe;
    seguranca?: MembroEquipe;
  };
  suspeitos: Suspeito[];
  local: string;
  dataHora: string;
  veiculo?: string;
  itensApreendidos?: string;
  descricao: string;
}

export async function POST(req: NextRequest) {
  try {
    const dados: DadosOcorrencia = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY ?? "";
    if (!groqApiKey) {
      return NextResponse.json({ error: "Chave da IA não configurada no servidor." }, { status: 500 });
    }

    const equipeTexto = Object.entries(dados.equipe)
      .filter(([, m]) => m && m.nome)
      .map(([cargo, m]) => {
        const cargoLabel: Record<string, string> = {
          motorista: "Motorista",
          chefe: "Chefe de Equipe",
          auxiliar: "Auxiliar",
          seguranca: "Segurança",
        };
        return `${cargoLabel[cargo] ?? cargo}: ${m!.patente ? m!.patente + " " : ""}${m!.nome}${m!.matricula ? " | " + m!.matricula : ""}`;
      })
      .join("\n");

    const suspeitosTexto = dados.suspeitos
      .filter((s) => s.nome)
      .map((s) => `Nome: ${s.nome}${s.rg ? "\nRG: " + s.rg : ""}${s.outros ? "\nObservação: " + s.outros : ""}`)
      .join("\n\n");

    const prompt = `Você é um redator especialista em relatórios policiais brasileiros. 
Gere um Boletim de Ocorrência Policial (BOPM) completo, formal e detalhado com base nas informações abaixo.

REGRAS:
- Use linguagem policial formal e técnica
- Escreva na primeira pessoa do Chefe de Equipe
- Inclua data/hora por extenso no relato
- Mencione o número do BOPM no cabeçalho se fornecido
- O relato deve ser coeso, detalhado e profissional
- Termine com "Responsável pela equipe e BOPM: [nome e matrícula do chefe]"
- NÃO use markdown, asteriscos ou formatação especial — apenas texto puro
- Estruture assim: cabeçalho, EQUIPE, SUSPEITO(S), Relato da Ocorrência, Local, Responsável

DADOS:

Unidade: ${dados.unidade}${dados.numeroBopm ? "\nNúmero BOPM: " + dados.numeroBopm : ""}

EQUIPE:
${equipeTexto || "Não informado"}

SUSPEITO(S):
${suspeitosTexto || "Nenhum suspeito identificado"}

Local da Ocorrência: ${dados.local}
Data e Hora: ${dados.dataHora}
${dados.veiculo ? "Veículo Envolvido: " + dados.veiculo : ""}
${dados.itensApreendidos ? "Itens Apreendidos: " + dados.itensApreendidos : ""}

Descrição breve da ocorrência (use como base, expanda com linguagem formal):
${dados.descricao}

Gere agora o BOPM completo:`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return NextResponse.json({ error: "Erro ao chamar IA: " + err }, { status: 500 });
    }

    const result = await response.json();
    const texto = result.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ bopm: texto });
  } catch (err) {
    console.error("Erro na API gerar-bopm:", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
