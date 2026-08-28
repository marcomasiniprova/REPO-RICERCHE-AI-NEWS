#!/usr/bin/env python3
"""Genera supabase/seed.sql dai dati veri in src/data (CRM, leads, reddit, agenti)."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data"
OUT = ROOT / "supabase" / "seed.sql"


def q(v):
    if v is None:
        return "null"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


agents = json.loads((DATA / "agents.json").read_text())
crm = json.loads((DATA / "crm.json").read_text())
leads = json.loads((DATA / "leads.json").read_text())
reddit = json.loads((DATA / "reddit.json").read_text())

L = []
L.append("-- Seed generato da scripts/build-seed.py (dati veri, snapshot 28/8/2026)")
L.append("begin;")

L.append("\n-- Agenti")
for i, a in enumerate(agents):
    L.append(
        "insert into agents (slug,name,role,tagline,avatar,schedule_label,cron,color,sort) values ("
        + ",".join(
            [
                q(a["slug"]),
                q(a["name"]),
                q(a["role"]),
                q(a["tagline"]),
                q(a["avatar"]),
                q(a["schedule_label"]),
                q(a.get("cron")),
                q(a.get("color")),
                str(i),
            ]
        )
        + ") on conflict (slug) do update set name=excluded.name, role=excluded.role, tagline=excluded.tagline, avatar=excluded.avatar, schedule_label=excluded.schedule_label, cron=excluded.cron, color=excluded.color, sort=excluded.sort;"
    )

L.append("\n-- Creator (CRM completa)")
for c in crm:
    L.append(
        "insert into creators (name,ig,tiktok,followers,fascia,stage,canale,email,esito,priorita,url,source) values ("
        + ",".join(
            [
                q(c["name"]),
                q(c.get("ig")),
                q(c.get("tiktok")),
                q(c.get("followers")),
                q(c.get("fascia")),
                q(c["stage"]),
                q(c.get("canale")),
                q(c.get("email")),
                q(c.get("esito")),
                q(c.get("priorita")),
                q(c.get("url")),
                "'crm'",
            ]
        )
        + ") on conflict (name) do update set stage=excluded.stage, esito=excluded.esito, email=excluded.email, updated_at=now();"
    )

L.append("\n-- Lead Scout interessanti (Pronto / Da arricchire)")
for r in leads["rows"]:
    if r["s"] not in ("Pronto", "Da arricchire"):
        continue
    esito = (
        "Trovato dallo SCOUT, pronto al primo contatto."
        if r["s"] == "Pronto"
        else "In arricchimento."
    )
    L.append(
        "insert into creators (name,ig,tiktok,followers,stage,email,esito,url,source) values ("
        + ",".join(
            [
                q(r["u"]),
                q(r["u"] if r["p"] == "Instagram" else None),
                q(r["u"] if r["p"] == "TikTok" else None),
                q(str(r["f"]) if r.get("f") is not None else None),
                "'Nuovo'",
                q(r.get("e")),
                q(esito),
                q(r.get("url")),
                "'scout'",
            ]
        )
        + ") on conflict (name) do nothing;"
    )

L.append("\n-- Reddit: contributi pubblicati")
for r in reddit["items"]:
    L.append(
        "insert into reddit_items (date,subreddit,kind,title,body_summary,permalink_id,status) values ("
        + ",".join(
            [
                q(r["date"]),
                q(r["subreddit"]),
                q(r["kind"]),
                q(r["title"]),
                q(r.get("body_summary")),
                q(r.get("permalink_id")),
                q(r["status"]),
            ]
        )
        + ");"
    )

L.append("\n-- KV")
L.append(f"insert into kv (key,value) values ('reddit_karma', '{json.dumps(reddit['karma'])}'::jsonb) on conflict (key) do update set value=excluded.value, updated_at=now();")
L.append("insert into kv (key,value) values ('reddit_account', '\"u/Valerio_alieri\"'::jsonb) on conflict (key) do nothing;")

L.append("\n-- Primo evento nel feed")
L.append(
    "insert into activity_feed (agent_slug,kind,message) values (null,'success','Mission Control collegata: dati importati da Airtable e Reddit. Da adesso la squadra aggiorna qui in tempo reale.');"
)

L.append("commit;")
OUT.write_text("\n".join(L) + "\n")
print(f"scritto {OUT} ({len(L)} statement)")
