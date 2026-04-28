/**
 * hooks/usePolls.ts
 *
 * In-meeting polls via LiveKit data channel "mf-polls".
 *
 * DIFFERENTIATOR FEATURE
 *
 * Flow:
 *   Host creates poll → broadcasts to all via data channel
 *   Participants receive poll → vote → broadcast vote
 *   Everyone sees live results update in real-time
 *
 * Data channel message shapes:
 *   { type: "poll-create", poll: Poll }
 *   { type: "poll-vote",   pollId, optionId, voterIdentity }
 *   { type: "poll-end",    pollId }
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useDataChannel, useLocalParticipant } from "@livekit/components-react";
import type { ReceivedDataMessage } from "@livekit/components-core";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // array of voter identities
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: number;
  ended: boolean;
}

export interface UsePollsReturn {
  activePoll: Poll | null;
  myVote: string | null; // optionId
  createPoll: (question: string, options: string[]) => void;
  vote: (optionId: string) => void;
  endPoll: () => void;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function usePolls(): UsePollsReturn {
  const { localParticipant } = useLocalParticipant();
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [myVote, setMyVote] = useState<string | null>(null);

  // Store send ref to avoid stale closures
  const sendRef = useRef<
    ((payload: Uint8Array, options: { reliable: boolean }) => Promise<void>) | null
  >(null);

  const onPollMessage = useCallback(
    (msg: ReceivedDataMessage<"mf-polls">) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(msg.payload));

        if (data.type === "poll-create") {
          setActivePoll(data.poll as Poll);
          setMyVote(null);
        }

        if (data.type === "poll-vote") {
          const { pollId, optionId, voterIdentity } = data;
          setActivePoll((prev) => {
            if (!prev || prev.id !== pollId) return prev;
            return {
              ...prev,
              options: prev.options.map((opt) => {
                if (opt.id !== optionId) {
                  // Remove voter from other options (change-vote support)
                  return { ...opt, votes: opt.votes.filter((v) => v !== voterIdentity) };
                }
                if (opt.votes.includes(voterIdentity)) return opt;
                return { ...opt, votes: [...opt.votes, voterIdentity] };
              }),
            };
          });
        }

        if (data.type === "poll-end") {
          setActivePoll((prev) =>
            prev && prev.id === data.pollId ? { ...prev, ended: true } : prev,
          );
          // Auto-dismiss ended poll after 8s
          setTimeout(() => {
            setActivePoll((prev) =>
              prev?.id === data.pollId ? null : prev,
            );
          }, 8000);
        }
      } catch { /* ignore */ }
    },
    [],
  );

  const { send } = useDataChannel("mf-polls", onPollMessage);

  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  const broadcast = useCallback((payload: object) => {
    sendRef.current?.(
      new TextEncoder().encode(JSON.stringify(payload)),
      { reliable: true },
    ).catch(() => {});
  }, []);

  const createPoll = useCallback(
    (question: string, options: string[]) => {
      const poll: Poll = {
        id: crypto.randomUUID(),
        question,
        options: options.map((text) => ({
          id: crypto.randomUUID(),
          text,
          votes: [],
        })),
        createdBy: localParticipant.identity,
        createdAt: Date.now(),
        ended: false,
      };
      broadcast({ type: "poll-create", poll });
      // Apply locally (data channel doesn't echo)
      setActivePoll(poll);
      setMyVote(null);
    },
    [localParticipant.identity, broadcast],
  );

  const vote = useCallback(
    (optionId: string) => {
      if (!activePoll || activePoll.ended) return;
      setMyVote(optionId);
      broadcast({
        type: "poll-vote",
        pollId: activePoll.id,
        optionId,
        voterIdentity: localParticipant.identity,
      });
      // Apply locally
      setActivePoll((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          options: prev.options.map((opt) => {
            if (opt.id !== optionId) {
              return {
                ...opt,
                votes: opt.votes.filter((v) => v !== localParticipant.identity),
              };
            }
            if (opt.votes.includes(localParticipant.identity)) return opt;
            return { ...opt, votes: [...opt.votes, localParticipant.identity] };
          }),
        };
      });
    },
    [activePoll, localParticipant.identity, broadcast],
  );

  const endPoll = useCallback(() => {
    if (!activePoll) return;
    broadcast({ type: "poll-end", pollId: activePoll.id });
    setActivePoll((prev) => (prev ? { ...prev, ended: true } : null));
    setTimeout(() => setActivePoll(null), 8000);
  }, [activePoll, broadcast]);

  return { activePoll, myVote, createPoll, vote, endPoll };
}
