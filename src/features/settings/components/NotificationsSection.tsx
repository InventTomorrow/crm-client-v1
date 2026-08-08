"use client";
import { NotificationPreferences } from "@/features/notifications/components/NotificationPreferences";

export function NotificationsSection() {
  return (
    <>
      <h2 className="text-[20px] font-semibold">Notifications</h2>
      <div className="max-w-2xl">
        <NotificationPreferences />
      </div>
    </>
  );
}
