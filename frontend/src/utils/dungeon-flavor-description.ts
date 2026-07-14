export type FlavorDescriptionContext = {
  dungeonName: string
  totalMistakes: number
  totalDeaths: number
  totalYeets: number
  playerCount: number
  contributorCount: number
  cleanPlayerCount: number
  seasonAverageMistakes: number
  topPlayerName?: string
  blameShare?: number
  yeetSharePercent: number
  deathSharePercent: number
}

function yeetLabel(count: number): string {
  return count === 1 ? 'yeet' : 'yeets'
}

function playerLabel(count: number): string {
  return count === 1 ? 'player' : 'players'
}

function mistakeTotals(ctx: FlavorDescriptionContext): string {
  return `${ctx.totalMistakes} mistakes (${ctx.totalDeaths} deaths, ${ctx.totalYeets} ${yeetLabel(ctx.totalYeets)})`
}

function describeMeatGrinder(ctx: FlavorDescriptionContext): string {
  if (ctx.totalMistakes <= 0) {
    return `${ctx.dungeonName} has not earned the grinder title on the scoreboard yet.`
  }

  return `${ctx.dungeonName} is the season's roughest grind. ${mistakeTotals(ctx)}, well above the ${ctx.seasonAverageMistakes} per-dungeon average.`
}

function describeLaunchPad(ctx: FlavorDescriptionContext): string {
  if (ctx.totalYeets <= 0) {
    return `${ctx.dungeonName} holds the launch pad title, but nobody has taken flight yet.`
  }

  return `${ctx.dungeonName} sends more bodies flying than any other key. ${ctx.totalYeets} ${yeetLabel(ctx.totalYeets)} this season, with ${ctx.totalDeaths} deaths tagging along.`
}

function describeGraveyardShift(ctx: FlavorDescriptionContext): string {
  if (ctx.totalDeaths <= 0) {
    return `${ctx.dungeonName} has the graveyard shift nameplate, but the night crew has been idle.`
  }

  return `${ctx.dungeonName} runs the longest graveyard shift in the season. ${ctx.totalDeaths} deaths, more than anywhere else.`
}

function describeScapegoatFactory(ctx: FlavorDescriptionContext): string {
  const offender = ctx.topPlayerName ?? 'One player'
  const share = ctx.blameShare ?? 0

  return `${ctx.dungeonName} stamps out scapegoats on demand. ${offender} took ${share}% of the blame here.`
}

function describeYeetCannon(ctx: FlavorDescriptionContext): string {
  return `${ctx.dungeonName} treats yeets like artillery. ${ctx.yeetSharePercent}% of mistakes here were launches, the highest share in the season.`
}

function describeFloorIsLava(ctx: FlavorDescriptionContext): string {
  return `${ctx.dungeonName} collects deaths at a brutal rate. ${ctx.deathSharePercent}% of mistakes here were deaths, worst in the season.`
}

function describeCommitteeMeeting(ctx: FlavorDescriptionContext): string {
  if (ctx.totalMistakes <= 0) {
    return `${ctx.dungeonName} called a meeting, but the agenda was empty.`
  }

  const contributors =
    ctx.playerCount > 0
      ? `${ctx.contributorCount} of ${ctx.playerCount} ${playerLabel(ctx.playerCount)} contributed`
      : 'Blame spread wide'

  return `${ctx.dungeonName} runs on shared accountability. ${mistakeTotals(ctx)}. ${contributors}, and no one player owned the room.`
}

function describeQuietLobby(ctx: FlavorDescriptionContext): string {
  if (ctx.totalMistakes <= 0) {
    return `${ctx.dungeonName} is suspiciously quiet. Nothing on the ledger.`
  }

  return `${ctx.dungeonName} barely makes a sound. ${ctx.totalMistakes} mistakes all season, the lowest count in the rotation.`
}

function describeCleanRecord(ctx: FlavorDescriptionContext): string {
  if (ctx.playerCount > 0) {
    return `${ctx.dungeonName} is spotless across ${ctx.playerCount} ${playerLabel(ctx.playerCount)}. No deaths, no yeets.`
  }

  return `${ctx.dungeonName} is spotless. No deaths, no yeets.`
}

function describeGravityLounge(ctx: FlavorDescriptionContext): string {
  return `${ctx.dungeonName} is yeet country. ${ctx.yeetSharePercent}% of mistakes here were launches. ${mistakeTotals(ctx)}.`
}

function describeRespawnTaxOffice(ctx: FlavorDescriptionContext): string {
  return `${ctx.dungeonName} bills mostly in deaths. ${ctx.deathSharePercent}% of mistakes here were wipes. ${mistakeTotals(ctx)}.`
}

function describePunchingBag(ctx: FlavorDescriptionContext): string {
  return `${ctx.dungeonName} takes more punishment than most keys. ${mistakeTotals(ctx)}, above the ${ctx.seasonAverageMistakes} per-dungeon average.`
}

function describeSoftTouch(ctx: FlavorDescriptionContext): string {
  return `${ctx.dungeonName} went easy on the group. ${mistakeTotals(ctx)}, below the ${ctx.seasonAverageMistakes} per-dungeon average.`
}

function describeSeasonRegular(ctx: FlavorDescriptionContext): string {
  if (ctx.totalMistakes <= 0) {
    return describeCleanRecord(ctx)
  }

  return `${ctx.dungeonName} sits near the middle of the season. ${mistakeTotals(ctx)}, close to the ${ctx.seasonAverageMistakes} per-dungeon average.`
}

const FLAVOR_DESCRIPTION_BY_TITLE: Record<
  string,
  (ctx: FlavorDescriptionContext) => string
> = {
  'The Meat Grinder': describeMeatGrinder,
  'The Launch Pad': describeLaunchPad,
  'The Graveyard Shift': describeGraveyardShift,
  'The Scapegoat Factory': describeScapegoatFactory,
  'The Yeet Cannon': describeYeetCannon,
  'The Floor Is Lava': describeFloorIsLava,
  'The Committee Meeting': describeCommitteeMeeting,
  'The Quiet Lobby': describeQuietLobby,
  'The Clean Record': describeCleanRecord,
  'The Gravity Lounge': describeGravityLounge,
  'The Respawn Tax Office': describeRespawnTaxOffice,
  'The Punching Bag': describePunchingBag,
  'The Soft Touch': describeSoftTouch,
  'The Season Regular': describeSeasonRegular,
}

export function getFlavorDescription(
  title: string,
  context: FlavorDescriptionContext,
): string {
  const builder = FLAVOR_DESCRIPTION_BY_TITLE[title]
  if (!builder) {
    return `${context.dungeonName} earned "${title}" this season.`
  }

  return builder(context)
}

export const FLAVOR_DESCRIPTION_TITLES = Object.keys(FLAVOR_DESCRIPTION_BY_TITLE)
