import type { Profile } from "../../src/types/content";
import { slugifyId } from "./merge-content";

export type ParseResult = {
  extracted: Partial<Profile>;
  ambiguities: string[];
  warnings: string[];
};

const MONTH_MAP: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

const PAGE_MARKER = /^\s*--\s*\d+\s+of\s+\d+\s*--\s*$/gm;
// Greedy title so the location is the last "City, Region" pair on the line.
const TRAILING_LOCATION = /^(.+)\s+([A-Z][A-Za-z.]+,\s*[A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+)?)$/;

function splitTrailingLocation(line: string): { text: string; location: string } {
  const spaced = line.split(/\s{2,}|\t/);
  if (spaced.length >= 2) {
    return { text: spaced[0], location: spaced.slice(1).join(", ") };
  }
  const match = line.match(TRAILING_LOCATION);
  return match ? { text: match[1].trim(), location: match[2] } : { text: line, location: "" };
}

export function parseResumeText(rawText: string): ParseResult {
  const text = rawText.replace(PAGE_MARKER, "");
  const ambiguities: string[] = [];
  const warnings: string[] = [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const name = lines[0] ?? "";
  const titleLine = lines.find((l, i) => i > 0 && i < 5 && !l.includes("@") && !l.includes("+")) ?? "";

  const contactLine =
    lines.find((l) => l.includes("@") || l.includes("|")) ?? "";

  const emailMatch = contactLine.match(/[\w.+-]+@[\w.-]+\.\w+/);
  const phoneMatch = contactLine.match(/\+?[\d][\d\s-]{8,}/);

  const summary = extractSection(text, "Summary", [
    "Technical Skills",
    "Professional Experience",
  ]);

  const skillCategories = parseSkills(extractSection(text, "Technical Skills", [
    "Professional Experience",
    "Education",
  ]));

  const experience = parseExperience(
    extractSection(text, "Professional Experience", ["Education"]),
    ambiguities,
  );

  const education = parseEducation(
    extractSection(text, "Education", []),
    ambiguities,
  );

  if (!emailMatch) {
    warnings.push("Could not extract email from resume.");
  }

  const yearsMatch = summary.match(/(\d+)\+?\s*years?/i);
  const yearsExperience = yearsMatch ? Number(yearsMatch[1]) : undefined;

  const specialties = inferSpecialties(skillCategories);

  return {
    extracted: {
      name,
      title: titleLine || "Software Engineer",
      summary,
      yearsExperience,
      specialties,
      contact: {
        email: emailMatch?.[0] ?? "",
        phone: phoneMatch?.[0]?.trim(),
      },
      skillCategories,
      experience,
      education,
      certifications: [],
      achievements: [],
    },
    ambiguities,
    warnings,
  };
}

function extractSection(
  text: string,
  startHeader: string,
  endHeaders: string[],
): string {
  const start = text.indexOf(startHeader);
  if (start === -1) return "";
  let end = text.length;
  for (const h of endHeaders) {
    const idx = text.indexOf(h, start + startHeader.length);
    if (idx !== -1 && idx < end) end = idx;
  }
  return text.slice(start + startHeader.length, end).trim();
}

function parseSkills(block: string) {
  const categories: Profile["skillCategories"] = [];
  for (const line of block.split("\n")) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (!match) continue;
    const label = match[1].trim();
    const skills = match[2]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    categories.push({
      id: slugifyId(label),
      label,
      skills,
    });
  }
  return categories;
}

function parseExperience(block: string, ambiguities: string[]) {
  const experiences: Profile["experience"] = [];
  const chunks = block.split(/\n(?=[A-Za-z].{2,}?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?)/);

  for (const chunk of chunks) {
    const headerMatch = chunk.match(
      /^(.+?)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s*(\d{4})\s*[–-]\s*(present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s*\d{4})/im,
    );

    if (!headerMatch) continue;

    const company = headerMatch[1].trim();
    const start = toIsoMonth(headerMatch[2], headerMatch[3]);
    const endRaw = headerMatch[4].toLowerCase();
    const current = endRaw === "present";
    let endDate: string | null = null;
    if (!current) {
      const endMatch = endRaw.match(
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s*(\d{4})/i,
      );
      if (endMatch) {
        endDate = toIsoMonth(endMatch[1], endMatch[2]);
      }
    }

    const [titleLocation, ...bodyLines] = chunk
      .slice(headerMatch[0].length)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let title = "Software Engineer";
    let location = "";
    if (titleLocation) {
      const split = splitTrailingLocation(titleLocation);
      title = split.text;
      location = split.location;
    }

    const highlights: string[] = [];
    for (const line of bodyLines) {
      if (/^[–-]\s*/.test(line)) {
        highlights.push(line.replace(/^[–-]\s*/, ""));
      } else if (highlights.length) {
        highlights[highlights.length - 1] += ` ${line}`;
      }
    }

    const yearNum = Number(headerMatch[3]);
    if (yearNum > new Date().getFullYear()) {
      ambiguities.push(
        `Experience at "${company}" has a future start year (${headerMatch[2]}. ${headerMatch[3]}). Review dates after sync.`,
      );
    }

    experiences.push({
      id: slugifyId(`${company}-${start}`),
      company,
      title,
      location,
      startDate: start,
      endDate,
      current,
      highlights,
      technologies: [],
    });
  }

  return experiences;
}

function parseEducation(block: string, ambiguities: string[]) {
  const entries: Profile["education"] = [];
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return entries;

  const header = lines[0];
  const dateMatch = header.match(/(\d{4})\s*[–-]\s*(\d{4})/);
  const institution = header.replace(/\s+\d{4}\s*[–-]\s*\d{4}.*$/, "").trim();

  const degreeSplit = splitTrailingLocation(lines[1] ?? "");
  const degreeLine = degreeSplit.text;
  const location = degreeSplit.location || (lines[2] ?? "");

  if (!dateMatch) {
    ambiguities.push("Education dates could not be parsed confidently.");
  }

  entries.push({
    id: slugifyId(institution),
    institution,
    degree: degreeLine,
    location,
    startDate: dateMatch?.[1] ?? "",
    endDate: dateMatch?.[2] ?? "",
  });

  return entries;
}

function toIsoMonth(mon: string, year: string): string {
  const key = mon.toLowerCase().slice(0, 3);
  return `${year}-${MONTH_MAP[key] ?? "01"}`;
}

function inferSpecialties(categories: Profile["skillCategories"]) {
  const all = categories.flatMap((c) => c.skills).slice(0, 6);
  const defaults = ["Enterprise SPAs", "REST API integration", "Responsive UI"];
  return [...new Set([...all.slice(0, 3), ...defaults])].slice(0, 6);
}