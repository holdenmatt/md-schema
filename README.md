# md-schema

Typed frontmatter schemas for markdown documents.

`md-schema` parses YAML frontmatter with `gray-matter` and validates it with a Zod object schema. The markdown body is returned as trimmed markdown text.

## Install

```sh
pnpm add git+https://github.com/Slider-Labs/md-schema.git zod
```

## Usage

```ts
import { z } from "zod";
import { markdownSchema } from "md-schema";

const postSchema = markdownSchema(
  z.object({
    title: z.string(),
    draft: z.boolean().default(false),
    slug: z.string().transform((value) => value.toLowerCase()),
  }),
);

const result = postSchema.parse(`---
title: Hello
slug: Hello-World
---

# Hello
`);

if (result.success) {
  result.data.frontmatter.title;
  result.data.body;
  result.data.markdown;
}
```

## API

### `markdownSchema(frontmatterSchema)`

Creates a parser for markdown documents with YAML frontmatter.

- `frontmatterSchema`: a Zod object schema used to validate parsed frontmatter.
- Returns `{ schema, parse }`.
- `schema` is the original Zod schema.
- `parse(markdown)` returns a safe result object and does not throw for YAML parse or Zod validation failures.

Success:

```ts
{
  success: true,
  data: {
    frontmatter,
    body,
    markdown,
  },
}
```

Failure:

```ts
{
  success: false,
  error,
}
```

Only frontmatter is validated. The body is not parsed and is returned as trimmed markdown text.
