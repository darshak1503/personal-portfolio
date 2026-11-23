import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(20),
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = bodySchema.parse(json);

    const webhook = process.env.CONTACT_WEBHOOK_URL;
    const resendKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;

    if (webhook) {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "portfolio",
          ...data,
          submittedAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        return NextResponse.json(
          { error: "Webhook delivery failed. Check CONTACT_WEBHOOK_URL." },
          { status: 502 },
        );
      }
      return NextResponse.json({ ok: true });
    }

    if (resendKey && to) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
          to: [to],
          reply_to: data.email,
          subject: `Portfolio inquiry from ${data.name}`,
          text: `Name: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company || "—"}\n\n${data.message}`,
        }),
      });
      if (!response.ok) {
        const detail = await response.text();
        return NextResponse.json(
          { error: `Email delivery failed: ${detail}` },
          { status: 502 },
        );
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      {
        error:
          "Contact delivery is not configured. Set CONTACT_WEBHOOK_URL or RESEND_API_KEY + CONTACT_TO_EMAIL.",
      },
      { status: 503 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}