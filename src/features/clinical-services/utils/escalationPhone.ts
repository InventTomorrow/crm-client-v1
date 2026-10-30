const INTERNATIONAL_PHONE = /^\+[1-9]\d{6,14}$/;
// 03xx, 3xx, 92 3xx and 0092 3xx forms of a Pakistani mobile number.
const PK_MOBILE_PHONE = /^(?:0092|92|0)?3\d{9}$/;

/** Empty is valid: the workspace's default support contact is used instead. */
export function isValidEscalationPhone(rawPhone: string): boolean {
  const compactPhone = rawPhone.replace(/[\s\-()]/g, "");
  return (
    compactPhone === "" ||
    INTERNATIONAL_PHONE.test(compactPhone) ||
    PK_MOBILE_PHONE.test(compactPhone)
  );
}
