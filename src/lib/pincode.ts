import { INDIAN_STATES } from "@/lib/checkout";

/** What a PIN code tells us about the address, for filling in the form. */
export type PinCodeInfo = {
  pin: string;
  /** Town or taluka (block), or the district when the block is not known. */
  city: string;
  district: string;
  /** State code as used by the checkout form ("MH"); null if not recognised. */
  stateCode: string | null;
  stateName: string;
  /** Post offices served by the PIN code — villages and localities. */
  places: string[];
};

type IndiaPostOffice = {
  Name?: string;
  Block?: string;
  District?: string;
  State?: string;
};

const normalise = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z]+/g, " ")
    .trim();

/** Older or shorter names India Post still uses. */
const STATE_ALIASES: Record<string, string> = {
  orissa: "Odisha",
  pondicherry: "Puducherry",
  chattisgarh: "Chhattisgarh",
  "dadra and nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
  "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
  "andaman and nicobar": "Andaman and Nicobar Islands",
  "new delhi": "Delhi",
};

export function toStateCode(name: string): string | null {
  const key = normalise(name);
  const target = normalise(STATE_ALIASES[key] ?? name);
  return INDIAN_STATES.find((state) => normalise(state.name) === target)?.code ?? null;
}

function mostCommon(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

const usable = (value: string | undefined) =>
  value && value.trim() && value.trim().toUpperCase() !== "NA" ? value.trim() : "";

/**
 * Reads the India Post PIN code API answer
 * (https://api.postalpincode.in/pincode/<pin>). Returns null when the PIN
 * code is unknown.
 */
export function parseIndiaPostResponse(pin: string, body: unknown): PinCodeInfo | null {
  const first = Array.isArray(body) ? (body[0] as { Status?: string; PostOffice?: unknown }) : null;
  if (!first || first.Status !== "Success" || !Array.isArray(first.PostOffice)) return null;

  const offices = first.PostOffice as IndiaPostOffice[];
  const district = mostCommon(offices.map((office) => usable(office.District)).filter(Boolean));
  const block = mostCommon(offices.map((office) => usable(office.Block)).filter(Boolean));
  const stateName = mostCommon(offices.map((office) => usable(office.State)).filter(Boolean));
  if (!district || !stateName) return null;

  return {
    pin,
    city: block || district,
    district,
    stateCode: toStateCode(stateName),
    stateName,
    places: [...new Set(offices.map((office) => usable(office.Name)).filter(Boolean))],
  };
}
