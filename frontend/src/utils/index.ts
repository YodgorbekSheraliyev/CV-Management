import type { PeriodValue } from "../components/ValueField";

export function parsePeriod(raw: string | null | undefined): PeriodValue {
  if (!raw) {
    return {
      start: "",
      end: "",
    };
  }

  try {
    const parsed = JSON.parse(raw);

    return {
      start: parsed.start ?? "",
      end: parsed.end ?? "",
    };
  } catch {
    return {
      start: "",
      end: "",
    };
  }
}
