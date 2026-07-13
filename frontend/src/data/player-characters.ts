import type { WowClassKey } from "../assets/wow-classes";

export type PlayerCharacter = {
  name: string;
  wowClass?: WowClassKey;
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
