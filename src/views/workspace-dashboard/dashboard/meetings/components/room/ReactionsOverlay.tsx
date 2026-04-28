/**
 * components/room/ReactionsOverlay.tsx
 *
 * Renders floating emoji reactions over the video area.
 * Each reaction floats upward with a fade-out animation, then is removed from state.
 *
 * Reactions arrive via MeetingDataContext (already decoded + timestamped).
 * This component is purely presentational — zero side effects.
 */

import React, { type JSX } from "react";
import { useMeetingData } from "../../context/MeetingDataContext";

// Keyframes injected once into the document via a style tag.
// Using dangerouslySetInnerHTML is safe here since the content is static.
const KEYFRAMES_CSS = `
@keyframes mf-float-up {
  0%   { transform: translateY(0) scale(1);    opacity: 1; }
  60%  { transform: translateY(-140px) scale(1.25); opacity: 1; }
  100% { transform: translateY(-220px) scale(1.1);  opacity: 0; }
}
`;

const ReactionsOverlay: React.FC = (): JSX.Element => {
  const { reactions } = useMeetingData();

  return (
    <>
      {/* Inject keyframes once */}
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES_CSS }} />

      {/* Reaction emojis */}
      {reactions.map((reaction) => (
        <div
          key={reaction.id}
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "80px",
            left: `${reaction.x}%`,
            fontSize: "2rem",
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 20,
            animation: `mf-float-up 3.2s ease-out forwards`,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
          }}
        >
          {reaction.emoji}
        </div>
      ))}
    </>
  );
};

export default ReactionsOverlay;
