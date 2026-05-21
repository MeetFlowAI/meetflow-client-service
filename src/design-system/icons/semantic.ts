/* ============================================================
   MeetFlow V2 — Semantic Icon Registry

   WHAT THIS IS:
     ~40 high-frequency icons given product-semantic names.
     These are the icons that appear constantly throughout the
     product and warrant a stable, named contract.

   WHAT THIS IS NOT:
     A wrapper around all 3000+ Lucide icons. That would
     break tree-shaking and add maintenance overhead with
     no meaningful benefit.

   WHEN TO USE THIS vs DIRECT LUCIDE IMPORT:

     ✅ Use Icons.* (from this file):
        - The icon appears in 3+ places across feature modules
        - The icon has a clear product-semantic role
        - App Components should use Icons.* internally

     ✅ Direct Lucide import (acceptable):
        - A one-off, contextually specific icon
        - An icon not in this registry
        - import { Zap } from "lucide-react";

     ✅ Custom product icons (always from design-system):
        - MeetingRoomIcon, ChannelIcon, WorkspaceIcon, etc.
        - import { MeetingRoomIcon } from "@/design-system/icons";

   TREE-SHAKING:
     Named imports from lucide-react are individually tree-shaken.
     Re-exporting them here does NOT bundle unused icons — bundlers
     follow the import chain and only include what is actually used.

   ADDING A NEW ICON:
     1. Verify it appears (or will appear) in 3+ feature locations
     2. Add an import and a semantic name below
     3. Update design-system/icons/index.ts exports
     4. Document the semantic name in ARCHITECTURE.md icon table
   ============================================================ */

import {
  // Navigation & Layout
  Search,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Menu,
  SidebarOpen,
  LayoutDashboard,

  // Core Actions
  Plus,
  X,
  Check,
  Pencil,
  Trash2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Link,
  Share2,
  MoreHorizontal,
  MoreVertical,
  Filter,
  ArrowUpDown,
  FileDown,

  // Feedback & Status
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  Loader2,
  AlertTriangle,

  // Entities — MeetFlow domain
  Building2,
  Users,
  User,
  UserPlus,
  CreditCard,
  BarChart2,
  Calendar,
  Clock,
  Mail,
  Globe,
  Zap,
  Star,
  Tag,
  Bell,
  Settings,
  LogOut,
  HelpCircle,
  Shield,
  Lock,
  Eye,
  EyeOff,
  FileText,
  Image,
  Folder,
} from "lucide-react";

// ── The semantic registry ─────────────────────────────────────────────────────
// LHS: semantic product name
// RHS: Lucide component
//
// Naming philosophy:
//   - Use the ROLE, not the icon shape
//   - "add" not "plus", "delete" not "trash", "back" not "arrowLeft"
//   - Entity names match domain vocabulary: "organization" not "building"

export const Icons = {
  // ── Navigation ─────────────────────────────────────────────────────────
  search: Search,
  back: ArrowLeft,
  forward: ArrowRight,
  up: ArrowUp,
  down: ArrowDown,
  expand: ChevronDown,
  collapse: ChevronUp,
  next: ChevronRight,
  previous: ChevronLeft,
  menu: Menu,
  sidebar: SidebarOpen,
  dashboard: LayoutDashboard,

  // ── Actions ────────────────────────────────────────────────────────────
  add: Plus,
  close: X,
  confirm: Check,
  edit: Pencil,
  delete: Trash2,
  copy: Copy,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  external: ExternalLink,
  link: Link,
  share: Share2,
  moreActions: MoreHorizontal,
  moreActionsV: MoreVertical,
  filter: Filter,
  sort: ArrowUpDown,
  export: FileDown,

  // ── Status & Feedback ──────────────────────────────────────────────────
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
  info: Info,
  loading: Loader2,
  caution: AlertTriangle,

  // ── Domain Entities ────────────────────────────────────────────────────
  organization: Building2,
  members: Users,
  user: User,
  inviteUser: UserPlus,
  billing: CreditCard,
  analytics: BarChart2,
  calendar: Calendar,
  time: Clock,
  email: Mail,
  globe: Globe,
  upgrade: Zap,
  favorite: Star,
  tag: Tag,
  notifications: Bell,
  settings: Settings,
  signOut: LogOut,
  help: HelpCircle,
  security: Shield,
  lock: Lock,
  show: Eye,
  hide: EyeOff,
  document: FileText,
  image: Image,
  folder: Folder,
} as const;

export type IconName = keyof typeof Icons;
export type IconComponent = (typeof Icons)[IconName];
