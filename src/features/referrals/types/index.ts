// Mirrors server/src/modules/referrals (REFERRAL_CODE_PATTERN, GET /referral-codes/:code).
export const REFERRAL_CODE_PATTERN = /^[A-Za-z0-9]{3,20}$/;

export interface ReferralCodeCheck {
  code: string;
  discountPercent: number;
}
