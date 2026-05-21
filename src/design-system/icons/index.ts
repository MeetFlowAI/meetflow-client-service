// ── Core icon wrapper ─────────────────────────────────────────────────────────
export { AppIcon } from "./AppIcon";
export type { AppIconProps, IconSize } from "./AppIcon";

// ── Semantic icon registry ────────────────────────────────────────────────────
// Import Icons.* for high-frequency, product-semantic icon usage.
// Direct lucide-react imports remain acceptable for contextual one-offs.
export { Icons } from "./semantic";
export type { IconName, IconComponent } from "./semantic";

// ── Product-specific custom icons ─────────────────────────────────────────────
export {
  MeetingRoomIcon,
  WorkspaceIcon,
  RecordingIcon,
  ChannelIcon,
  ScreenShareIcon,
} from "./custom";
