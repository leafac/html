import he from "he";
import * as sanitizeXMLCharacters from "sanitize-xml-string";

export default html;
export type HTML = string;
export function html(
  template: TemplateStringsArray,
  ...substitutions: any[]
): string {
  const templatePartsSanitized = template.map((templatePart) =>
    sanitizeXMLCharacters.sanitize(templatePart)
  );
  const substitutionsSanitized = [
    ...substitutions.map((substitution) =>
      (Array.isArray(substitution)
        ? substitution
        : [substitution]
      ).map((substitutionPart) =>
        sanitizeXMLCharacters.sanitize(String(substitutionPart))
      )
    ),
    [],
  ];
  const buffer = new Array<string>();
  for (const index of templatePartsSanitized.keys()) {
    let templatePart = templatePartsSanitized[index];
    let substitution = substitutionsSanitized[index];
    if (templatePart.endsWith("$")) templatePart = templatePart.slice(0, -1);
    else
      substitution = substitution.map((substitutionPart) =>
        he.encode(substitutionPart)
      );
    buffer.push(templatePart, ...substitution);
  }
  return buffer.join("");
}
