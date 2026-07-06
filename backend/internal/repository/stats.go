package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrDatabaseNotConfigured = errors.New("database is not configured")
	ErrNotFound              = errors.New("resource not found")
	ErrNegativeStat          = errors.New("stat value cannot be below zero")
)

type StatField string

const (
	StatFieldDeaths StatField = "deaths"
	StatFieldYeets  StatField = "yeets"
)

type StatsRepository struct {
	pool *pgxpool.Pool
}

type PlayerSummary struct {
	ID          string  `json:"id"`
	DisplayName string  `json:"displayName"`
	AvatarURL   *string `json:"avatarUrl"`
}

type SeasonSummary struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Expansion *string `json:"expansion"`
	IsCurrent bool    `json:"isCurrent"`
}

type DungeonSummary struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	ShortName     *string `json:"shortName"`
	DisplayOrder  int     `json:"displayOrder"`
	TotalDeaths   int     `json:"totalDeaths"`
	TotalYeets    int     `json:"totalYeets"`
	TotalMistakes int     `json:"totalMistakes"`
}

type LeaderboardEntry struct {
	PlayerID      string  `json:"playerId"`
	DisplayName   string  `json:"displayName"`
	AvatarURL     *string `json:"avatarUrl"`
	TotalDeaths   int     `json:"totalDeaths"`
	TotalYeets    int     `json:"totalYeets"`
	TotalMistakes int     `json:"totalMistakes"`
}

type DungeonStats struct {
	Dungeon       DungeonSummary `json:"dungeon"`
	Deaths        int            `json:"deaths"`
	Yeets         int            `json:"yeets"`
	TotalMistakes int            `json:"totalMistakes"`
}

type PlayerStats struct {
	Player        PlayerSummary  `json:"player"`
	Season        SeasonSummary  `json:"season"`
	TotalDeaths   int            `json:"totalDeaths"`
	TotalYeets    int            `json:"totalYeets"`
	TotalMistakes int            `json:"totalMistakes"`
	Dungeons      []DungeonStats `json:"dungeons"`
}

type StatRow struct {
	PlayerID      string `json:"playerId"`
	SeasonID      string `json:"seasonId"`
	DungeonID     string `json:"dungeonId"`
	Deaths        int    `json:"deaths"`
	Yeets         int    `json:"yeets"`
	TotalMistakes int    `json:"totalMistakes"`
}

func NewStatsRepository(pool *pgxpool.Pool) StatsRepository {
	return StatsRepository{
		pool: pool,
	}
}

func (statsRepository StatsRepository) ListLeaderboard(ctx context.Context, seasonID string) ([]LeaderboardEntry, error) {
	if statsRepository.pool == nil {
		return nil, ErrDatabaseNotConfigured
	}

	season, err := statsRepository.resolveSeason(ctx, seasonID)
	if err != nil {
		return nil, err
	}

	const query = `
		select
			players.id::text,
			players.display_name,
			players.avatar_url,
			coalesce(sum(player_dungeon_stats.deaths), 0)::int as total_deaths,
			coalesce(sum(player_dungeon_stats.yeets), 0)::int as total_yeets,
			(coalesce(sum(player_dungeon_stats.deaths), 0) + coalesce(sum(player_dungeon_stats.yeets), 0))::int as total_mistakes
		from players
		left join player_dungeon_stats
			on player_dungeon_stats.player_id = players.id
			and player_dungeon_stats.season_id = $1::uuid
		group by players.id, players.display_name, players.avatar_url
		order by total_mistakes desc, total_yeets desc, players.display_name asc
	`

	rows, err := statsRepository.pool.Query(ctx, query, season.ID)
	if err != nil {
		return nil, fmt.Errorf("query leaderboard: %w", err)
	}
	defer rows.Close()

	leaderboard := make([]LeaderboardEntry, 0)
	for rows.Next() {
		var entry LeaderboardEntry
		if err := rows.Scan(
			&entry.PlayerID,
			&entry.DisplayName,
			&entry.AvatarURL,
			&entry.TotalDeaths,
			&entry.TotalYeets,
			&entry.TotalMistakes,
		); err != nil {
			return nil, fmt.Errorf("scan leaderboard: %w", err)
		}
		leaderboard = append(leaderboard, entry)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate leaderboard: %w", err)
	}

	return leaderboard, nil
}

