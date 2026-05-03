/**
 * hooks/useMeetingTimer.ts
 *
 * Simple elapsed-time counter that starts when the hook mounts.
 * Returns a formatted HH:MM:SS / MM:SS string.
 */

import { useState, useEffect } from "react";

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function useMeetingTimer(): { elapsed: number; formatted: string } {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return { elapsed, formatted: formatElapsed(elapsed) };
}
