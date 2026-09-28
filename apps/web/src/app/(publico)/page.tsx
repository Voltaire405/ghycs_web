import Image from "next/image";
import Link from "next/link";

// Rompe el contenedor de PaginaPublica para que las bandas ocupen todo el ancho.
const aSangre = "relative left-1/2 w-screen -translate-x-1/2";

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

// Del más urgente al que más espera, como ordena el panel del gestor (RS-F-018).
const momentos = [
  { titulo: "Cierre de un servicio", texto: "Le cerraron un servicio y debe volver a solicitar visita.", urgente: true },
  { titulo: "Hallazgo de una visita", texto: "La visita de verificación dejó anotado algo que el servicio no cumple.", urgente: true },
  { titulo: "Novedad en un servicio", texto: "Va a agregar, modificar o retirar un servicio ya habilitado.", urgente: false },
  { titulo: "Habilitación inicial", texto: "Aún no tiene el servicio y quiere abrirlo.", urgente: false },
];

// ponytail: resumen de demo; el detalle de cada servicio (qué recibe, cuánto toma) llega con /servicios (RP-F-002).
const servicios = [
  {
    titulo: "Asesoría",
    texto: "Orientación para preparar su servicio frente a las condiciones de habilitación.",
    foto: "/fotos/asesoria.jpg",
  },
  {
    titulo: "Acompañamiento",
    texto: "Trabajamos con usted la autoevaluación y el plan de mejora, paso a paso.",
    foto: "/fotos/acompanamiento.jpg",
  },
  {
    titulo: "PAMEC",
    texto: "Programa de auditoría para el mejoramiento de la calidad de su atención.",
    foto: "/fotos/pamec.jpg",
  },
];

const pasos = [
  { titulo: "Agende su cita", texto: "Elija el día y la hora en el sitio y cuéntenos su caso. No necesita cuenta." },
  { titulo: "Conversemos por videollamada", texto: "La primera cita no tiene costo. Entendemos qué necesita su servicio." },
  {
    titulo: "Reciba su plan de trabajo",
    texto: "Le proponemos el servicio que le corresponde, desde la autoevaluación hasta el plan de mejora.",
  },
];

// Botón claro sobre las bandas oscuras de marca.
const botonClaro = "btn-primario bg-white text-petroleo-900 hover:bg-petroleo-50";

export default function Inicio() {
  return (
    <div className="-mt-10 -mb-10">
      <section className={`${aSangre} relative isolate min-h-[34rem] overflow-hidden`}>
        <Image
          src="/fotos/portada.jpg"
          alt="Un paciente conversa con su médico en un consultorio."
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-petroleo-950/90 via-petroleo-900/70 to-petroleo-900/10" />
        <div className="mx-auto max-w-5xl px-4 py-24 md:py-32">
          <h1 className="max-w-[18ch] font-display text-display text-white">
            Habilitación y calidad para su servicio de salud
          </h1>
          <p className="mt-6 max-w-[46ch] text-lead text-petroleo-50">
            GHYCS asesora y acompaña a los prestadores de servicios de salud en Colombia para cumplir las condiciones de
            habilitación de la Resolución 3100 de 2019 y mejorar la calidad de su atención.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/solicitar" className={botonClaro}>
              Agende su cita
            </Link>
            <span className="self-center rounded-full bg-white/15 px-4 py-2 text-sm text-white">
              Primera cita sin costo · videollamada
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="para-quien" className="py-20">
        <h2 id="para-quien" className="text-center font-display text-h1 text-titular">
          Para quién es
        </h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {prestadores.map((p) => (
            <li key={p.titulo}>
              <Link href="/solicitar" className="block h-full rounded-lg bg-petroleo-50 p-8 transition hover:bg-petroleo-100">
                <h3 className="font-display text-h3 text-titular">{p.titulo}</h3>
                <p className="mt-3 text-cuerpo">{p.texto}</p>
                <span className="mt-6 block font-semibold text-enlace">Agende su cita →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="momentos" className="grid gap-8 border-t border-borde py-20 md:grid-cols-[14rem_1fr]">
        <header>
          <h2 id="momentos" className="font-display text-h2 text-titular">
            En qué momento llega
          </h2>
          <p className="mt-3 text-sm text-apoyo">Si le cerraron un servicio o una visita dejó hallazgos, lo atendemos primero.</p>
        </header>
        <dl className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          {momentos.map((m) => (
            <div key={m.titulo} className={`border-l-2 pl-5 ${m.urgente ? "border-alerta-600" : "border-petroleo-500"}`}>
              <dt className="font-semibold text-titular">{m.titulo}</dt>
              <dd className="mt-1 text-cuerpo">{m.texto}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="servicios" className={`${aSangre} bg-superficie-suave py-20`}>
        <div className="mx-auto max-w-5xl px-4">
          <h2 id="servicios" className="font-display text-h1 text-titular">
            Servicios
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {servicios.map((s) => (
              <li key={s.titulo} className="overflow-hidden rounded-lg bg-superficie shadow-sutil">
                <Image
                  src={s.foto}
                  alt=""
                  width={1600}
                  height={1067}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="aspect-[3/2] w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="font-display text-h3 text-titular">{s.titulo}</h3>
                  <p className="mt-2 text-cuerpo">{s.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="como-funciona" className={`${aSangre} bg-petroleo-900 py-20`}>
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-4 md:grid-cols-2">
          <div>
            <h2 id="como-funciona" className="font-display text-h1 text-white">
              Así funciona
            </h2>
            <ol className="mt-8 grid gap-8">
              {pasos.map((p, i) => (
                <li key={p.titulo} className="flex gap-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-petroleo-400 font-semibold text-petroleo-950">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lead font-semibold text-white">{p.titulo}</h3>
                    <p className="mt-1 text-petroleo-100">{p.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <Image
            src="/fotos/videollamada.jpg"
            alt="Un médico atiende una consulta por videollamada desde su portátil."
            width={1600}
            height={1067}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="rounded-lg object-cover"
          />
        </div>
      </section>

      <section aria-labelledby="cierre" className={`${aSangre} bg-petroleo-700 py-16 text-center`}>
        <h2 id="cierre" className="font-display text-h1 text-white">
          ¿Hablamos de su servicio?
        </h2>
        <p className="mt-3 text-petroleo-50">Elija una hora. La primera cita no tiene costo.</p>
        <Link href="/solicitar" className={`${botonClaro} mt-8`}>
          Agende su cita
        </Link>
      </section>
    </div>
  );
}