func (statsRepository StatsRepository) GetPlayerStats(ctx context.Context, playerID string, seasonID string) (PlayerStats, error) {
	if statsRepository.pool == nil {
		return PlayerStats{}, ErrDatabaseNotConfigured
	}

	season, err := statsRepository.resolveSeason(ctx, seasonID)
	if err != nil {
		return PlayerStats{}, err
	}

	player, err := statsRepository.getPlayer(ctx, playerID)
	if err != nil {
		return PlayerStats{}, err
	}

	const query = `
		select
			dungeons.id::text,
			dungeons.name,
			dungeons.short_name,
			season_dungeons.display_order,
			coalesce(player_dungeon_stats.deaths, 0)::int as deaths,
			coalesce(player_dungeon_stats.yeets, 0)::int as yeets
		from season_dungeons
		join dungeons on dungeons.id = season_dungeons.dungeon_id
		left join player_dungeon_stats
			on player_dungeon_stats.season_id = season_dungeons.season_id
			and player_dungeon_stats.dungeon_id = season_dungeons.dungeon_id
			and player_dungeon_stats.player_id = $1::uuid
		where season_dungeons.season_id = $2::uuid
		order by season_dungeons.display_order asc, dungeons.name asc
	`

	rows, err := statsRepository.pool.Query(ctx, query, playerID, season.ID)
	if err != nil {
		return PlayerStats{}, fmt.Errorf("query player stats: %w", err)
	}
	defer rows.Close()

	playerStats := PlayerStats{
		Player:   player,
		Season:   season,
		Dungeons: make([]DungeonStats, 0),
	}

	for rows.Next() {
		var dungeonStats DungeonStats
		if err := rows.Scan(
			&dungeonStats.Dungeon.ID,
			&dungeonStats.Dungeon.Name,
			&dungeonStats.Dungeon.ShortName,
			&dungeonStats.Dungeon.DisplayOrder,
			&dungeonStats.Deaths,
			&dungeonStats.Yeets,
		); err != nil {
			return PlayerStats{}, fmt.Errorf("scan player stats: %w", err)
		}

		dungeonStats.TotalMistakes = dungeonStats.Deaths + dungeonStats.Yeets
		playerStats.TotalDeaths += dungeonStats.Deaths
		playerStats.TotalYeets += dungeonStats.Yeets
		playerStats.TotalMistakes += dungeonStats.TotalMistakes
		playerStats.Dungeons = append(playerStats.Dungeons, dungeonStats)
	}

	if err := rows.Err(); err != nil {
		return PlayerStats{}, fmt.Errorf("iterate player stats: %w", err)
	}

	return playerStats, nil
}

func (statsRepository StatsRepository) ListSeasons(ctx context.Context) ([]SeasonSummary, error) {
	if statsRepository.pool == nil {
		return nil, ErrDatabaseNotConfigured
	}

	const query = `
		select id::text, name, expansion, is_current
		from seasons
		order by is_current desc, created_at desc, name asc
	`

	rows, err := statsRepository.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query seasons: %w", err)
	}
	defer rows.Close()

	seasons := make([]SeasonSummary, 0)
	for rows.Next() {
		var season SeasonSummary
		if err := rows.Scan(&season.ID, &season.Name, &season.Expansion, &season.IsCurrent); err != nil {
			return nil, fmt.Errorf("scan season: %w", err)
		}
		seasons = append(seasons, season)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate seasons: %w", err)
	}

	return seasons, nil
}

func (statsRepository StatsRepository) ListCurrentSeasonDungeons(ctx context.Context) (SeasonSummary, []DungeonSummary, error) {
	return statsRepository.ListSeasonDungeons(ctx, "")
}

