import { supabase } from "@/integrations/supabase/client";

export const NOTIFICATION_EMAIL = "Syeda.m462006@gmail.com";
export const FORMSUBMIT_CODE = "42d88b56bf4a26a55234f0f30a77220a";
export const PUBLISHED_SITE_URL = "https://artistrybymarium.netlify.app/";
export const ADMIN_DASHBOARD_URL = "https://artistrybymarium.netlify.app/welcome100";

export interface ContactNotificationData {
  type: "contact_message";
  name: string;
  email: string;
  message: string;
}

export interface ArtworkRequestNotificationData {
  type: "artwork_request";
  name: string;
  phone: string;
  whatsapp?: string;
  email: string;
  size?: string;
  instructions?: string;
  imageUrl?: string | null;
}

export type NotificationPayload = ContactNotificationData | ArtworkRequestNotificationData;

/**
 * Sends an instant email notification to Syeda.m462006@gmail.com
 * when a client submits a message or requests a custom artwork commission.
 */
export async function sendEmailNotification(payload: NotificationPayload): Promise<boolean> {
  const isContact = payload.type === "contact_message";
  const now = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const subject = isContact
    ? `📩 New Client Inquiry for Artistry By Marium - ${payload.name}`
    : `🎨 New Custom Calligraphy Commission Order - ${payload.name}`;

  // Log in Supabase for admin audit
  try {
    await supabase.from("email_notifications").insert({
      recipient: NOTIFICATION_EMAIL,
      subject,
      payload,
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Could not log notification in database:", err);
  }

  // Build parameters for FormSubmit endpoint targeting Syeda.m462006@gmail.com
  const formData = new FormData();
  formData.append("_email", NOTIFICATION_EMAIL);
  formData.append("_subject", subject);
  formData.append("_template", "box");
  formData.append("_captcha", "false");

  formData.append("🌐 Portfolio Website", PUBLISHED_SITE_URL);
  formData.append("📅 Date & Time Received", now);

  if (isContact) {
    formData.append("🔔 Inquiry Type", "New Client General Inquiry / Hire Request");
    formData.append("👤 Client Name", payload.name);
    formData.append("✉️ Client Email", payload.email);
    formData.append("💬 Client Message", payload.message);
    formData.append("🔐 Admin Panel", ADMIN_DASHBOARD_URL);
  } else {
    formData.append("🔔 Inquiry Type", "Custom Calligraphy Artwork Commission");
    formData.append("👤 Client Name", payload.name);
    formData.append("📞 Contact Phone", payload.phone);
    formData.append("💬 WhatsApp Number", payload.whatsapp ? payload.whatsapp : "Not provided");
    formData.append("✉️ Client Email", payload.email);
    formData.append(
      "📐 Requested Canvas Size",
      payload.size ? payload.size : "Flexible / Open to artist recommendation",
    );
    formData.append(
      "📝 Custom Artwork Details",
      payload.instructions ? payload.instructions : "Standard artwork request",
    );
    if (payload.imageUrl) {
      formData.append("🖼️ Reference Image", payload.imageUrl);
    }
    formData.append("🔐 Admin Panel", ADMIN_DASHBOARD_URL);
  }

  try {
    // Attempt sending via activated FormSubmit code
    const endpoint = `https://formsubmit.co/ajax/${FORMSUBMIT_CODE}`;
    let res = await fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      // Fallback to raw email endpoint
      res = await fetch(`https://formsubmit.co/ajax/${NOTIFICATION_EMAIL}`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });
    }

    return res.ok;
  } catch (err) {
    console.error("Failed to send email notification:", err);
    return false;
  }
}
