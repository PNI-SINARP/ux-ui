import { UIKitView } from "@/modules/uikit/views/uikit-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DINARP KIT UX / UI | DINARP",
  description: "Explora los componentes y tokens del sistema de diseño de DINARP.",
};

export default function UIKitPage() {
  return <UIKitView />;
}
