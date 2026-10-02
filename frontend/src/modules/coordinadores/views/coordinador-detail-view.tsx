import { CoordinadorDetailClient } from "@/modules/coordinadores/components/coordinador-detail-client";

export function CoordinadorDetailView({ id }: { id: string }) {
  return <CoordinadorDetailClient id={id} />;
}
