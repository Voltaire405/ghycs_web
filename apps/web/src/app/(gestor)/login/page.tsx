import { Aviso } from "@/compartido/ui/Aviso";
import { Boton } from "@/compartido/ui/Boton";
import { entrarConGoogle } from "./acciones";

export const metadata = { title: "Acceso del gestor" };

export default async function Login({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <section className="mx-auto grid max-w-sm gap-6">
      <h1 className="font-display text-h2 font-semibold text-titular">Acceso del gestor</h1>

      {error && (
        <Aviso tono="error" role="alert">
          No fue posible entrar con esa cuenta. Use la cuenta de Google de GHYCS que está en la lista de acceso.
        </Aviso>
      )}

      <form action={entrarConGoogle}>
        <Boton type="submit">Entrar con Google</Boton>
      </form>
    </section>
  );
}
