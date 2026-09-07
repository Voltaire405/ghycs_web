import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/** Fronteras de SRD §3.1: cada capa solo importa de las capas que la tabla le permite (RS-R-007). */
const frontera = (files, prohibido, message) => ({
  files,
  rules: { "no-restricted-imports": ["error", { patterns: [{ regex: prohibido, message }] }] },
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  frontera(
    ["src/app/**", "src/modulos/*/ui/**"],
    "(^|/)(dominio|infraestructura|compartido/(bd|config))(/|$)",
    "Presentación solo importa aplicación y compartido/ui (SRD §3.1)."
  ),
  frontera(
    ["src/modulos/*/aplicacion/**"],
    "^(next|react)(/|$)|(^|/)(ui|infraestructura|app|compartido/(bd|ui|config))(/|$)",
    "Aplicación solo importa dominio y compartido/tipos (SRD §3.1)."
  ),
  frontera(
    ["src/modulos/*/dominio/**"],
    "^(next|react|drizzle-orm|googleapis|@anthropic-ai)(/|$)|(^|/)(ui|aplicacion|infraestructura|app|compartido/(?!tipos))(/|$)",
    "Dominio solo importa dentro del módulo y compartido/tipos (SRD §3.1)."
  ),
  frontera(
    ["src/modulos/*/infraestructura/**"],
    "^(next|react)(/|$)|(^|/)(ui|aplicacion|app|compartido/ui)(/|$)",
    "Infraestructura solo importa dominio, compartido/bd y compartido/config (SRD §3.1)."
  ),
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
