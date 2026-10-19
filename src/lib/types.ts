// Shared domain types. One Profile shape is used for both clients (people a
// matchmaker manages) and the wider pool of candidates they can be matched with.

export type Gender = "Male" | "Female";
export type YesNoMaybe = "Yes" | "No" | "Maybe";
export type MaritalStatus = "Never Married" | "Divorced" | "Widowed" | "Awaiting Divorce";
export type Diet = "Vegetarian" | "Eggetarian" | "Non-Vegetarian" | "Vegan" | "Jain";
export type Habit = "No" | "Occasionally" | "Yes";
export type FamilyType = "Nuclear" | "Joint";
export type FamilyValues = "Traditional" | "Moderate" | "Liberal";
export type EducationLevel = "Bachelors" | "Masters" | "Doctorate" | "Professional";

/** Where a client is in their matchmaking journey, in order. */
export const JOURNEY_STAGES = [
  "Onboarding",
  "Profile Verified",
  "Matches Shared",
  "First Meeting",
  "In Conversation",
  "Engaged",
] as const;
export type JourneyStage = (typeof JOURNEY_STAGES)[number];

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string; // ISO date
  country: string;
  city: string;
  heightCm: number;
  email: string;
  phone: string;
  college: string;
  degree: string;
  educationLevel: EducationLevel;
  incomeLpa: number; // annual income in lakh rupees
  company: string;
  designation: string;
  profession: string; // broad field, e.g. "Technology"
  maritalStatus: MaritalStatus;
  languages: string[];
  motherTongue: string;
  siblings: string; // free text like "1 elder brother (married)"
  religion: string;
  caste: string;
  wantKids: YesNoMaybe;
  openToRelocate: YesNoMaybe;
  openToPets: YesNoMaybe;

  // Fields common on Indian matrimonial platforms (Shaadi, Jeevansathi,
  // BharatMatrimony) that matter to families and matchmakers.
  diet: Diet;
  smoking: Habit;
  drinking: Habit;
  familyType: FamilyType;
  familyValues: FamilyValues;
  fatherOccupation: string;
  motherOccupation: string;
  manglik: YesNoMaybe;
  horoscopeMatchRequired: boolean;
  casteNoBar: boolean; // client is open to any caste
  sameReligionOnly: boolean;
  aboutMe: string;
  hobbies: string[];
  verified: boolean;

  // Stated partner preferences.
  partnerAgeMin: number;
  partnerAgeMax: number;
}

export interface Client extends Profile {
  matchmakerId: string;
  stage: JourneyStage;
  statusTag: StatusTag;
  joinedOn: string;
}

export type StatusTag = "New" | "Active" | "On Hold" | "Priority" | "Matched";

export interface Matchmaker {
  id: string;
  name: string;
  username: string;
  password: string; // demo only; real deployments would store a hash
}

/** One scored dimension in a match explanation. */
export interface ScoreFactor {
  key: string;
  label: string;
  weight: number; // relative importance
  score: number; // 0..1
  note: string;
}

export type MatchTier = "High Potential" | "Good Match" | "Worth Exploring";

export interface MatchResult {
  candidate: Profile;
  score: number; // 0..100
  tier: MatchTier;
  factors: ScoreFactor[];
  highlights: string[];
  concerns: string[];
}

export function ageOf(dob: string, today = new Date()): number {
  const d = new Date(dob);
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

export function formatHeight(cm: number): string {
  const totalIn = Math.round(cm / 2.54);
  return `${Math.floor(totalIn / 12)}'${totalIn % 12}" (${cm} cm)`;
}
