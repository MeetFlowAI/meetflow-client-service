/**
 * components/panels/DeviceSettingsPanel.tsx
 *
 * Live device switcher panel — camera, microphone, speaker.
 * Accessible from the "More" menu in MeetingControls.
 *
 * DIFFERENTIATOR FEATURE
 */

import React, { type JSX } from "react";
import { Settings, Loader2, Check } from "lucide-react";
import clsx from "clsx";
import PanelHeader from "../shared/PanelHeader";
import type { UseDeviceSwitcherReturn } from "../../hooks/useDeviceSwitcher";

interface DeviceSelectRowProps {
  label: string;
  devices: { deviceId: string; label: string }[];
  activeId: string | null;
  onSwitch: (id: string) => void;
  isSwitching: boolean;
}

const DeviceSelectRow: React.FC<DeviceSelectRowProps> = ({
  label,
  devices,
  activeId,
  onSwitch,
  isSwitching,
}) => (
  <div className="flex flex-col gap-1.5">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35 px-1">
      {label}
    </p>
    {devices.length === 0 && (
      <p className="text-[12px] text-white/25 px-1">No devices found</p>
    )}
    {devices.map(device => {
      const isActive = device.deviceId === activeId;
      return (
        <button
          key={device.deviceId}
          onClick={() => !isActive && onSwitch(device.deviceId)}
          disabled={isSwitching || isActive}
          className={clsx(
            "flex items-center justify-between px-3 py-2.5 rounded-xl text-left",
            "border transition-all duration-150 text-[12px]",
            isActive
              ? "bg-primary-500/10 border-primary-500/40 text-white cursor-default"
              : "bg-white/[0.04] border-white/[0.07] text-white/60 hover:bg-white/[0.08] hover:text-white",
            isSwitching && !isActive && "opacity-40 cursor-not-allowed",
          )}
        >
          <span className="truncate pr-2">{device.label}</span>
          <span className="shrink-0">
            {isSwitching && !isActive
              ? <Loader2 className="h-3.5 w-3.5 animate-spin text-white/30" />
              : isActive
                ? <Check className="h-3.5 w-3.5 text-primary-400" />
                : null
            }
          </span>
        </button>
      );
    })}
  </div>
);

interface DeviceSettingsPanelProps {
  hook: UseDeviceSwitcherReturn;
  onClose: () => void;
}

const DeviceSettingsPanel: React.FC<DeviceSettingsPanelProps> = ({
  hook,
  onClose,
}): JSX.Element => {
  const {
    cameras, microphones, speakers,
    activeCameraId, activeMicId, activeSpeakerId,
    switchCamera, switchMicrophone, switchSpeaker,
    isSwitching,
  } = hook;

  return (
    <div
      className={clsx(
        "flex flex-col w-72 shrink-0 h-full",
        "bg-[#111115] border-l border-white/[0.07]",
        "animate-in slide-in-from-right-3 duration-200",
      )}
    >
      <PanelHeader
        title="Audio & Video"
        icon={<Settings className="h-4 w-4" />}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-5">
        <DeviceSelectRow
          label="Camera"
          devices={cameras}
          activeId={activeCameraId}
          onSwitch={switchCamera}
          isSwitching={isSwitching}
        />
        <DeviceSelectRow
          label="Microphone"
          devices={microphones}
          activeId={activeMicId}
          onSwitch={switchMicrophone}
          isSwitching={isSwitching}
        />
        {speakers.length > 0 && (
          <DeviceSelectRow
            label="Speaker"
            devices={speakers}
            activeId={activeSpeakerId}
            onSwitch={switchSpeaker}
            isSwitching={isSwitching}
          />
        )}

        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
          <p className="text-[11px] text-white/35 leading-relaxed">
            Device changes apply instantly — no reconnect needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeviceSettingsPanel;
