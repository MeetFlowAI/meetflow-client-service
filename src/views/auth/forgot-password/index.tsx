/* Imports */
import { useState, type JSX } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, MailCheck } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import {
  ForgotPasswordFormSchema,
  type ForgotPasswordFormValues,
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
import { forgotPasswordRequest } from "@/services/auth";
import { typography } from "@/theme/typography";
import { PAGE_ROOT } from "@/routes/paths";
import AppLogoDark from "@/assets/images/meetFlowDarkLogo.png";
import AppLogoLight from "@/assets/images/meetFlowLightLogo.png";

// ----------------------------------------------------------------------

/**
 * Forgot Password page.
 * Submits email, then shows a confirmation state.
 * Server always returns success — never reveals if email exists.
 *
 * @component
 */
const ForgotPassword = (): JSX.Element => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordFormSchema),
    defaultValues: { txtEmail: "" },
  });

  const forgotMutation = useMutation({
    mutationFn: async ({ txtEmail }: ForgotPasswordFormValues) => {
      return forgotPasswordRequest({ email: txtEmail });
    },
    onSuccess: (_, variables) => {
      setSubmittedEmail(variables.txtEmail);
      setIsEmailSent(true);
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    },
  });

  const handleFormSubmit = (values: ForgotPasswordFormValues): void => {
    forgotMutation.mutate(values);
  };

  // ─── Email sent confirmation state ───────────────────────────────────────────
  if (isEmailSent) {
    return (
      <AuthPage title="Check Your Email">
        <div className="flex flex-col w-full h-full items-start justify-center gap-20">
          {/* Logo */}
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
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <MailCheck className="w-7 h-7 text-primary" />
            </div>

            {/* Text */}
            <div className="flex flex-col gap-2">
              <h1 className={typography.semibold24}>Check your email</h1>
              <p
                className={clsx(
                  typography.regular14,
                  "text-secondary-400 dark:text-secondary-300",
                )}
              >
                We sent a password reset link to
              </p>
              <p className={clsx(typography.semibold14, "text-foreground")}>
                {submittedEmail}
              </p>
              <p
                className={clsx(
                  typography.regular14,
                  "text-secondary-400 dark:text-secondary-300 mt-1",
                )}
              >
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => {
                  setIsEmailSent(false);
                  form.reset();
                }}
              >
                Try a different email
              </Button>

              <Link
                to={PAGE_ROOT.signIn.absolutePath}
                className={clsx(
                  typography.regular14,
                  "flex items-center justify-center gap-2 text-secondary-400 hover:text-foreground transition-colors",
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </AuthPage>
    );
  }

  // ─── Form state ───────────────────────────────────────────────────────────────
  return (
    <AuthPage title="Forgot Password">
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
            <h1 className={typography.semibold24}>Forgot password?</h1>
            <p
              className={clsx(
                typography.regular14,
                "text-secondary-400 dark:text-secondary-300",
              )}
            >
              No worries — enter your email and we'll send you a reset link.
            </p>
          </div>

          {/* Form */}
          <div className="w-full flex flex-col gap-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="txtEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={clsx(typography.regular12)}>
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 rounded-[10px] text-base font-medium"
                  disabled={forgotMutation.isPending}
                >
                  {forgotMutation.isPending ? (
                    <ButtonLoader text="Sending reset link..." />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </Form>

            {/* Back link */}
            <Link
              to={PAGE_ROOT.signIn.absolutePath}
              className={clsx(
                typography.regular14,
                "flex items-center justify-center gap-2 text-secondary-400 hover:text-foreground transition-colors",
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </AuthPage>
  );
};

export default ForgotPassword;
