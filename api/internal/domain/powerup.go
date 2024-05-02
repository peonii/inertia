package domain

const (
	PowerupTypeFreezeHunters = "freeze_hunters"
	PowerupTypeRevealHunters = "reveal_hunters"
	PowerupTypeHideTracker   = "hide_tracker"

	PowerupTypeHunt          = "hunt"
	PowerupTypeFreezeRunners = "freeze_runners"
	PowerupTypeBlacklist     = "blacklist"
)

type Powerup struct {
	ID string `json:"id"`

	Type string `json:"type"`

	CasterID string `json:"caster_id"`
	EndsAt   time.Time `json:"ends_at"`

	CreatedAt time.Time `json:"created_at"`
}

type PowerupCreate struct {
	Type     string `json:"type"`
	CasterID string `json:"caster_id"`
}
