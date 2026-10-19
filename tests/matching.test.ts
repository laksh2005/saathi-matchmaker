import { describe, expect, it } from "vitest";
import type { Profile } from "@/lib/types";
import { dealbreaker, findMatches, scorePair } from "@/lib/matching";
import pool from "@data/pool.json";
import clients from "@data/clients.json";

const YEAR = new Date().getFullYear();

function person(over: Partial<Profile> & { age?: number } = {}): Profile {
  const { age = 30, ...rest } = over;
  return {
    id: Math.random().toString(36).slice(2), firstName: "A", lastName: "B", gender: "Male",
    dateOfBirth: `${YEAR - age}-01-01`, country: "India", city: "Mumbai", heightCm: 175,
    email: "a@example.com", phone: "+91 900", college: "X", degree: "B.Tech", educationLevel: "Bachelors",
    incomeLpa: 30, company: "Acme", designation: "Engineer", profession: "Technology",
    maritalStatus: "Never Married", languages: ["English", "Hindi"], motherTongue: "Hindi", siblings: "Only child",
    religion: "Hindu", caste: "Brahmin", wantKids: "Yes", openToRelocate: "Maybe", openToPets: "Yes",
    diet: "Vegetarian", smoking: "No", drinking: "No", familyType: "Nuclear", familyValues: "Moderate",
    fatherOccupation: "", motherOccupation: "", manglik: "No", horoscopeMatchRequired: false,
    casteNoBar: true, sameReligionOnly: false, aboutMe: "", hobbies: ["Reading"], verified: true,
    partnerAgeMin: 22, partnerAgeMax: 40, ...rest,
  };
}

describe("hard filters", () => {
  it("never pairs the same gender", () => {
    expect(dealbreaker(person(), person())).toBe("Same gender");
  });
  it("removes opposite firm views on children", () => {
    expect(dealbreaker(person({ wantKids: "Yes" }), person({ gender: "Female", wantKids: "No" }))).toBe("Opposite views on children");
    expect(dealbreaker(person({ wantKids: "Yes" }), person({ gender: "Female", wantKids: "Maybe" }))).toBeNull();
  });
  it("respects religion preference from either side", () => {
    expect(dealbreaker(person(), person({ gender: "Female", religion: "Sikh", sameReligionOnly: true }))).toBe("Religion preference");
  });
  it("is mutual on age ranges", () => {
    const him = person({ age: 38 });
    expect(dealbreaker(him, person({ gender: "Female", age: 28, partnerAgeMax: 32 }))).toBe("Client outside candidate's age range");
  });
});

describe("male client preferences", () => {
  const him = person({ age: 32, heightCm: 178, incomeLpa: 40 });
  it("ranks a younger, shorter, lower earning woman above an older, taller, higher earning one", () => {
    const fits = person({ gender: "Female", age: 29, heightCm: 163, incomeLpa: 25 });
    const opposite = person({ gender: "Female", age: 34, heightCm: 180, incomeLpa: 70 });
    expect(scorePair(him, fits).score).toBeGreaterThan(scorePair(him, opposite).score);
  });
});

describe("female client preferences", () => {
  const her = person({ gender: "Female", age: 29, heightCm: 162, incomeLpa: 35, familyValues: "Liberal", city: "Pune" });
  it("prefers career parity and a partner willing to relocate", () => {
    const good = person({ age: 31, incomeLpa: 40, educationLevel: "Masters", openToRelocate: "Yes", familyValues: "Liberal" });
    const weak = person({ age: 31, incomeLpa: 12, openToRelocate: "No", familyType: "Joint", familyValues: "Traditional" });
    expect(scorePair(her, good).score).toBeGreaterThan(scorePair(her, weak).score);
  });
});

describe("findMatches on the demo data", () => {
  it("returns sorted, opposite gender, dealbreaker free matches for every client", () => {
    for (const c of clients as Profile[]) {
      const ms = findMatches(c, pool as Profile[], { limit: 10 });
      expect(ms.length).toBeGreaterThan(0);
      for (let i = 0; i < ms.length; i++) {
        expect(ms[i].candidate.gender).not.toBe(c.gender);
        expect(dealbreaker(c, ms[i].candidate)).toBeNull();
        if (i) expect(ms[i - 1].score).toBeGreaterThanOrEqual(ms[i].score);
      }
    }
  });
});
