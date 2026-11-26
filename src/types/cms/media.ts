export type Asset = {
  id: string; originalName: string; mime: string; size: number;
  width: number | null; height: number | null; duration: number | null;
  alt: string; title: string; status: "STAGED" | "READY" | "RETIRED" | "DELETING"; version: number; createdAt: string;
};

export type AssetType = "image" | "video";
export type AssetPage = { items: Asset[]; page: number; pageSize: number; total: number; limitsMiB: { image: number; video: number } };
