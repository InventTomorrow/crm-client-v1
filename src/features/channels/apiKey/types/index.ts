export type ApiKeyMode = 'LIVE' | 'SANDBOX';

export interface ApiKey {
  id: string;
  name: string;
  mode: ApiKeyMode;
  keyPrefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

/** Only returned once, from the create response — never persisted client-side. */
export interface CreatedApiKey extends ApiKey {
  key: string;
}

export interface CreateApiKeyDto {
  name: string;
  mode: ApiKeyMode;
}

export interface ExternalOrderTestResult {
  orderId: string;
  orderNumber: number;
  status: string;
  duplicate: boolean;
}
