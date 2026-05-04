/**
 * components/room/ConnectionQualityIndicator.tsx
 *
 * 3-bar signal strength indicator per participant tile.
 * Subscribes to ParticipantEvent.ConnectionQualityChanged to stay reactive.
 *
 * Bar colors:
 *   Excellent → all 3 bars emerald
 *   Good      → 2 bars amber
 *   Poor      → 1 bar red
 *   Lost/Unknown → all bars gray, WiFi-off icon
 */

import React, { useState, useEffect, type JSX } from "react";
import { ConnectionQuality, ParticipantEvent, type Participant } from "livekit-client";
import { WifiOff } from "lucide-react";
import clsx from "clsx";

interface ConnectionQualityIndicatorProps {
  participant: Participant;
  className?: string;
}

const ConnectionQualityIndicator: React.FC<ConnectionQualityIndicatorProps> = ({
  participant,
  className,
}): JSX.Element => {
  const [quality, setQuality] = useState<ConnectionQuality>(
    participant.connectionQuality,
  );

  useEffect(() => {
    const handleChange = (q: ConnectionQuality) => setQuality(q);
    participant.on(ParticipantEvent.ConnectionQualityChanged, handleChange);
    return () => {
      participant.off(ParticipantEvent.ConnectionQualityChanged, handleChange);
    };
  }, [participant]);

  // Unknown / Lost
  if (
    quality === ConnectionQuality.Lost ||
    quality === ConnectionQuality.Unknown
  ) {
    return (
      <div
        className={clsx("flex items-center justify-center", className)}
        title="Connection lost"
        aria-label="Connection lost"
      >
        <WifiOff className="h-3 w-3 text-red-400/80" />
      </div>
    );
  }

  const filledBars =
    quality === ConnectionQuality.Excellent
      ? 3
      : quality === ConnectionQuality.Good
        ? 2
        : 1;

  const barColor =
    filledBars === 3
      ? "bg-emerald-400"
      : filledBars === 2
        ? "bg-amber-400"
        : "bg-red-400";

  const label =
    filledBars === 3 ? "Excellent" : filledBars === 2 ? "Good" : "Poor";

  return (
    <div
      className={clsx("flex items-end gap-[2px]", className)}
      title={`Connection: ${label}`}
      aria-label={`Connection quality: ${label}`}
    >
      {[1, 2, 3].map((bar) => (
        <div
          key={bar}
          className={clsx(
            "w-[3px] rounded-full transition-colors duration-300",
            bar <= filledBars ? barColor : "bg-white/20",
          )}
          style={{ height: `${bar * 4}px` }}
        />
      ))}
    </div>
  );
};

export default ConnectionQualityIndicator;
