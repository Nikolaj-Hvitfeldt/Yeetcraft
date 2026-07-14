package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"yeetcraft/backend/internal/slug"
)

var (
	ErrDatabaseNotConfigured = errors.New("database is not configured")
	ErrNotFound              = errors.New("resource not found")
	ErrNegativeStat          = errors.New("stat value cannot be below zero")
)

const upsertStatsQuery = `
	insert into player_dungeon_stats (player_id, season_id, dungeon_id, deaths, yeets)
	values ($1::uuid, $2::uuid, $3::uuid, $4, $5)
	on conflict (player_id, season_id, dungeon_id)
	do update set
		deaths = excluded.deaths,
		yeets = excluded.yeets
	returning player_id::text, season_id::text, dungeon_id::text, deaths, yeets, deaths + yeets as total_mistakes
`

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

type DungeonReference struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	ShortName    *string `json:"shortName"`
	DisplayOrder int     `json:"displayOrder"`
}

type DungeonLeaderboardEntry struct {
	PlayerID      string  `json:"playerId"`
	DisplayName   string  `json:"displayName"`
	AvatarURL     *string `json:"avatarUrl"`
	Deaths        int     `json:"deaths"`
	Yeets         int     `json:"yeets"`
	TotalMistakes int     `json:"totalMistakes"`
}

type DungeonLeaderboard struct {
	Season      SeasonSummary           `json:"season"`
	Dungeon     DungeonReference        `json:"dungeon"`
	Leaderboard []DungeonLeaderboardEntry `json:"leaderboard"`
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

	return statsRepository.listLeaderboardForResolvedSeason(ctx, season.ID)
}

