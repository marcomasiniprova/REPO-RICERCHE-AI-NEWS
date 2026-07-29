# AI NEWS — ATOMIC BREVITY REPORT
**Data:** 29 Luglio 2026 | **Focus:** Agentic Tools & Rule-Breakers delle ultime 24-72h

---

## ANTHROPIC / CLAUDE CODE

### Claude Code v2.1.219 — Sub-agent nesting ripristinato
- **Cosa è successo:** Il 21 luglio la v2.1.217 aveva bloccato la ricorsione tra sub-agenti. Il 24 luglio la v2.1.219 la ha **ripristinata con un limite di profondità = 3**.
- **Perché è importante:** Puoi ora costruire gerarchie agent→subagent→subagent in modo controllato senza rischio di loop infiniti.
- **Nuove feature chiave:**
  - Skills con `context: fork` girano in background di default (opt-out con `background: false`)
  - Background agents fanno auto-commit + push + draft PR quando finiscono lavoro su worktree
  - Ultra Code usa fan-out, adversarial verification e tournament patterns
- **Link:** [Claude Code Changelog July 2026](https://www.gradually.ai/en/changelogs/claude-code/) | [DigitalApplied - Subagent Depth Limits](https://www.digitalapplied.com/blog/claude-code-subagent-depth-limits-budget-caps-2026)

### Claude Opus 4.7 — Disponibile su API
- **Rilasciato:** 16 Aprile 2026 — su API, Bedrock, Vertex AI, Azure Foundry
- **Pricing:** $5/$25 per milione di token (invariato da Opus 4.6)
- **Miglioramenti:** Vision HD, coding complesso long-running
- **Link:** [Anthropic — Introducing Claude Opus 4.7](https://www.anthropic.com/news/claude-opus-4-7)

### Claude Mythos — Accesso ristretto (NON pubblico)
- **Stato:** Solo early-access a Google, Microsoft, Apple per security testing. Nessuna API pubblica, nessun pricing, nessuna data confermata.
- **Alternativa pratica:** Claude Fable 5 porta capacità Mythos-class con guardrail nel general use.
- **Link:** [WaveSpeed — Claude Mythos API & Pricing](https://wavespeed.ai/blog/posts/claude-mythos-api-pricing/)

---

## OPENAI

### GPT-5.6 Family — Sol / Terra / Luna (9 Luglio 2026)
- **Tre varianti:** Sol (flagship), Terra (intermedio), Luna (budget)
- **Sol Ultra:** Flagship per enterprise, coding scientifico, multimodale
- **ChatGPT Work:** Agent autonomo che prende un goal, legge file e app connesse, esegue task multi-step senza supervisione
- **Link:** [TechCrunch — GPT-5.6](https://techcrunch.com/2026/07/09/openai-launches-its-new-family-of-models-with-gpt-5-6/) | [Axios — Sol Ultra](https://www.axios.com/2026/07/08/gpt-sol-ultra-openai-anthropic-grok)

---

## MANUS AI

### Manus 1.6 + "My Computer" — L'agente ora vive sulla tua macchina
- **Manus Desktop:** L'agent esce dal cloud sandbox e gira **localmente** — legge file, esegue CLI, controlla la macchina da remoto
- **Wide Research:** Sub-agenti paralleli su fonti multiple per deep research
- **Modelli:** Lite / Standard / Max
- **Nota:** Meta ha tentato un'acquisizione (bloccata) — Manus rimane indipendente
- **Link:** [AlphaMatch — Manus My Computer](https://www.alphamatch.ai/blog/manus-my-computer-ai-agent-desktop-2026) | [FM Magazine — Manus e gli agenti autonomi](https://www.fm-magazine.com/issues/2026/jul/part-1-manus-ai-and-the-emergence-of-autonomous-agents/)

---

## KIMI K3 (Moonshot AI) — BOMBA OPEN-SOURCE

### Kimi K3 Open Weights — RILASCIATO il 27 Luglio 2026
- **Parametri:** 2.8 TRILIONI — il modello open-weight più grande della storia
- **Prestazioni:** Near-frontier su coding, math reasoning — confrontabile con Claude Opus 4.8
- **Self-hosting:** 1.4 TB di pesi su Hugging Face, richiede vLLM con KDA attention
- **API:** $3/$15 per milione di token (su platform.kimi.ai)
- **Catch:** vLLM mainstream non supporta ancora KDA natively — settimane per piena integrazione
- **Link:** [TechTimes — Open Weights](https://www.techtimes.com/articles/321551/20260725/kimi-k3-open-weights-arrive-sunday-self-hosting-cuts-china-data-risk-api-never-can.htm) | [DEV.to — Self-hosting guide](https://dev.to/lola_lin_a1be8395c517b081/kimi-k3-open-weights-are-here-how-to-self-host-the-28t-parameter-model-hardware-vllm-and-data-4b0n) | [Kimi K3 API Quickstart](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart)

---

## DEEPSEEK V4 — In arrivo

- **Stato:** Leaked su social, release attesa a inizio settimana
- **Performance:** Test preliminari a livello di Claude Opus 4.8, con capacità 3D generation
- **Link:** [AI Base News — DeepSeek V4 leak](https://news.aibase.com/news/29717)

---

## OPENCLAW + PAPERCLIP — L'ecosistema open-source agentico

### OpenClaw (310K+ stelle GitHub)
- Personal assistant autonomo: inbox, web scraping, email, task ricorrenti via WhatsApp/Telegram/Slack
- Security patch: CVE-2026-25253 corretta + integrazione VirusTotal per skill comunitarie
- **Link:** [Wikipedia — OpenClaw](https://en.wikipedia.org/wiki/OpenClaw)

### Paperclip v2026.722.0 (22 Luglio 2026)
- Orchestratore open-source Node.js/React per **team di agenti AI strutturati in aziende virtuali**
- **Novità v2026.722.0:**
  - Run-bound agent secret access (API per segreti on-demand)
  - Worktree init fix (non cancella più l'intera cartella)
  - Fix autocomplete dentro dialog Radix
- **Plugin OpenClaw:** Agenti con accesso real-time a issue tracking, dashboard, status team
- **Link:** [Paperclip Changelog](https://paperclip.ing/changelog/) | [eWeek — Paperclip + OpenClaw](https://www.eweek.com/news/meet-paperclip-openclaw-ai-company-tool/)

---

## GROK 4.5 (xAI)
- **Rilasciato:** 8 Luglio 2026 — progettato per **operazione autonoma prolungata**
- **Disponibile:** API + Cursor su tutti i piani
- **Link:** [Agentic.ai News](https://agentic.ai/news)

---

## ACTIONABLE — Come integrarlo nel tuo workflow ORA

### Opzione 1 — Claude Code + Background Agents (⚡ Highest ROI)
```
# Crea una skill con fork automatico in background
# In .claude/skills/research.md:
# context: fork
# background: true
```
Lancia ricerche parallele mentre lavori — l'agent committa i risultati da solo.

### Opzione 2 — Kimi K3 via API (budget-friendly frontier)
```python
# API OpenAI-compatible, endpoint platform.kimi.ai
import openai
client = openai.OpenAI(
    api_key="your-kimi-key",
    base_url="https://api.moonshot.cn/v1"
)
response = client.chat.completions.create(
    model="kimi-k3",
    messages=[{"role": "user", "content": "..."}]
)
```
$3/M token input vs $5/M di Claude Opus 4.7 — ideale per task ripetitivi.

### Opzione 3 — Paperclip per orchestrare più agenti su questo stesso repo
Installa Paperclip localmente, crea un'organizzazione AI con ruoli (Researcher, Writer, Publisher) e connettilo via plugin OpenClaw per gestire le issue di questo repo automaticamente.
- [Paperclip GitHub](https://github.com/paperclipai/paperclip)
- [OpenClaw-Paperclip integration guide](https://www.codebridge.tech/articles/openclaw-paperclip-integration-how-to-connect-configure-and-test-it)

---

## TL;DR — TOP 3 NEWS DELLA SETTIMANA

| # | News | Impatto |
|---|------|---------|
| 1 | **Kimi K3 open weights (2.8T params)** | Il GPT-4 open-source dell'era attuale — gratis da self-hostare |
| 2 | **Claude Code sub-agent nesting (depth=3)** | Agenti che spawna agenti = automazione ricorsiva senza limiti |
| 3 | **Manus "My Computer"** | L'agente AI finalmente sulla tua macchina locale |

---

*Report generato automaticamente — 29 Luglio 2026*
