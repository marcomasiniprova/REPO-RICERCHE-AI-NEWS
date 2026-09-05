#!/usr/bin/env bash
# SessionStart hook - Growth RIVO Team
# Garantisce il repo fresco (skill aggiornate) all'inizio di ogni giro di ruolo.
# NO-OP SICURO: agisce solo se siamo su main e la working tree e' pulita,
# cosi' non tocca mai la sessione builder (feature branch / modifiche in corso).
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
branch="$(git symbolic-ref --short HEAD 2>/dev/null || echo '')"
if [ "$branch" = "main" ] && git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
  git pull --ff-only origin main >/dev/null 2>&1 || true
fi
exit 0
