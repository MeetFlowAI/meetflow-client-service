import { useContext } from "react";
import { MeetingDataContext } from "./MeetingDataContextValue";
import type { MeetingDataContextValue } from "./MeetingDataContext";

export function useMeetingData(): MeetingDataContextValue {
  const ctx = useContext(MeetingDataContext);
  if (!ctx)
    throw new Error("useMeetingData must be used inside MeetingDataProvider");
  return ctx;
}
