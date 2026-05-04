/* Relative Imports */
import { z } from "zod/v4";

// ----------------------------------------------------------------------

export const PlanFormSchema = z.object({
  txtName: z
    .string()
    .min(1, "Plan name is required")
    .max(100, "Must be under 100 characters"),
  txtDescription: z
    .string()
    .max(500, "Must be under 500 characters")
    .optional(),
  numPrice: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)), {
      message: "Price must be a number",
    })
    .refine((val) => Number(val) >= 0, {
      message: "Price cannot be negative",
    }),
  selBillingCycle: z.enum(["monthly", "yearly", "lifetime"], {
    error: "Select a billing cycle",
  }),

  chkIsActive: z.boolean(),
});
export type PlanFormValues = z.infer<typeof PlanFormSchema>;
