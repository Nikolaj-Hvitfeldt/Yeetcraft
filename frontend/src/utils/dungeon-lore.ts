import type { DungeonSummary } from "../api/types";
import { toSlug } from "./slug";

function normalizeDungeonName(input: string): string {
  return toSlug(input).replace(/-/g, "");
}

// Brief lore blurbs sourced from warcraft.wiki.gg Adventure Guide summaries.
const DUNGEON_LORE_BY_NAME: Record<string, string> = {
  magistersterrace:
    "The heart of sin'dorei arcane study on Quel'Danas, where the Cynosure of Twilight waits behind magister wards.",
  maisaracaverns:
    "Beneath the sacred Maisara Hills, Vilebranch trolls sacrifice Witherbark captives to fuel dark rituals in the depths.",
  nexuspointxenas:
    "A fractured research facility where void and arcane energy still pulse through collapsing halls and voidwalking guardians.",
  pitofsaron:
    "A frozen Icecrown pit where prisoners mined saronite for the Scourge beneath the watch of Tyrannus and his lieutenants.",
  algetharacademy:
    "The great dragon academy of the Dragon Isles, reopened under Headteacher Doragosa and open to students from every walk of life.",
  windrunnerspire:
    "The ancestral Windrunner home in Eversong Woods, now haunted by grief and spirits that cannot find peace.",
  skyreach:
    "The arakkoa capital atop the Spires of Arak, where the Adherents of Rukhmar wield Apexis sun power against their enemies.",
  theseatofthetriumvirate:
    "A long-abandoned seat of eredar power on Argus, now overtaken by the Void and the Shadowguard seeking L'ura.",
  denofnalorakk:
    "The den where the wounded Loa of War, Nalorakk, tests any Amani who seek to heal the rift and earn his blessing.",
  kingsrest:
    "A sacred Zandalari tomb where kings, conquerors, and tyrants of the empire are honored in death.",
  rubylifepools:
    "The ancestral nesting grounds of the dragonflights, sacred waters tended by the red dragonflight for all dragonkind.",
  altaroffangs:
    "An ancient Amani altar on the Coiled Isle, once used to seal the Vaults of Atal'Utek from a nest of venomous horrors.",
  theblindingvale:
    "Where the Lightbloom first took root in Harandar, breeding new creatures and magic behind a hideous, blinding glare.",
  murderrow:
    "The shadowed streets of Silvermoon, where a fel-smuggling ring preys on fear since the Voidstorm appeared.",
  voidscararena:
    "A void-touched arena where a cruel master imprisons creatures from across the cosmos for bloody spectacle.",
  templeofsethraliss:
    "A desert temple built around the remains of Sethraliss, the snake loa who once stopped Mythrax at terrible cost.",
};

const DEFAULT_DUNGEON_LORE =
  "A dungeon on the season roster, waiting to add another story to the ledger.";

export function getDungeonLore(dungeon: Pick<DungeonSummary, "name">): string {
  const lore = DUNGEON_LORE_BY_NAME[normalizeDungeonName(dungeon.name)];
  return lore ?? DEFAULT_DUNGEON_LORE;
}
