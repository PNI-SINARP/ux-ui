import { redirect } from "next/navigation";

export function AccesoInteroperabilidadView(): null {
  redirect("/acceso-interoperabilidad/solicitudes");
  return null;
}
