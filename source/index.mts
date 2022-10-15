import he from "he";
import * as sanitizeXMLCharacters from "sanitize-xml-string";
import assert from "node:assert/strict";

export default html;
export type HTML = string;
export function html(
  template: TemplateStringsArray,
  ...substitutions: (string | string[])[]
): HTML {
  const templatePartsSanitized = template.map((templatePart) =>
    sanitizeXMLCharacters.sanitize(templatePart)
  );
  const substitutionsSanitized = [
    ...substitutions.map((substitution) =>
      (Array.isArray(substitution) ? substitution : [substitution]).map(
        (substitutionPart) =>
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

if (process.env.TEST === "leafac--html") {
  assert.equal(html`<p>Leandro Facchinetti</p>`, `<p>Leandro Facchinetti</p>`);
  assert.equal(
    html`<p>${"Leandro Facchinetti"}</p>`,
    `<p>Leandro Facchinetti</p>`
  );
  assert.equal(
    html`<p>${`<script>alert(1);</script>`}</p>`,
    `<p>&#x3C;script&#x3E;alert(1);&#x3C;/script&#x3E;</p>`
  );
  assert.equal(
    html`<p>${html`${`<script>alert(1);</script>`}`}</p>`,
    `<p>&#x26;#x3C;script&#x26;#x3E;alert(1);&#x26;#x3C;/script&#x26;#x3E;</p>`
  );
  assert.equal(
    html`<p>$${html`${`<script>alert(1);</script>`}`}</p>`,
    `<p>&#x3C;script&#x3E;alert(1);&#x3C;/script&#x3E;</p>`
  );
  assert.equal(
    html`<p>$${`<span>Leandro Facchinetti</span>`}</p>`,
    `<p><span>Leandro Facchinetti</span></p>`
  );
  assert.equal(
    html`<p>${html`${"$"}${`<script>alert(1);</script>`}`}</p>`,
    `<p>$&#x26;#x3C;script&#x26;#x3E;alert(1);&#x26;#x3C;/script&#x26;#x3E;</p>`
  );
  assert.equal(
    html`<p>${["Leandro", " ", "Facchinetti"]}</p>`,
    `<p>Leandro Facchinetti</p>`
  );
  assert.equal(
    html`
      <p>
        ${["Leandro", " ", `<script>alert(1);</script>`, " ", "Facchinetti"]}
      </p>
    `,
    `
      <p>
        Leandro &#x3C;script&#x3E;alert(1);&#x3C;/script&#x3E; Facchinetti
      </p>
    `
  );
  assert.equal(
    html`
      <ul>
        $${[`<li>Leandro</li>`, `<li>Facchinetti</li>`]}
      </ul>
    `,
    `
      <ul>
        <li>Leandro</li><li>Facchinetti</li>
      </ul>
    `
  );
  assert.equal(
    // prettier-ignore
    html`<p>Invalid character (backspace): |💩| |\b| ${"|\b|"} $${"|\b|"} ${["|\b|"]} $${["|\b|"]} |\b| |💩|</p>`,
    `<p>Invalid character (backspace): |💩| || || || || || || |💩|</p>`
  );
}