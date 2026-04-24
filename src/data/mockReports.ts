import type { Report } from "@/lib/types";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600 * 1000).toISOString();

export const SEED_REPORTS: Report[] = [
  { id: "s1", beachId: "tinos-kolymbithres", kind: "perfect_session", userHandle: "meltemi_kid", createdAt: hoursAgo(2), note: "Glassy waist-to-chest, 8s period. Pure stoke." },
  { id: "s2", beachId: "tinos-kolymbithres", kind: "waves_there", userHandle: "saltwater_sam", createdAt: hoursAgo(5) },
  { id: "s3", beachId: "ikaria-messakti", kind: "too_windy", userHandle: "ika_local", createdAt: hoursAgo(3), note: "Onshore blew it out by 10am." },
  { id: "s4", beachId: "vouliagmeni", kind: "no_waves", userHandle: "athens_paddler", createdAt: hoursAgo(1) },
  { id: "s5", beachId: "falassarna", kind: "perfect_session", userHandle: "crete_crew", createdAt: hoursAgo(6), note: "Head-high lines, barely anyone out." },
  { id: "s6", beachId: "artemida-loutsa", kind: "smaller_than_predicted", userHandle: "loutsa_grom", createdAt: hoursAgo(4) },
  { id: "s7", beachId: "tel-aviv-hilton", kind: "too_crowded", userHandle: "hilton_regular", createdAt: hoursAgo(7), note: "Every softtop in TLV here today." },
  { id: "s8", beachId: "capo-mannu", kind: "waves_there", userHandle: "sardo_surf", createdAt: hoursAgo(9) },
  { id: "s9", beachId: "tinos-agios-fokas", kind: "waves_there", userHandle: "beginner_bea", createdAt: hoursAgo(8), note: "Clean little rollers — perfect for learning." },
  { id: "s10", beachId: "falassarna", kind: "unsafe", userHandle: "crete_crew", createdAt: hoursAgo(22), note: "Strong rip on the north end. Heads up." },
];
