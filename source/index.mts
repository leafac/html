import * as sanitizeXMLCharacters from "sanitize-xml-string";
import * as entities from "entities/lib/escape.js";
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
          output += entities.escapeUTF8(
            sanitizeXMLCharacters.sanitize(substitutionPart)
          );
    } else {
      if (unsafeSubstitution) output += substitution;
      else
        output += entities.escapeUTF8(
          sanitizeXMLCharacters.sanitize(substitution)
        );
    }
  }

  output += templateStrings[templateStrings.length - 1];

  return output;
}

if (process.env.TEST === "@leafac/html") {
  assert.equal(html`<p>Leandro Facchinetti</p>`, `<p>Leandro Facchinetti</p>`);
  assert.equal(
    html`<p>${"Leandro Facchinetti"}</p>`,
    `<p>Leandro Facchinetti</p>`
  );
  assert.equal(
    html`<p>${`<script>alert(1);</script>`}</p>`,
    `<p>&lt;script&gt;alert(1);&lt;/script&gt;</p>`
  );
  assert.equal(
    html`<p>${html`${`<script>alert(1);</script>`}`}</p>`,
    `<p>&amp;lt;script&amp;gt;alert(1);&amp;lt;/script&amp;gt;</p>`
  );
  assert.equal(
    html`<p>$${html`${`<script>alert(1);</script>`}`}</p>`,
    `<p>&lt;script&gt;alert(1);&lt;/script&gt;</p>`
  );
  assert.equal(
    html`<p>$${`<span>Leandro Facchinetti</span>`}</p>`,
    `<p><span>Leandro Facchinetti</span></p>`
  );
  assert.equal(
    html`<p>${html`${"$"}${`<script>alert(1);</script>`}`}</p>`,
    `<p>$&amp;lt;script&amp;gt;alert(1);&amp;lt;/script&amp;gt;</p>`
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
        Leandro &lt;script&gt;alert(1);&lt;/script&gt; Facchinetti
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

if (process.env.TEST === "@leafac/html/benchmark") {
  const node = await import("@leafac/node");
  const iterations = 5_000_000;

  node.time("@leafac/html", async () => {
    for (let iteration = 0; iteration < iterations; iteration++)
      html`
        <a href="${`https://leafac.com`}">
          $${html`<strong>${"Hello World"}</strong>`}
        </a>
      `;
  });

  const React = (await import("react")).default;
  const ReactDOMServer = await import("react-dom/server");
  node.time("ReactDOMServer.renderToStaticMarkup()", async () => {
    for (let iteration = 0; iteration < iterations; iteration++)
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(
          "a",
          { href: `https://leafac.com` },
          React.createElement("strong", null, "Hello World")
        )
      );
  });
}
