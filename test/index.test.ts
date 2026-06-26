import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";

import { markdownSchema } from "../src/index.js";

describe("markdownSchema", () => {
  it("returns the original frontmatter schema", () => {
    const frontmatterSchema = z.object({
      title: z.string(),
    });

    const document = markdownSchema(frontmatterSchema);

    expect(document.schema).toBe(frontmatterSchema);
  });

  it("parses valid frontmatter and body", () => {
    const document = markdownSchema(
      z.object({
        title: z.string(),
        draft: z.boolean(),
      }),
    );

    const result = document.parse(`---
title: Hello
draft: false
---

# Hello

Body text
`);

    expect(result).toEqual({
      success: true,
      data: {
        frontmatter: {
          title: "Hello",
          draft: false,
        },
        body: "# Hello\n\nBody text",
        markdown: `---
title: Hello
draft: false
---

# Hello

Body text
`,
      },
    });
  });

  it("applies Zod defaults and transforms", () => {
    const document = markdownSchema(
      z.object({
        slug: z.string().transform((value) => value.toLowerCase()),
        tags: z.array(z.string()).default([]),
      }),
    );

    const result = document.parse(`---
slug: Hello-World
---
Body
`);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.frontmatter).toEqual({
      slug: "hello-world",
      tags: [],
    });
    expectTypeOf(result.data.frontmatter).toEqualTypeOf<{
      slug: string;
      tags: string[];
    }>();
  });

  it("returns validation failure for invalid frontmatter", () => {
    const document = markdownSchema(
      z.object({
        title: z.string(),
        publishedAt: z.string(),
      }),
    );

    const result = document.parse(`---
title: 123
---
Body
`);

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error).toBeInstanceOf(z.ZodError);
  });

  it("returns parse failure for invalid YAML", () => {
    const document = markdownSchema(
      z.object({
        title: z.string(),
      }),
    );

    const result = document.parse(`---
title: [unterminated
---
Body
`);

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error).toBeInstanceOf(Error);
  });

  it("preserves original markdown", () => {
    const document = markdownSchema(
      z.object({
        title: z.string(),
      }),
    );
    const markdown = `---
title: Original
---

  Body with surrounding whitespace
`;

    const result = document.parse(markdown);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.markdown).toBe(markdown);
  });

  it("trims body", () => {
    const document = markdownSchema(z.object({}));

    const result = document.parse(`---
---

  Body with padding

`);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.body).toBe("Body with padding");
  });
});
