import type { Profile } from "../../src/types/content";

export function slugifyId(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function mergeProfile(
  existing: Profile,
  extracted: Partial<Profile>,
): Profile {
  const mergedExperience = mergeExperienceLists(
    existing.experience,
    extracted.experience ?? [],
  );

  return {
    ...existing,
    name: extracted.name || existing.name,
    title: extracted.title || existing.title,
    summary: extracted.summary || existing.summary,
    yearsExperience: extracted.yearsExperience ?? existing.yearsExperience,
    specialties:
      extracted.specialties && extracted.specialties.length
        ? extracted.specialties
        : existing.specialties,
    contact: {
      email: extracted.contact?.email || existing.contact.email,
      phone: extracted.contact?.phone || existing.contact.phone,
    },
    skillCategories:
      extracted.skillCategories && extracted.skillCategories.length
        ? extracted.skillCategories
        : existing.skillCategories,
    experience: mergedExperience,
    education:
      extracted.education && extracted.education.length
        ? mergeEducation(existing.education, extracted.education)
        : existing.education,
    certifications: existing.certifications.length
      ? existing.certifications
      : extracted.certifications ?? [],
    achievements: existing.achievements.length
      ? existing.achievements
      : extracted.achievements ?? [],
    headline: existing.headline,
    valueProposition: existing.valueProposition,
    meta: {
      ...existing.meta,
      ...(extracted.meta ?? {}),
      lastSyncedAt: new Date().toISOString(),
    },
  };
}

function mergeExperienceLists(
  existing: Profile["experience"],
  extracted: Profile["experience"],
): Profile["experience"] {
  const byId = new Map(existing.map((e) => [e.id, e]));

  for (const item of extracted) {
    const match =
      byId.get(item.id) ??
      [...byId.values()].find(
        (e) =>
          e.company.toLowerCase() === item.company.toLowerCase() &&
          e.startDate === item.startDate,
      );

    if (match) {
      byId.set(match.id, {
        ...match,
        title: item.title || match.title,
        location: item.location || match.location,
        endDate: item.endDate ?? match.endDate,
        current: item.current,
        highlights: item.highlights.length ? item.highlights : match.highlights,
        technologies: match.technologies.length
          ? match.technologies
          : item.technologies,
      });
    } else {
      byId.set(item.id, item);
    }
  }

  return [...byId.values()].sort((a, b) =>
    b.startDate.localeCompare(a.startDate),
  );
}

function mergeEducation(
  existing: Profile["education"],
  extracted: Profile["education"],
) {
  const byId = new Map(existing.map((e) => [e.id, e]));
  for (const item of extracted) {
    const match =
      byId.get(item.id) ??
      [...byId.values()].find(
        (e) =>
          e.institution.toLowerCase() === item.institution.toLowerCase() &&
          e.startDate === item.startDate,
      );

    if (match) {
      // Curated fields win: parsed PDF text often leaks locations and page markers.
      byId.set(match.id, {
        ...match,
        degree: match.degree || item.degree,
        location: match.location || item.location,
        endDate: match.endDate || item.endDate,
      });
    } else {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()];
}