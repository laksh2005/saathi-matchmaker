/**
 * Deterministic generator for demo data. Run with `npm run generate`.
 *
 * A seeded PRNG keeps the output stable between runs so the committed JSON,
 * the tests and the live demo all agree. Distributions are loosely modelled on
 * urban Indian matrimonial profiles: ages 24 to 38, metro heavy, tech and
 * finance heavy, with a realistic spread of religion, diet and family values.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import type {
  Client, Diet, EducationLevel, FamilyValues, Gender, Habit, JourneyStage, MaritalStatus, Profile, StatusTag, YesNoMaybe,
} from "../src/lib/types";

let seed = 20261019;
function rand(): number {
  // mulberry32
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function pick<T>(xs: readonly T[]): T {
  return xs[Math.floor(rand() * xs.length)];
}
function int(lo: number, hi: number): number {
  return lo + Math.floor(rand() * (hi - lo + 1));
}
function weighted<T>(pairs: [T, number][]): T {
  const total = pairs.reduce((s, p) => s + p[1], 0);
  let r = rand() * total;
  for (const [v, w] of pairs) {
    r -= w;
    if (r <= 0) return v;
  }
  return pairs[pairs.length - 1][0];
}
/** Rough bell curve in about -1..1. */
function gauss(): number {
  return (rand() + rand() + rand() - 1.5) / 1.5;
}

const MALE_NAMES = ["Aarav", "Vihaan", "Arjun", "Rohan", "Kabir", "Aditya", "Siddharth", "Karan", "Ishaan", "Rahul", "Varun", "Nikhil", "Pranav", "Aman", "Dhruv", "Harsh", "Kunal", "Manav", "Yash", "Rishabh", "Akash", "Tanmay", "Neil", "Sameer", "Abhishek", "Gaurav", "Vikram", "Rajat", "Ankit", "Mihir", "Omkar", "Parth", "Shaurya", "Tejas", "Uday", "Zubin", "Imran", "Farhan", "Joel", "Gurpreet"];
const FEMALE_NAMES = ["Ananya", "Diya", "Ishita", "Kavya", "Meera", "Priya", "Riya", "Sanya", "Tanvi", "Aditi", "Neha", "Pooja", "Shreya", "Nisha", "Aisha", "Kriti", "Simran", "Radhika", "Sneha", "Avni", "Bhavna", "Charvi", "Divya", "Esha", "Gauri", "Ira", "Juhi", "Lavanya", "Mansi", "Naina", "Pallavi", "Rhea", "Saloni", "Trisha", "Vaani", "Zara", "Sana", "Ayesha", "Maria", "Harleen"];

interface Community { religion: string; castes: string[]; surnames: string[]; tongues: string[]; weight: number }
const COMMUNITIES: Community[] = [
  { religion: "Hindu", castes: ["Brahmin", "Kayastha", "Agarwal", "Khatri", "Rajput", "Maratha", "Reddy", "Nair", "Iyer", "Patel"], surnames: ["Sharma", "Verma", "Gupta", "Agarwal", "Malhotra", "Kapoor", "Mehta", "Joshi", "Iyer", "Nair", "Reddy", "Patel", "Deshmukh", "Kulkarni", "Rao", "Chopra", "Saxena", "Bhatt"], tongues: ["Hindi", "Marathi", "Gujarati", "Tamil", "Telugu", "Malayalam", "Punjabi", "Bengali", "Kannada"], weight: 70 },
  { religion: "Muslim", castes: ["Sunni", "Shia"], surnames: ["Khan", "Shaikh", "Qureshi", "Siddiqui", "Ansari", "Mirza"], tongues: ["Urdu", "Hindi"], weight: 10 },
  { religion: "Sikh", castes: ["Jat", "Khatri", "Ramgarhia"], surnames: ["Singh", "Gill", "Sandhu", "Bedi", "Ahluwalia"], tongues: ["Punjabi", "Hindi"], weight: 7 },
  { religion: "Christian", castes: ["Catholic", "Protestant"], surnames: ["DSouza", "Fernandes", "Thomas", "Mathew", "Pereira"], tongues: ["English", "Malayalam", "Konkani"], weight: 6 },
  { religion: "Jain", castes: ["Oswal", "Digambar", "Shwetambar"], surnames: ["Jain", "Shah", "Mehta", "Doshi"], tongues: ["Gujarati", "Hindi", "Marwari"], weight: 5 },
];

