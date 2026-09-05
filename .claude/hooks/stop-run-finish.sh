#!/usr/bin/env bash
# Stop hook - Growth RIVO Team
# Se un giro di RUOLO ha aperto il lavoro (run_start) ma non lo ha chiuso
# (run_finish), ricorda di registrare l'esito prima di fermarsi, cosi' la
# dashboard ha sempre il polso del giro (niente giri "muti").
#
# Robustezza: conta SOLO le chiamate VERE (tool_use Bash che contiene la parola),
# non le semplici menzioni nel testo della skill. La sessione builder non lancia
# mai run_start via Bash, quindi questo hook non la tocca.
input="$(cat)"

# evita loop infiniti (se lo stop e' gia' stato bloccato una volta)
printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true' && exit 0

# path del transcript
tp="$(printf '%s' "$input" | sed -n 's/.*"transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
{ [ -n "$tp" ] && [ -f "$tp" ]; } || exit 0

# chiamate VERE (righe di tool_use Bash che contengono il token)
started="$(grep -E '"name"[[:space:]]*:[[:space:]]*"Bash"' "$tp" 2>/dev/null | grep -c 'run_start')"
finished="$(grep -E '"name"[[:space:]]*:[[:space:]]*"Bash"' "$tp" 2>/dev/null | grep -c 'run_finish')"

if [ "${started:-0}" -ge 1 ] && [ "${finished:-0}" -lt 1 ]; then
  printf '%s' '{"decision":"block","reason":"Hai aperto il giro con run_start ma non lo hai chiuso con run_finish. Registra lesito del giro (run_finish, esito ok o error e la checklist) prima di fermarti, cosi la dashboard ha il polso del lavoro."}'
fi
exit 0
