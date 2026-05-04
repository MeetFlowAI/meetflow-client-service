/**
 * context/StreamChatContext.tsx
 *
 * Initializes the Stream Chat client once after login and provides it
 * globally so any component can use Stream's hooks without re-connecting.
 *
 * Usage:
 *   const { client, isReady } = useStreamChat();
 *
 * Wrap your WorkspaceDashboardLayout (or App root after auth) with
 * <StreamChatProvider>.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useContext as useCtx,
  type JSX,
} from "react";
import { StreamChat, type StreamChat as StreamChatType } from "stream-chat";
import SessionContext from "@/context/SessionContext";
import { getStreamTokenRequest } from "@/services/workspace-dashboard/chats";

// ----------------------------------------------------------------------

interface IStreamChatState {
  client: StreamChatType | null;
  isReady: boolean;
  error: string | null;
  streamUserId: string | null;
}

const initialState: IStreamChatState = {
  client: null,
  isReady: false,
  error: null,
  streamUserId: null,
};

const StreamChatContext = createContext<IStreamChatState>(initialState);

// ----------------------------------------------------------------------

export const StreamChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}): JSX.Element => {
  const { user, isAuthenticated } = useCtx(SessionContext);
  const [state, setState] = useState<IStreamChatState>(initialState);
  const clientRef = useRef<StreamChatType | null>(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    // Only connect when we have an authenticated org user
    if (!isAuthenticated || !user?.id) return;

    let cancelled = false;

    const connect = async () => {
      try {
        // 1. Fetch token + api key from our backend
        const { token, stream_api_key, user_id } =
          await getStreamTokenRequest();

        if (cancelled) return;

        // 2. Init the Stream client (singleton pattern)
        const streamClient = StreamChat.getInstance(stream_api_key);
        clientRef.current = streamClient;

        // 3. Connect the user (idempotent — safe to call multiple times)
        if (!connectedRef.current) {
          await streamClient.connectUser(
            {
              id: user_id,
              name: `${user.first_name} ${user.last_name}`.trim(),
            },
            token,
          );
          connectedRef.current = true;
        }

        if (!cancelled) {
          setState({
            client: streamClient,
            isReady: true,
            error: null,
            streamUserId: user_id,
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Stream Chat connection failed:", err.message);
          setState({
            client: null,
            isReady: false,
            error: err.message,
            streamUserId: null,
          });
        }
      }
    };

    connect();

    return () => {
      cancelled = true;
      // Disconnect on logout / unmount
      if (clientRef.current && connectedRef.current) {
        clientRef.current.disconnectUser().catch(() => {});
        connectedRef.current = false;
      }
    };
  }, [isAuthenticated, user?.id]);

  return (
    <StreamChatContext.Provider value={state}>
      {children}
    </StreamChatContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStreamChat = () => useContext(StreamChatContext);
export default StreamChatContext;
