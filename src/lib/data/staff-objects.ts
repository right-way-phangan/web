import "server-only";
import { currentAgentId } from "@/lib/auth/require-admin";
import { getAllObjects } from "@/lib/data/objects";
import type { RealEstateObject } from "@/types/object";

/**
 * Catalogue for /admin screens, scoped to the viewer. An agent sees the object
 * (price, specs, photos, map) but not the seller side: owner contacts, working
 * documents, Drive folder, the raw legacy notes (may carry commission terms),
 * the owner call log. Otherwise an agent could take the owner and go direct.
 * Admin gets the full object. Kept apart from getAllObjects, which public pages
 * use — reading the session there would make them dynamic.
 */
export function stripSellerSide(o: RealEstateObject): RealEstateObject {
  const {
    ownerName, contacts, driveFolder, docs, descriptionRaw, ddLawyer,
    outreachStatus, outreachNote, outreachDate, outreachAttempts, reasonForSelling,
    ...rest
  } = o;
  void ownerName; void contacts; void driveFolder; void docs; void descriptionRaw; void ddLawyer;
  void outreachStatus; void outreachNote; void outreachDate; void outreachAttempts; void reasonForSelling;
  return rest;
}

export async function getStaffObjects(): Promise<RealEstateObject[]> {
  const all = await getAllObjects();
  return (await currentAgentId()) === null ? all : all.map(stripSellerSide);
}

export async function getStaffObject(rw: string): Promise<RealEstateObject | null> {
  return (await getStaffObjects()).find((o) => o.rwNumber === rw) ?? null;
}
