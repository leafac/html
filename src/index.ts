import he from "he";
import * as sanitizeXMLCharacters from "sanitize-xml-string";

export default html;
export type HTML = string;
export function html(
  template: TemplateStringsArray,
  ...substitutions: any[]
): string {
  const buffer = new Array<string>();

  for (let index = 0; index < template.length - 1; index++) {
    const templatePart = sanitizeXMLCharacters.sanitize(template[index]);
    let encode = true;
    if (templatePart.endsWith("$")) {
      buffer.push(templatePart.slice(0, -1));
      encode = false;
    } else buffer.push(templatePart);
    let substitution = substitutions[index];
    if (!Array.isArray(substitution)) substitution = [substitution];
    for (let substitutionPart of substitution) {
      substitutionPart = sanitizeXMLCharacters.sanitize(
        String(substitutionPart)
      );
      if (encode) substitutionPart = he.encode(substitutionPart);
      buffer.push(substitutionPart);
    }
  }
  buffer.push(sanitizeXMLCharacters.sanitize(template[template.length - 1]));

  return buffer.join("");
}
