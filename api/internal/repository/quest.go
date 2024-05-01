package repository

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
)

type QuestRepository interface {
	FindByGameID(ctx context.Context, gameID string) ([]*domain.Quest, error)
	FindOne(ctx context.Context, id string) (*domain.Quest, error)
	Create(ctx context.Context, quest *domain.QuestCreate) (*domain.Quest, error)
	Update(ctx context.Context, quest *domain.Quest) error
	Delete(ctx context.Context, id string) error

	FindGroup(ctx context.Context, id string) (*domain.QuestGroup, error)
	FindMany(ctx context.Context, ids []string) ([]*domain.QuestGroup, error)
	CreateGroup(ctx context.Context, group *domain.QuestGroupCreate) (*domain.QuestGroup, error)
	UpdateGroup(ctx context.Context, group *domain.QuestGroup) error
	DeleteGroup(ctx context.Context, id string) error

	FindActive(ctx context.Context, id string) (*domain.ActiveQuestFull, error)
	FindActiveByTeamID(ctx context.Context, teamID string) ([]*domain.ActiveQuestFull, error)
	TeamHasActiveSide(ctx context.Context, teamID string) (bool, error)
	CreateActive(ctx context.Context, quest *domain.ActiveQuestCreate) (*domain.ActiveQuest, error)
	CreateManyActive(ctx context.Context, quests []*domain.ActiveQuestCreate) ([]*domain.ActiveQuest, error)
	Complete(ctx context.Context, id string) error
	DeleteActive(ctx context.Context, id string) error
	PurgeAllActive(ctx context.Context, gameID string) error

	GenerateMainQuests(ctx context.Context, gameID string) error
	GenerateSideQuest(ctx context.Context, teamID string) error
}

type PostgresQuestRepository struct {
	QuestRepository
	db *pgxpool.Pool
}

func MakePostgresQuestRepository(db *pgxpool.Pool) *PostgresQuestRepository {
	return &PostgresQuestRepository{
		db: db,
	}
}

func (r *PostgresQuestRepository) FindByGameID(ctx context.Context, gameID string) ([]*domain.Quest, error) {
	query := `SELECT id, title, description, money, xp, quest_type, group_id, lat, lng, game_id, created_at FROM quests WHERE game_id = $1`
	rows, err := r.db.Query(ctx, query, gameID)
	if err != nil {
		return nil, err
	}

	quests := []*domain.Quest{}
	for rows.Next() {
		quest := &domain.Quest{}
		err = rows.Scan(&quest.ID, &quest.Title, &quest.Description, &quest.Money, &quest.XP, &quest.QuestType, &quest.GroupID, &quest.Lat, &quest.Lng, &quest.GameID, &quest.CreatedAt)
		if err != nil {
			return nil, err
		}
		quests = append(quests, quest)
	}

	return quests, nil
}

func (r *PostgresQuestRepository) FindOne(ctx context.Context, id string) (*domain.Quest, error) {
	query := `SELECT id, title, description, money, xp, quest_type, group_id, lat, lng, game_id, created_at FROM quests WHERE id = $1`
	quest := &domain.Quest{}
	err := r.db.QueryRow(ctx, query, id).Scan(&quest.ID, &quest.Title, &quest.Description, &quest.Money, &quest.XP, &quest.QuestType, &quest.GroupID, &quest.Lat, &quest.Lng, &quest.GameID, &quest.CreatedAt)
	if err != nil {
		return nil, err
	}

	return quest, nil
}

func (r *PostgresQuestRepository) Create(ctx context.Context, quest *domain.QuestCreate) (*domain.Quest, error) {
	query := `INSERT INTO quests (id, title, description, money, xp, quest_type, group_id, lat, lng, game_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING created_at`
	node, err := snowflake.NewNode(domain.QuestSnowflakeNode)
	if err != nil {
		return nil, err
	}

	questID := node.Generate().String()
	createdAt := time.Time{}
	err = r.db.QueryRow(ctx, query, questID, quest.Title, quest.Description, quest.Money, quest.XP, quest.QuestType, quest.GroupID, quest.Lat, quest.Lng, quest.GameID).Scan(&createdAt)
	if err != nil {
		return nil, err
	}

	return &domain.Quest{
		ID:          questID,
		Title:       quest.Title,
		Description: quest.Description,
		Money:       quest.Money,
		XP:          quest.XP,
		QuestType:   quest.QuestType,
		GroupID:     quest.GroupID,
		Lat:         quest.Lat,
		Lng:         quest.Lng,
		GameID:      quest.GameID,
		CreatedAt:   createdAt,
	}, nil
}

