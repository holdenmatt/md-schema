import matter from "gray-matter";
import type * as z from "zod";

/** A Zod object schema used to validate parsed YAML frontmatter. */
export type FrontmatterSchema = z.ZodObject;

/**
 * Parsed markdown data returned after frontmatter validation succeeds.
 */
export type MarkdownSchemaData<Schema extends FrontmatterSchema> = {
  /** Frontmatter after Zod validation. */
  frontmatter: z.output<Schema>;
  /** Markdown content after frontmatter, trimmed at both ends. */
  body: string;
  /** Original markdown input string, preserved exactly. */
  markdown: string;
};

/**
 * Safe parse result for a markdown document with typed frontmatter.
 */
export type MarkdownSchemaResult<Schema extends FrontmatterSchema> =
  | {
      success: true;
      data: MarkdownSchemaData<Schema>;
    }
  | {
      success: false;
      error: unknown;
    };

/**
 * A reusable parser for markdown documents with a specific frontmatter schema.
 */
export type MarkdownSchema<Schema extends FrontmatterSchema> = {
  /** Frontmatter schema used by this parser. */
  schema: Schema;
  /** Parse markdown text into typed frontmatter and a trimmed body. */
  parse(markdown: string): MarkdownSchemaResult<Schema>;
};

/**
 * Create a parser for markdown documents with YAML frontmatter validated by a Zod object schema.
 *
 * YAML parse failures and Zod validation failures are returned as safe `{ success: false }` results.
 */
export function markdownSchema<Schema extends FrontmatterSchema>(
  frontmatterSchema: Schema,
): MarkdownSchema<Schema> {
  return {
    schema: frontmatterSchema,
    parse(markdown) {
      let file: matter.GrayMatterFile<string>;

      try {
        file = matter(markdown);
      } catch (error) {
        return { success: false, error };
      }

      try {
        const result = frontmatterSchema.safeParse(file.data);

        if (!result.success) {
          return { success: false, error: result.error };
        }

        return {
          success: true,
          data: {
            frontmatter: result.data,
            body: file.content.trim(),
            markdown,
          },
        };
      } catch (error) {
        return { success: false, error };
      }
    },
  };
}
