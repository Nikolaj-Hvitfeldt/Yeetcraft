//go:build integration

package repository

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgconn"

	"yeetcraft/backend/internal/testdb"
)

const (
	testOverlapSeasonAID      = "eeee0001-0000-4000-8000-000000000101"
	testOverlapSeasonBID      = "eeee0001-0000-4000-8000-000000000102"
	testAdjacentSeasonAID     = "eeee0001-0000-4000-8000-000000000103"
	testAdjacentSeasonBID     = "eeee0001-0000-4000-8000-000000000104"
	testPartialNullSeasonID   = "eeee0001-0000-4000-8000-000000000105"
	testDuplicateMapDungeonID = "eeee0003-0000-4000-8000-000000000099"
)

func TestSeasonBoundsOverlapRejected(t *testing.T) {
	ctx := setupIntegrationTest(t)
	cleanupSeason(t, testOverlapSeasonAID)
	cleanupSeason(t, testOverlapSeasonBID)

	startsA := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	endsA := time.Date(2026, 7, 1, 0, 0, 0, 0, time.UTC)
	startsB := time.Date(2026, 6, 1, 0, 0, 0, 0, time.UTC)
	endsB := time.Date(2026, 12, 1, 0, 0, 0, 0, time.UTC)

	if err := insertSeasonWithBounds(ctx, testOverlapSeasonAID, "WP4 Overlap A", startsA, endsA); err != nil {
		t.Fatalf("insert overlap season A: %v", err)
	}

	err := insertSeasonWithBounds(ctx, testOverlapSeasonBID, "WP4 Overlap B", startsB, endsB)
	if err == nil {
		t.Fatal("expected overlapping season bounds to fail")
	}
	if !isPostgresCode(err, "23P01") {
		t.Fatalf("expected exclusion_violation 23P01, got %v", err)
	}
}

func TestSeasonBoundsAdjacentHalfOpenAllowed(t *testing.T) {
	ctx := setupIntegrationTest(t)
	cleanupSeason(t, testAdjacentSeasonAID)
	cleanupSeason(t, testAdjacentSeasonBID)

	startsA := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	endsA := time.Date(2026, 7, 1, 0, 0, 0, 0, time.UTC)
	startsB := endsA
	endsB := time.Date(2027, 1, 1, 0, 0, 0, 0, time.UTC)

	if err := insertSeasonWithBounds(ctx, testAdjacentSeasonAID, "WP4 Adjacent A", startsA, endsA); err != nil {
		t.Fatalf("insert adjacent season A: %v", err)
	}
	if err := insertSeasonWithBounds(ctx, testAdjacentSeasonBID, "WP4 Adjacent B", startsB, endsB); err != nil {
		t.Fatalf("expected adjacent [) bounds to be allowed, got %v", err)
	}
}

func TestChallengeMapIDUnique(t *testing.T) {
	ctx := setupIntegrationTest(t)
	cleanupDungeon(t, testDuplicateMapDungeonID)

	_, err := integrationClient.Pool().Exec(ctx, `
		insert into dungeons (id, name, challenge_map_id)
		values ($1::uuid, 'WP4 Duplicate Map Dungeon', $2)
	`, testDuplicateMapDungeonID, testdb.DungeonAlphaChallengeMapID)
	if err == nil {
		t.Fatal("expected duplicate challenge_map_id to fail")
	}
	if !isPostgresCode(err, "23505") {
		t.Fatalf("expected unique_violation 23505, got %v", err)
	}
}

func TestIsolationSeasonNullBoundsSucceeds(t *testing.T) {
	ctx := setupIntegrationTest(t)

	if err := integrationClient.EnsureIsolationSeasonFixtures(ctx); err != nil {
		t.Fatalf("isolation season insert: %v", err)
	}

	var startsAt *time.Time
	var endsAt *time.Time
	err := integrationClient.Pool().QueryRow(ctx, `
		select starts_at, ends_at
		from seasons
		where id = $1::uuid
	`, testdb.IsolationSeasonID).Scan(&startsAt, &endsAt)
	if err != nil {
		t.Fatalf("read isolation season bounds: %v", err)
	}
	if startsAt != nil || endsAt != nil {
		t.Fatalf("expected isolation season null bounds, got starts_at=%v ends_at=%v", startsAt, endsAt)
	}
}

func TestSeasonBoundsRequireBothOrNeither(t *testing.T) {
	ctx := setupIntegrationTest(t)
	cleanupSeason(t, testPartialNullSeasonID)

	startsAt := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	_, err := integrationClient.Pool().Exec(ctx, `
		insert into seasons (id, name, expansion, is_current, starts_at, ends_at)
		values ($1::uuid, 'WP4 Partial Null Season', 'Test', false, $2, null)
	`, testPartialNullSeasonID, startsAt)
	if err == nil {
		t.Fatal("expected one-sided season bounds to fail CHECK")
	}
	if !isPostgresCode(err, "23514") {
		t.Fatalf("expected check_violation 23514, got %v", err)
	}
}

func insertSeasonWithBounds(ctx context.Context, id string, name string, startsAt time.Time, endsAt time.Time) error {
	_, err := integrationClient.Pool().Exec(ctx, `
		insert into seasons (id, name, expansion, is_current, starts_at, ends_at)
		values ($1::uuid, $2, 'Test', false, $3, $4)
	`, id, name, startsAt, endsAt)
	return err
}

func cleanupSeason(t *testing.T, id string) {
	t.Helper()
	t.Cleanup(func() {
		_, err := integrationClient.Pool().Exec(context.Background(), `
			delete from seasons where id = $1::uuid
		`, id)
		if err != nil {
			t.Errorf("cleanup season %s: %v", id, err)
		}
	})
}

func cleanupDungeon(t *testing.T, id string) {
	t.Helper()
	t.Cleanup(func() {
		_, err := integrationClient.Pool().Exec(context.Background(), `
			delete from dungeons where id = $1::uuid
		`, id)
		if err != nil {
			t.Errorf("cleanup dungeon %s: %v", id, err)
		}
	})
}

func isPostgresCode(err error, code string) bool {
	var pgError *pgconn.PgError
	return errors.As(err, &pgError) && pgError.Code == code
}
