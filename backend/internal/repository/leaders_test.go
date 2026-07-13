package repository

import "testing"

func TestComputeSeasonLeaders(t *testing.T) {
	season := SeasonSummary{ID: "season-1", Name: "Season 1", IsCurrent: true}
	avatar := "https://example.com/a.png"

	leaderboard := []LeaderboardEntry{
		{PlayerID: "p1", DisplayName: "Alpha", TotalDeaths: 2, TotalYeets: 8, TotalMistakes: 10},
		{PlayerID: "p2", DisplayName: "Bravo", TotalDeaths: 5, TotalYeets: 3, TotalMistakes: 8},
		{PlayerID: "p3", DisplayName: "Charlie", AvatarURL: &avatar, TotalDeaths: 1, TotalYeets: 8, TotalMistakes: 9},
	}

	leaders := ComputeSeasonLeaders(season, leaderboard)

	if leaders.Season.ID != season.ID {
		t.Fatalf("expected season %q, got %q", season.ID, leaders.Season.ID)
	}

	if leaders.TopPlayer == nil || leaders.TopPlayer.PlayerID != "p1" {
		t.Fatalf("expected top player p1, got %#v", leaders.TopPlayer)
	}

	if len(leaders.Leaderboard) != len(leaderboard) {
		t.Fatalf("expected leaderboard length %d, got %d", len(leaderboard), len(leaders.Leaderboard))
	}

	if leaders.KingOfYeets == nil || leaders.KingOfYeets.PlayerID != "p1" {
		t.Fatalf("expected yeets king p1 by deaths tie-break, got %#v", leaders.KingOfYeets)
	}

	if leaders.KingOfDeaths == nil || leaders.KingOfDeaths.PlayerID != "p2" {
		t.Fatalf("expected deaths king p2, got %#v", leaders.KingOfDeaths)
	}
}

func TestComputeSeasonLeadersReturnsNilWhenStatsAreZero(t *testing.T) {
	season := SeasonSummary{ID: "season-1", Name: "Season 1"}
	leaderboard := []LeaderboardEntry{
		{PlayerID: "p1", DisplayName: "Alpha"},
	}

	leaders := ComputeSeasonLeaders(season, leaderboard)

	if leaders.KingOfYeets != nil || leaders.KingOfDeaths != nil || leaders.TopPlayer != nil {
		t.Fatalf("expected nil leaders for zero stats, got %#v", leaders)
	}
}
