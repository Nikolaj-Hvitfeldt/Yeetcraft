//go:build integration

package repository

import (
	"context"
	"encoding/json"
	"strings"
	"testing"

	"yeetcraft/backend/internal/testdb"
)

const testPlayerNoCharactersID = "eeee0005-0000-4000-8000-000000000001"

func TestListPlayerRosterSeededMultiCharacter(t *testing.T) {
	ctx := setupIntegrationTest(t)
	repo := NewPlayersRepository(integrationClient.Pool())

	roster, err := repo.ListPlayerRoster(ctx)
	if err != nil {
		t.Fatalf("ListPlayerRoster: %v", err)
	}

	playerCharacters := make(map[string][]CharacterRosterEntry, len(roster.Players))
	for _, player := range roster.Players {
		playerCharacters[player.ID] = player.Characters
	}

	if len(playerCharacters[testdb.PlayerSebID]) != 2 {
		t.Fatalf("expected Seb to have 2 characters, got %d", len(playerCharacters[testdb.PlayerSebID]))
	}
	if len(playerCharacters[testdb.PlayerMartinID]) != 2 {
		t.Fatalf("expected Martin to have 2 characters, got %d", len(playerCharacters[testdb.PlayerMartinID]))
	}
	if len(playerCharacters[testdb.PlayerNiklasID]) != 1 {
		t.Fatalf("expected Niklas to have 1 character, got %d", len(playerCharacters[testdb.PlayerNiklasID]))
	}
	if len(playerCharacters[testdb.PlayerNikoID]) != 2 {
		t.Fatalf("expected Niko to have 2 characters, got %d", len(playerCharacters[testdb.PlayerNikoID]))
	}
}

func TestListPlayerRosterZeroCharacters(t *testing.T) {
	ctx := setupIntegrationTest(t)
	repo := NewPlayersRepository(integrationClient.Pool())

	_, err := integrationClient.Pool().Exec(ctx, `
		insert into players (id, display_name)
		values ($1::uuid, $2)
	`, testPlayerNoCharactersID, "NoCharsPlayer")
	if err != nil {
		t.Fatalf("insert player without characters: %v", err)
	}
	t.Cleanup(func() {
		_, cleanupErr := integrationClient.Pool().Exec(context.Background(), `
			delete from players where id = $1::uuid
		`, testPlayerNoCharactersID)
		if cleanupErr != nil {
			t.Errorf("delete test player without characters: %v", cleanupErr)
		}
	})

	roster, err := repo.ListPlayerRoster(ctx)
	if err != nil {
		t.Fatalf("ListPlayerRoster: %v", err)
	}

	var found *PlayerRosterEntry
	for _, player := range roster.Players {
		if player.ID == testPlayerNoCharactersID {
			found = &player
			break
		}
	}
	if found == nil {
		t.Fatalf("expected player %s in roster, got %#v", testPlayerNoCharactersID, roster.Players)
	}
	if found.Characters == nil {
		t.Fatal("expected non-nil characters slice")
	}
	if len(found.Characters) != 0 {
		t.Fatalf("expected zero characters, got %#v", found.Characters)
	}
}

func TestListPlayerRosterOrdering(t *testing.T) {
	ctx := setupIntegrationTest(t)
	repo := NewPlayersRepository(integrationClient.Pool())

	roster, err := repo.ListPlayerRoster(ctx)
	if err != nil {
		t.Fatalf("ListPlayerRoster: %v", err)
	}

	expectedPlayerOrder := []string{
		testdb.PlayerMartinName,
		testdb.PlayerNiklasName,
		testdb.PlayerNikoName,
		testdb.PlayerSebName,
	}
	if len(roster.Players) < len(expectedPlayerOrder) {
		t.Fatalf("expected at least %d players, got %d", len(expectedPlayerOrder), len(roster.Players))
	}

	seededNames := make([]string, 0, len(expectedPlayerOrder))
	for _, player := range roster.Players {
		switch player.DisplayName {
		case testdb.PlayerMartinName, testdb.PlayerNiklasName, testdb.PlayerNikoName, testdb.PlayerSebName:
			seededNames = append(seededNames, player.DisplayName)
		}
	}
	if len(seededNames) != len(expectedPlayerOrder) {
		t.Fatalf("expected %d seeded players, got %#v", len(expectedPlayerOrder), seededNames)
	}
	for index, expectedName := range expectedPlayerOrder {
		if seededNames[index] != expectedName {
			t.Fatalf("player order mismatch at %d: expected %s, got %s (full order %#v)", index, expectedName, seededNames[index], seededNames)
		}
	}

	for _, player := range roster.Players {
		if player.ID != testdb.PlayerSebID {
			continue
		}
		if len(player.Characters) != 2 {
			t.Fatalf("expected Seb to have 2 characters, got %d", len(player.Characters))
		}
		if player.Characters[0].Name != "MostDope" || player.Characters[1].Name != "Nudelkriger" {
			t.Fatalf("unexpected Seb character order: %#v", player.Characters)
		}
		if player.Characters[0].DisplayOrder != 0 || player.Characters[1].DisplayOrder != 1 {
			t.Fatalf("unexpected Seb display order: %#v", player.Characters)
		}
	}
}

