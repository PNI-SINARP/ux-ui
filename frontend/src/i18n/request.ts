import { getRequestConfig } from "next-intl/server";
import { routing } from "@/routing";

export default getRequestConfig(async () => {
  // Para static export (Github Pages), forzamos español (único locale disponible)
  // Esto evita que next-intl intente leer la cookie o headers de requestLocale
  const locale = routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