const CITIES: [string, string, number][] = [
  ["India", "Mumbai", 16], ["India", "Delhi", 14], ["India", "Bengaluru", 16], ["India", "Pune", 9], ["India", "Hyderabad", 9], ["India", "Chennai", 7], ["India", "Gurugram", 7], ["India", "Kolkata", 5], ["India", "Ahmedabad", 4], ["India", "Jaipur", 3],
  ["United States", "San Francisco", 3], ["United States", "New York", 3], ["United Kingdom", "London", 3], ["Singapore", "Singapore", 2], ["United Arab Emirates", "Dubai", 2], ["Canada", "Toronto", 2],
];

interface Career { profession: string; degree: string; level: EducationLevel; colleges: string[]; companies: string[]; titles: string[]; income: [number, number]; weight: number }
const CAREERS: Career[] = [
  { profession: "Technology", degree: "B.Tech Computer Science", level: "Bachelors", colleges: ["IIT Bombay", "IIT Delhi", "BITS Pilani", "NIT Trichy", "VIT Vellore", "IIIT Hyderabad"], companies: ["Google", "Microsoft", "Flipkart", "Swiggy", "Razorpay", "Atlassian", "Amazon", "Zomato"], titles: ["Software Engineer", "Senior Software Engineer", "Engineering Manager", "Staff Engineer"], income: [14, 85], weight: 22 },
  { profession: "Business", degree: "MBA", level: "Masters", colleges: ["IIM Ahmedabad", "IIM Bangalore", "ISB Hyderabad", "XLRI Jamshedpur", "FMS Delhi"], companies: ["McKinsey", "BCG", "Unilever", "P&G", "Bain", "Tata Group"], titles: ["Consultant", "Product Manager", "Brand Manager", "Associate Director"], income: [22, 90], weight: 14 },
  { profession: "Finance", degree: "B.Com, CA", level: "Professional", colleges: ["SRCC Delhi", "Narsee Monjee", "St. Xavier's Kolkata", "Christ University"], companies: ["Goldman Sachs", "Deloitte", "EY", "HDFC Bank", "KPMG", "JP Morgan"], titles: ["Chartered Accountant", "Analyst", "Vice President", "Finance Manager"], income: [10, 60], weight: 12 },
  { profession: "Medicine", degree: "MBBS, MD", level: "Doctorate", colleges: ["AIIMS Delhi", "CMC Vellore", "KEM Mumbai", "Maulana Azad Medical College"], companies: ["Apollo Hospitals", "Fortis", "Max Healthcare", "Manipal Hospitals"], titles: ["Resident Doctor", "Consultant Physician", "Surgeon", "Pediatrician"], income: [12, 55], weight: 8 },
  { profession: "Law", degree: "BA LLB", level: "Professional", colleges: ["NLSIU Bangalore", "NALSAR Hyderabad", "NLU Delhi", "Symbiosis Law School"], companies: ["AZB & Partners", "Cyril Amarchand Mangaldas", "Khaitan & Co", "Trilegal"], titles: ["Associate", "Senior Associate", "Legal Counsel"], income: [10, 50], weight: 6 },
  { profession: "Design", degree: "B.Des", level: "Bachelors", colleges: ["NID Ahmedabad", "NIFT Delhi", "Srishti Bangalore", "IIT Bombay IDC"], companies: ["Cred", "Airbnb", "Ogilvy", "Myntra", "Titan"], titles: ["Product Designer", "UX Researcher", "Design Lead", "Creative Director"], income: [8, 40], weight: 6 },
  { profession: "Education", degree: "MA, B.Ed", level: "Masters", colleges: ["Delhi University", "JNU", "Presidency University", "TISS Mumbai"], companies: ["Ashoka University", "The Doon School", "Teach For India", "Byju's"], titles: ["Teacher", "Assistant Professor", "Program Manager"], income: [5, 22], weight: 6 },
  { profession: "Media", degree: "BA Journalism", level: "Bachelors", colleges: ["Lady Shri Ram College", "Xavier's Mumbai", "Asian College of Journalism"], companies: ["The Hindu", "NDTV", "Netflix India", "Dharma Productions"], titles: ["Journalist", "Content Strategist", "Producer"], income: [6, 30], weight: 5 },
  { profession: "Entrepreneur", degree: "B.Tech, MBA", level: "Masters", colleges: ["IIT Kharagpur", "IIM Calcutta", "Manipal Institute of Technology"], companies: ["Own startup", "Family business"], titles: ["Founder", "Co-founder", "Director"], income: [10, 120], weight: 6 },
];

