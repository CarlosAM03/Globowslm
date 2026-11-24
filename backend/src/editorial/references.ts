import type { ContentKind } from "../generated/prisma/client.js";
import type { ValidatedPayload } from "./dto.js";

type MediaRef = { mediaId: string; role: string; position: number; type: "image" | "video" | "either" };
type EntryRef = { targetId: string; role: string; position: number; kind: ContentKind };

export function collectReferences(payload: ValidatedPayload): { media: MediaRef[]; entries: EntryRef[] } {
  const media: MediaRef[] = [];
  const entries: EntryRef[] = [];
  const addMedia = (id: string | undefined, role: string, type: MediaRef["type"], position = 0) => {
    if (id) media.push({ mediaId: id, role, type, position });
  };
  const addEntry = (targetId: string, role: string, kind: ContentKind, position = 0) => {
    entries.push({ targetId, role, kind, position });
  };

  switch (payload.kind) {
    case "SITE":
      addMedia(payload.data.hero.photoRef, "hero", "image");
      addMedia(payload.data.about.portraitRef, "portrait", "image");
      break;
    case "SERVICE":
      addMedia(payload.data.imageRef, "image", "image");
      payload.data.eventTypes?.forEach((id, index) => addEntry(id, "eventType", "EVENT_TYPE", index));
      break;
    case "EVENT_TYPE":
      addMedia(payload.data.imageRef, "image", "image");
      break;
    case "GALLERY":
      addEntry(payload.data.categoryRef, "category", "GALLERY_CATEGORY");
      payload.data.orderedPhotoRefs.forEach((photo, index) => addMedia(photo.mediaRef, "photo", "image", index));
      break;
    case "TRAINING":
      addMedia(payload.data.photoRef, "photo", "image");
      addMedia(payload.data.videoRef, "video", "video");
      break;
    case "CERTIFICATION":
      payload.data.evidenceMediaRefs.forEach((id, index) => addMedia(id, "evidence", "either", index));
      break;
    case "POST":
      addMedia(payload.data.coverRef, "cover", "image");
      payload.data.categoryRefs.forEach((id, index) => addEntry(id, "category", "BLOG_CATEGORY", index));
      payload.data.blocks.forEach((block, index) => {
        if (block.type === "image" || block.type === "video") addMedia(block.mediaRef, "block", block.type, index);
      });
      break;
  }
  return { media, entries };
}
