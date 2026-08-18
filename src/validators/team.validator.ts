import { z } from "zod";

// multipart/form-data sends every form field as a string, even ones the
// user left blank — so on PUT, an untouched field arrives as "" rather
// than being omitted. This converts "" (or whitespace-only) to undefined
// so blank fields are treated as "leave unchanged" instead of "set to
// invalid empty value".
function emptyToUndefined(val: unknown) {
  if (typeof val === "string" && val.trim() === "") return undefined;
  return val;
}

// Wraps a schema so blank input is dropped (becomes undefined) and the
// field becomes optional — used only on the UPDATE schema, since on
// CREATE a blank required field should still fail validation.
function blankable<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(emptyToUndefined, schema.optional());
}

export const createTeamSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(50),
      role: z.string().trim().min(1).max(100),
      bio: z.string().trim().min(1).max(500),
      socialsLinkedin: blankable(z.url()),
      socialsGithub: blankable(z.url()),
      socialsEmail: blankable(z.email()),
    })
    .strict(),
});

export const updateTeamSchema = z.object({
  body: z
    .object({
      name: blankable(z.string().trim().min(2).max(50)),
      role: blankable(z.string().trim().min(1).max(100)),
      bio: blankable(z.string().trim().min(1).max(500)),
      socialsLinkedin: blankable(z.url()),
      socialsGithub: blankable(z.url()),
      socialsEmail: blankable(z.email()),
    })
    .strict(),
});
