#!/usr/bin/env python3
"""Baixa as taxas e preços atuais do Tesouro Direto e grava um JSON pequeno para o app.

Fontes (na ordem):
  1. API pública do site do Tesouro Direto (taxas do momento);
  2. Tesouro Transparente (dados abertos, atualizados todo dia útil) — reserva.
Também tenta a Selic meta e o IPCA 12 meses no Banco Central (opcional).

Uso: python3 scripts/tesouro.py rates.json
Só usa a biblioteca padrão do Python.
"""
import csv
import io
import json
import re
import sys
import unicodedata
import urllib.request
from datetime import datetime, timedelta, timezone

UA = {"User-Agent": "Mozilla/5.0 (gastos-app; +https://github.com/felipetajes21-crypto/gastos)", "Accept": "*/*"}
BRT = timezone(timedelta(hours=-3))

API_URL = "https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json"
CKAN_URL = "https://www.tesourotransparente.gov.br/ckan/api/3/action/package_show?id=taxas-dos-titulos-ofertados-pelo-tesouro-direto"
CSV_FALLBACK = ("https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/"
                "resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv")
BCB = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.{}/dados/ultimos/1?formato=json"


def get(url, timeout=60):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def norm(s):
    return unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode().lower()


def classify(name):
    n = norm(name)
    semestral = "semestra" in n
    if "renda+" in n or "renda mais" in n or "aposentadoria" in n:
        return "renda"
    if "educa" in n:
        return "educa"
    if "igp" in n:
        return "igpm"
    if "selic" in n:
        return "selic"
    if "ipca" in n:
        return "ipca-semestral" if semestral else "ipca"
    if "prefixado" in n:
        return "prefixado-semestral" if semestral else "prefixado"
    return "outro"


def num(x):
    if x is None or x == "":
        return None
    if isinstance(x, (int, float)):
        return float(x)
    x = str(x).strip().replace(".", "").replace(",", ".") if "," in str(x) else str(x).strip()
    try:
        return float(x)
    except ValueError:
        return None


def from_api():
    data = json.loads(get(API_URL))
    resp = data.get("response", data)
    out = []
    for item in resp.get("TrsrBdTradgList", []):
        b = item.get("TrsrBd", item)
        nome = (b.get("nm") or "").strip()
        if not nome:
            continue
        venc = (b.get("mtrtyDt") or "")[:10]
        tc, tv = num(b.get("anulInvstmtRate")), num(b.get("anulRedRate"))
        pc, pv = num(b.get("untrInvstmtVal")), num(b.get("untrRedVal"))
        out.append({
            "nome": nome, "tipo": classify(nome), "vencimento": venc,
            "taxaCompra": tc or None, "taxaVenda": tv or None,
            "puCompra": pc or None, "puVenda": pv or None,
            "minimo": num(b.get("minInvstmtAmt")) or None,
            "aVenda": bool((tc or 0) > 0 or (pc or 0) > 0),
        })
    status = resp.get("BizSts", {}) or {}
    quando = status.get("dtTm") or datetime.now(BRT).isoformat(timespec="minutes")
    if not out:
        raise RuntimeError("API sem títulos")
    return out, quando, "Tesouro Direto (site oficial)"


def csv_url():
    try:
        pkg = json.loads(get(CKAN_URL))["result"]
        for r in pkg.get("resources", []):
            if "csv" in (r.get("format") or "").lower() and "preco" in norm(r.get("name", "")):
                return r["url"]
    except Exception as e:  # noqa: BLE001
        print("CKAN falhou:", e, file=sys.stderr)
    return CSV_FALLBACK


def year_name(tipo_titulo, venc):
    """Nome comercial do título a partir do tipo e do vencimento."""
    y = int(venc[:4])
    t = classify(tipo_titulo)
    if t == "renda":  # Renda+ 2065 paga de 2065 a 2084 (vence 19 anos depois)
        y -= 19
    elif t == "educa":  # Educa+ 2030 paga de 2030 a 2034
        y -= 4
    return f"{tipo_titulo.strip()} {y}"


def parse_csv(text):
    rows = list(csv.DictReader(io.StringIO(text), delimiter=";"))
    if not rows:
        raise RuntimeError("CSV vazio")
    def d(s):
        return datetime.strptime(s.strip(), "%d/%m/%Y")
    last = max(d(r["Data Base"]) for r in rows)
    out = []
    for r in rows:
        if d(r["Data Base"]) != last:
            continue
        venc = d(r["Data Vencimento"]).strftime("%Y-%m-%d")
        tc = num(r.get("Taxa Compra Manha"))
        pc = num(r.get("PU Compra Manha"))
        out.append({
            "nome": year_name(r["Tipo Titulo"], venc), "tipo": classify(r["Tipo Titulo"]), "vencimento": venc,
            "taxaCompra": tc or None, "taxaVenda": num(r.get("Taxa Venda Manha")) or None,
            "puCompra": pc or None, "puVenda": num(r.get("PU Venda Manha")) or None,
            "minimo": max(30.0, round(pc * 0.01, 2)) if pc else None,  # mínimo: 1% do título, pelo menos R$ 30
            "aVenda": bool((tc or 0) > 0 and (pc or 0) > 0),
        })
    return out, last.strftime("%Y-%m-%d"), "Tesouro Transparente (dados abertos)"


def from_csv():
    raw = get(csv_url(), timeout=180)
    for enc in ("utf-8-sig", "latin-1"):
        try:
            return parse_csv(raw.decode(enc))
        except UnicodeDecodeError:
            continue
    raise RuntimeError("não consegui ler o CSV")


def bcb(serie):
    try:
        v = json.loads(get(BCB.format(serie), timeout=30))[-1]
        return {"valor": float(v["valor"]), "data": v["data"]}
    except Exception as e:  # noqa: BLE001
        print(f"BCB {serie} falhou:", e, file=sys.stderr)
        return None


ORDER = ["selic", "prefixado", "prefixado-semestral", "ipca", "ipca-semestral", "renda", "educa", "igpm", "outro"]


def main(path):
    titulos = None
    for fn in (from_api, from_csv):
        try:
            titulos, quando, fonte = fn()
            print(f"OK {fonte}: {len(titulos)} títulos ({quando})")
            break
        except Exception as e:  # noqa: BLE001
            print(f"{fn.__name__} falhou: {e}", file=sys.stderr)
    if not titulos:
        print("Nenhuma fonte respondeu.", file=sys.stderr)
        return 1
    titulos.sort(key=lambda t: (ORDER.index(t["tipo"]), t["vencimento"]))
    out = {
        "atualizado": quando, "buscado": datetime.now(BRT).isoformat(timespec="minutes"), "fonte": fonte,
        # Selic meta (432), CDI anualizado (4389), Selic efetiva anualizada (1178), IPCA 12 meses (13522)
        "selic": bcb(432), "cdi": bcb(4389), "selicOver": bcb(1178), "ipca12m": bcb(13522), "titulos": titulos,
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    for t in titulos:
        if t["aVenda"]:
            print(f"  {t['nome']:<45} compra {t['taxaCompra']}  venda {t['taxaVenda']}  PU {t['puCompra']}/{t['puVenda']}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "rates.json"))
