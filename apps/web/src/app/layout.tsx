import type { Metadata } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], variable: "--fuente-lora" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--fuente-source-sans" });

export const metadata: Metadata = {
  title: { default: "GHYCS", template: "%s · GHYCS" },
  description:
    "Asesoría y acompañamiento a prestadores de servicios de salud en Colombia para cumplir las condiciones de habilitación y mejorar la calidad de su atención.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className={`${lora.variable} ${sourceSans.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
