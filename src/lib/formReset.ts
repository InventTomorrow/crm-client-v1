// reset() drops RHF's field registry; under the React Compiler unchanged fields never re-register, so onChange no-ops.
export const KEEP_FIELD_REFS = { keepFieldsRef: true } as const;
