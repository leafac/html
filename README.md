<h1 align="center">@leafac/html</h1>
<h3 align="center">HTML [tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)</h3>
<p align="center">
<a href="https://github.com/leafac/html"><img src="https://img.shields.io/badge/Source---" alt="Source"></a>
<a href="https://www.npmjs.com/package/@leafac/html"><img alt="Package" src="https://badge.fury.io/js/%40leafac%2Fhtml.svg"></a>
<a href="https://github.com/leafac/html/actions"><img src="https://github.com/leafac/html/workflows/.github/workflows/main.yml/badge.svg" alt="Continuous Integration"></a>
</p>

### Installation

```console
$ npm install @leafac/html
```

### Features, Usage, and Examples

See [`src/index.test.ts`](src/index.test.ts).

**Bonus feature:** [The implementation](src/index.ts) is so short and straightforward that you can inspect it yourself. In particular, note how @leafac/html **doesn’t** encode HTML itself; instead, it relies on [he](https://npm.im/he), which is much more robust and reliable than any bespoke encoding.

### Recommendation

Use @leafac/html with [Prettier](https://prettier.io) (automatic formatting) & [the es6-string-html Visual Studio Code extension](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html) (syntax highlighting).

### Anti-Features

- Doesn’t try to format the output. Instead call Prettier programmatically on the output.
- Generates strings, not any kind of virtual DOM.

### Prior Art

- <https://npm.im/html-template-tag>:
  - Was a major inspiration for this. Its design is simple and great. In particular, I love (and stole) the idea of using `$${...}` to mark safe interpolation.
  - [Doesn’t encode arrays by default](https://github.com/AntonioVdlC/html-template-tag/issues/10).
  - [Uses a bespoke encoding](https://github.com/AntonioVdlC/html-template-tag/blob/b6a5eee92a4625c93de5cc9c3446cd3ca79e9b3c/src/index.js#L3).
  - [Has awkward types that require substitutions to be `string`s, as opposed to `any`s](https://github.com/AntonioVdlC/html-template-tag/blob/b6a5eee92a4625c93de5cc9c3446cd3ca79e9b3c/index.d.ts#L3).
- <https://npm.im/common-tags>:
  - Doesn’t encode interpolated values by default.
  - Uses the `safeHtml` tag, which isn’t recognized by Prettier & the es6-string-html Visual Studio Code extension.
- <https://npm.im/escape-html-template-tag>:
  - Awkward API with `escapeHtml.safe()` and `escapeHtml.join()` instead of the `$${}` trick.
  - [Uses a bespoke encoding](https://github.com/Janpot/escape-html-template-tag/blob/14ab388646b9b930ea68a46b0a9c8314d65b388a/index.mjs#L1-L10).
- <https://npm.im/lit-html>, <https://npm.im/nanohtml>, <https://npm.im/htm>, and <https://npm.im/viperhtml>: Have the notion of virtual DOM instead of simple strings.
