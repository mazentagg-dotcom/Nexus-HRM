package repositories

import (
	"database/sql"
	"fmt"

	"nexus-hrm/internal/models"
)

type NotificationRepository struct {
	db *sql.DB
}

func NewNotificationRepository(db *sql.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

func (r *NotificationRepository) Create(n *models.Notification) error {
	query := `INSERT INTO notifications (id, user_id, title, message, type, action_url)
		VALUES ($1, $2, $3, $4, $5, $6)`

	_, err := r.db.Exec(query, n.ID, n.UserID, n.Title, n.Message, n.Type, n.Link)
	if err != nil {
		return fmt.Errorf("create notification: %w", err)
	}
	return nil
}

func (r *NotificationRepository) FindByUserID(userID string, page, pageSize int) ([]models.Notification, int64, error) {
	var total int64
	err := r.db.QueryRow(`SELECT COUNT(*) FROM notifications WHERE user_id = $1`, userID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count notifications: %w", err)
	}

	offset := (page - 1) * pageSize
	query := `SELECT id, user_id, title, message, COALESCE(type, ''), is_read, action_url, created_at
		FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`

	rows, err := r.db.Query(query, userID, pageSize, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("query notifications: %w", err)
	}
	defer rows.Close()

	notifications, err := scanNotifications(rows)
	if err != nil {
		return nil, 0, err
	}

	return notifications, total, nil
}

func (r *NotificationRepository) FindByID(id string) (*models.Notification, error) {
	var n models.Notification
	var ntype, link sql.NullString

	query := `SELECT id, user_id, title, message, COALESCE(type, ''), is_read, action_url, created_at
		FROM notifications WHERE id = $1`

	err := r.db.QueryRow(query, id).Scan(
		&n.ID, &n.UserID, &n.Title, &n.Message, &ntype, &n.Read, &link, &n.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("notification not found")
	}
	if err != nil {
		return nil, fmt.Errorf("query notification: %w", err)
	}

	n.Type = ntype.String
	n.Link = toStringPtr(link)

	return &n, nil
}

func (r *NotificationRepository) MarkRead(id string) error {
	_, err := r.db.Exec(`UPDATE notifications SET is_read = true WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("mark notification read: %w", err)
	}
	return nil
}

func (r *NotificationRepository) MarkAllRead(userID string) error {
	_, err := r.db.Exec(`UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`, userID)
	if err != nil {
		return fmt.Errorf("mark all notifications read: %w", err)
	}
	return nil
}

func (r *NotificationRepository) Delete(id string) error {
	_, err := r.db.Exec(`DELETE FROM notifications WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete notification: %w", err)
	}
	return nil
}

func (r *NotificationRepository) CountUnread(userID string) (int64, error) {
	var count int64
	err := r.db.QueryRow(`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("count unread notifications: %w", err)
	}
	return count, nil
}

func (r *NotificationRepository) FindDashboard(userID string) (map[string]interface{}, error) {
	var unreadCount int64
	err := r.db.QueryRow(`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`, userID).Scan(&unreadCount)
	if err != nil {
		return nil, fmt.Errorf("count dashboard unread: %w", err)
	}

	result := map[string]interface{}{
		"unread_count": unreadCount,
	}
	return result, nil
}

func scanNotifications(rows *sql.Rows) ([]models.Notification, error) {
	var notifications []models.Notification
	for rows.Next() {
		var n models.Notification
		var ntype, link sql.NullString

		err := rows.Scan(
			&n.ID, &n.UserID, &n.Title, &n.Message, &ntype, &n.Read, &link, &n.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scan notification: %w", err)
		}

		n.Type = ntype.String
		n.Link = toStringPtr(link)

		notifications = append(notifications, n)
	}
	return notifications, nil
}
