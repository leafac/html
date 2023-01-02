<!--
- Currently, whether a substitution is safe is determined by the context (`${...}` vs `$${...}`). Consider introducing a notion of marking a substitution as safe in and of itself and bypassing escaping even when using `${...}`.
  - You can’t add custom properties to native values like strings, so it would have to be a wrapper, for example:
    ```javascript
    const example = new String("hello");
    example.htmlSafe = true;
  ```
  - As far as I remember, this is Ruby on Rail’s design.
  - Perhaps this is a bad idea, because having more than one to do things may lead to confusion and errors in people’s code.
-->

<h1 align="center">@leafac/html</h1>
<h3 align="center">Radically Straightforward HTML</h3>
<p align="center">
<a href="https://github.com/leafac/html"><img src="https://img.shields.io/badge/Source---" alt="Source"></a>
<a href="https://www.npmjs.com/package/@leafac/html"><img alt="Package" src="https://badge.fury.io/js/%40leafac%2Fhtml.svg"></a>
<a href="https://github.com/leafac/html/actions"><img src="https://github.com/leafac/html/workflows/.github/workflows/main.yml/badge.svg" alt="Continuous Integration"></a>
</p>

## Videos

[<img src="https://img.youtube.com/vi/em3x-HbtCag/0.jpg" width="200" /><br />Demonstration](https://youtu.be/em3x-HbtCag)

[<img src="https://img.youtube.com/vi/UPNNLrXlnfw/0.jpg" width="200" /><br />Code Review](https://youtu.be/UPNNLrXlnfw)

## Installation

```console
$ npm install @leafac/html
```

We recommend using @leafac/html along with the following tools:

**Formatting:** [Prettier](https://prettier.io) and the Visual Studio Code extension [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).

**Syntax Highlighting:** The Visual Studio Code extension [es6-string-html](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html).

## Features, Usage, and Examples

**Use [tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) as an HTML template engine.** For example:

```typescript
import html from "@leafac/html";

console.log(html`<p>${"Leandro Facchinetti"}</p>`); // => <p>Leandro Facchinetti</p>
```

**Safe by default.** For example:

```typescript
console.log(html`<p>${`<script>alert(1);</script>`}</p>`); // => <p>&#x3C;script&#x3E;alert(1);&#x3C;/script&#x3E;</p>
```

**Unsafely interpolate trusted HTML with `$${...}`.** For example:

```typescript
console.log(html`<p>$${`<span>Leandro Facchinetti</span>`}</p>`); // => <p><span>Leandro Facchinetti</span></p>
```

**Join interpolated arrays.** For example:

```typescript
console.log(html`<p>${["Leandro", " ", "Facchinetti"]}</p>`); // => <p>Leandro Facchinetti</p>
```

Array interpolation is safe by default; if you wish to unsafely interpolate an array of trusted HTML use `$${[...]}`.

**@leafac/html doesn’t encode HTML itself.** It relies on [he](https://npm.im/he), which is a mature solution and covers all the edge cases.

**@leafac/html doesn’t format the output.** If you need pretty HTML, you may pass the output of @leafac/html to Prettier.

**@leafac/html generates strings.** No virtual DOM in sight. For readability, the `HTML` type is exported in TypeScript. For example:

```typescript
import html, { HTML } from "@leafac/html";
const name: HTML = html`<p>Leandro Facchinetti</p>`;
console.log(name);
```

**@leafac/html sanitizes (removes) invalid XML characters.** It uses [sanitize-xml-string](https://npm.im/sanitize-xml-string). For example:

<!-- prettier-ignore -->
```typescript
console.log(html`<p>A backspace is invalid in XML: ${`|\b|`}</p>`); // => <p>A backspace is invalid in XML: ||</p>
```

**@leafac/html is fast.** Rendering HTML tends to be one of the most expensive computations in a web server, so it must be fast. @leafac/html is approximately 3x faster than `ReactDOMServer.renderToStaticMarkup()` (run the benchmark on your machine with `npm run test:benchmark`).

## Related Projects

- <https://npm.im/@leafac/sqlite>: Radically Straightforward SQLite.
- <https://npm.im/@leafac/css>: Radically Straightforward CSS.
- <https://npm.im/@leafac/javascript>: Radically Straightforward Client-Side JavaScript.

## Prior Art

- <https://npm.im/html-template-tag>:
  - Was a major inspiration for this. Its design is simple and great. In particular, I love (and stole) the idea of using `$${...}` to mark unsafe interpolation of trusted HTML.
  - [Doesn’t encode arrays by default](https://github.com/AntonioVdlC/html-template-tag/issues/10).
  - [Uses a bespoke encoding](https://github.com/AntonioVdlC/html-template-tag/blob/b6a5eee92a4625c93de5cc9c3446cd3ca79e9b3c/src/index.js#L3).
- <https://npm.im/common-tags>:
  - Doesn’t encode interpolated values by default.
  - Uses the `safeHtml` tag, which isn’t recognized by Prettier or the Visual Studio Code extension es6-string-html extension.
- <https://npm.im/escape-html-template-tag>:
  - Less ergonomic API with `escapeHtml.safe()` and `escapeHtml.join()` instead of the `$${}` trick.
  - [Uses a bespoke encoding](https://github.com/Janpot/escape-html-template-tag/blob/14ab388646b9b930ea68a46b0a9c8314d65b388a/index.mjs#L1-L10).
- <https://npm.im/lit-html>, <https://npm.im/nanohtml>, <https://npm.im/htm>, and <https://npm.im/viperhtml>:
  - Have the notion of virtual DOM instead of simple string concatenation.

## Changelog

### 4.0.0 · 2022-12-02

- Reimplemented @leafac/html to improve performance. Measured a 2x speedup with respect to version 3.0.3.

**Breaking Changes**

- Use default import instead of named import for `html`.

  Before:

  ```javascript
  import { html, HTML } from "@leafac/html";
  ```

  After:

  ```javascript
  import html, { HTML } from "@leafac/html";
  ```

- We no longer sanitize XML characters in the literal template or in unsafe substitutions (those using `$${...}`). This was one of the reasons for the performance improvement, particularly because it prevents the same string from being sanitized over and over in a big template with deep nesting.

  In most situations this change shouldn’t affect your code, but you must be aware of the following:

  - Templates must not contain invalid XML characters, for example, `` html`<p>A backspace: |\b|</p>` ``.
  - Unsafe substitutions (those using `$${...}`) must not contain invalid XML characters. If the unsafe substitution is the result of `` html`...` `` itself, then it’s already sanitized; but if you’re generating HTML in some other way, then you may need to introduce [sanitize-xml-string](https://npm.im/sanitize-xml-string)’s `sanitizeXMLCharacters.sanitize()`.

  > **Note:** Safe substitutions (the default substitutions; those using `${...}`) continued to be sanitized against invalid XML characters.
