/** TEC-00 (alcance transversal): validaciones comunes y referencias técnicas. */

const aleatorio = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");

/** CA1: identificador opaco único por objeto. */
export const idOperacion = (prefijo = "OP") => `${prefijo}-${aleatorio(8).toUpperCase()}`;

/** CA2: código de referencia estable que se muestra al usuario ante un fallo. */
export const codigoReferencia = () => `TEC-${aleatorio(6).toUpperCase()}`;

/** CA9: cédula ordinaria de 10 dígitos con dígito verificador (pesos 2,1,2,1,2,1,2,1,2). */
export function cedulaValida(cedula: string): boolean {
  if (!/^[0-9]{10}$/.test(cedula)) return false;
  const provincia = parseInt(cedula.slice(0, 2), 10);
  if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;
  const pesos = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const suma = pesos.reduce((acc, p, i) => {
    const prod = p * parseInt(cedula[i], 10);
    return acc + (prod > 9 ? prod - 9 : prod);
  }, 0);
  return (10 - (suma % 10)) % 10 === parseInt(cedula[9], 10);
}

/** CA9: RUC de 13 dígitos; la existencia y titularidad las confirma la fuente oficial. */
export const rucValido = (ruc: string) => /^[0-9]{13}$/.test(ruc);

/** CA10: subforma ASCII `local@dominio`, hasta 64 caracteres en la parte local y 254 en total. */
const CORREO = /^[A-Za-z0-9!#$%&'*+/=?^_{}|~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_{}|~-]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
export function correoValido(correo: string): boolean {
  const [local = ""] = correo.split("@");
  return correo.length <= 254 && local.length <= 64 && CORREO.test(correo);
}
