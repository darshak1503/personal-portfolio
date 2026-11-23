import { describe, expect, it } from "vitest";
import { parseResumeText } from "../lib/parse-resume-content";

const sample = `Darshak Sondagar
Senior Software Engineer
+91-95125-58153 | test@example.com
Summary
Senior Software Engineer with 5+ years of experience.
Technical Skills
Frontend: Angular 13+, React.js
Professional Experience
Acme Corp Oct. 2024 – present
Senior Engineer Remote
– Built platform features
Education
Example University 2019 – 2023
Bachelor of Technology
`;

describe("parseResumeText", () => {
  it("extracts core identity and skills", () => {
    const { extracted, warnings } = parseResumeText(sample);
    expect(extracted.name).toBe("Darshak Sondagar");
    expect(extracted.contact?.email).toBe("test@example.com");
    expect(extracted.skillCategories?.length).toBeGreaterThan(0);
    expect(extracted.yearsExperience).toBe(5);
    expect(warnings).toEqual([]);
  });

  it("splits single-space title/location, joins wrapped bullets, and drops page markers", () => {
    const resume = `Darshak Sondagar
Senior Software Engineer
+91-95125-58153 | test@example.com
Summary
Engineer with 5+ years of experience.
Professional Experience
QX Global Group Oct. 2024 – Aug. 2026
Software Engineer Remote, India
– Developed an enterprise Finance Transformation application using Angular, improving frontend UI
performance by approximately 30%.
– Developed Bank Reconciliation workflows.

-- 1 of 2 --

Digipay Guru Feb. 2023 – Sep. 2024
Software Engineer Ahmedabad, Gujarat
– Integrated REST APIs.
Education
Charotar University of Science and Technology (CHARUSAT) 2019 – 2023
Bachelor of Technology – Information Technology Anand, Gujarat

-- 2 of 2 --
`;
    const { extracted } = parseResumeText(resume);
    const [qx, digipay] = extracted.experience ?? [];

    expect(qx.title).toBe("Software Engineer");
    expect(qx.location).toBe("Remote, India");
    expect(qx.highlights).toEqual([
      "Developed an enterprise Finance Transformation application using Angular, improving frontend UI performance by approximately 30%.",
      "Developed Bank Reconciliation workflows.",
    ]);
    expect(digipay.location).toBe("Ahmedabad, Gujarat");
    expect(digipay.highlights).toEqual(["Integrated REST APIs."]);
    expect(extracted.education?.[0]).toMatchObject({
      degree: "Bachelor of Technology – Information Technology",
      location: "Anand, Gujarat",
    });
  });
});