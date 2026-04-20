/* Relative Imports */
import { z } from "zod/v4";

// ----------------------------------------------------------------------

export const RoleFormSchema = z.object({
  txtName: z
    .string()
    .min(1, "Role key is required")
    .max(50, "Must be under 50 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Only lowercase letters, digits, and underscores allowed",
    ),
  txtDisplayName: z
    .string()
    .min(1, "Display name is required")
    .max(80, "Must be under 80 characters"),
  txtDescription: z
    .string()
    .max(300, "Must be under 300 characters")
    .optional(),
  chkIsSystem: z.boolean(),
});

export type RoleFormValues = z.infer<typeof RoleFormSchema>;