func (r *PostgresQuestRepository) Update(ctx context.Context, quest *domain.Quest) error {
	query := `UPDATE quests SET title = $1, description = $2, money = $3, xp = $4, quest_type = $5, group_id = $6, lat = $7, lng = $8, game_id = $9 WHERE id = $10`
	_, err := r.db.Exec(ctx, query, quest.Title, quest.Description, quest.Money, quest.XP, quest.QuestType, quest.GroupID, quest.Lat, quest.Lng, quest.GameID, quest.ID)
	if err != nil {
		return err
	}

	return nil
}

func (r *PostgresQuestRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM quests WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	return nil
}

func (r *PostgresQuestRepository) FindGroup(ctx context.Context, id string) (*domain.QuestGroup, error) {
	query := `SELECT id, game_id, count FROM quest_groups WHERE id = $1`
	group := &domain.QuestGroup{}
	err := r.db.QueryRow(ctx, query, id).Scan(&group.ID, &group.GameID, &group.Count)
	if err != nil {
		return nil, err
	}

	return group, nil
}

func (r *PostgresQuestRepository) FindMany(ctx context.Context, ids []string) ([]*domain.QuestGroup, error) {
	query := `SELECT id, game_id, count FROM quest_groups WHERE id = ANY($1)`
	rows, err := r.db.Query(ctx, query, ids)
	if err != nil {
		return nil, err
	}

	groups := []*domain.QuestGroup{}
	for rows.Next() {
		group := &domain.QuestGroup{}
		err = rows.Scan(&group.ID, &group.GameID, &group.Count)
		if err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}

	return groups, nil
}

func (r *PostgresQuestRepository) CreateGroup(ctx context.Context, group *domain.QuestGroupCreate) (*domain.QuestGroup, error) {
	query := `INSERT INTO quest_groups (id, game_id, count) VALUES ($1, $2, $3)`
	node, err := snowflake.NewNode(domain.QuestGroupSnowflakeNode)
	if err != nil {
		return nil, err
	}

	groupID := node.Generate().String()
	_, err = r.db.Exec(ctx, query, groupID, group.GameID, group.Count)
	if err != nil {
		return nil, err
	}

	return &domain.QuestGroup{
		ID:     groupID,
		GameID: group.GameID,
		Count:  group.Count,
	}, nil
}

func (r *PostgresQuestRepository) UpdateGroup(ctx context.Context, group *domain.QuestGroup) error {
	query := `UPDATE quest_groups SET game_id = $1, count = $2 WHERE id = $3`
	_, err := r.db.Exec(ctx, query, group.GameID, group.Count, group.ID)
	if err != nil {
		return err
	}

	return nil
}