const HOBBIES = ["Trekking", "Reading", "Cooking", "Travel", "Classical music", "Photography", "Running", "Yoga", "Cricket", "Painting", "Board games", "Theatre", "Gardening", "Cycling", "Dancing", "Podcasts", "Badminton", "Volunteering"];
const FATHER_JOBS = ["Retired government officer", "Businessman", "Doctor", "Engineer", "Professor", "Retired bank manager", "Army officer (retd.)", "Lawyer"];
const MOTHER_JOBS = ["Homemaker", "Teacher", "Doctor", "Professor", "Banker", "Entrepreneur", "Retired principal"];

function siblings(): string {
  const n = weighted<number>([[0, 2], [1, 5], [2, 2]]);
  if (n === 0) return "Only child";
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const rel = pick(["elder", "younger"]);
    const who = pick(["brother", "sister"]);
    parts.push(`1 ${rel} ${who}${rel === "elder" && rand() < 0.6 ? " (married)" : ""}`);
  }
  return parts.join(", ");
}

const REF_YEAR = 2026;
let counter = 0;

function makeProfile(gender: Gender, idPrefix: string): Profile {
  counter++;
  const community = weighted(COMMUNITIES.map((c) => [c, c.weight] as [Community, number]));
  const firstName = pick(gender === "Male" ? MALE_NAMES : FEMALE_NAMES);
  let lastName = pick(community.surnames);
  if (community.religion === "Sikh" && gender === "Female" && lastName === "Singh") lastName = "Kaur";
  const age = gender === "Male" ? int(26, 38) : int(24, 36);
  const dob = `${REF_YEAR - age}-${String(int(1, 12)).padStart(2, "0")}-${String(int(1, 28)).padStart(2, "0")}`;
  const [country, city] = weighted(CITIES.map(([c, ci, w]) => [[c, ci], w] as [[string, string], number]));
  const career = weighted(CAREERS.map((c) => [c, c.weight] as [Career, number]));
  // Mean adult heights in urban India are roughly 172 cm (men) and 159 cm (women).
  const heightCm = Math.round((gender === "Male" ? 174 : 160) + gauss() * 9);
  // Income grows with age inside the career's band, plus some noise.
  const [lo, hi] = career.income;
  const ageFactor = Math.min(1, Math.max(0, (age - 24) / 13));
  const incomeLpa = Math.round(lo + (hi - lo) * (0.55 * ageFactor + 0.45 * rand()));
  const titleIdx = Math.min(career.titles.length - 1, Math.floor(ageFactor * career.titles.length * (0.6 + rand() * 0.6)));
  const tongue = pick(community.tongues);
  const languages = Array.from(new Set(["English", tongue, rand() < 0.7 ? "Hindi" : pick(community.tongues)]));
  const familyValues = weighted<FamilyValues>([["Traditional", 3], ["Moderate", 5], ["Liberal", 3]]);
  const diet: Diet = community.religion === "Jain"
    ? weighted<Diet>([["Jain", 6], ["Vegetarian", 4]])
    : weighted<Diet>([["Vegetarian", 4], ["Eggetarian", 2], ["Non-Vegetarian", 6], ["Vegan", 1]]);
  const wantKids = weighted<YesNoMaybe>([["Yes", 7], ["Maybe", 2], ["No", 1]]);
  const hobbies = Array.from(new Set([pick(HOBBIES), pick(HOBBIES), pick(HOBBIES)]));
  const company = pick(career.companies);
  const designation = career.titles[titleIdx];
  const abroad = country !== "India";

  const profile: Profile = {
    id: `${idPrefix}-${String(counter).padStart(3, "0")}`,
    firstName,
    lastName,
    gender,
    dateOfBirth: dob,
    country,
    city,
    heightCm,
    email: `${firstName}.${lastName}${counter}@example.com`.toLowerCase(),
    phone: `+91 9${int(100000000, 999999999)}`,
    college: pick(career.colleges),
    degree: career.degree,
    educationLevel: career.level,
    incomeLpa,
    company,
    designation,
    profession: career.profession,
    maritalStatus: weighted<MaritalStatus>([["Never Married", 86], ["Divorced", 9], ["Awaiting Divorce", 2], ["Widowed", 3]]),
    languages,
    motherTongue: tongue,
    siblings: siblings(),
    religion: community.religion,
    caste: pick(community.castes),
    wantKids,
    openToRelocate: abroad
      ? weighted<YesNoMaybe>([["Yes", 3], ["Maybe", 4], ["No", 3]])
      : weighted<YesNoMaybe>([["Yes", 4], ["Maybe", 4], ["No", 3]]),
    openToPets: weighted<YesNoMaybe>([["Yes", 5], ["Maybe", 3], ["No", 2]]),
    diet,
    smoking: weighted<Habit>([["No", 8], ["Occasionally", 2], ["Yes", 1]]),
    drinking: weighted<Habit>([["No", 4], ["Occasionally", 5], ["Yes", 1]]),
    familyType: weighted<Profile["familyType"]>([["Nuclear", 6], ["Joint", 3]]),
    familyValues,
    fatherOccupation: pick(FATHER_JOBS),
    motherOccupation: pick(MOTHER_JOBS),
    manglik: community.religion === "Hindu" ? weighted<YesNoMaybe>([["No", 7], ["Yes", 2], ["Maybe", 1]]) : "No",
    horoscopeMatchRequired: community.religion === "Hindu" && familyValues === "Traditional" && rand() < 0.6,
    casteNoBar: familyValues !== "Traditional" || rand() < 0.3,
    sameReligionOnly: familyValues === "Traditional" ? rand() < 0.85 : rand() < 0.35,
    aboutMe: "",
    hobbies,
    verified: rand() < 0.88,
    partnerAgeMin: gender === "Male" ? Math.max(21, age - 7) : Math.max(23, age - 2),
    partnerAgeMax: gender === "Male" ? age + 1 : age + 7,
  };
  const kidsLine = wantKids === "Yes"
    ? "Looking forward to building a family."
    : wantKids === "Maybe" ? "Open about kids, depending on the right person." : "Prefers a child free life.";
  profile.aboutMe = `${designation} at ${company}, based in ${city}. ${familyValues} family values, ${hobbies.slice(0, 2).join(" and ").toLowerCase()} on weekends. ${kidsLine}`;
  return profile;
}

