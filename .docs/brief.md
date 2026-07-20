# BOPM - Boletim de Ocorrência Policial com IA
- One-line positioning: Sistema para geração de Boletins de Ocorrência Policial com assistência de IA
- Target users: Agentes e equipes de força tática policial (TÁTICO COMANDO e similares)
- Core features:
  1. Formulário estruturado com dados da equipe (motorista, chefe, auxiliar, segurança)
  2. Dados do suspeito (nome, RG, vínculo)
  3. Dados da ocorrência (local, data/hora, descrição breve, itens apreendidos)
  4. Geração automática do texto completo do BOPM via IA (claude-sonnet-4.6)
  5. Visualização formatada do relatório gerado
  6. Copiar e imprimir relatório
- Device strategy: adaptive
- Design style: Dark militar/policial — fundo escuro (#0d1117), verde militar (#4a7c59), cinza metálico
- Technical constraints: LLM via BTY gateway (claude-sonnet-4.6), chamada server-side via API route
- Nova Agent: not needed
- Completed: brief.md, design.md
- Current iteration: Build inicial