func (r *PostgresQuestRepository) DeleteGroup(ctx context.Context, id string) error {
	query := `DELETE FROM quest_groups WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	return nil
}

func (r *PostgresQuestRepository) FindActive(ctx context.Context, id string) (*domain.ActiveQuestFull, error) {
	query := `
	SELECT q.id, q.title, q.description, q.money, q.xp, q.quest_type, q.group_id, q.lat, q.lng, q.game_id, q.created_at, aq.team_id, aq.complete, aq.created_at
	FROM quests q
	JOIN active_quests aq ON q.id = aq.quest_id
	WHERE aq.id = $1
	`

	activeQuest := &domain.ActiveQuestFull{}
	err := r.db.QueryRow(ctx, query, id).Scan(&activeQuest.ID, &activeQuest.Title, &activeQuest.Description, &activeQuest.Money, &activeQuest.XP, &activeQuest.QuestType, &activeQuest.GroupID, &activeQuest.Lat, &activeQuest.Lng, &activeQuest.GameID, &activeQuest.CreatedAt, &activeQuest.TeamID, &activeQuest.Complete, &activeQuest.StartedAt)
	if err != nil {
		return nil, err
	}

	return activeQuest, nil
}

func (r *PostgresQuestRepository) FindActiveByTeamID(ctx context.Context, teamID string) ([]*domain.ActiveQuestFull, error) {
	query := `
	SELECT aq.id, q.id, q.title, q.description, q.money, q.xp, q.quest_type, q.group_id, q.lat, q.lng, q.game_id, q.created_at, aq.complete, aq.created_at
	FROM quests q
	JOIN active_quests aq ON q.id = aq.quest_id
	WHERE aq.team_id = $1
	`

	rows, err := r.db.Query(ctx, query, teamID)
	if err != nil {
		return nil, err
	}

	activeQuests := []*domain.ActiveQuestFull{}
	for rows.Next() {
		activeQuest := &domain.ActiveQuestFull{}
		err = rows.Scan(&activeQuest.ID, &activeQuest.QuestID, &activeQuest.Title, &activeQuest.Description, &activeQuest.Money, &activeQuest.XP, &activeQuest.QuestType, &activeQuest.GroupID, &activeQuest.Lat, &activeQuest.Lng, &activeQuest.GameID, &activeQuest.CreatedAt, &activeQuest.Complete, &activeQuest.StartedAt)
		if err != nil {
			return nil, err
		}
		activeQuests = append(activeQuests, activeQuest)
	}

	return activeQuests, nil
}

func (r *PostgresQuestRepository) CreateActive(ctx context.Context, active *domain.ActiveQuestCreate) (*domain.ActiveQuest, error) {
	query := `INSERT INTO active_quests (id, quest_id, team_id, complete) VALUES ($1, $2, $3, $4) RETURNING created_at`
	node, err := snowflake.NewNode(domain.ActiveQuestSnowflakeNode)
	if err != nil {
		return nil, err
	}

	activeID := node.Generate().String()
	_, err = r.db.Exec(ctx, query, activeID, active.QuestID, active.TeamID, active.Complete)
	if err != nil {
		return nil, err
	}

	return &domain.ActiveQuest{
		ID:       activeID,
		QuestID:  active.QuestID,
		TeamID:   active.TeamID,
		Complete: active.Complete,
	}, nil
}

func (r *PostgresQuestRepository) CreateManyActive(ctx context.Context, active []*domain.ActiveQuestCreate) ([]*domain.ActiveQuest, error) {
	query := `INSERT INTO active_quests (id, quest_id, team_id, complete) VALUES `

	var values []interface{}
	for i, a := range active {
		node, err := snowflake.NewNode(domain.ActiveQuestSnowflakeNode)
		if err != nil {
			return nil, err
		}

		activeID := node.Generate().String()
		query += fmt.Sprintf("($%d, $%d, $%d, $%d),", i*4+1, i*4+2, i*4+3, i*4+4)
		values = append(values, activeID, a.QuestID, a.TeamID, a.Complete)
	}

	query = query[:len(query)-1] + " RETURNING created_at"

	fmt.Printf("query: %s\n", query)

	rows, err := r.db.Query(ctx, query, values...)
	if err != nil {
		return nil, err
	}

	activeQuests := []*domain.ActiveQuest{}
	for rows.Next() {
		activeQuest := &domain.ActiveQuest{}
		err = rows.Scan(&activeQuest.CreatedAt)
		if err != nil {
			return nil, err
		}
		activeQuests = append(activeQuests, activeQuest)
	}

	return activeQuests, nil
}

func (r *PostgresQuestRepository) Complete(ctx context.Context, id string) error {
	query := `UPDATE active_quests SET complete = true WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	return nil
}

