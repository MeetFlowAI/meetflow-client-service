/**
 * components/panels/BackgroundPanel.tsx
 *
 * Virtual background and blur settings panel.
 *
 * DIFFERENTIATOR FEATURE
 *
 * Options:
 *   - None (remove processor)
 *   - Blur (BackgroundBlurProcessor)
 *   - 4 preset image backgrounds
 *   - Custom upload (reads as data URL)
 */

import React, { useRef, type JSX, type ChangeEvent } from "react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import clsx from "clsx";
import PanelHeader from "../shared/PanelHeader";
import type { UseVirtualBackgroundReturn } from "../../hooks/useVirtualBackground";
import { PRESET_BACKGROUNDS } from "../../hooks/useVirtualBackground";

interface BackgroundPanelProps {
  hook: UseVirtualBackgroundReturn;
  onClose: () => void;
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({
  hook,
  onClose,
}): JSX.Element => {
  const {
    mode,
    isApplying,
    isSupported,
    setBlur,
    setImage,
    setNone,
    customBgUrl,
  } = hook;
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (url) setImage(url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={clsx(
        "flex flex-col w-72 shrink-0 h-full",
        "bg-[#111115] border-l border-white/[0.07]",
        "animate-in slide-in-from-right-3 duration-200",
      )}
    >
      <PanelHeader
        title="Background"
        icon={<ImageIcon className="h-4 w-4" />}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto p-3">
        {!isSupported && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400/80 text-[11px] leading-relaxed mb-3">
            Virtual backgrounds require a browser with WebAssembly and
            OffscreenCanvas support (Chrome 88+ or Edge 88+).
          </div>
        )}

        {isApplying && (
          <div className="flex items-center gap-2 text-white/40 text-[12px] mb-3">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Applying…
          </div>
        )}

        {/* None */}
        <div className="flex flex-col gap-1.5 mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
            No background
          </p>
          <button
            onClick={setNone}
            disabled={isApplying || !isSupported}
            className={clsx(
              "h-10 rounded-xl border text-[13px] font-medium transition-all",
              mode === "none"
                ? "bg-primary-500/15 border-primary-500/40 text-primary-300"
                : "bg-white/[0.05] border-white/[0.08] text-white/50 hover:bg-white/[0.09] hover:text-white",
              (isApplying || !isSupported) && "opacity-40 cursor-not-allowed",
            )}
          >
            None
          </button>
        </div>

        {/* Blur */}
        <div className="flex flex-col gap-1.5 mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
            Blur
          </p>
          <button
            onClick={setBlur}
            disabled={isApplying || !isSupported}
            className={clsx(
              "h-10 rounded-xl border text-[13px] font-medium transition-all",
              mode === "blur"
                ? "bg-primary-500/15 border-primary-500/40 text-primary-300"
                : "bg-white/[0.05] border-white/[0.08] text-white/50 hover:bg-white/[0.09] hover:text-white",
              (isApplying || !isSupported) && "opacity-40 cursor-not-allowed",
            )}
          >
            Blur background
          </button>
        </div>

        {/* Preset images */}
        <div className="flex flex-col gap-2 mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
            Presets
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_BACKGROUNDS.map((bg) => {
              const isActive = mode === "image" && customBgUrl === bg.url;
              return (
                <button
                  key={bg.id}
                  onClick={() => setImage(bg.url)}
                  disabled={isApplying || !isSupported}
                  className={clsx(
                    "relative rounded-xl overflow-hidden aspect-video border-2 transition-all",
                    isActive
                      ? "border-primary-400"
                      : "border-transparent hover:border-white/30",
                    (isApplying || !isSupported) &&
                      "opacity-40 cursor-not-allowed",
                  )}
                  title={bg.label}
                  aria-label={`Set ${bg.label} background`}
                >
                  <img
                    src={bg.url}
                    alt={bg.label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-end p-1.5">
                    <span className="text-white text-[9px] font-semibold drop-shadow">
                      {bg.label}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-white text-[8px]">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom upload */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
            Custom image
          </p>
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            aria-label="Upload custom background image"
          />
          <button
            onClick={() => uploadRef.current?.click()}
            disabled={isApplying || !isSupported}
            className={clsx(
              "h-10 rounded-xl border border-dashed text-[12px] font-medium transition-all",
              "flex items-center justify-center gap-2",
              "border-white/[0.15] text-white/35 hover:border-primary-500/40 hover:text-primary-400",
              (isApplying || !isSupported) && "opacity-40 cursor-not-allowed",
            )}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload image
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundPanel;
