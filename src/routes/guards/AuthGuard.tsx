/* Imports */
import { useContext, type JSX } from "react";

/* Relative Imports */
import { Navigate, useLocation } from "react-router-dom";

/* Local Imports */
import { PAGE_ROOT } from "../paths";
import SessionContext from "@/context/SessionContext";

// ----------------------------------------------------------------------

/* Types/Interfaces */
/**
 * Interface used to create component to define protection layout for pages, which are not accessible without sign in.
 *
 * @interface AuthGuardProps
 * @property {node} children - contains the child components.
 */
export interface AuthGuardProps {
  children: React.ReactElement;
}

// ----------------------------------------------------------------------

/**
 * Component to define protection layout for pages, which are not accessible without sign in.
 *
 * @component
 * @param {node} children - contains the child components
 * @returns {JSX.Element}
 */

const AuthGuard: React.FC<AuthGuardProps> = ({ children }): JSX.Element => {
  /* Hooks */
  const { isAuthenticated } = useContext(SessionContext);
  const location = useLocation();
  console.log("inside auth guard", isAuthenticated);

  /* Output */
  if (!isAuthenticated) {
    return (
      <Navigate
        to={`${PAGE_ROOT.signIn.absolutePath}?returnurl=${encodeURIComponent(
          location.pathname,
        )}`}
        replace
      />
    );
  }

  return children;
};

export default AuthGuard;
