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
