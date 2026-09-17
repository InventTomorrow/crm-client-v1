import { BookingsPageSkeleton } from "@/features/bookings/components/BookingsPageSkeleton";

export default function BookingsLoading() {
  return (
    <div className="scroll h-full overflow-y-auto p-4 md:p-8">
      <BookingsPageSkeleton statCount={4} />
    </div>
  );
}
