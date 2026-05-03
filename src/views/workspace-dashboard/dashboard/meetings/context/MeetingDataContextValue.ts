import { createContext } from "react";
import type { MeetingDataContextValue } from "./MeetingDataContext";

export const MeetingDataContext = createContext<MeetingDataContextValue | null>(
  null,
);
