/** Credencial de servidor del calendario del gestor, independiente de su sesión en el sitio (ADR-0006). */
export interface CredencialesGoogle {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  calendarId: string;
}

/** Sin respuesta en este tiempo, la llamada falla: el formulario no queda colgado esperando a Google. */
export const limite = () => AbortSignal.timeout(10_000);

export const urlCalendario = (calendarId: string) =>
  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}`;

export async function jsonOLanza<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error(`Google respondió ${r.status}: ${await r.text()}`);
  return r.json() as Promise<T>;
}

/**
 * Access token a partir del refresh token.
 * ponytail: se pide en cada llamada; guárdalo hasta que expire si el tráfico lo pide.
 */
export async function tokenDeAcceso(credenciales: CredencialesGoogle, fetch = globalThis.fetch) {
  const { access_token } = await jsonOLanza<{ access_token: string }>(
    await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      signal: limite(),
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: credenciales.clientId,
        client_secret: credenciales.clientSecret,
        refresh_token: credenciales.refreshToken,
      }),
    }),
  );
  return access_token;
}