func (r *PostgresQuestRepository) DeleteActive(ctx context.Context, id string) error {
	query := `DELETE FROM active_quests WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	return nil
}

func (r *PostgresQuestRepository) GenerateMainQuests(ctx context.Context, gameID string) error {
	query := `
	SELECT q.id, q.title, q.description, q.money, q.xp, q.quest_type, q.group_id, q.lat, q.lng, q.game_id, q.created_at
	FROM quests q
	WHERE q.game_id = $1 AND q.quest_type = 'main'
	`

	quests := []*domain.Quest{}
	rows, err := r.db.Query(ctx, query, gameID)
	if err != nil {
		return err
	}

	for rows.Next() {
		quest := &domain.Quest{}
		err = rows.Scan(&quest.ID, &quest.Title, &quest.Description, &quest.Money, &quest.XP, &quest.QuestType, &quest.GroupID, &quest.Lat, &quest.Lng, &quest.GameID, &quest.CreatedAt)
		if err != nil {
			return err
		}
		quests = append(quests, quest)
	}

	if len(quests) == 0 {
		return fmt.Errorf("no main quests found for game %s", gameID)
	}

	groupQuery := `SELECT id, game_id, count FROM quest_groups WHERE game_id = $1`
	groups := []*domain.QuestGroup{}
	groupRows, err := r.db.Query(ctx, groupQuery, gameID)
	if err != nil {
		return err
	}

	for groupRows.Next() {
		group := &domain.QuestGroup{}
		err = groupRows.Scan(&group.ID, &group.GameID, &group.Count)
		if err != nil {
			return err
		}
		groups = append(groups, group)
	}
	if len(groups) == 0 {
		return fmt.Errorf("no quest groups found for game %s", gameID)
	}

	teamsQuery := `SELECT id FROM teams WHERE game_id = $1`
	teams := []*domain.Team{}
	teamRows, err := r.db.Query(ctx, teamsQuery, gameID)
	if err != nil {
		return err
	}

	for teamRows.Next() {
		team := &domain.Team{}
		err = teamRows.Scan(&team.ID)
		if err != nil {
			return err
		}
		teams = append(teams, team)
	}

	if len(teams) == 0 {
		return fmt.Errorf("no teams found for game %s", gameID)
	}

	for _, team := range teams {
		teamQuests := []*domain.Quest{}

		for _, group := range groups {
			// Select group.Count random quests from quests
			rand.Seed(time.Now().UnixNano())

			// Shuffle the quests
			rand.Shuffle(len(quests), func(i, j int) { quests[i], quests[j] = quests[j], quests[i] })

			// Select the first group.Count quests
			teamQuests = append(teamQuests, quests[:group.Count]...)

			fmt.Printf("teamQuests: %v\n", teamQuests)

			// Remove the selected quests from the slice
			quests = quests[group.Count:]
		}

		// Insert the quests into the active_quests table

		activeQuestCreates := []*domain.ActiveQuestCreate{}
		for _, quest := range teamQuests {
			activeQuestCreates = append(activeQuestCreates, &domain.ActiveQuestCreate{
				QuestID:  quest.ID,
				TeamID:   team.ID,
				Complete: false,
			})
		}

		_, err = r.CreateManyActive(ctx, activeQuestCreates)
		if err != nil {
			return err
		}
	}

	return nil
}

func (r *PostgresQuestRepository) GenerateSideQuest(ctx context.Context, teamID string) error {
	teamQuery := `SELECT game_id FROM teams WHERE id = $1`
	var gameID string
	err := r.db.QueryRow(ctx, teamQuery, teamID).Scan(&gameID)
	if err != nil {
		return err
	}

	query := `
	SELECT q.id, q.title, q.description, q.money, q.xp, q.quest_type, q.group_id, q.lat, q.lng, q.game_id, q.created_at
	FROM quests q
	WHERE q.game_id = $1 AND q.quest_type = 'side'
	`

	quests := []*domain.Quest{}
	rows, err := r.db.Query(ctx, query, gameID)
	if err != nil {
		return err
	}

	for rows.Next() {
		quest := &domain.Quest{}
		err = rows.Scan(&quest.ID, &quest.Title, &quest.Description, &quest.Money, &quest.XP, &quest.QuestType, &quest.GroupID, &quest.Lat, &quest.Lng, &quest.GameID, &quest.CreatedAt)
		if err != nil {
			return err
		}
		quests = append(quests, quest)
	}

	if len(quests) == 0 {
		return fmt.Errorf("no side quests found for game %s", gameID)
	}

	// Select a random quest from the slice that isn't the same as the last quest
	latestActiveQuery := `SELECT quest_id FROM active_quests WHERE team_id = $1 ORDER BY created_at DESC LIMIT 1`
	var latestQuestID string
	err = r.db.QueryRow(ctx, latestActiveQuery, teamID).Scan(&latestQuestID)
	if err != nil {
		return err
	}

	// Remove the latest quest from the slice
	for i, quest := range quests {
		if quest.ID == latestQuestID {
			quests = append(quests[:i], quests[i+1:]...)
		}
	}

	// Select a random quest from the slice
	rand.Seed(time.Now().UnixNano())
	quest := quests[rand.Intn(len(quests))]

	// Insert the quest
	_, err = r.CreateActive(ctx, &domain.ActiveQuestCreate{
		QuestID:  quest.ID,
		TeamID:   teamID,
		Complete: false,
	})
	if err != nil {
		return err
	}

	return nil
}

func (r *PostgresQuestRepository) TeamHasActiveSide(ctx context.Context, teamID string) (bool, error) {
	query := `SELECT COUNT(*) FROM active_quests WHERE team_id = $1 AND complete = false AND quest_id IN (SELECT id FROM quests WHERE quest_type = 'side')`
	var count int
	err := r.db.QueryRow(ctx, query, teamID).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *PostgresQuestRepository) PurgeAllActive(ctx context.Context, gameID string) error {
	query := `DELETE FROM active_quests WHERE team_id IN (SELECT id FROM teams WHERE game_id = $1)`
	_, err := r.db.Exec(ctx, query, gameID)
	if err != nil {
		return err
	}

	return nil
}
