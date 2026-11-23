"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#services", label: "Services" },
  { href: "#contact", label: "Contact" },
];

export function Navbar({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sections = [
      { href: "#home", el: document.querySelector("#home") },
      ...links.map((l) => ({ href: l.href, el: document.querySelector(l.href) })),
    ].filter((s) => s.el) as Array<{ href: string; el: HTMLElement }>;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-42% 0px -48% 0px", threshold: [0.12, 0.35, 0.7] },
    );

    sections.forEach((s) => observer.observe(s.el));
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className="nav-wrap">
      <div className="container-xl">
        <nav className={cn("nav-bar", scrolled && "nav-bar-scrolled")}>
          <Link href="#home" className="nav-brand">
            {name.split(" ")[0]}
            <span className="text-accent-blue">/</span>
            <span className="text-text-muted">dev</span>
          </Link>

          <ul className="nav-links">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn("nav-link", active === link.href && "nav-link-active")}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <Button href="#contact" className="!py-2 !text-xs">
              Hire me
            </Button>
          </div>

          <button
            type="button"
            className="rounded-full border border-white/10 p-2 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {open ? (
          <div className="surface-card mt-2 rounded-2xl p-3 md:hidden">
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </header>
  );
}