func TestListPlayerRosterNullableRealmRegionClass(t *testing.T) {
	ctx := setupIntegrationTest(t)
	repo := NewPlayersRepository(integrationClient.Pool())

	nullableCharacterID := testdb.SeededCharacters[0].ID
	_, err := integrationClient.Pool().Exec(ctx, `
		update characters
		set realm = null, region = null, class_key = null
		where id = $1::uuid
	`, nullableCharacterID)
	if err != nil {
		t.Fatalf("update nullable character fields: %v", err)
	}
	t.Cleanup(func() {
		_, cleanupErr := integrationClient.Pool().Exec(context.Background(), `
			update characters
			set class_key = $1
			where id = $2::uuid
		`, testdb.SeededCharacters[0].ClassKey, nullableCharacterID)
		if cleanupErr != nil {
			t.Errorf("restore nullable character fields: %v", cleanupErr)
		}
	})

	roster, err := repo.ListPlayerRoster(ctx)
	if err != nil {
		t.Fatalf("ListPlayerRoster: %v", err)
	}

	var found *CharacterRosterEntry
	for _, player := range roster.Players {
		if player.ID != testdb.PlayerSebID {
			continue
		}
		for _, character := range player.Characters {
			if character.ID == nullableCharacterID {
				found = &character
				break
			}
		}
	}
	if found == nil {
		t.Fatal("expected nullable character in roster")
	}
	if found.Realm != nil || found.Region != nil || found.ClassKey != nil {
		t.Fatalf("expected null realm/region/classKey, got %#v", found)
	}

	encoded, err := json.Marshal(found)
	if err != nil {
		t.Fatalf("marshal character: %v", err)
	}
	body := string(encoded)
	if strings.Contains(body, `"realm":""`) || strings.Contains(body, `"region":""`) || strings.Contains(body, `"classKey":""`) {
		t.Fatalf("expected JSON nulls for nullable fields, got %s", body)
	}
}

func TestListPlayerRosterOmitsGUIDFromJSON(t *testing.T) {
	ctx := setupIntegrationTest(t)
	repo := NewPlayersRepository(integrationClient.Pool())

	const populatedGUID = "Player-1-00000000-0000-4000-8000-000000000099"
	characterID := testdb.SeededCharacters[1].ID
	_, err := integrationClient.Pool().Exec(ctx, `
		update characters
		set guid = $1
		where id = $2::uuid
	`, populatedGUID, characterID)
	if err != nil {
		t.Fatalf("populate character guid: %v", err)
	}
	t.Cleanup(func() {
		_, cleanupErr := integrationClient.Pool().Exec(context.Background(), `
			update characters
			set guid = null
			where id = $1::uuid
		`, characterID)
		if cleanupErr != nil {
			t.Errorf("restore character guid: %v", cleanupErr)
		}
	})

	roster, err := repo.ListPlayerRoster(ctx)
	if err != nil {
		t.Fatalf("ListPlayerRoster: %v", err)
	}

	encoded, err := json.Marshal(roster)
	if err != nil {
		t.Fatalf("marshal roster: %v", err)
	}
	body := string(encoded)
	if strings.Contains(strings.ToLower(body), "guid") {
		t.Fatalf("roster JSON must not include guid, got %s", body)
	}
}
