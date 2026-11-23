"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Copy, Check, Loader2 } from "lucide-react";
import type { SiteConfig } from "@/types/content";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { isEmailJsConfigured, sendWithEmailJs } from "@/lib/emailjs";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  company: z.string().optional(),
  message: z.string().min(20, "Please add more detail (20+ characters)"),
  website: z.string().max(0, "Spam detected").optional(),
});

type FormValues = z.infer<typeof schema>;

export function ContactSection({ config }: { config: SiteConfig }) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { website: "" },
  });

  async function onSubmit(values: FormValues) {
    setStatus("loading");
    setErrorMessage(null);
    try {
      if (isEmailJsConfigured) {
        await sendWithEmailJs({
          name: values.name,
          email: values.email,
          company: values.company || "—",
          message: values.message,
          title: `Portfolio inquiry from ${values.name}`,
          time: new Date().toLocaleString(),
        });
      } else {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Submission failed");
      }
      setStatus("success");
      reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Unable to send message");
    }
  }

  async function copyEmail() {
    await navigator.clipboard.writeText(config.contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="contact" className="section-shell section-padding section-panel">
      <div className="container-xl grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeading
            index="06"
            eyebrow="Contact"
            title="Let’s build something exceptional"
            description="Share your product goals, timelines, and technical context. I typically respond within 1–2 business days."
          />
          <Reveal>
          <div className="spot-card glass-panel rounded-2xl p-5">
            <p className="text-sm text-text-muted">Email</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <a className="text-base" href={`mailto:${config.contact.email}`}>
                {config.contact.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="rounded-lg border border-white/10 p-2"
                aria-label="Copy email"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            {config.contact.phone ? (
              <p className="mt-4 text-sm text-text-muted">{config.contact.phone}</p>
            ) : null}
          </div>
          </Reveal>
        </div>

        <Reveal x={60} y={0}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="glass-panel rounded-3xl p-6 sm:p-8"
          noValidate
        >
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden
            {...register("website")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={errors.name?.message}>
              <input
                className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent-cyan"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input
                className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent-cyan"
                type="email"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
            </Field>
          </div>

          <Field label="Company (optional)" error={errors.company?.message}>
            <input
              className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent-cyan"
              {...register("company")}
            />
          </Field>

          <Field label="Project details" error={errors.message?.message}>
            <textarea
              className="min-h-32 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent-cyan"
              {...register("message")}
            />
          </Field>

          {status === "success" ? (
            <p className="mb-4 text-sm text-accent-cyan" role="status">
              Message sent successfully. Thank you!
            </p>
          ) : null}
          {status === "error" && errorMessage ? (
            <p className="mb-4 text-sm text-red-400" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
              </>
            ) : (
              "Send collaboration request"
            )}
          </Button>
        </form>
        </Reveal>
      </div>

    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-4 block text-sm">
      <span className="mb-1.5 block text-text-muted">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-400">{error}</span> : null}
    </label>
  );
}
