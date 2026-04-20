/* Relative Imports */
import { z } from "zod/v4";

// ----------------------------------------------------------------------

export const UserFormSchema = z.object({
  txtFirstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "Must be under 50 characters"),
  txtLastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Must be under 50 characters"),
  txtEmail: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  txtPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Must be under 100 characters")
    .optional()
    .or(z.literal("")),
  numRoleId: z
    .number({ error: "Role is required" })
    .int()
    .positive("Role is required"),
  chkIsActive: z.boolean(),
});

export type UserFormValues = z.infer<typeof UserFormSchema>;