const pool: Profile[] = [];
for (let i = 0; i < 120; i++) pool.push(makeProfile("Female", "pf"));
for (let i = 0; i < 120; i++) pool.push(makeProfile("Male", "pm"));

const STAGES: JourneyStage[] = ["Onboarding", "Profile Verified", "Matches Shared", "First Meeting", "In Conversation", "Engaged"];
const ACTIVE_TAGS: StatusTag[] = ["Active", "Priority", "On Hold"];
const clients: Client[] = [];
counter = 0;
for (let i = 0; i < 16; i++) {
  const p = makeProfile(i % 2 === 0 ? "Male" : "Female", "c");
  const stage = STAGES[Math.min(5, Math.floor(rand() * 5.4))];
  const statusTag: StatusTag = stage === "Engaged" ? "Matched" : stage === "Onboarding" ? "New" : pick(ACTIVE_TAGS);
  clients.push({
    ...p,
    verified: stage !== "Onboarding" || rand() < 0.4,
    matchmakerId: i < 10 ? "mm-1" : "mm-2",
    stage,
    statusTag,
    joinedOn: `2026-${String(int(1, 9)).padStart(2, "0")}-${String(int(1, 28)).padStart(2, "0")}`,
  });
}

function out(file: string, data: unknown) {
  writeFileSync(path.join(__dirname, file), JSON.stringify(data, null, 2) + "\n");
}
out("pool.json", pool);
out("clients.json", clients);
console.log(`Wrote ${pool.length} pool profiles and ${clients.length} clients.`);
