import { NextResponse, type NextRequest } from "next/server";

/**
 * Sin el acceso del gestor (ADR-0006), la administración no se sirve en producción: expondría
 * las solicitudes reales. Cubre páginas y server actions, que también se envían a estas rutas.
 * ponytail: guarda provisional; se retira cuando exista la sesión real (#10).
 */
export function proxy(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") return NextResponse.next();
  return new NextResponse(null, { status: 404 });
}

export const config = { matcher: ["/admin", "/admin/:path*", "/login", "/login/:path*"] };
