import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

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

    const btyBaseUrl = process.env.BTY_LLM_SERVER_BASE_URL ?? "https://aigw-api.happyseeds.ai/v1";
    const btyApiKey = process.env.BTY_LLM_SERVER_API_KEY ?? process.env.HAPPYSEEDS_KEY ?? "bty-prod-13b5e07cd597014a37b51404d6e8a9fc53663591c1e493ed9e2e35deed59d351";

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

    const response = await fetch(`${btyBaseUrl}/messages`, {
      method: "POST",
      headers: {
        "x-api-key": btyApiKey,
        "anthropic-version": "2023-06-01",
        "x-bty-business": "ReActUs",
        "x-bty-workspace": "default",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4.6",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("LLM error:", err);
      return NextResponse.json({ error: "Erro ao chamar IA: " + err }, { status: 500 });
    }

    const result = await response.json();
    const texto = result.content?.[0]?.text ?? "";

    return NextResponse.json({ bopm: texto });
  } catch (err) {
    console.error("Erro na API gerar-bopm:", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
