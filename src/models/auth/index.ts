/* Imports */
import { z } from "zod";

// ----------------------------------------------------------------------

// ─── Sign In ──────────────────────────────────────────────────────────────────

export const SignInFormSchema = z.object({
  txtEmail: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  txtPassword: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),

  chkRememberMe: z.boolean(),
});

export type SignInFormValues = z.infer<typeof SignInFormSchema>;

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const ForgotPasswordFormSchema = z.object({
  txtEmail: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordFormSchema>;

// ─── Reset Password ───────────────────────────────────────────────────────────

export const ResetPasswordFormSchema = z
  .object({
    txtNewPassword: z.string().min(8, "Password must be at least 8 characters"),
    txtConfirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.txtNewPassword === data.txtConfirmPassword, {
    message: "Passwords do not match",
    path: ["txtConfirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof ResetPasswordFormSchema>;
