import type { Metadata } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], variable: "--fuente-lora" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--fuente-source-sans" });

export const metadata: Metadata = {
  title: { default: "GHYCS", template: "%s · GHYCS" },
  description:
    "Asesoría y acompañamiento a prestadores de servicios de salud en Colombia para cumplir las condiciones de habilitación y mejorar la calidad de su atención.",
  // Propiedad de Search Console: Google exige el dominio verificado para publicar la app OAuth de FreeBusy.
  verification: { google: "FnGdWO4RYqDgL-nN5QrVeImXkSX2RR9M5PZFbFcvS54" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" data-tema="claro" className={`${lora.variable} ${sourceSans.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
