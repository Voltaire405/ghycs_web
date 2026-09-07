#!/usr/bin/env python3
"""Valida PRD.md y SRD.md contra las propiedades de ISO/IEC/IEEE 29148:2018.

Comprueba, por requisito: identificador único y bien formado, campos obligatorios,
enunciado singular (una sola obligación «debe»), prioridad y método de verificación
dentro de los valores admitidos, y trazabilidad SRD→PRD. Reporta cobertura de los
RP obligatorios y las referencias a TBD.

Uso:
    python3 validar_requisitos.py            # valida y devuelve 1 si hay errores
    python3 validar_requisitos.py --matriz   # imprime la matriz de trazabilidad en Markdown
"""
import re
import sys
from collections import defaultdict
from pathlib import Path

AQUI = Path(__file__).parent
PRD = AQUI / "PRD.md"
SRD = AQUI / "SRD.md"

PATRON_ID = {
    "PRD": re.compile(r"^RP-(F|NF|L|R)-\d{3}$"),
    "SRD": re.compile(r"^RS-(I|F|D|NF|R)-\d{3}$"),
}
CAMPOS = ["Enunciado", "Justificación", "Prioridad", "Verificación"]
PRIORIDADES = {"Obligatorio", "Deseable"}
VERIFICACIONES = {"Inspección", "Análisis", "Demostración", "Prueba"}
RE_BLOQUE = re.compile(r"^### (R[PS]-[A-Z]+-\d+)\s*·\s*(.+)$", re.M)
RE_CAMPO = re.compile(r"^\*\*(\w+)\.\*\*\s*(.+)$", re.M)
RE_DEBE = re.compile(r"\b(?:no\s+)?debe(?:n)?\b", re.I)
RE_REF = re.compile(r"\bRP-[A-Z]+-\d{3}\b")


def leer_bloques(ruta: Path):
    texto = ruta.read_text(encoding="utf-8")
    bloques = []
    partes = RE_BLOQUE.split(texto)
    # partes = [prefijo, id, titulo, cuerpo, id, titulo, cuerpo, ...]
    for i in range(1, len(partes), 3):
        rid, titulo, cuerpo = partes[i], partes[i + 1].strip(), partes[i + 2]
        cuerpo = cuerpo.split("\n### ")[0].split("\n## ")[0]
        campos = {m.group(1): m.group(2).strip() for m in RE_CAMPO.finditer(cuerpo)}
        bloques.append({"id": rid, "titulo": titulo, "campos": campos})
    return texto, bloques


def excepciones_declaradas(texto_srd: str):
    m = re.search(r"^## 7\..*?(?=^## 8\.|\Z)", texto_srd, re.M | re.S)
    return set(RE_REF.findall(m.group(0))) if m else set()


def validar(nombre, bloques, ids_prd=None):
    errores, avisos = [], []
    vistos = set()
    for b in bloques:
        rid, c = b["id"], b["campos"]
        if not PATRON_ID[nombre].match(rid):
            errores.append(f"{rid}: identificador mal formado")
        if rid in vistos:
            errores.append(f"{rid}: identificador duplicado")
        vistos.add(rid)

        obligatorios = CAMPOS + (["Traza"] if nombre == "SRD" else [])
        for campo in obligatorios:
            if campo not in c or not c[campo]:
                errores.append(f"{rid}: falta el campo «{campo}»")

        enun = c.get("Enunciado", "")
        n = len(RE_DEBE.findall(enun))
        if n == 0:
            errores.append(f"{rid}: el enunciado no contiene «debe»")
        elif n > 1:
            errores.append(f"{rid}: enunciado no singular ({n} obligaciones); divide el requisito")
        if not enun.rstrip().endswith("."):
            avisos.append(f"{rid}: el enunciado no termina en punto")

        if c.get("Prioridad") and c["Prioridad"] not in PRIORIDADES:
            errores.append(f"{rid}: prioridad «{c['Prioridad']}» no admitida")
        if c.get("Verificación") and c["Verificación"] not in VERIFICACIONES:
            errores.append(f"{rid}: verificación «{c['Verificación']}» no admitida")

        if "TBD" in enun or "TBD" in c.get("Justificación", ""):
            avisos.append(f"{rid}: referencia un TBD; debe cerrarse antes de la aceptación")

        if nombre == "SRD" and ids_prd is not None:
            refs = RE_REF.findall(c.get("Traza", ""))
            if not refs:
                errores.append(f"{rid}: la traza no contiene identificadores RP")
            for r in refs:
                if r not in ids_prd:
                    errores.append(f"{rid}: traza a {r}, que no existe en el PRD")
    return errores, avisos


def cobertura(bloques_prd, bloques_srd, excepciones):
    mapa = defaultdict(list)
    for b in bloques_srd:
        for r in RE_REF.findall(b["campos"].get("Traza", "")):
            mapa[r].append(b["id"])
    errores = []
    for b in bloques_prd:
        rid = b["id"]
        if not mapa.get(rid) and rid not in excepciones:
            if b["campos"].get("Prioridad") == "Obligatorio":
                errores.append(f"{rid}: requisito obligatorio sin requisito de software que lo cubra")
    return mapa, errores


def imprimir_matriz(bloques_prd, mapa, excepciones):
    print("| PRD | SRD |\n|---|---|")
    for b in bloques_prd:
        rid = b["id"]
        if mapa.get(rid):
            print(f"| {rid} | {', '.join(mapa[rid])} |")
        elif rid in excepciones:
            print(f"| {rid} | — (excepción declarada en §7) |")
        else:
            print(f"| {rid} | **SIN COBERTURA** |")


def main():
    texto_prd, prd = leer_bloques(PRD)
    texto_srd, srd = leer_bloques(SRD)
    ids_prd = {b["id"] for b in prd}
    excepciones = excepciones_declaradas(texto_srd)

    e1, a1 = validar("PRD", prd)
    e2, a2 = validar("SRD", srd, ids_prd)
    mapa, e3 = cobertura(prd, srd, excepciones)

    if "--matriz" in sys.argv:
        imprimir_matriz(prd, mapa, excepciones)
        return 0

    errores = e1 + e2 + e3
    avisos = a1 + a2
    print(f"PRD: {len(prd)} requisitos · SRD: {len(srd)} requisitos · excepciones: {len(excepciones)}")
    for msg in avisos:
        print(f"  aviso   {msg}")
    for msg in errores:
        print(f"  ERROR   {msg}")
    print(f"\n{len(errores)} errores, {len(avisos)} avisos")
    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
