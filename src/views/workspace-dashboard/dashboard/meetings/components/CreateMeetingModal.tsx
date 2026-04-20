/* Imports */
import { useState, type JSX } from "react";
import clsx from "clsx";

/* Local Imports */
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createMeetingRequest } from "@/services/workspace-dashboard/meetings";
import Toast from "@/components/toast";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

interface CreateMeetingModalProps {
  open: boolean;
  onClose: () => void;
  workspaceId: number;
  onCreated: () => void;
}

/**
 * CreateMeetingModal — dialog for scheduling a new workspace meeting.
 *
 * @component
 */
const CreateMeetingModal = ({
  open, onClose, workspaceId, onCreated,
}: CreateMeetingModalProps): JSX.Element => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setTitle(""); setDescription("");
    setScheduledAt(""); setDurationMinutes("60");
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Toast.error({ message: "Meeting title is required" });
      return;
    }
    if (!scheduledAt) {
      Toast.error({ message: "Please set a start date and time" });
      return;
    }
    setSubmitting(true);
    try {
      await createMeetingRequest({
        title: title.trim(),
        description: description.trim() || undefined,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: parseInt(durationMinutes, 10) || 60,
        workspace_id: workspaceId,
      });
      Toast.success({ message: "Meeting scheduled successfully" });
      onCreated();
      handleClose();
    } catch (err: any) {
      Toast.error({
        message: "Failed to schedule meeting",
        description: err?.response?.data?.message ?? err?.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={typography.semibold18}>Schedule a meeting</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="meet-title" className={typography.medium14}>
              Meeting title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="meet-title"
              placeholder="e.g. Sprint Planning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="meet-desc" className={typography.medium14}>
              Description <span className={clsx(typography.regular12, "text-secondary-400 font-normal")}>(optional)</span>
            </Label>
            <Input
              id="meet-desc"
              placeholder="What is this meeting about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Scheduled at + duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="meet-date" className={typography.medium14}>
                Start date &amp; time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="meet-date"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="meet-duration" className={typography.medium14}>
                Duration (minutes)
              </Label>
              <Input
                id="meet-duration"
                type="number"
                min={5}
                max={480}
                placeholder="60"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || !title.trim() || !scheduledAt}>
            {submitting ? "Scheduling…" : "Schedule Meeting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMeetingModal;
