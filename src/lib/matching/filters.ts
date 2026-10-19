// Hard filters: dealbreakers that remove a candidate before any scoring.
// They mirror what families and matrimonial platforms treat as non negotiable,
// and they are applied in both directions so we never suggest someone who
// would reject the client outright.
import { ageOf, type Profile } from "../types";

/** Allowed slack (years) around a stated partner age range. */
const AGE_GRACE = 1;

export function dealbreaker(client: Profile, cand: Profile): string | null {
  if (client.gender === cand.gender) return "Same gender";
  if (client.id === cand.id) return "Same person";

  const ca = ageOf(client.dateOfBirth);
  const pa = ageOf(cand.dateOfBirth);
  if (pa < client.partnerAgeMin - AGE_GRACE || pa > client.partnerAgeMax + AGE_GRACE) return "Outside client's age range";
  if (ca < cand.partnerAgeMin - AGE_GRACE || ca > cand.partnerAgeMax + AGE_GRACE) return "Client outside candidate's age range";

  if ((client.sameReligionOnly || cand.sameReligionOnly) && client.religion !== cand.religion) return "Religion preference";
  const sameCommunity = client.religion === cand.religion;
  if (sameCommunity && client.caste !== cand.caste && (!client.casteNoBar || !cand.casteNoBar)) return "Caste preference";

  // One person firmly wants children and the other firmly does not.
  const kids = [client.wantKids, cand.wantKids].sort().join("/");
  if (kids === "No/Yes") return "Opposite views on children";

  // Manglik compatibility only matters when a horoscope match is required.
  if ((client.horoscopeMatchRequired || cand.horoscopeMatchRequired) &&
      ((client.manglik === "Yes") !== (cand.manglik === "Yes")) &&
      client.manglik !== "Maybe" && cand.manglik !== "Maybe") return "Manglik mismatch";

  // Living in different countries works only if at least one would move.
  if (client.country !== cand.country && client.openToRelocate === "No" && cand.openToRelocate === "No") return "Neither will relocate";

  return null;
}
