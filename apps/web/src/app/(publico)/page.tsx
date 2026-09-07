import Link from "next/link";

const prestadores = [
  {
    titulo: "IPS",
    texto: "Instituciones prestadoras de servicios de salud que abren, modifican o recuperan un servicio en el REPS.",
  },
  {
    titulo: "Profesional independiente",
    texto: "Personas naturales que prestan servicios de salud por cuenta propia y necesitan habilitarlos.",
  },
  {
    titulo: "Entidad con objeto social diferente",
    texto: "Organizaciones que prestan servicios de salud a sus trabajadores o a poblaciones específicas.",
  },
];

export default function Inicio() {
  return (
    <>
      <section className="prosa">
        <h1>Habilitación y calidad para su servicio de salud</h1>
        <p className="mt-4 text-lead">
          GHYCS asesora y acompaña a los prestadores de servicios de salud en Colombia para cumplir las
          condiciones de habilitación de la Resolución 3100 de 2019 y mejorar la calidad de su atención: desde la
          autoevaluación hasta el plan de mejora.
        </p>
      </section>
      <section aria-labelledby="para-quien" className="mt-12">
        <h2 id="para-quien">Para quién es</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {prestadores.map((p) => (
            <li key={p.titulo}>
              <Link href="/solicitar" className="tarjeta block h-full hover:border-borde-fuerte">
                <h3>{p.titulo}</h3>
                <p className="mt-2 text-cuerpo">{p.texto}</p>
                <span className="mt-4 block font-semibold text-enlace">Agende su cita</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-12">
        <Link href="/solicitar" className="btn-primario">
          Agende su cita
        </Link>
      </p>
    </>
  );
}
