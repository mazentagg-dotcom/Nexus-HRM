package services

import (
	"fmt"

	"github.com/google/uuid"

	"nexus-hrm/internal/models"
)

type NotificationRepository interface {
	FindByUserID(userID string, page, pageSize int) ([]models.Notification, int64, error)
	FindByID(id string) (*models.Notification, error)
	MarkRead(id string) error
	MarkAllRead(userID string) error
	Delete(id string) error
	CountUnread(userID string) (int64, error)
	FindDashboard(userID string) (map[string]interface{}, error)
	Create(n *models.Notification) error
}

type NotificationService struct {
	repo NotificationRepository
}

func NewNotificationService(repo NotificationRepository) *NotificationService {
	return &NotificationService{repo: repo}
}

func (s *NotificationService) GetNotifications(userID string, page, pageSize int) ([]models.Notification, int64, error) {
	return s.repo.FindByUserID(userID, page, pageSize)
}

func (s *NotificationService) GetNotification(id string) (*models.Notification, error) {
	n, err := s.repo.FindByID(id)
	if err != nil {
		return nil, ErrNotFound
	}
	return n, nil
}

func (s *NotificationService) MarkRead(id string) error {
	if err := s.repo.MarkRead(id); err != nil {
		return ErrNotFound
	}
	return nil
}

func (s *NotificationService) MarkAllRead(userID string) error {
	return s.repo.MarkAllRead(userID)
}

func (s *NotificationService) DeleteNotification(id string) error {
	if err := s.repo.Delete(id); err != nil {
		return ErrNotFound
	}
	return nil
}

func (s *NotificationService) GetUnreadCount(userID string) (int64, error) {
	return s.repo.CountUnread(userID)
}

func (s *NotificationService) GetDashboard(userID string) (map[string]interface{}, error) {
	return s.repo.FindDashboard(userID)
}

func (s *NotificationService) CreateNotification(userID, title, message, ntype string, link *string) (*models.Notification, error) {
	n := &models.Notification{
		ID:      uuid.New().String(),
		UserID:  userID,
		Title:   title,
		Message: message,
		Type:    ntype,
		Link:    link,
	}

	if err := s.repo.Create(n); err != nil {
		return nil, fmt.Errorf("create notification: %w", err)
	}

	return n, nil
}
