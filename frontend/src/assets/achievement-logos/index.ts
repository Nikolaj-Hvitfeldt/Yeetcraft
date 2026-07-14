import balanceAct from './balanceAct.webp'
import carryJob from './carryJob.webp'
import cliffDiver from './cliffDiver.webp'
import comitteeMeeting from './comitteeMeeting.webp'
import dungeonMenace from './dungeonMenace.webp'
import theLiability from './theLiability.webp'
import theUsualSuspect from './theUsualSuspect.webp'
import yeetCannon from './yeetCannon.webp'

export const achievementLogos = {
  'the-liability': theLiability,
  'cliff-diver': cliffDiver,
  'the-usual-suspect': theUsualSuspect,
  'carry-job': carryJob,
  'dungeon-menace': dungeonMenace,
  'balancing-act': balanceAct,
  'yeet-cannon': yeetCannon,
  'committee-meeting': comitteeMeeting,
} as const

export type AchievementLogoKey = keyof typeof achievementLogos

export function isAchievementLogoKey(
  icon: string,
): icon is AchievementLogoKey {
  return icon in achievementLogos
}
