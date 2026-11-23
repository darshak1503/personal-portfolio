import { describe, expect, it } from "vitest";
import { mergeProfile, slugifyId } from "../lib/merge-content";
import type { Profile } from "../../src/types/content";

const baseProfile: Profile = {
  meta: {
    lastSyncedAt: null,
    sourceResume: "public/resume/current-resume.pdf",
    resumeHash: null,
  },
  name: "Test User",
  title: "Engineer",
  headline: "Custom headline",
  summary: "Old summary",
  specialties: ["React"],
  valueProposition: "Custom value",
  contact: { email: "test@example.com" },
  skillCategories: [],
  experience: [
    {
      id: "exp-acme",
      company: "Acme",
      title: "Engineer",
      location: "Remote",
      startDate: "2024-01",
      endDate: null,
      current: true,
      highlights: ["Built UI"],
      technologies: ["Angular"],
    },
  ],
  education: [],
  certifications: [{ id: "c1", name: "Cert" }],
  achievements: [],
};

describe("mergeProfile", () => {
  it("preserves manual headline and curated tech on experience", () => {
    const merged = mergeProfile(baseProfile, {
      summary: "New summary",
      experience: [
        {
          id: "exp-acme",
          company: "Acme",
          title: "Senior Engineer",
          location: "Remote",
          startDate: "2024-01",
          endDate: null,
          current: true,
          highlights: ["Updated bullet"],
          technologies: [],
        },
      ],
    });
    expect(merged.headline).toBe("Custom headline");
    expect(merged.experience[0].technologies).toEqual(["Angular"]);
    expect(merged.experience[0].title).toBe("Senior Engineer");
  });

  it("does not duplicate education when the parsed id differs from the curated one", () => {
    const curated = {
      id: "edu-charusat",
      institution: "Charotar University of Science and Technology (CHARUSAT)",
      degree: "Bachelor of Technology — Information Technology",
      location: "Anand, Gujarat",
      startDate: "2019",
      endDate: "2023",
    };
    const merged = mergeProfile(
      { ...baseProfile, education: [curated] },
      {
        education: [
          {
            id: "charotar-university-of-science-and-technology-charusat",
            institution: "Charotar University of Science and Technology (CHARUSAT)",
            degree: "Bachelor of Technology – Information Technology Anand, Gujarat",
            location: "-- 2 of 2 --",
            startDate: "2019",
            endDate: "2023",
          },
        ],
      },
    );
    expect(merged.education).toEqual([curated]);
  });

  it("slugifyId normalizes strings", () => {
    expect(slugifyId("QX Global Group")).toBe("qx-global-group");
  });
});