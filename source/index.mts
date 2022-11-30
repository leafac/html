import he from "he";
import * as sanitizeXMLCharacters from "sanitize-xml-string";
import assert from "node:assert/strict";

export type HTML = string;

export default function html(
  templateStrings: TemplateStringsArray,
  ...substitutions: (string | string[])[]
): HTML {
  let result = "";

  for (const index of substitutions.keys()) {
    let templateString = templateStrings[index];
    const unsafeSubstitution = templateString.endsWith("$");
    result += unsafeSubstitution ? templateString.slice(0, -1) : templateString;

    const substitution = substitutions[index];
    if (Array.isArray(substitution)) {
      if (unsafeSubstitution)
        for (const substitutionPart of substitution) result += substitutionPart;
      else
        for (const substitutionPart of substitution)
          result += he.encode(sanitizeXMLCharacters.sanitize(substitutionPart));
    } else {
      if (unsafeSubstitution) result += substitution;
      else result += he.encode(sanitizeXMLCharacters.sanitize(substitution));
    }
  }

  result += templateStrings[templateStrings.length - 1];

  return result;
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
    `<p>Invalid character (backspace): |💩| |\b| || |\b| || |\b| |\b| |💩|</p>`
  );
}
