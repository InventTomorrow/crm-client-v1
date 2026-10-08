/** What a rule does when it fires: hand the chat over, alert the team, or nothing. */
export type PolicyAction = "HANDOFF" | "NOTIFY" | "IGNORE";

/** What a clinic that cannot book times does with an appointment. */
export type AppointmentIntake = "REQUEST" | "HANDOFF";

export type PolicyLanguage = "ENGLISH" | "ROMAN_URDU" | "URDU";

export interface TriggerSetting {
  trigger: string;
  action: PolicyAction;
  /** Department key; null routes to the default department. */
  department: string | null;
}

export interface MediaSetting {
  kind: string;
  notifyTeam: boolean;
  department: string | null;
}

/** The policy in force — defaults filled in — exactly as the API returns and accepts it. */
export interface AgentPolicy {
  triggers: TriggerSetting[];
  media: MediaSetting[];
  appointmentIntake: AppointmentIntake;
  handoffPauseMinutes: number;
  handoffMessages: Record<PolicyLanguage, string>;
  houseRules: string;
  recruitmentPolicy: string;
  analysePhotos: boolean;
}

/** The platform's side: what each setting means and what it defaults to. */
export interface AgentPolicyCatalog {
  triggers: {
    trigger: string;
    label: string;
    defaultAction: PolicyAction;
    canIgnore: boolean;
    /** MESSAGE: matched in what the customer wrote. SIGNAL: raised by what the assistant found. */
    raisedBy: "MESSAGE" | "SIGNAL";
  }[];
  media: {
    kind: string;
    label: string;
    defaultNotifyTeam: boolean;
    defaultDepartment: string | null;
  }[];
  languages: { language: PolicyLanguage; label: string }[];
}

export interface AgentPolicySettings {
  policy: AgentPolicy;
  catalog: AgentPolicyCatalog;
}

export interface Department {
  id: string;
  key: string;
  name: string;
  description: string | null;
  whatsappNumber: string | null;
  email: string | null;
  isPublicContact: boolean;
  handoffMessage: string | null;
  isDefault: boolean;
  isActive: boolean;
}

export interface DepartmentForm {
  key: string;
  name: string;
  whatsappNumber: string;
  email: string;
  isPublicContact: boolean;
  handoffMessage: string;
  isDefault: boolean;
}
