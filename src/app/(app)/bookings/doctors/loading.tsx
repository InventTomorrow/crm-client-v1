import { BookingsPageSkeleton } from "@/features/bookings/components/BookingsPageSkeleton";

export default function DoctorBookingsLoading() {
  return (
    <div className="scroll h-full overflow-y-auto p-4 md:p-8">
      <BookingsPageSkeleton />
    </div>
  );
}
