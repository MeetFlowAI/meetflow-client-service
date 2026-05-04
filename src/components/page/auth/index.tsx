/* Imports */
import usePageTitle from "@/hooks/usePageTitle";
import React, { forwardRef, memo, type JSX } from "react";

/* Relative Imports */

// ----------------------------------------------------------------------
export interface AuthPageProps {
  title?: string;
  children?: React.ReactNode;
}

// ----------------------------------------------------------------------

/**
 * Component to display title, Layout for Auth.
 *
 * @component
 * @param {string} title - contains page title in tab bar.
 * @param {node} children - contains data or component.
 * @returns {JSX.Element}
 */

const AuthPage = forwardRef<HTMLDivElement, AuthPageProps>(
  ({ title = "SignIn", children = <></> }, ref): JSX.Element => {
    /* Hooks */
    usePageTitle(title);

    return (
      <div className="relative w-full h-full" ref={ref}>
        {children}
      </div>
    );
  },
);

export default memo(AuthPage);
