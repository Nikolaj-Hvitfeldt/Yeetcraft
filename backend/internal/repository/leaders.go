package repository

import "context"

type SeasonLeaderPlayer struct {
	PlayerID    string  `json:"playerId"`
	DisplayName string  `json:"displayName"`
	AvatarURL   *string `json:"avatarUrl"`
	Yeets       int     `json:"yeets"`
	Deaths      int     `json:"deaths"`
}

type SeasonTopPlayer struct {
	PlayerID      string  `json:"playerId"`
	DisplayName   string  `json:"displayName"`
	AvatarURL     *string `json:"avatarUrl"`
	TotalMistakes int     `json:"totalMistakes"`
	TotalYeets    int     `json:"totalYeets"`
	TotalDeaths   int     `json:"totalDeaths"`
}

type SeasonLeaders struct {
	Season                SeasonSummary         `json:"season"`
	KingOfYeets           *SeasonLeaderPlayer   `json:"kingOfYeets"`
	KingOfDeaths          *SeasonLeaderPlayer   `json:"kingOfDeaths"`
	TopPlayer             *SeasonTopPlayer      `json:"topPlayer"`
	DungeonMistakeLeaders []DungeonMistakeLeader `json:"dungeonMistakeLeaders"`
}

type DungeonMistakeLeader struct {
	DungeonID     string `json:"dungeonId"`
	PlayerID      string `json:"playerId"`
	TotalMistakes int    `json:"totalMistakes"`
}

func (statsRepository StatsRepository) GetSeasonLeaders(ctx context.Context, seasonID string) (SeasonLeaders, error) {
	season, err := statsRepository.resolveSeason(ctx, seasonID)
	if err != nil {
		return SeasonLeaders{}, err
	}

	leaderboard, err := statsRepository.ListLeaderboard(ctx, season.ID)
	if err != nil {
		return SeasonLeaders{}, err
	}

	dungeonMistakeLeaders, err := statsRepository.ListDungeonMistakeLeaders(ctx, season.ID)
	if err != nil {
		return SeasonLeaders{}, err
	}

	leaders := ComputeSeasonLeaders(season, leaderboard)
	leaders.DungeonMistakeLeaders = dungeonMistakeLeaders

	return leaders, nil
}

func ComputeSeasonLeaders(season SeasonSummary, leaderboard []LeaderboardEntry) SeasonLeaders {
	return SeasonLeaders{
		Season:       season,
		KingOfYeets:  findYeetsKing(leaderboard),
		KingOfDeaths: findDeathsKing(leaderboard),
		TopPlayer:    findTopPlayer(leaderboard),
	}
}

func findYeetsKing(leaderboard []LeaderboardEntry) *SeasonLeaderPlayer {
	entry := findLeader(leaderboard, func(player LeaderboardEntry) int { return player.TotalYeets }, func(player LeaderboardEntry) int { return player.TotalDeaths })
	if entry == nil || entry.TotalYeets == 0 {
		return nil
	}

	return toSeasonLeaderPlayer(*entry)
}

func findDeathsKing(leaderboard []LeaderboardEntry) *SeasonLeaderPlayer {
	entry := findLeader(leaderboard, func(player LeaderboardEntry) int { return player.TotalDeaths }, func(player LeaderboardEntry) int { return player.TotalYeets })
	if entry == nil || entry.TotalDeaths == 0 {
		return nil
	}

	return toSeasonLeaderPlayer(*entry)
}

func findTopPlayer(leaderboard []LeaderboardEntry) *SeasonTopPlayer {
	entry := findLeader(leaderboard, func(player LeaderboardEntry) int { return player.TotalMistakes }, func(player LeaderboardEntry) int { return player.TotalYeets })
	if entry == nil || entry.TotalMistakes == 0 {
		return nil
	}

	return &SeasonTopPlayer{
		PlayerID:      entry.PlayerID,
		DisplayName:   entry.DisplayName,
		AvatarURL:     entry.AvatarURL,
		TotalMistakes: entry.TotalMistakes,
		TotalYeets:    entry.TotalYeets,
		TotalDeaths:   entry.TotalDeaths,
	}
}

func findLeader(
	leaderboard []LeaderboardEntry,
	primary func(LeaderboardEntry) int,
	tieBreak func(LeaderboardEntry) int,
) *LeaderboardEntry {
	if len(leaderboard) == 0 {
		return nil
	}

	maxValue := primary(leaderboard[0])
	for _, entry := range leaderboard[1:] {
		if value := primary(entry); value > maxValue {
			maxValue = value
		}
	}

	if maxValue == 0 {
		return nil
	}

	var leader *LeaderboardEntry
	for index := range leaderboard {
		entry := leaderboard[index]
		if primary(entry) != maxValue {
			continue
		}

		if leader == nil || tieBreak(entry) > tieBreak(*leader) {
			leader = &entry
		}
	}

	return leader
}

func toSeasonLeaderPlayer(entry LeaderboardEntry) *SeasonLeaderPlayer {
	return &SeasonLeaderPlayer{
		PlayerID:    entry.PlayerID,
		DisplayName: entry.DisplayName,
		AvatarURL:   entry.AvatarURL,
		Yeets:       entry.TotalYeets,
		Deaths:      entry.TotalDeaths,
	}
}
