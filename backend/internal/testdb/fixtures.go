package testdb

// Fixed seeded entity identifiers for deterministic test data.
const (
	SeasonID   = "eeee0001-0000-4000-8000-000000000001"
	SeasonName = "E2E Test Season"

	PlayerSebID      = "eeee0002-0000-4000-8000-000000000001"
	PlayerMartinID   = "eeee0002-0000-4000-8000-000000000002"
	PlayerNiklasID   = "eeee0002-0000-4000-8000-000000000003"
	PlayerNikoID     = "eeee0002-0000-4000-8000-000000000004"
	PlayerSebName    = "Seb"
	PlayerMartinName = "Martin"
	PlayerNiklasName = "Niklas"
	PlayerNikoName   = "Niko"

	DungeonAlphaID   = "eeee0003-0000-4000-8000-000000000001"
	DungeonBetaID    = "eeee0003-0000-4000-8000-000000000002"
	DungeonAlphaName = "Test Dungeon Alpha"
	DungeonBetaName  = "Test Dungeon Beta"
)

// SeededCharacter is one deterministic characters row in testdb seed data.
type SeededCharacter struct {
	ID           string
	PlayerID     string
	Name         string
	ClassKey     string
	DisplayOrder int
}

// SeededCharacters is the authoritative character fixture for verify.
var SeededCharacters = []SeededCharacter{
	{ID: "eeee0004-0000-4000-8000-000000000001", PlayerID: PlayerSebID, Name: "MostDope", ClassKey: "warlock", DisplayOrder: 0},
	{ID: "eeee0004-0000-4000-8000-000000000002", PlayerID: PlayerSebID, Name: "Nudelkriger", ClassKey: "priest", DisplayOrder: 1},
	{ID: "eeee0004-0000-4000-8000-000000000003", PlayerID: PlayerMartinID, Name: "Zorker", ClassKey: "priest", DisplayOrder: 0},
	{ID: "eeee0004-0000-4000-8000-000000000004", PlayerID: PlayerMartinID, Name: "Rauw", ClassKey: "shaman", DisplayOrder: 1},
	{ID: "eeee0004-0000-4000-8000-000000000005", PlayerID: PlayerNiklasID, Name: "Ungeork", ClassKey: "hunter", DisplayOrder: 0},
	{ID: "eeee0004-0000-4000-8000-000000000006", PlayerID: PlayerNikoID, Name: "Freecry", ClassKey: "demonhunter", DisplayOrder: 0},
	{ID: "eeee0004-0000-4000-8000-000000000007", PlayerID: PlayerNikoID, Name: "LouiLoui", ClassKey: "evoker", DisplayOrder: 1},
}

// StatBaseline is one seeded player_dungeon_stats row at the known baseline.
type StatBaseline struct {
	PlayerID  string
	DungeonID string
	Deaths    int
	Yeets     int
}

// BaselineStats is the authoritative mutable stats baseline for verify and reset.
var BaselineStats = []StatBaseline{
	{PlayerID: PlayerSebID, DungeonID: DungeonAlphaID, Deaths: 3, Yeets: 1},
	{PlayerID: PlayerSebID, DungeonID: DungeonBetaID, Deaths: 0, Yeets: 2},
	{PlayerID: PlayerMartinID, DungeonID: DungeonAlphaID, Deaths: 1, Yeets: 0},
	{PlayerID: PlayerMartinID, DungeonID: DungeonBetaID, Deaths: 2, Yeets: 3},
	{PlayerID: PlayerNiklasID, DungeonID: DungeonAlphaID, Deaths: 5, Yeets: 0},
	{PlayerID: PlayerNiklasID, DungeonID: DungeonBetaID, Deaths: 0, Yeets: 1},
	{PlayerID: PlayerNikoID, DungeonID: DungeonAlphaID, Deaths: 0, Yeets: 0},
	{PlayerID: PlayerNikoID, DungeonID: DungeonBetaID, Deaths: 1, Yeets: 1},
}

var seededPlayers = []struct {
	ID          string
	DisplayName string
}{
	{PlayerSebID, PlayerSebName},
	{PlayerMartinID, PlayerMartinName},
	{PlayerNiklasID, PlayerNiklasName},
	{PlayerNikoID, PlayerNikoName},
}

var seededDungeons = []struct {
	ID   string
	Name string
}{
	{DungeonAlphaID, DungeonAlphaName},
	{DungeonBetaID, DungeonBetaName},
}