func (statsRepository StatsRepository) listLeaderboardForResolvedSeason(ctx context.Context, resolvedSeasonID string) ([]LeaderboardEntry, error) {
	if statsRepository.pool == nil {
		return nil, ErrDatabaseNotConfigured
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

	rows, err := statsRepository.pool.Query(ctx, query, resolvedSeasonID)
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

func (statsRepository StatsRepository) GetPlayerStatsByDisplaySlug(ctx context.Context, playerSlug string, seasonID string) (PlayerStats, error) {
	if statsRepository.pool == nil {
		return PlayerStats{}, ErrDatabaseNotConfigured
	}

	playerID, err := statsRepository.resolvePlayerIDByDisplaySlug(ctx, playerSlug)
	if err != nil {
		return PlayerStats{}, err
	}

	return statsRepository.GetPlayerStats(ctx, playerID, seasonID)
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

func (statsRepository StatsRepository) ListDungeonLeaderboard(ctx context.Context, seasonID string, dungeonID string) (DungeonLeaderboard, error) {
	if statsRepository.pool == nil {
		return DungeonLeaderboard{}, ErrDatabaseNotConfigured
	}

	season, err := statsRepository.resolveSeason(ctx, seasonID)
	if err != nil {
		return DungeonLeaderboard{}, err
	}

	dungeon, err := statsRepository.getSeasonDungeon(ctx, season.ID, dungeonID)
	if err != nil {
		return DungeonLeaderboard{}, err
	}

	const query = `
		select
			players.id::text,
			players.display_name,
			players.avatar_url,
			coalesce(pds.deaths, 0)::int as deaths,
			coalesce(pds.yeets, 0)::int as yeets,
			(coalesce(pds.deaths, 0) + coalesce(pds.yeets, 0))::int as total_mistakes
		from players
		left join player_dungeon_stats pds
			on pds.player_id = players.id
			and pds.season_id = $1::uuid
			and pds.dungeon_id = $2::uuid
		order by total_mistakes desc, yeets desc, players.display_name asc
	`

	rows, err := statsRepository.pool.Query(ctx, query, season.ID, dungeon.ID)
	if err != nil {
		return DungeonLeaderboard{}, fmt.Errorf("query dungeon leaderboard: %w", err)
	}
	defer rows.Close()

	leaderboard := make([]DungeonLeaderboardEntry, 0)
	for rows.Next() {
		var entry DungeonLeaderboardEntry
		if err := rows.Scan(
			&entry.PlayerID,
			&entry.DisplayName,
			&entry.AvatarURL,
			&entry.Deaths,
			&entry.Yeets,
			&entry.TotalMistakes,
		); err != nil {
			return DungeonLeaderboard{}, fmt.Errorf("scan dungeon leaderboard: %w", err)
		}
		leaderboard = append(leaderboard, entry)
	}

	if err := rows.Err(); err != nil {
		return DungeonLeaderboard{}, fmt.Errorf("iterate dungeon leaderboard: %w", err)
	}

	return DungeonLeaderboard{
		Season:      season,
		Dungeon:     dungeon,
		Leaderboard: leaderboard,
	}, nil
}

func (statsRepository StatsRepository) ListDungeonMistakeLeaders(ctx context.Context, seasonID string) ([]DungeonMistakeLeader, error) {
	if statsRepository.pool == nil {
		return nil, ErrDatabaseNotConfigured
	}

	const query = `
		with ranked as (
			select
				pds.dungeon_id::text as dungeon_id,
				pds.player_id::text as player_id,
				pds.deaths + pds.yeets as total_mistakes,
				row_number() over (
					partition by pds.dungeon_id
					order by (pds.deaths + pds.yeets) desc, pds.yeets desc, pds.player_id
				) as rank
			from player_dungeon_stats pds
			where pds.season_id = $1::uuid
				and (pds.deaths + pds.yeets) > 0
		)
		select dungeon_id, player_id, total_mistakes
		from ranked
		where rank = 1
		order by dungeon_id
	`

	rows, err := statsRepository.pool.Query(ctx, query, seasonID)
	if err != nil {
		return nil, fmt.Errorf("list dungeon mistake leaders: %w", err)
	}
	defer rows.Close()

	leaders := make([]DungeonMistakeLeader, 0)
	for rows.Next() {
		var leader DungeonMistakeLeader
		if err := rows.Scan(&leader.DungeonID, &leader.PlayerID, &leader.TotalMistakes); err != nil {
			return nil, fmt.Errorf("scan dungeon mistake leader: %w", err)
		}
		leaders = append(leaders, leader)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate dungeon mistake leaders: %w", err)
	}

	return leaders, nil
}

type StatUpdate struct {
	DungeonID string
	Deaths    int
	Yeets     int
}

func (statsRepository StatsRepository) SetStatsBatch(ctx context.Context, playerID string, seasonID string, updates []StatUpdate) ([]StatRow, error) {
	if statsRepository.pool == nil {
		return nil, ErrDatabaseNotConfigured
	}

	if len(updates) == 0 {
		return nil, fmt.Errorf("set stats batch: at least one update is required")
	}

	seenDungeonIDs := make(map[string]struct{}, len(updates))
	for _, update := range updates {
		if update.Deaths < 0 || update.Yeets < 0 {
			return nil, ErrNegativeStat
		}

		if _, isDuplicate := seenDungeonIDs[update.DungeonID]; isDuplicate {
			return nil, fmt.Errorf("set stats batch: duplicate dungeonId %s", update.DungeonID)
		}
		seenDungeonIDs[update.DungeonID] = struct{}{}

		if err := statsRepository.ensureStatReferencesExist(ctx, playerID, seasonID, update.DungeonID); err != nil {
			return nil, err
		}
	}

	transaction, err := statsRepository.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin set stats batch transaction: %w", err)
	}
	defer transaction.Rollback(ctx)

	statRows := make([]StatRow, 0, len(updates))
	for _, update := range updates {
		statRow, err := upsertStatValues(ctx, transaction, playerID, seasonID, update.DungeonID, update.Deaths, update.Yeets)
		if err != nil {
			return nil, err
		}
		statRows = append(statRows, statRow)
	}

	if err := transaction.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit set stats batch transaction: %w", err)
	}

	return statRows, nil
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

func (statsRepository StatsRepository) getSeasonDungeon(ctx context.Context, seasonID string, dungeonID string) (DungeonReference, error) {
	const query = `
		select
			dungeons.id::text,
			dungeons.name,
			dungeons.short_name,
			season_dungeons.display_order
		from season_dungeons
		join dungeons on dungeons.id = season_dungeons.dungeon_id
		where season_dungeons.season_id = $1::uuid
			and season_dungeons.dungeon_id = $2::uuid
	`

	var dungeon DungeonReference
	if err := statsRepository.pool.QueryRow(ctx, query, seasonID, dungeonID).Scan(
		&dungeon.ID,
		&dungeon.Name,
		&dungeon.ShortName,
		&dungeon.DisplayOrder,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return DungeonReference{}, ErrNotFound
		}
		return DungeonReference{}, fmt.Errorf("get season dungeon: %w", err)
	}

	return dungeon, nil
}

func (statsRepository StatsRepository) resolvePlayerIDByDisplaySlug(ctx context.Context, playerSlug string) (string, error) {
	if playerSlug == "" {
		return "", ErrNotFound
	}

	const query = `
		select id::text, display_name
		from players
		order by display_name asc
	`

	rows, err := statsRepository.pool.Query(ctx, query)
	if err != nil {
		return "", fmt.Errorf("query players for slug lookup: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var playerID string
		var displayName string
		if err := rows.Scan(&playerID, &displayName); err != nil {
			return "", fmt.Errorf("scan player for slug lookup: %w", err)
		}

		if slug.ToSlug(displayName) == playerSlug {
			return playerID, nil
		}
	}

	if err := rows.Err(); err != nil {
		return "", fmt.Errorf("iterate players for slug lookup: %w", err)
	}

	return "", ErrNotFound
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

func upsertStatValues(ctx context.Context, transaction pgx.Tx, playerID string, seasonID string, dungeonID string, deaths int, yeets int) (StatRow, error) {
	var statRow StatRow
	if err := transaction.QueryRow(ctx, upsertStatsQuery, playerID, seasonID, dungeonID, deaths, yeets).Scan(
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
