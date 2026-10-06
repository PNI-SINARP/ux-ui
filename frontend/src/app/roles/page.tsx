import type { Metadata } from "next";
import { RolesView } from "@/modules/roles-permisos/views/roles-view";

export const metadata: Metadata = {
  title: "Roles y Permisos | DINARP",
  description: "Administración de roles, versionado de capacidades y control de accesos institucionales DINARP.",
};

export default function RolesPage() {
  return <RolesView />;
}
