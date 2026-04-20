/* Imports */
import { z } from "zod";

// ----------------------------------------------------------------------

// ─── Channel ──────────────────────────────────────────────────────────────────

export const CreateChannelFormSchema = z.object({
  txtName: z
    .string()
    .min(1, "Channel name is required")
    .max(80, "Channel name must be under 80 characters")
    .regex(
      /^[a-z0-9-_]+$/,
      "Only lowercase letters, numbers, hyphens, and underscores",
    ),
  txtDescription: z
    .string()
    .max(250, "Description must be under 250 characters")
    .optional(),
  chkIsPrivate: z.boolean(),
});

export type CreateChannelFormValues = z.infer<typeof CreateChannelFormSchema>;

// ─── Send Message ─────────────────────────────────────────────────────────────

export const SendMessageFormSchema = z.object({
  txtMessage: z
    .string()
    .min(1, "Message cannot be empty")
    .max(4000, "Message is too long"),
});

export type SendMessageFormValues = z.infer<typeof SendMessageFormSchema>;

// ─── Create Task ──────────────────────────────────────────────────────────────

export const CreateTaskFormSchema = z.object({
  txtTitle: z
    .string()
    .min(1, "Task title is required")
    .max(200, "Title must be under 200 characters"),
  txtDescription: z
    .string()
    .max(1000, "Description must be under 1000 characters")
    .optional(),
  selPriority: z.enum(["high", "medium", "low"]),
  selStatus: z.enum(["todo", "in-progress", "done"]),
  txtAssignee: z.string().optional(),
  txtDueDate: z.string().optional(),
});

export type CreateTaskFormValues = z.infer<typeof CreateTaskFormSchema>;

// ─── Schedule Meeting ─────────────────────────────────────────────────────────

export const ScheduleMeetingFormSchema = z.object({
  txtTitle: z
    .string()
    .min(1, "Meeting title is required")
    .max(200, "Title must be under 200 characters"),
  txtDescription: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional(),
  txtScheduledAt: z.string().min(1, "Scheduled time is required"),
  txtDuration: z.string().min(1, "Duration is required"),
});

export type ScheduleMeetingFormValues = z.infer<
  typeof ScheduleMeetingFormSchema
>;
