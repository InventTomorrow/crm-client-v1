import {
  type BusinessHoursForm,
  type BusinessHoursPayload,
  WEEKDAYS,
  type Weekday,
} from "../types";

export const DEFAULT_OPEN_TIME = "09:00";
export const DEFAULT_CLOSE_TIME = "18:00";

const openDay = (open = DEFAULT_OPEN_TIME, close = DEFAULT_CLOSE_TIME) => ({ isOpen: true, open, close });

// Custom hours start with every day open, so nothing is silently closed until the owner closes it.
export const DEFAULT_BUSINESS_HOURS_FORM: BusinessHoursForm = {
  isOpenAllTime: true,
  days: Object.fromEntries(WEEKDAYS.map((weekday) => [weekday, openDay()])) as BusinessHoursForm["days"],
};

export function toBusinessHoursForm(saved: BusinessHoursPayload | null | undefined): BusinessHoursForm {
  const hasOpenDay = !!saved && WEEKDAYS.some((weekday) => saved[weekday]);
  if (!saved || !hasOpenDay) return DEFAULT_BUSINESS_HOURS_FORM;

  const days = Object.fromEntries(
    WEEKDAYS.map((weekday): [Weekday, BusinessHoursForm["days"][Weekday]] => {
      const window = saved[weekday];
      return [
        weekday,
        window
          ? openDay(window.open, window.close)
          : { isOpen: false, open: DEFAULT_OPEN_TIME, close: DEFAULT_CLOSE_TIME },
      ];
    }),
  ) as BusinessHoursForm["days"];
  return { isOpenAllTime: false, days };
}

// null tells the server "open all the time"; a closed day is null inside the payload.
export function toBusinessHoursPayload(form: BusinessHoursForm): { businessHours: BusinessHoursPayload | null } {
  if (form.isOpenAllTime) return { businessHours: null };

  const businessHours = Object.fromEntries(
    WEEKDAYS.map((weekday) => {
      const { isOpen, open, close } = form.days[weekday];
      return [weekday, isOpen ? { open, close } : null];
    }),
  ) as BusinessHoursPayload;
  return { businessHours };
}
