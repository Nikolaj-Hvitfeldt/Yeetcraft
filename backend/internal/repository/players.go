package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PlayersRepository struct {
	pool *pgxpool.Pool
}

type CharacterRosterEntry struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	Realm        *string `json:"realm"`
	Region       *string `json:"region"`
	ClassKey     *string `json:"classKey"`
	Active       bool    `json:"active"`
	DisplayOrder int     `json:"displayOrder"`
}

type PlayerRosterEntry struct {
	ID          string                 `json:"id"`
	DisplayName string                 `json:"displayName"`
	AvatarURL   *string                `json:"avatarUrl"`
	Characters  []CharacterRosterEntry `json:"characters"`
}

type PlayerRoster struct {
	Players []PlayerRosterEntry `json:"players"`
}

func NewPlayersRepository(pool *pgxpool.Pool) PlayersRepository {
	return PlayersRepository{pool: pool}
}

func (playersRepository PlayersRepository) ListPlayerRoster(ctx context.Context) (PlayerRoster, error) {
	if playersRepository.pool == nil {
		return PlayerRoster{}, ErrDatabaseNotConfigured
	}

	const query = `
		select
			p.id::text,
			p.display_name,
			p.avatar_url,
			c.id::text,
			c.name,
			c.realm,
			c.region,
			c.class_key,
			c.active,
			c.display_order
		from players p
		left join characters c on c.player_id = p.id
		order by p.display_name asc, c.display_order asc nulls last, c.name asc nulls last
	`

	rows, err := playersRepository.pool.Query(ctx, query)
	if err != nil {
		return PlayerRoster{}, fmt.Errorf("query player roster: %w", err)
	}
	defer rows.Close()

	players := make([]PlayerRosterEntry, 0)
	playerIndex := make(map[string]int)

	for rows.Next() {
		var playerID string
		var displayName string
		var avatarURL *string
		var characterID *string
		var characterName *string
		var realm *string
		var region *string
		var classKey *string
		var active *bool
		var displayOrder *int

		if err := rows.Scan(
			&playerID,
			&displayName,
			&avatarURL,
			&characterID,
			&characterName,
			&realm,
			&region,
			&classKey,
			&active,
			&displayOrder,
		); err != nil {
			return PlayerRoster{}, fmt.Errorf("scan player roster row: %w", err)
		}

		playerIdx, exists := playerIndex[playerID]
		if !exists {
			players = append(players, PlayerRosterEntry{
				ID:          playerID,
				DisplayName: displayName,
				AvatarURL:   avatarURL,
				Characters:  []CharacterRosterEntry{},
			})
			playerIdx = len(players) - 1
			playerIndex[playerID] = playerIdx
		}

		if characterID != nil {
			players[playerIdx].Characters = append(players[playerIdx].Characters, CharacterRosterEntry{
				ID:           *characterID,
				Name:         *characterName,
				Realm:        realm,
				Region:       region,
				ClassKey:     classKey,
				Active:       *active,
				DisplayOrder: *displayOrder,
			})
		}
	}

	if err := rows.Err(); err != nil {
		return PlayerRoster{}, fmt.Errorf("iterate player roster: %w", err)
	}

	return PlayerRoster{Players: players}, nil
}