func (statsRepository StatsRepository) ListSeasonDungeons(ctx context.Context, seasonID string) (SeasonSummary, []DungeonSummary, error) {
	if statsRepository.pool == nil {
		return SeasonSummary{}, nil, ErrDatabaseNotConfigured
	}

	season, err := statsRepository.resolveSeason(ctx, seasonID)
	if err != nil {
		return SeasonSummary{}, nil, err
	}

	const query = `
		select
			dungeons.id::text,
			dungeons.name,
			dungeons.short_name,
			season_dungeons.display_order,
			coalesce(sum(player_dungeon_stats.deaths), 0)::int as total_deaths,
			coalesce(sum(player_dungeon_stats.yeets), 0)::int as total_yeets,
			(coalesce(sum(player_dungeon_stats.deaths), 0) + coalesce(sum(player_dungeon_stats.yeets), 0))::int as total_mistakes
		from season_dungeons
		join dungeons on dungeons.id = season_dungeons.dungeon_id
		left join player_dungeon_stats
			on player_dungeon_stats.season_id = season_dungeons.season_id
			and player_dungeon_stats.dungeon_id = season_dungeons.dungeon_id
		where season_dungeons.season_id = $1::uuid
		group by dungeons.id, dungeons.name, dungeons.short_name, season_dungeons.display_order
		order by season_dungeons.display_order asc, dungeons.name asc
	`

	rows, err := statsRepository.pool.Query(ctx, query, season.ID)
	if err != nil {
		return SeasonSummary{}, nil, fmt.Errorf("query season dungeons: %w", err)
	}
	defer rows.Close()

	dungeons := make([]DungeonSummary, 0)
	for rows.Next() {
		var dungeon DungeonSummary
		if err := rows.Scan(
			&dungeon.ID,
			&dungeon.Name,
			&dungeon.ShortName,
			&dungeon.DisplayOrder,
			&dungeon.TotalDeaths,
			&dungeon.TotalYeets,
			&dungeon.TotalMistakes,
		); err != nil {
			return SeasonSummary{}, nil, fmt.Errorf("scan season dungeon: %w", err)
		}
		dungeons = append(dungeons, dungeon)
	}

	if err := rows.Err(); err != nil {
		return SeasonSummary{}, nil, fmt.Errorf("iterate season dungeons: %w", err)
	}

	return season, dungeons, nil
}

func (statsRepository StatsRepository) SetStats(ctx context.Context, playerID string, seasonID string, dungeonID string, deaths int, yeets int) (StatRow, error) {
	if statsRepository.pool == nil {
		return StatRow{}, ErrDatabaseNotConfigured
	}

	if err := statsRepository.ensureStatReferencesExist(ctx, playerID, seasonID, dungeonID); err != nil {
		return StatRow{}, err
	}

	const query = `
		insert into player_dungeon_stats (player_id, season_id, dungeon_id, deaths, yeets)
		values ($1::uuid, $2::uuid, $3::uuid, $4, $5)
		on conflict (player_id, season_id, dungeon_id)
		do update set
			deaths = excluded.deaths,
			yeets = excluded.yeets
		returning player_id::text, season_id::text, dungeon_id::text, deaths, yeets, deaths + yeets as total_mistakes
	`

	var statRow StatRow
	if err := statsRepository.pool.QueryRow(ctx, query, playerID, seasonID, dungeonID, deaths, yeets).Scan(
		&statRow.PlayerID,
		&statRow.SeasonID,
		&statRow.DungeonID,
		&statRow.Deaths,
		&statRow.Yeets,
		&statRow.TotalMistakes,
	); err != nil {
		return StatRow{}, fmt.Errorf("set stats: %w", err)
	}

	return statRow, nil
}

func (statsRepository StatsRepository) AdjustStat(ctx context.Context, playerID string, seasonID string, dungeonID string, field StatField, delta int) (StatRow, error) {
	if statsRepository.pool == nil {
		return StatRow{}, ErrDatabaseNotConfigured
	}

	if err := statsRepository.ensureStatReferencesExist(ctx, playerID, seasonID, dungeonID); err != nil {
		return StatRow{}, err
	}

	transaction, err := statsRepository.pool.Begin(ctx)
	if err != nil {
		return StatRow{}, fmt.Errorf("begin adjust stat transaction: %w", err)
	}
	defer transaction.Rollback(ctx)

	deaths, yeets, err := getLockedStatValues(ctx, transaction, playerID, seasonID, dungeonID)
	if err != nil {
		return StatRow{}, err
	}

	switch field {
	case StatFieldDeaths:
		deaths += delta
	case StatFieldYeets:
		yeets += delta
	}

	if deaths < 0 || yeets < 0 {
		return StatRow{}, ErrNegativeStat
	}

	statRow, err := upsertStatValues(ctx, transaction, playerID, seasonID, dungeonID, deaths, yeets)
	if err != nil {
		return StatRow{}, err
	}

	if err := transaction.Commit(ctx); err != nil {
		return StatRow{}, fmt.Errorf("commit adjust stat transaction: %w", err)
	}

	return statRow, nil
}

