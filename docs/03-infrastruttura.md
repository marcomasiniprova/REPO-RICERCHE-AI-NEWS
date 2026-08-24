# 03 — Infrastruttura & Sicurezza

## Airtable — Base "Rivolio - Creator Database"

`appJWp6jzGrG7Kfo3` · connettore **Airtable nativo** (non via Composio).

| Tabella | ID | Uso |
|---|---|---|
| **Creator Pipeline** | `tblgzKN2LFWfuDEK6` | CRM outreach: chi contattare / contattato / risposto. Vista **Kanban colorata per Stato**. |
| **Leads** | `tblNjhgOrmCeFAH3R` | Database grande creator per outreach (Username, Follower, Email, Score, Motivo_AI, Vision…). |
| **Collaborazioni** | `tbliuSFXQpBtgtUQP` | Collaborazioni **attive** (Codice sconto, Commissione %, Clienti portati, Fatturato, Contratto firmato, Stato). Qui si spostano i creator che chiudono. |
| **Ricerche** | `tblT789orESFCMvQo` | Hashtag/keyword per la scoperta automatica. |

**Campi chiave Creator Pipeline:** Creator, Stato, Priorità, Canale, Username IG, Profilo, Follower, Fascia, Email, AGCOM, Esito risposta, Bio, Note.
**Stati Kanban:** Da contattare · Contattato · Visualizzato · Risposto · (Scartato) · → Collaborazioni.

## n8n — Harvest automatico

Workflow **"Rivolio 3 - Harvest lead (Byparr)"** (`NPuoG4jzEJddpyyQ`), **ATTIVO**.
Ogni giorno **06:00 Europe/Rome**: raccoglie creator da blog + Feedspot travel (via Byparr per bypassare Cloudflare) → filtra → scrive in Airtable **Leads** con Stato "Da arricchire". Dedup verificato (0 duplicati).

## Byparr — solver anti-Cloudflare (self-hosted)

- Endpoint: `https://byparr.artecai.cloud/v1` · Basic Auth (user `agent`).
- Usato come **fallback di Firecrawl** sui siti protetti da Cloudflare. Verificato funzionante.

## Gmail

Account **valerio@artecai.it** (via Composio). Usato per outreach email e lettura risposte.

## Tracking vendite (DA COMPLETARE — blocco #1)

Flusso: `ref in URL → cookie → checkout Stripe con metadata.creator → webhook checkout.session.completed → n8n → CRM/Supabase`.

- **Metà A** (cookie ref → Stripe `metadata.creator` + webhook + API key) → la fa la **sessione che gestisce il codice di Rivolio**. Prompt già consegnato.
- **Metà B** (n8n Stripe Trigger → aggiorna CRM Collaborazioni) → la fa **questa sessione**, quando l'altra conferma `metadata.creator` e fornisce l'API key Stripe come credenziale n8n.

> Senza questo tracking non si può pagare i creator in automatico né sapere chi porta cosa. **È la priorità tecnica assoluta.**

---

## 🔒 Sicurezza — segreti (regole non negoziabili)

- **`BYPARR_PASSWORD`** → solo in variabile d'ambiente. **Mai** hardcodata, mai committata.
- **API key Stripe** → solo come **credenziale n8n**. Mai nei repo, commit, artifact o documenti.
- Nessun segreto (password, token, chiavi) va scritto in questo repo o in qualsiasi file versionato.
- Le email dei creator sono dati personali: restano in Airtable, non in file pubblici del repo.
