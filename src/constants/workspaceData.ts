// ----------------------------------------------------------------------
// Workspace Dashboard — Static / Dummy Data
// Replace with real API responses once backend is ready
// ----------------------------------------------------------------------

export interface IChannel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  unreadCount?: number;
  isPrivate?: boolean;
  lastActivity?: string;
}

export interface IDirectMessage {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
  isOnline: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface IMeeting {
  id: string;
  title: string;
  scheduledAt: string;
  duration: string;
  participants: number;
  status: "upcoming" | "live" | "ended";
}

export interface ITask {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in-progress" | "done";
}

export interface IRecentActivity {
  id: string;
  type: "message" | "meeting" | "task" | "channel";
  text: string;
  time: string;
  user: string;
}

export interface IChatMessage {
  id: string;
  user: string;
  initials: string;
  avatarColor: string;
  text: string;
  time: string;
}

// ----------------------------------------------------------------------

export const WORKSPACE_DUMMY_CHANNELS: IChannel[] = [
  {
    id: "ch-1",
    name: "general",
    description: "Company-wide announcements and updates",
    memberCount: 128,
    unreadCount: 5,
    isPrivate: false,
    lastActivity: "2 min ago",
  },
  {
    id: "ch-2",
    name: "product-roadmap",
    description: "Upcoming features and product direction",
    memberCount: 34,
    unreadCount: 12,
    isPrivate: false,
    lastActivity: "15 min ago",
  },
  {
    id: "ch-3",
    name: "design-system",
    description: "UI/UX components, tokens, and design decisions",
    memberCount: 18,
    unreadCount: 0,
    isPrivate: false,
    lastActivity: "1 hour ago",
  },
  {
    id: "ch-4",
    name: "engineering",
    description: "Technical discussions, PRs, and architecture",
    memberCount: 42,
    unreadCount: 3,
    isPrivate: false,
    lastActivity: "30 min ago",
  },
  {
    id: "ch-5",
    name: "marketing-ops",
    description: "Campaigns, launches, and growth initiatives",
    memberCount: 21,
    isPrivate: true,
    lastActivity: "3 hours ago",
  },
  {
    id: "ch-6",
    name: "random",
    description: "Off-topic conversations and fun stuff",
    memberCount: 116,
    unreadCount: 28,
    isPrivate: false,
    lastActivity: "5 min ago",
  },
];

export const WORKSPACE_DUMMY_DMS: IDirectMessage[] = [
  {
    id: "dm-1",
    name: "Sarah Chen",
    role: "Product Manager",
    initials: "SC",
    avatarColor: "bg-violet-500",
    isOnline: true,
    lastMessage: "Can you review the updated specs?",
    lastMessageTime: "2m",
    unreadCount: 2,
  },
  {
    id: "dm-2",
    name: "James Okafor",
    role: "Senior Engineer",
    initials: "JO",
    avatarColor: "bg-emerald-500",
    isOnline: true,
    lastMessage: "The PR is ready for review",
    lastMessageTime: "18m",
    unreadCount: 0,
  },
  {
    id: "dm-3",
    name: "Priya Nair",
    role: "UX Designer",
    initials: "PN",
    avatarColor: "bg-pink-500",
    isOnline: false,
    lastMessage: "Figma file updated 🎨",
    lastMessageTime: "1h",
    unreadCount: 1,
  },
  {
    id: "dm-4",
    name: "Marcus Leblanc",
    role: "DevOps",
    initials: "ML",
    avatarColor: "bg-amber-500",
    isOnline: true,
    lastMessage: "Deploy pipeline is green ✅",
    lastMessageTime: "3h",
    unreadCount: 0,
  },
  {
    id: "dm-5",
    name: "Aisha Patel",
    role: "Data Analyst",
    initials: "AP",
    avatarColor: "bg-cyan-500",
    isOnline: false,
    lastMessage: "Q2 report is attached",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
  },
];

export const WORKSPACE_DUMMY_MEETINGS: IMeeting[] = [
  {
    id: "meet-1",
    title: "Product Sprint Review",
    scheduledAt: "Today, 2:00 PM",
    duration: "1h",
    participants: 8,
    status: "upcoming",
  },
  {
    id: "meet-2",
    title: "Design System Sync",
    scheduledAt: "Today, 4:30 PM",
    duration: "30m",
    participants: 5,
    status: "upcoming",
  },
  {
    id: "meet-3",
    title: "Engineering All-Hands",
    scheduledAt: "Now",
    duration: "1h",
    participants: 42,
    status: "live",
  },
  {
    id: "meet-4",
    title: "Stakeholder Update",
    scheduledAt: "Yesterday, 10:00 AM",
    duration: "45m",
    participants: 12,
    status: "ended",
  },
];

export const WORKSPACE_DUMMY_TASKS: ITask[] = [
  {
    id: "task-1",
    title: "Finalize onboarding flow wireframes",
    assignee: "Priya Nair",
    dueDate: "Today",
    priority: "high",
    status: "in-progress",
  },
  {
    id: "task-2",
    title: "Migrate auth service to new SDK",
    assignee: "James Okafor",
    dueDate: "Tomorrow",
    priority: "high",
    status: "todo",
  },
  {
    id: "task-3",
    title: "Update release notes for v2.4",
    assignee: "Sarah Chen",
    dueDate: "Apr 12",
    priority: "medium",
    status: "todo",
  },
  {
    id: "task-4",
    title: "Fix dashboard loading state bug",
    assignee: "Marcus Leblanc",
    dueDate: "Apr 10",
    priority: "high",
    status: "done",
  },
  {
    id: "task-5",
    title: "Review Q2 analytics report",
    assignee: "Aisha Patel",
    dueDate: "Apr 15",
    priority: "low",
    status: "in-progress",
  },
];

export const WORKSPACE_DUMMY_ACTIVITY: IRecentActivity[] = [
  { id: "act-1", type: "message", text: "Posted in #general", time: "2 min ago", user: "Sarah Chen" },
  { id: "act-2", type: "meeting", text: "Engineering All-Hands is live", time: "5 min ago", user: "Marcus Leblanc" },
  { id: "act-3", type: "task", text: "Completed: Fix dashboard bug", time: "30 min ago", user: "Marcus Leblanc" },
  { id: "act-4", type: "channel", text: "You were added to #product-roadmap", time: "1 hour ago", user: "James Okafor" },
  { id: "act-5", type: "message", text: "Mentioned you in #design-system", time: "2 hours ago", user: "Priya Nair" },
];

export const WORKSPACE_DUMMY_CHANNEL_MESSAGES: Record<string, IChatMessage[]> = {
  "ch-1": [
    { id: "m1", user: "Sarah Chen", initials: "SC", avatarColor: "bg-violet-500", text: "Hey everyone! Excited to announce we're shipping v2.4 next week 🚀", time: "2:14 PM" },
    { id: "m2", user: "James Okafor", initials: "JO", avatarColor: "bg-emerald-500", text: "Great news! The infra changes are all in. We're good to go.", time: "2:16 PM" },
    { id: "m3", user: "Priya Nair", initials: "PN", avatarColor: "bg-pink-500", text: "Design handoff is done — all assets are in the shared Figma 🎨", time: "2:19 PM" },
    { id: "m4", user: "Aisha Patel", initials: "AP", avatarColor: "bg-cyan-500", text: "I will prep the analytics tracking setup before EOD.", time: "2:22 PM" },
  ],
  "ch-2": [
    { id: "m1", user: "Sarah Chen", initials: "SC", avatarColor: "bg-violet-500", text: "Q3 roadmap draft is up for review — feedback welcome!", time: "11:00 AM" },
    { id: "m2", user: "Marcus Leblanc", initials: "ML", avatarColor: "bg-amber-500", text: "Left some comments on the infra items.", time: "11:15 AM" },
  ],
  "ch-3": [
    { id: "m1", user: "Priya Nair", initials: "PN", avatarColor: "bg-pink-500", text: "New button variants are live in Storybook. Please review!", time: "9:30 AM" },
    { id: "m2", user: "James Okafor", initials: "JO", avatarColor: "bg-emerald-500", text: "Looks great! The spacing is much more consistent now.", time: "9:45 AM" },
  ],
};

export const WORKSPACE_DUMMY_DM_MESSAGES: IChatMessage[] = [
  { id: "dm1", user: "them", initials: "SC", avatarColor: "bg-violet-500", text: "Hey! Got a minute to review the latest designs?", time: "10:02 AM" },
  { id: "dm2", user: "me", initials: "ME", avatarColor: "bg-primary-500", text: "Sure! Share the link and I will take a look.", time: "10:04 AM" },
  { id: "dm3", user: "them", initials: "SC", avatarColor: "bg-violet-500", text: "Thanks! Here is the Figma file — let me know what you think.", time: "10:05 AM" },
  { id: "dm4", user: "me", initials: "ME", avatarColor: "bg-primary-500", text: "Looking good overall! Left a few comments on the nav section.", time: "10:12 AM" },
  { id: "dm5", user: "them", initials: "SC", avatarColor: "bg-violet-500", text: "Perfect, will address those before EOD 🙌", time: "10:14 AM" },
];

export const WORKSPACE_DUMMY_INFO = {
  name: "MeetFlow HQ",
  plan: "Pro",
  memberCount: 148,
  initials: "MF",
};

export const WORKSPACE_OTHER_WORKSPACES = [
  { id: "ws-2", name: "Design Studio", initials: "DS", color: "bg-emerald-500" },
  { id: "ws-3", name: "Dev Ops", initials: "DO", color: "bg-amber-500" },
];
