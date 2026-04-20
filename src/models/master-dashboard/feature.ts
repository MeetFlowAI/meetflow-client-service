/* Relative Imports */
import { z } from "zod/v4";

// ----------------------------------------------------------------------

export const FeatureFormSchema = z.object({
  txtFeatureKey: z
    .string()
    .min(1, "Feature key is required")
    .max(100, "Must be under 100 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Only lowercase letters, digits, and underscores allowed",
    ),
  txtName: z
    .string()
    .min(1, "Feature name is required")
    .max(100, "Must be under 100 characters"),
  txtDescription: z
    .string()
    .max(300, "Must be under 300 characters")
    .optional(),
  chkIsActive: z.boolean(),
});

export type FeatureFormValues = z.infer<typeof FeatureFormSchema>;
