import { PaginaPublica } from "@/compartido/ui/PaginaPublica";

/** Todo lo que ve el visitante lleva la navegación y el pie públicos (RS-F-036). */
export default function LayoutPublico({ children }: LayoutProps<"/">) {
  return <PaginaPublica>{children}</PaginaPublica>;
}