func (statsRepository StatsRepository) resolveSeason(ctx context.Context, seasonID string) (SeasonSummary, error) {
	query := `
		select id::text, name, expansion, is_current
		from seasons
		where is_current = true
	`
	args := []any{}

	if seasonID != "" {
		query = `
			select id::text, name, expansion, is_current
			from seasons
			where id = $1::uuid
		`
		args = append(args, seasonID)
	}

	var season SeasonSummary
	if err := statsRepository.pool.QueryRow(ctx, query, args...).Scan(
		&season.ID,
		&season.Name,
		&season.Expansion,
		&season.IsCurrent,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return SeasonSummary{}, ErrNotFound
		}
		return SeasonSummary{}, fmt.Errorf("resolve season: %w", err)
	}

	return season, nil
}

func (statsRepository StatsRepository) getPlayer(ctx context.Context, playerID string) (PlayerSummary, error) {
	const query = `
		select id::text, display_name, avatar_url
		from players
		where id = $1::uuid
	`

	var player PlayerSummary
	if err := statsRepository.pool.QueryRow(ctx, query, playerID).Scan(
		&player.ID,
		&player.DisplayName,
		&player.AvatarURL,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return PlayerSummary{}, ErrNotFound
		}
		return PlayerSummary{}, fmt.Errorf("get player: %w", err)
	}

	return player, nil
}

func (statsRepository StatsRepository) ensureStatReferencesExist(ctx context.Context, playerID string, seasonID string, dungeonID string) error {
	const query = `
		select exists(select 1 from players where id = $1::uuid),
			exists(select 1 from season_dungeons where season_id = $2::uuid and dungeon_id = $3::uuid)
	`

	var playerExists bool
	var seasonDungeonExists bool
	if err := statsRepository.pool.QueryRow(ctx, query, playerID, seasonID, dungeonID).Scan(&playerExists, &seasonDungeonExists); err != nil {
		return fmt.Errorf("check stat references: %w", err)
	}

	if !playerExists || !seasonDungeonExists {
		return ErrNotFound
	}

	return nil
}

func getLockedStatValues(ctx context.Context, transaction pgx.Tx, playerID string, seasonID string, dungeonID string) (int, int, error) {
	const query = `
		select deaths, yeets
		from player_dungeon_stats
		where player_id = $1::uuid
			and season_id = $2::uuid
			and dungeon_id = $3::uuid
		for update
	`

	var deaths int
	var yeets int
	if err := transaction.QueryRow(ctx, query, playerID, seasonID, dungeonID).Scan(&deaths, &yeets); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, 0, nil
		}
		return 0, 0, fmt.Errorf("get locked stat values: %w", err)
	}

	return deaths, yeets, nil
}

func upsertStatValues(ctx context.Context, transaction pgx.Tx, playerID string, seasonID string, dungeonID string, deaths int, yeets int) (StatRow, error) {
	const query = `
		insert into player_dungeon_stats (player_id, season_id, dungeon_id, deaths, yeets)
		values ($1::uuid, $2::uuid, $3::uuid, $4, $5)
		on conflict (player_id, season_id, dungeon_id)
		do update set
			deaths = excluded.deaths,
			yeets = excluded.yeets
		returning player_id::text, season_id::text, dungeon_id::text, deaths, yeets, deaths + yeets as total_mistakes
	`

	var statRow StatRow
	if err := transaction.QueryRow(ctx, query, playerID, seasonID, dungeonID, deaths, yeets).Scan(
		&statRow.PlayerID,
		&statRow.SeasonID,
		&statRow.DungeonID,
		&statRow.Deaths,
		&statRow.Yeets,
		&statRow.TotalMistakes,
	); err != nil {
		return StatRow{}, fmt.Errorf("upsert stat values: %w", err)
	}

	return statRow, nil
}
