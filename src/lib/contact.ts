import type { ContactChannel } from "../types/content";

const allowedHosts = {
  facebook: ["facebook.com", "www.facebook.com"],
  instagram: ["instagram.com", "www.instagram.com"],
  tiktok: ["tiktok.com", "www.tiktok.com"],
};

// Approval is editorial, never inferred from a reachable URL or the preview.
export function getApprovedDestination(channel: ContactChannel): string | null {
  if (channel.status !== "approved" || !channel.destination) return null;
  if (channel.id === "whatsapp") return channel.destination;
  if (channel.id === "email") {
    return !/\s/.test(channel.destination) && /^[a-z0-9.!+_-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(channel.destination)
      ? `mailto:${channel.destination}` : null;
  }
  try {
    const url = new URL(channel.destination);
    return url.protocol === "https:" && !url.username && !url.password && allowedHosts[channel.id].includes(url.hostname)
      ? url.href : null;
  } catch { return null; }
}
