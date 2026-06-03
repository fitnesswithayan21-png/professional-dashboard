import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: "bg-[#EFF6FF] text-[#3B82F6] border-[#BFDBFE]",
    qualified: "bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]",
    contacted: "bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]",
    converted: "bg-[#F5F3FF] text-[#8B5CF6] border-[#DDD6FE]",
    lost: "bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]",
    pending: "bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]",
    completed: "bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]",
    cancelled: "bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]",
    scheduled: "bg-[#EFF6FF] text-[#3B82F6] border-[#BFDBFE]",
    sent: "bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]",
    failed: "bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]",
    confirmed: "bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]",
    "no-show": "bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]",
  };
  return colors[status.toLowerCase()] || "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]";
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-[#10B981]";
  if (score >= 60) return "text-[#F59E0B]";
  if (score >= 40) return "text-[#F97316]";
  return "text-[#EF4444]";
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}
