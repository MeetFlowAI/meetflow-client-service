/* Imports */
import { useState, type JSX } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, ShieldCheck, AlertTriangle } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import {
  ResetPasswordFormSchema,
  type ResetPasswordFormValues,
} from "@/models/auth";
import AuthPage from "@/components/page/auth";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ButtonLoader from "@/components/loader/InlineLoader";
import Toast from "@/components/toast";
import { resetPasswordRequest } from "@/services/auth";
import { typography } from "@/theme/typography";
import { PAGE_ROOT } from "@/routes/paths";
import AppLogoDark from "@/assets/images/meetFlowDarkLogo.png";
import AppLogoLight from "@/assets/images/meetFlowLightLogo.png";

// ----------------------------------------------------------------------

/**
 * Reset Password page.
 * Reads ?token= and ?schema= from the URL (schema only present for org users).
 * Shows success state after password is reset.
 *
 * @component
 */
const ResetPassword = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const tenantSchema = searchParams.get("schema") ?? null;

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: { txtNewPassword: "", txtConfirmPassword: "" },
  });

  const resetMutation = useMutation({
    mutationFn: async (values: ResetPasswordFormValues) => {
      return resetPasswordRequest({
        token,
        newPassword: values.txtNewPassword,
        tenantSchema,
      });
    },
    onSuccess: () => {
      setIsResetSuccess(true);
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description:
          error?.response?.data?.message ||
          "Reset link is invalid or has expired.",
      });
    },
  });

  const handleFormSubmit = (values: ResetPasswordFormValues): void => {
    resetMutation.mutate(values);
  };

  // ─── Invalid / missing token guard ───────────────────────────────────────────
  if (!token) {
    return (
      <AuthPage title="Invalid Reset Link">
        <div className="flex flex-col w-full h-full items-start justify-center gap-20">
          <div className="flex justify-start">
            <img
              src={AppLogoDark}
              alt="MeetFlow"
              className="h-12 dark:hidden"
            />
            <img
              src={AppLogoLight}
              alt="MeetFlow"
              className="h-12 hidden dark:block"
            />
          </div>

          <div className="w-full flex flex-col items-start gap-8">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className={typography.semibold24}>Invalid reset link</h1>
              <p
                className={clsx(
                  typography.regular14,
                  "text-secondary-400 dark:text-secondary-300",
                )}
              >
                This password reset link is invalid or has already been used.
                Please request a new one.
              </p>
            </div>

            <Button asChild className="w-full h-11 rounded-[10px]">
              <Link to={PAGE_ROOT.forgotPassword.absolutePath}>
                Request new reset link
              </Link>
            </Button>
          </div>
        </div>
      </AuthPage>
    );
  }

  // ─── Success state ────────────────────────────────────────────────────────────
  if (isResetSuccess) {
    return (
      <AuthPage title="Password Reset">
        <div className="flex flex-col w-full h-full items-start justify-center gap-20">
          <div className="flex justify-start">
            <img
              src={AppLogoDark}
              alt="MeetFlow"
              className="h-12 dark:hidden"
            />
            <img
              src={AppLogoLight}
              alt="MeetFlow"
              className="h-12 hidden dark:block"
            />
          </div>

          <div className="w-full flex flex-col items-start gap-8">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-emerald-500" />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className={typography.semibold24}>Password reset!</h1>
              <p
                className={clsx(
                  typography.regular14,
                  "text-secondary-400 dark:text-secondary-300",
                )}
              >
                Your password has been updated successfully. You can now sign in
                with your new password.
              </p>
            </div>

            <Button
              asChild
              className="w-full h-11 rounded-[10px] text-base font-medium"
            >
              <Link to={PAGE_ROOT.signIn.absolutePath}>Back to Sign In</Link>
            </Button>
          </div>
        </div>
      </AuthPage>
    );
  }

  // ─── Form state ───────────────────────────────────────────────────────────────
  return (
    <AuthPage title="Reset Password">
      <div className="flex flex-col w-full h-full items-start justify-center gap-20">
        {/* Logo */}
        <div className="flex justify-start">
          <img src={AppLogoDark} alt="MeetFlow" className="h-12 dark:hidden" />
          <img
            src={AppLogoLight}
            alt="MeetFlow"
            className="h-12 hidden dark:block"
          />
        </div>

        <div className="w-full flex flex-col items-start gap-8">
          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h1 className={typography.semibold24}>Set new password</h1>
            <p
              className={clsx(
                typography.regular14,
                "text-secondary-400 dark:text-secondary-300",
              )}
            >
              Your new password must be at least 8 characters.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="w-full space-y-6"
            >
              {/* New Password */}
              <FormField
                control={form.control}
                name="txtNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={clsx(typography.regular12)}>
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((p) => !p)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={
                            showNewPassword ? "Hide password" : "Show password"
                          }
                          tabIndex={-1}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="txtConfirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={clsx(typography.regular12)}>
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((p) => !p)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 rounded-[10px] text-base font-medium"
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? (
                  <ButtonLoader text="Resetting password..." />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AuthPage>
  );
};

export default ResetPassword;
