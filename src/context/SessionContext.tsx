/* Imports */
import React, { type JSX } from "react";

/* Local Imports */
import { PAGE_ROOT } from "@/routes/paths";
import {
  getAccessToken,
  getRefreshToken,
  isValidToken,
  setAccessToken,
  setRefreshToken,
  clearAuthTokens,
} from "@/utilities/auth";
import { getUserProfileRequest } from "@/services/account";
import { signOutRequest } from "@/services/auth";

// ----------------------------------------------------------------------

/* Types/Interfaces */
export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  is_active: boolean;
  last_login: string | null;
  role: {
    id: number;
    name: string;
    display_name: string;
    description: string;
  };
}

export interface ISessionState {
  isAuthenticated: boolean;
  user: IUser | null;
  isPageLoaded: boolean;
  SignInUser: (
    accessToken: string,
    refreshToken: string,
    rememberMe: boolean,
  ) => Promise<void>;
  LogoutUser: () => Promise<void>;
}

export interface ISessionProps {
  children: React.ReactNode;
}

// ----------------------------------------------------------------------

const initialState: ISessionState = {
  isAuthenticated: false,
  user: null,
  isPageLoaded: true,
  SignInUser: async () => {},
  LogoutUser: async () => {},
};

const SessionContext = React.createContext<ISessionState>(initialState);

class Session extends React.Component<ISessionProps, ISessionState> {
  constructor(props: ISessionProps) {
    super(props);

    const accessToken = getAccessToken();
    const isValid = isValidToken(accessToken as string);

    this.state = {
      isAuthenticated: Boolean(accessToken && isValid),
      user: null,
      isPageLoaded: true,

      SignInUser: async (
        accessToken: string,
        refreshToken: string,
        rememberMe: boolean,
      ) => {
        setAccessToken(accessToken, rememberMe);
        setRefreshToken(refreshToken, rememberMe);

        this.setState((prev) => ({
          ...prev,
          isAuthenticated: true,
        }));

        await this.fetchUserProfile();
      },

      LogoutUser: async () => {
        const refreshToken = getRefreshToken();

        // Best-effort API call — clear tokens regardless of outcome
        if (refreshToken) {
          try {
            await signOutRequest({ refreshToken });
          } catch {
            // Silent — tokens are cleared client-side either way
          }
        }

        clearAuthTokens();

        this.setState((prev) => ({
          ...prev,
          isAuthenticated: false,
          user: null,
        }));

        window.location.href = PAGE_ROOT.signIn.absolutePath;
      },
    };

    this.fetchUserProfile = this.fetchUserProfile.bind(this);
  }

  componentDidMount(): void {
    const accessToken = getAccessToken();
    if (accessToken && isValidToken(accessToken)) {
      this.fetchUserProfile();
    } else {
      // No valid access token — but maybe silent refresh will handle it
      // Just unblock the page
      this.setState((prev) => ({ ...prev, isPageLoaded: false }));
    }
  }

  async fetchUserProfile(): Promise<void> {
    try {
      const response: any = await getUserProfileRequest();
      if (response?.status?.response_code === 200 && response?.data) {
        this.setState((prev) => ({
          ...prev,
          user: response.data,
          isAuthenticated: true,
          isPageLoaded: false,
        }));
      } else {
        this.handleAuthFailure();
      }
    } catch {
      this.handleAuthFailure();
    }
  }

  handleAuthFailure(): void {
    clearAuthTokens();
    this.setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      user: null,
      isPageLoaded: false,
    }));
  }

  render(): JSX.Element {
    return (
      <SessionContext.Provider value={this.state}>
        {/* Render children only after page load resolves */}
        {!this.state.isPageLoaded && this.props.children}
      </SessionContext.Provider>
    );
  }
}

export default SessionContext;
export const SessionProvider = Session;
export const SessionConsumer = SessionContext.Consumer;
