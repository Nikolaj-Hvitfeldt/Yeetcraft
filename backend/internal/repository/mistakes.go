package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type MistakeType string

const (
	MistakeTypeDeath MistakeType = "death"
	MistakeTypeYeet  MistakeType = "yeet"
)

type Mistake struct {
	ID          int         `json:"id"`
	PlayerName  string      `json:"playerName"`
	Dungeon     string      `json:"dungeon"`
	Type        MistakeType `json:"type"`
	Description string      `json:"description"`
	Timestamp   int64       `json:"timestamp"`
}

type MistakeRepository struct {
	pool *pgxpool.Pool
}

func NewMistakeRepository(pool *pgxpool.Pool) MistakeRepository {
	return MistakeRepository{
		pool: pool,
	}
}

func (mistakeRepository MistakeRepository) List(ctx context.Context) ([]Mistake, error) {
	_ = ctx
	_ = mistakeRepository.pool
	// TODO: Replace mock data with pgx queries against player_dungeon_stats.
	currentTime := time.Now()

	return []Mistake{
		{
			ID:          1,
			PlayerName:  "Roguetank",
			Dungeon:     "Deadmines",
			Type:        MistakeTypeYeet,
			Description: "Got yeeted off the ship by a Defias Pirate",
			Timestamp:   currentTime.Add(-1 * time.Hour).UnixMilli(),
		},
		{
			ID:          2,
			PlayerName:  "HealzgoBRRR",
			Dungeon:     "Shadowfang Keep",
			Type:        MistakeTypeDeath,
			Description: "Aggro'd the entire courtyard and got one-shot",
			Timestamp:   currentTime.Add(-2 * time.Hour).UnixMilli(),
		},
		{
			ID:          3,
			PlayerName:  "LeroyJenkins",
			Dungeon:     "Blackrock Depths",
			Type:        MistakeTypeDeath,
			Description: "Pulled all of Domicile, party wiped spectacularly",
			Timestamp:   currentTime.Add(-3 * time.Hour).UnixMilli(),
		},
	}, nil
}
