import type { WowClassKey } from "../assets/wow-classes";

export type PlayerRole = "DPS" | "Healer" | "Tank";

export type PlayerCharacter = {
  name: string;
  wowClass?: WowClassKey;
};

export const ROLES_BY_PLAYER: Record<string, PlayerRole[]> = {
  seb: ["DPS", "Healer"],
  martin: ["DPS", "Healer", "Tank"],
  niklas: ["DPS", "Tank"],
  niko: ["DPS"],
};

export const CHARACTERS_BY_PLAYER: Record<string, PlayerCharacter[]> = {
  martin: [
    { name: "Zorker", wowClass: "priest" },
    { name: "Rauw", wowClass: "shaman" },
  ],
  niklas: [{ name: "Ungeork", wowClass: "hunter" }],
  seb: [
    { name: "MostDope", wowClass: "warlock" },
    { name: "Nudelkriger", wowClass: "priest" },
  ],
  niko: [
    { name: "Freecry", wowClass: "demonhunter" },
    { name: "LouiLoui", wowClass: "evoker" },
  ],
};
