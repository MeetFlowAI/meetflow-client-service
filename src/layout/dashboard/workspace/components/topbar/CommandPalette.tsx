/**
 * layout/dashboard/workspace/components/topbar/CommandPalette.tsx
 *
 * Global command palette (⌘K) powered by cmdk.
 * Data sources — all from React Query cache, zero extra network calls:
 *   • Channels  → queryKey: ["channels", workspaceId]
 *   • Members   → queryKey: ["workspace-members", workspaceId]
 *
 * Quick actions are static — navigate to key sections instantly.
 *
 * Usage:
 *   <CommandPalette open={open} onClose={() => setOpen(false)} />
 */

import React, { useContext, useCallback, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Hash,
  Lock,
  MessageCircle,
  Users,
  Home,
  User,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import { useWorkspace } from "@/context/WorkspaceContext";
import SessionContext from "@/context/SessionContext";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";

// ----------------------------------------------------------------------

// Avatar colours — deterministic by id
const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-emerald-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

// ----------------------------------------------------------------------

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
}): JSX.Element => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { selectedWorkspaceId } = useWorkspace();
  const { user } = useContext(SessionContext);

  // ── Pull data straight from React Query cache ────────────────────────
  // These queries are already live in ChannelsPanel / ChatsPanel /
  // MembersPanel — so this is a zero-cost read, no fetch triggered.
  const channelsCache = qc.getQueryData<{
    publicChannels: { id: number; name: string; description?: string | null }[];
    privateChannels: {
      id: number;
      name: string;
      description?: string | null;
    }[];
  }>(["channels", selectedWorkspaceId]);

  const membersCache = qc.getQueryData<any[]>([
    "workspace-members",
    selectedWorkspaceId,
  ]);

  const publicChannels = channelsCache?.publicChannels ?? [];
  const privateChannels = channelsCache?.privateChannels ?? [];
  const members = (membersCache ?? []).filter(
    (m: any) => m.member?.id !== user?.id,
  );

  // ── Navigation helpers ───────────────────────────────────────────────
  const go = useCallback(
    (path: string) => {
      navigate(path);
      onClose();
    },
    [navigate, onClose],
  );

  const goToChannel = (id: number) =>
    go(
      PAGE_WORKSPACE_DASHBOARD.channels.view.absolutePath.replace(
        ":id",
        String(id),
      ),
    );

  const goToChat = (memberId: number) =>
    go(
      PAGE_WORKSPACE_DASHBOARD.chats.view.absolutePath.replace(
        ":id",
        String(memberId),
      ),
    );

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <CommandDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <CommandInput placeholder="Search channels, people, or jump to..." />

      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="h-10 w-10 rounded-xl bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center mb-3">
              <Hash className="h-5 w-5 text-secondary-400 dark:text-secondary-500" />
            </div>
            <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
              No results found
            </p>
            <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
              Try searching for a channel or person
            </p>
          </div>
        </CommandEmpty>

        {/* ── Quick actions ──────────────────────────────────────── */}
        <CommandGroup heading="Quick actions">
          <CommandItem
            onSelect={() => go(PAGE_WORKSPACE_DASHBOARD.home.absolutePath)}
            className="gap-2.5"
          >
            <div className="h-6 w-6 rounded-md bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center shrink-0">
              <Home className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
            </div>
            <span>Go to Home</span>
            <ArrowRight className="ml-auto h-3.5 w-3.5 text-secondary-400 dark:text-secondary-500" />
          </CommandItem>

          <CommandItem
            onSelect={() => go(PAGE_WORKSPACE_DASHBOARD.channels.absolutePath)}
            className="gap-2.5"
          >
            <div className="h-6 w-6 rounded-md bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
              <Hash className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            </div>
            <span>Browse Channels</span>
            <ArrowRight className="ml-auto h-3.5 w-3.5 text-secondary-400 dark:text-secondary-500" />
          </CommandItem>

          <CommandItem
            onSelect={() => go(PAGE_WORKSPACE_DASHBOARD.chats.absolutePath)}
            className="gap-2.5"
          >
            <div className="h-6 w-6 rounded-md bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
              <MessageCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span>Direct Messages</span>
            <ArrowRight className="ml-auto h-3.5 w-3.5 text-secondary-400 dark:text-secondary-500" />
          </CommandItem>

          <CommandItem
            onSelect={() => go(PAGE_WORKSPACE_DASHBOARD.members.absolutePath)}
            className="gap-2.5"
          >
            <div className="h-6 w-6 rounded-md bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span>Members</span>
            <ArrowRight className="ml-auto h-3.5 w-3.5 text-secondary-400 dark:text-secondary-500" />
          </CommandItem>
        </CommandGroup>

        {/* ── Public channels ────────────────────────────────────── */}
        {publicChannels.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Public channels">
              {publicChannels.map((ch) => (
                <CommandItem
                  key={`pub-${ch.id}`}
                  value={`channel public ${ch.name} ${ch.description ?? ""}`}
                  onSelect={() => goToChannel(ch.id)}
                  className="gap-2.5"
                >
                  <div className="h-6 w-6 rounded-md bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center shrink-0">
                    <Hash className="h-3.5 w-3.5 text-secondary-500 dark:text-secondary-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {ch.name}
                    </span>
                    {ch.description && (
                      <span className="text-xs text-secondary-400 dark:text-secondary-500 truncate">
                        {ch.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* ── Private channels ───────────────────────────────────── */}
        {privateChannels.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Private channels">
              {privateChannels.map((ch) => (
                <CommandItem
                  key={`priv-${ch.id}`}
                  value={`channel private ${ch.name} ${ch.description ?? ""}`}
                  onSelect={() => goToChannel(ch.id)}
                  className="gap-2.5"
                >
                  <div className="h-6 w-6 rounded-md bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center shrink-0">
                    <Lock className="h-3.5 w-3.5 text-secondary-500 dark:text-secondary-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {ch.name}
                    </span>
                    {ch.description && (
                      <span className="text-xs text-secondary-400 dark:text-secondary-500 truncate">
                        {ch.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* ── People / DMs ───────────────────────────────────────── */}
        {members.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="People">
              {members.map((m: any) => {
                const member = m.member;
                const id: number = member?.id;
                const firstName: string = member?.first_name ?? "";
                const lastName: string = member?.last_name ?? "";
                const fullName = `${firstName} ${lastName}`.trim() || "Unknown";
                const initials =
                  `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
                const email: string = member?.email ?? "";

                return (
                  <CommandItem
                    key={`member-${id}`}
                    value={`member person ${fullName} ${email}`}
                    onSelect={() => goToChat(id)}
                    className="gap-2.5"
                  >
                    {/* Avatar */}
                    <div
                      className={clsx(
                        "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                        "text-white text-[9px] font-semibold",
                        avatarColor(id),
                      )}
                    >
                      {initials || <User className="h-3 w-3" />}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">
                        {fullName}
                      </span>
                      {email && (
                        <span className="text-xs text-secondary-400 dark:text-secondary-500 truncate">
                          {email}
                        </span>
                      )}
                    </div>

                    <span className="ml-auto text-[10px] text-secondary-400 dark:text-secondary-500 shrink-0">
                      Message
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}

        {/* ── Hint footer ────────────────────────────────────────── */}
        <div className="border-t border-secondary-100 dark:border-secondary-800 px-3 py-2 flex items-center gap-3">
          <span className="text-[10px] text-secondary-400 dark:text-secondary-500 flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center h-4 px-1 rounded bg-secondary-100 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-[10px]">
              ↑↓
            </kbd>
            navigate
          </span>
          <span className="text-[10px] text-secondary-400 dark:text-secondary-500 flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center h-4 px-1.5 rounded bg-secondary-100 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-[10px]">
              ↵
            </kbd>
            select
          </span>
          <span className="text-[10px] text-secondary-400 dark:text-secondary-500 flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center h-4 px-1.5 rounded bg-secondary-100 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-[10px]">
              esc
            </kbd>
            close
          </span>
        </div>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
