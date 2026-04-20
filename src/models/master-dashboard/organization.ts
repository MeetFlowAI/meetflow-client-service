/* Relative Imports */
import { z } from "zod/v4";

// ----------------------------------------------------------------------

export const OrganizationFormSchema = z.object({
  // Step 1 — Org identity
  txtName: z
    .string()
    .min(1, "Legal name is required")
    .max(100, "Must be under 100 characters"),
  txtDisplayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Must be under 100 characters"),
  txtDomain: z
    .string()
    .max(100, "Must be under 100 characters")
    .optional()
    .or(z.literal("")),
  txtOfficialEmail: z
    .string()
    .min(1, "Official email is required")
    .email("Enter a valid email"),
  // Step 2 — Owner account
  txtOwnerFirstName: z
    .string()
    .min(1, "Owner first name is required")
    .max(50, "Must be under 50 characters"),
  txtOwnerLastName: z
    .string()
    .min(1, "Owner last name is required")
    .max(50, "Must be under 50 characters"),
  txtPrimaryOwnerEmail: z
    .string()
    .min(1, "Owner email is required")
    .email("Enter a valid email"),
  // Step 3 — Plan
  numPlanId: z
    .number({ error: "Plan is required" })
    .int()
    .positive("Plan is required"),
});

export type OrganizationFormValues = z.infer<typeof OrganizationFormSchema>;
