const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

const config = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};

export const isEmailJsConfigured = Boolean(
  config.serviceId && config.templateId && config.publicKey,
);

/** Sends via EmailJS's browser REST API; keys are public by design and scoped by allowed origins. */
export async function sendWithEmailJs(templateParams: Record<string, string>) {
  const response = await fetch(EMAILJS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: config.serviceId,
      template_id: config.templateId,
      user_id: config.publicKey,
      template_params: templateParams,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `EmailJS request failed (${response.status})`);
  }
}
