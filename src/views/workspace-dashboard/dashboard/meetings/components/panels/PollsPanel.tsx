/**
 * components/panels/PollsPanel.tsx
 *
 * In-meeting polls panel — create polls (host), vote, see live results.
 *
 * DIFFERENTIATOR FEATURE
 *
 * Layout:
 *   - Active poll: question + options with live % bars + vote button
 *   - Host: "Create poll" form + "End poll" button
 *   - Ended state: final results shown for 8s then auto-close
 */

import React, { useState, type JSX } from "react";
import { BarChart2, Plus, X, Check } from "lucide-react";
import clsx from "clsx";
import PanelHeader from "../shared/PanelHeader";
import type { Poll } from "../../hooks/usePolls";

interface PollsPanelProps {
  activePoll: Poll | null;
  myVote: string | null;
  isHost: boolean;
  onVote: (optionId: string) => void;
  onCreatePoll: (question: string, options: string[]) => void;
  onEndPoll: () => void;
  onClose: () => void;
}

// ── Create form ────────────────────────────────────────────────────────────────

const CreatePollForm: React.FC<{
  onSubmit: (q: string, opts: string[]) => void;
}> = ({ onSubmit }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const setOption = (i: number, val: string) => {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? val : o)));
  };

  const addOption = () => {
    if (options.length < 6) setOptions((prev) => [...prev, ""]);
  };

  const removeOption = (i: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  };

  const valid =
    question.trim().length > 0 &&
    options.filter((o) => o.trim().length > 0).length >= 2;

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
          Question
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the group something…"
          rows={2}
          className={clsx(
            "w-full bg-white/[0.07] border border-white/[0.1] rounded-xl",
            "px-3 py-2 text-[13px] text-white placeholder:text-white/25",
            "outline-none resize-none focus:border-primary-500/50",
            "transition-colors duration-150",
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
          Options
        </label>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className={clsx(
                "flex-1 bg-white/[0.07] border border-white/[0.1] rounded-xl",
                "h-9 px-3 text-[13px] text-white placeholder:text-white/25",
                "outline-none focus:border-primary-500/50 transition-colors",
              )}
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(i)}
                className="h-7 w-7 rounded-lg bg-white/[0.05] text-white/30 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <button
            onClick={addOption}
            className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-primary-400 transition-colors py-1"
          >
            <Plus className="h-3 w-3" />
            Add option
          </button>
        )}
      </div>

      <button
        onClick={() =>
          onSubmit(
            question.trim(),
            options.filter((o) => o.trim()),
          )
        }
        disabled={!valid}
        className={clsx(
          "h-9 rounded-xl text-[13px] font-semibold transition-all",
          valid
            ? "bg-primary-500 hover:bg-primary-600 text-white"
            : "bg-white/[0.06] text-white/25 cursor-not-allowed",
        )}
      >
        Launch Poll
      </button>
    </div>
  );
};

// ── Live poll display ──────────────────────────────────────────────────────────

const LivePoll: React.FC<{
  poll: Poll;
  myVote: string | null;
  isHost: boolean;
  onVote: (id: string) => void;
  onEnd: () => void;
}> = ({ poll, myVote, isHost, onVote, onEnd }) => {
  const totalVotes = poll.options.reduce((s, o) => s + o.votes.length, 0);

  return (
    <div className="flex flex-col gap-3 p-3">
      {poll.ended && (
        <div className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold text-center uppercase tracking-wider">
          Poll ended · Final results
        </div>
      )}

      <p className="text-white text-[13px] font-semibold leading-snug">
        {poll.question}
      </p>

      <div className="flex flex-col gap-2">
        {poll.options.map((opt) => {
          const pct =
            totalVotes > 0
              ? Math.round((opt.votes.length / totalVotes) * 100)
              : 0;
          const isMyVote = myVote === opt.id;
          const hasVoted = !!myVote || poll.ended;

          return (
            <button
              key={opt.id}
              onClick={() => !hasVoted && onVote(opt.id)}
              disabled={hasVoted}
              className={clsx(
                "relative flex items-center justify-between rounded-xl px-3 py-2.5 text-left",
                "border transition-all duration-150 overflow-hidden",
                isMyVote
                  ? "border-primary-500/60 bg-primary-500/10"
                  : "border-white/[0.08] bg-white/[0.04]",
                !hasVoted && "hover:border-white/20 hover:bg-white/[0.07] cursor-pointer",
                hasVoted && "cursor-default",
              )}
            >
              {/* Progress bar */}
              {hasVoted && (
                <div
                  className="absolute inset-0 rounded-xl transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: isMyVote
                      ? "rgba(77,65,243,0.15)"
                      : "rgba(255,255,255,0.04)",
                  }}
                />
              )}

              <span className="relative text-[13px] text-white/85 z-[1]">
                {opt.text}
              </span>

              <div className="relative flex items-center gap-2 z-[1] shrink-0">
                {hasVoted && (
                  <span className="text-[11px] text-white/50 font-medium tabular-nums">
                    {pct}%
                  </span>
                )}
                {isMyVote && (
                  <div className="h-4 w-4 rounded-full bg-primary-500 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/30">
          {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        </span>
        {isHost && !poll.ended && (
          <button
            onClick={onEnd}
            className="text-[11px] text-white/35 hover:text-red-400 transition-colors"
          >
            End poll
          </button>
        )}
      </div>
    </div>
  );
};

// ── Panel ──────────────────────────────────────────────────────────────────────

const PollsPanel: React.FC<PollsPanelProps> = ({
  activePoll,
  myVote,
  isHost,
  onVote,
  onCreatePoll,
  onEndPoll,
  onClose,
}): JSX.Element => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div
      className={clsx(
        "flex flex-col w-72 shrink-0 h-full",
        "bg-[#111115] border-l border-white/[0.07]",
        "animate-in slide-in-from-right-3 duration-200",
      )}
    >
      <PanelHeader
        title="Polls"
        icon={<BarChart2 className="h-4 w-4" />}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto">
        {activePoll ? (
          <LivePoll
            poll={activePoll}
            myVote={myVote}
            isHost={isHost}
            onVote={onVote}
            onEnd={onEndPoll}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 gap-3 text-center">
            <BarChart2 className="h-8 w-8 text-white/15" />
            <p className="text-white/25 text-sm">No active poll</p>
            {isHost && !showCreate && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500/15 border border-primary-500/25 text-primary-400 text-[12px] font-medium hover:bg-primary-500/22 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Create poll
              </button>
            )}
          </div>
        )}

        {/* Host create form (inline, below active poll if none) */}
        {isHost && !activePoll && showCreate && (
          <CreatePollForm
            onSubmit={(q, opts) => {
              onCreatePoll(q, opts);
              setShowCreate(false);
            }}
          />
        )}

        {isHost && !activePoll && !showCreate && (
          <div className="px-3 pb-3">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full h-9 rounded-xl border border-dashed border-white/[0.15] text-white/30 text-[12px] hover:border-primary-500/35 hover:text-primary-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              Create poll
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollsPanel;
