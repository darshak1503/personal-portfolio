import { getProfile, getSiteConfig } from "@/lib/content";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { ServicesSection } from "@/components/sections/services-section";
import { AchievementsSection } from "@/components/sections/achievements-section";
import { EducationSection } from "@/components/sections/education-section";
import { ContactSection } from "@/components/sections/contact-section";

export default function HomePage() {
  const profile = getProfile();
  const config = getSiteConfig();

  return (
    <main className="site-stage">
      <HeroSection profile={profile} config={config} />
      <AboutSection profile={profile} />
      <SkillsSection profile={profile} />
      <ExperienceSection profile={profile} />
      <ServicesSection config={config} />
      <AchievementsSection profile={profile} />
      <EducationSection profile={profile} />
      <ContactSection config={config} />
    </main>
  );
}
