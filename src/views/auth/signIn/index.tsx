/* Imports */
import { useContext, type JSX } from "react";
import clsx from "clsx";

/* Local Imports */
import { typography } from "@/theme/typography";
import AuthPage from "@/components/page/auth";
import SessionContext from "@/context/SessionContext";
import SignInForm from "./components/SignInForm";
import AppLogoDark from "@/assets/images/meetFlowDarkLogo.png";
import AppLogoLight from "@/assets/images/meetFlowLightLogo.png";

// ----------------------------------------------------------------------

/**
 * Sign In page — passes both tokens to SessionContext on success.
 *
 * @component
 */
const SignIn = (): JSX.Element => {
  const { SignInUser } = useContext(SessionContext);

  const handleSignIn = (
    accessToken: string,
    refreshToken: string,
    rememberMe: boolean,
  ): void => {
    SignInUser(accessToken, refreshToken, rememberMe);
  };

  return (
    <AuthPage title="Sign In">
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
            <h1 className={typography.semibold24}>Hi, Welcome back 👋</h1>
            <p
              className={clsx(
                typography.regular14,
                "text-secondary-400 dark:text-secondary-300",
              )}
            >
              Please sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <div className="w-full flex flex-col gap-4">
            <SignInForm onSubmitSuccess={handleSignIn} />
          </div>
        </div>
      </div>
    </AuthPage>
  );
};

export default SignIn;
