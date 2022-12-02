import he from "he";
import * as sanitizeXMLCharacters from "sanitize-xml-string";
import assert from "node:assert/strict";

export type HTML = string;

export default function html(
  templateStrings: TemplateStringsArray,
  ...substitutions: (string | string[])[]
): HTML {
  let output = "";

  for (const index of substitutions.keys()) {
    const templateString = templateStrings[index];
    const unsafeSubstitution = templateString.endsWith("$");
    output += unsafeSubstitution ? templateString.slice(0, -1) : templateString;

    const substitution = substitutions[index];
    if (Array.isArray(substitution)) {
      if (unsafeSubstitution)
        for (const substitutionPart of substitution) output += substitutionPart;
      else
        for (const substitutionPart of substitution)
          output += he.encode(sanitizeXMLCharacters.sanitize(substitutionPart));
    } else {
      if (unsafeSubstitution) output += substitution;
      else output += he.encode(sanitizeXMLCharacters.sanitize(substitution));
    }
  }

  output += templateStrings[templateStrings.length - 1];

  return output;
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

if (process.env.TEST === "leafac--html--benchmark") {
  const iterations = 5_000_000;

  await (async () => {
    const time = process.hrtime.bigint();
    for (let iteration = 0; iteration < iterations; iteration++)
      html`
        <a href="${`https://leafac.com`}">
          $${html`<strong>${"Hello World"}</strong>`}
        </a>
      `;
    console.log(
      `@leafac/html: ${(process.hrtime.bigint() - time) / 1_000_000n}ms`
    );
  })();

  await (async () => {
    const React = (await import("react")).default;
    const ReactDOMServer = await import("react-dom/server");
    const time = process.hrtime.bigint();
    for (let iteration = 0; iteration < iterations; iteration++)
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(
          "a",
          { href: `https://leafac.com` },
          React.createElement("strong", null, "Hello World")
        )
      );
    console.log(
      `ReactDOMServer.renderToStaticMarkup(): ${
        (process.hrtime.bigint() - time) / 1_000_000n
      }ms`
    );
  })();
}
