import { test, expect } from "@jest/globals";
import html from ".";

test("No interpolation: No change", () => {
  expect(html`<p>Leandro Facchinetti</p>`).toMatchInlineSnapshot(
    `"<p>Leandro Facchinetti</p>"`
  );
});

test("Simple interpolation: Same as untagged template literals", () => {
  expect(html`<p>${"Leandro Facchinetti"}</p>`).toMatchInlineSnapshot(
    `"<p>Leandro Facchinetti</p>"`
  );
});

test("Unsafe interpolation: Encode with he.encode()", () => {
  expect(html`<p>${`<script>alert(1);</script>`}</p>`).toMatchInlineSnapshot(
    `"<p>&#x3C;script&#x3E;alert(1);&#x3C;/script&#x3E;</p>"`
  );
});

test("Double encode: Don’t try to prevent it; use safe interpolation instead", () => {
  expect(
    html`<p>${html`${`<script>alert(1);</script>`}`}</p>`
  ).toMatchInlineSnapshot(
    `"<p>&#x26;#x3C;script&#x26;#x3E;alert(1);&#x26;#x3C;/script&#x26;#x3E;</p>"`
  );
  expect(
    html`<p>$${html`${`<script>alert(1);</script>`}`}</p>`
  ).toMatchInlineSnapshot(
    `"<p>&#x3C;script&#x3E;alert(1);&#x3C;/script&#x3E;</p>"`
  );
});

test("Interpolation of non-string/non-array: Convert to string", () => {
  expect(html`<p>${null}</p>`).toMatchInlineSnapshot(`"<p>null</p>"`);
});

test("Safe interpolation (use $${...}): Don’t encode", () => {
  expect(
    html`<p>$${`<span>Leandro Facchinetti</span>`}</p>`
  ).toMatchInlineSnapshot(`"<p><span>Leandro Facchinetti</span></p>"`);
});

test('Escape safe interpolation (if interpolation is unsafe but last character before it must be a $): Use ${"$"}${...}', () => {
  expect(
    html`<p>${html`${"$"}${`<script>alert(1);</script>`}`}</p>`
  ).toMatchInlineSnapshot(
    `"<p>$&#x26;#x3C;script&#x26;#x3E;alert(1);&#x26;#x3C;/script&#x26;#x3E;</p>"`
  );
});

test("Array interpolation: Join", () => {
  expect(html`<p>${["Leandro", " ", "Facchinetti"]}</p>`).toMatchInlineSnapshot(
    `"<p>Leandro Facchinetti</p>"`
  );
});

test("Array unsafe interpolation: Encode with he.encode()", () => {
  expect(
    html`
      <p>
        ${["Leandro", " ", `<script>alert(1);</script>`, " ", "Facchinetti"]}
      </p>
    `
  ).toMatchInlineSnapshot(`
    "
          <p>
            Leandro &#x3C;script&#x3E;alert(1);&#x3C;/script&#x3E; Facchinetti
          </p>
        "
  `);
});

test("Array safe interpolation (use $${...}): Don’t encode", () => {
  expect(
    html`
      <ul>
        $${[`<li>Leandro</li>`, `<li>Facchinetti</li>`]}
      </ul>
    `
  ).toMatchInlineSnapshot(`
    "
          <ul>
            <li>Leandro</li><li>Facchinetti</li>
          </ul>
        "
  `);
});

test("Invalid XML characters: Remove them with sanitize-xml-string", () => {
  expect(
    // prettier-ignore
    html`<p>Invalid character (backspace): |💩| |\b| ${"|\b|"} $${"|\b|"} ${["|\b|"]} $${["|\b|"]} |\b| |💩|</p>`
  ).toMatchInlineSnapshot(
    `"<p>Invalid character (backspace): |💩| || || || || || || |💩|</p>"`
  );
});
