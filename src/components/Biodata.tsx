import { ageOf, formatHeight, type Profile } from "@/lib/types";

type Row = [label: string, value: React.ReactNode];

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-600">{title}</h3>
      <dl className="grid grid-cols-[minmax(0,9rem)_1fr] gap-x-4 gap-y-1.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-sand-600">{k}</dt>
            <dd className="min-w-0 break-words">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Full biodata, grouped the way families read a matrimonial profile. */
export function Biodata({ p, compact = false }: { p: Profile; compact?: boolean }) {
  const dob = new Date(p.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const sections: { title: string; rows: Row[] }[] = [
    { title: "Personal", rows: [
      ["First name", p.firstName], ["Last name", p.lastName], ["Gender", p.gender],
      ["Date of birth", `${dob} (${ageOf(p.dateOfBirth)} yrs)`], ["Height", formatHeight(p.heightCm)],
      ["Marital status", p.maritalStatus], ["Location", `${p.city}, ${p.country}`],
      ["Languages", p.languages.join(", ")], ["Mother tongue", p.motherTongue],
    ] },
    { title: "Contact", rows: [["Email", p.email], ["Phone", p.phone]] },
    { title: "Education and career", rows: [
      ["College", p.college], ["Degree", p.degree], ["Company", p.company],
      ["Designation", p.designation], ["Income", `${p.incomeLpa} LPA`],
    ] },
    { title: "Family and community", rows: [
      ["Religion", p.religion], ["Caste", `${p.caste}${p.casteNoBar ? " (caste no bar)" : ""}`],
      ["Siblings", p.siblings], ["Family type", p.familyType], ["Family values", p.familyValues],
      ["Father", p.fatherOccupation], ["Mother", p.motherOccupation],
      ["Manglik", p.manglik], ["Horoscope match", p.horoscopeMatchRequired ? "Required" : "Not required"],
    ] },
    { title: "Lifestyle and outlook", rows: [
      ["Want kids", p.wantKids], ["Open to relocate", p.openToRelocate], ["Open to pets", p.openToPets],
      ["Diet", p.diet], ["Smoking", p.smoking], ["Drinking", p.drinking], ["Hobbies", p.hobbies.join(", ")],
    ] },
    { title: "Looking for", rows: [
      ["Partner age", `${p.partnerAgeMin} to ${p.partnerAgeMax} yrs`],
      ["Religion", p.sameReligionOnly ? `${p.religion} only` : "Open"],
    ] },
  ];
  const shown = compact ? sections.filter((s) => s.title !== "Contact") : sections;
  return (
    <section className={compact ? "space-y-5" : "card space-y-5 p-5"}>
      {!compact && <h2 className="font-serif text-xl">Biodata</h2>}
      {shown.map((s) => <Section key={s.title} {...s} />)}
    </section>
  );
}
