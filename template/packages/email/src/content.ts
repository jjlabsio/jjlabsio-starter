import { z } from "zod";

const safeUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return (
        ["https:", "http:"].includes(url.protocol) &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "Use an http or https URL.");

export const emailBlockSchema = z.discriminatedUnion("type", [
  z
    .object({ type: z.literal("heading"), text: z.string().trim().max(200) })
    .strict(),
  z
    .object({ type: z.literal("paragraph"), text: z.string().trim().max(5000) })
    .strict(),
  z
    .object({
      type: z.literal("bullets"),
      text: z
        .string()
        .trim()
        .max(5000)
        .refine((text) => {
          const lines = text.split("\n").filter((line) => line.trim());
          return (
            lines.length <= 30 && lines.every((line) => line.length <= 500)
          );
        }, "Use up to 30 bullet points, each under 500 characters."),
    })
    .strict(),
  z
    .object({
      type: z.literal("button"),
      text: z.string().trim().max(100),
      url: safeUrl,
    })
    .strict(),
  z.object({ type: z.literal("divider") }).strict(),
]);

export const emailContentSchema = z
  .object({
    subject: z
      .string()
      .trim()
      .max(200)
      .refine((text) => !/[\r\n]/.test(text), "Use a single-line subject."),
    previewText: z.string().trim().max(250),
    audiences: z
      .array(z.enum(["trial", "subscribed"]))
      .max(2)
      .transform((items) => [...new Set(items)]),
    blocks: z.array(emailBlockSchema).max(40),
  })
  .strict();

export type EmailBlock = z.infer<typeof emailBlockSchema>;
export type EmailContent = z.infer<typeof emailContentSchema>;
export type EmailAudience = EmailContent["audiences"][number];

export function validateReady(content: EmailContent) {
  if (!content.subject) throw new Error("Add a subject before sending.");
  if (!content.audiences.length)
    throw new Error("Select at least one audience.");
  if (!content.blocks.some((block) => block.type !== "divider"))
    throw new Error("Add email content before sending.");
  if (
    content.blocks.some(
      (block) =>
        block.type !== "divider" &&
        (!block.text || (block.type === "button" && !block.url)),
    )
  )
    throw new Error("Complete or remove empty content blocks before sending.");
}

export const emptyEmail: EmailContent = {
  subject: "",
  previewText: "",
  audiences: ["trial", "subscribed"],
  blocks: [
    { type: "heading", text: "" },
    { type: "paragraph", text: "" },
  ],
};
