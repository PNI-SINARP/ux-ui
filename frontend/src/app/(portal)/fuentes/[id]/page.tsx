import { redirect } from "next/navigation";

const FUENTES_IDS = [
  "FUE-RC-001",
  "FUE-ANT-002",
  "FUE-SRI-003",
  "FUE-MED-004",
  "FUE-IESS-005",
  "FUE-MSP-006",
  "FUE-AGRO-007",
  "FUE-JUD-008",
  "FUE-DEF-009",
  "FUE-BCE-007",
  "FUE-CJ-008",
  "FUE-CNT-010",
  "FUE-BCE-012",
];

export function generateStaticParams() {
  return FUENTES_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FuentesDetailRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/proveedor/fuentes/${id}`);
}
