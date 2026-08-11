"use client";
import {
  useConfirmAccountDeletion,
  useRequestAccountDeletion,
} from "@/features/auth/hooks/useAccountDeletion";
import { useLogout, useMe } from "@/features/auth/hooks/useAuth";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/ui/InputOtp";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const GRACE_DAYS = 7;

/**
 * Danger zone. Deletion is code-confirmed on purpose — a hijacked session alone
 * must not be able to close the account.
 */
export function DeleteAccountSection() {
  const router = useRouter();
  const { user } = useMe();
  const logout = useLogout();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");

  const requestDeletion = useRequestAccountDeletion();
  const confirmDeletion = useConfirmAccountDeletion();

  const closeDialog = () => {
    setIsDialogOpen(false);
    setOtp("");
    requestDeletion.reset();
    confirmDeletion.reset();
  };

  const handleConfirm = () => {
    confirmDeletion.mutate(otp, {
      onSuccess: async () => {
        closeDialog();
        // logout the user
        await logout.mutateAsync();
      },
    });
  };

  const isCodeSent = requestDeletion.isSuccess;

  return (
    <div className="mt-8 rounded-xl border border-[var(--destructive)]/25 p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-[14px] font-semibold text-[var(--destructive)]">
            Delete account
          </h3>
          <p className="text-[12.5px] mt-1 text-[var(--ink-mute)] max-w-[520px]">
            Closes your account and suspends every workspace you own. You have{" "}
            {GRACE_DAYS} days to restore everything before it closes for good.
          </p>
        </div>
        <Button variant="destructive" onClick={() => setIsDialogOpen(true)}>
          <Trash2 size={14} /> Delete account
        </Button>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => (open ? setIsDialogOpen(true) : closeDialog())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Read what happens before you confirm — some of it cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <ul className="flex flex-col gap-2 text-[12.5px] text-[var(--ink-soft)]">
            <li>You are signed out everywhere and can no longer sign in.</li>
            <li>
              Every workspace you own is suspended and its members lose access —
              they will be notified by email.
            </li>
            <li>
              WhatsApp is disconnected. Restoring the account will not restore
              the connection: you must scan the QR code again.
            </li>
            <li>
              Your workspace data is kept untouched and comes back intact if you
              restore within {GRACE_DAYS} days.
            </li>
            <li>
              After {GRACE_DAYS} days the account closes permanently, and this
              email address can never be used to sign up again.
            </li>
          </ul>

          {isCodeSent ? (
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                Enter the 6-digit code sent to {user?.email}
              </label>
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((slotIndex) => (
                    <InputOTPSlot key={slotIndex} index={slotIndex} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-[var(--destructive)]/25 bg-[var(--destructive)]/10 px-3 py-2.5 text-[12.5px] text-[var(--destructive)]">
              <AlertTriangle size={15} className="mt-px flex-shrink-0" />
              <span>
                We will email you a confirmation code. Your account is not
                deleted until you enter it.
              </span>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            {isCodeSent ? (
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={otp.length !== 6 || confirmDeletion.isPending}
              >
                {confirmDeletion.isPending && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Delete my account
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => requestDeletion.mutate()}
                disabled={requestDeletion.isPending}
              >
                {requestDeletion.isPending && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Send confirmation code
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
