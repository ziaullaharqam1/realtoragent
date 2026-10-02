export type AvailabilitySlot = {
  start: string;
  end: string;
  brokerId: string | null;
  propertyId: string;
  timezone: string;
  available: boolean;
};

export type AvailabilityQuery = {
  tenantId: string;
  propertyId: string;
  brokerId?: string | null;
  from?: Date;
  days?: number;
  slotMinutes?: number;
  timezone?: string;
  /** Existing bookings that block slots (ISO start times). */
  bookedStarts?: string[];
  workingDays?: string[];
  hours?: { startHour: number; endHour: number };
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/**
 * Demo calendar: generate broker viewing slots for the next N days.
 * Excludes already-booked start times (minute precision).
 */
export function generateAvailabilitySlots(query: AvailabilityQuery): AvailabilitySlot[] {
  const timezone = query.timezone ?? "Asia/Dubai";
  const days = query.days ?? 5;
  const slotMinutes = query.slotMinutes ?? 60;
  const startHour = query.hours?.startHour ?? 10;
  const endHour = query.hours?.endHour ?? 17;
  const workingDays = new Set(query.workingDays ?? ["Sun", "Mon", "Tue", "Wed", "Thu"]);
  const booked = new Set(
    (query.bookedStarts ?? []).map((s) => new Date(s).toISOString().slice(0, 16)),
  );

  const origin = query.from ? new Date(query.from) : new Date();
  origin.setHours(0, 0, 0, 0);

  const slots: AvailabilitySlot[] = [];
  for (let d = 1; d <= days + 2 && slots.length < days * 4; d++) {
    const day = new Date(origin);
    day.setDate(origin.getDate() + d);
    const dayName = DAY_NAMES[day.getDay()];
    if (!dayName || !workingDays.has(dayName)) continue;

    for (let hour = startHour; hour < endHour; hour++) {
      const start = new Date(day);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start.getTime() + slotMinutes * 60_000);
      const key = start.toISOString().slice(0, 16);
      const available = !booked.has(key);
      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
        brokerId: query.brokerId ?? null,
        propertyId: query.propertyId,
        timezone,
        available,
      });
    }
  }

  return slots.filter((s) => s.available).slice(0, 12);
}

export function pickNextSlot(slots: AvailabilitySlot[]): AvailabilitySlot | null {
  return slots.find((s) => s.available) ?? null;
}
