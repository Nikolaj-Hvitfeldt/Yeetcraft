import balanceAct from './balanceAct.webp'
import carryJob from './carryJob.webp'
import cliffDiver from './cliffDiver.webp'
import comitteeMeeting from './comitteeMeeting.webp'
import dungeonMenace from './dungeonMenace.webp'
import floorInspector from './floorInspector.webp'
import meatGrinder from './meatGrinder.webp'
import soloAct from './soloAct.webp'
import spotlessRun from './spotlessRun.webp'
import theBenchwarmer from './theBenchwarmer.webp'
import theLiability from './theLiability.webp'
import theUsualSuspect from './theUsualSuspect.webp'
import yeetCannon from './yeetCannon.webp'

export const achievementLogos = {
  'spotless-run': spotlessRun,
  'the-liability': theLiability,
  'solo-act': soloAct,
  'dungeon-menace': dungeonMenace,
  'the-usual-suspect': theUsualSuspect,
  'cliff-diver': cliffDiver,
  'floor-inspector': floorInspector,
  'carry-job': carryJob,
  'balancing-act': balanceAct,
  'the-benchwarmer': theBenchwarmer,
  'meat-grinder': meatGrinder,
  'yeet-cannon': yeetCannon,
  'committee-meeting': comitteeMeeting,
} as const

export type AchievementLogoKey = keyof typeof achievementLogos

export function isAchievementLogoKey(
  icon: string,
): icon is AchievementLogoKey {
  return icon in achievementLogos
}
