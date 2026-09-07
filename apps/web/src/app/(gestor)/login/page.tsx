import { Aviso } from "@/compartido/ui/Aviso";
import { Boton } from "@/compartido/ui/Boton";
import { Campo, Entrada } from "@/compartido/ui/Campo";
import { iniciarSesion } from "./acciones";

export const metadata = { title: "Acceso del gestor" };

export default async function Login({ searchParams }: PageProps<"/login">) {
  const { bloqueado } = await searchParams;

  return (
    <section className="mx-auto grid max-w-sm gap-6">
      <h1 className="font-display text-h2 font-semibold text-titular">Acceso del gestor</h1>

      {bloqueado === "1" && (
        <Aviso tono="error" role="alert">
          Se agotaron los intentos de acceso. Espere quince minutos antes de volver a intentarlo.
        </Aviso>
      )}

      <form action={iniciarSesion} className="grid gap-6">
        <Campo etiqueta="Correo">
          <Entrada type="email" name="correo" required autoComplete="username" />
        </Campo>

        <Campo etiqueta="Contraseña">
          <Entrada type="password" name="contrasena" required autoComplete="current-password" />
        </Campo>

        <p>
          <Boton type="submit">Entrar</Boton>
        </p>
      </form>
    </section>
  );
}
