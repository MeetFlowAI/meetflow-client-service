/* Imports */
import { memo, type JSX, useState } from "react";

/* Relative Imports */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";

/* Local Imports */
import { SignInFormSchema, type SignInFormValues } from "@/models/auth";
import ButtonLoader from "@/components/loader/InlineLoader";
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
import { Checkbox } from "@/components/ui/checkbox";
import { typography } from "@/theme/typography";
import { useAuth } from "@/hooks/auth/useAuth";
import { Eye, EyeOff } from "lucide-react";
import { PAGE_ROOT } from "@/routes/paths";
import { Link } from "react-router-dom";

// ----------------------------------------------------------------------

export interface SignInFormProps {
  onSubmitSuccess: (
    accessToken: string,
    refreshToken: string,
    rememberMe: boolean,
  ) => void;
}

// ----------------------------------------------------------------------

/**
 * Sign In form — validates credentials and passes both tokens up on success.
 *
 * @component
 */
const SignInForm = ({ onSubmitSuccess }: SignInFormProps): JSX.Element => {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: { txtEmail: "", txtPassword: "", chkRememberMe: false },
  });

  const { signInMutation } = useAuth();

  const handleFormSubmit = async (values: SignInFormValues): Promise<void> => {
    const response = await signInMutation.mutateAsync({
      email: values.txtEmail,
      password: values.txtPassword,
      rememberMe: values.chkRememberMe,
    });

    console.log("response of auth", response);

    const { accessToken, refreshToken } = response?.data ?? {};
    if (accessToken && refreshToken) {
      onSubmitSuccess(accessToken, refreshToken, values.chkRememberMe);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          {/* Email */}
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

          {/* Password */}
          <FormField
            control={form.control}
            name="txtPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={clsx(typography.regular12)}>
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      tabIndex={-1}
                    >
                      {showPassword ? (
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

          {/* Remember Me + Forgot Password row */}
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="chkRememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-0 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel
                    className={clsx(
                      typography.regular14,
                      "text-secondary-400 dark:text-secondary-300 cursor-pointer",
                    )}
                  >
                    Remember me
                  </FormLabel>
                </FormItem>
              )}
            />
            {/* Forgot password link */}
            <div className="text-center">
              <Link
                to={PAGE_ROOT.forgotPassword.absolutePath}
                className={clsx(
                  typography.regular14,
                  "text-information-500 hover:underline transition-colors",
                )}
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 rounded-[10px] text-base font-medium"
            disabled={signInMutation.isPending}
          >
            {signInMutation.isPending ? (
              <ButtonLoader text="Signing in..." />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default memo(SignInForm);
