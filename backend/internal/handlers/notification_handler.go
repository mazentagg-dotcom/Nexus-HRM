package handlers

import (
	"errors"

	"nexus-hrm/internal/services"
	"nexus-hrm/internal/utils"

	"github.com/gin-gonic/gin"
)

type NotificationsHandler struct {
	service *services.NotificationService
}

func NewNotificationsHandler(s *services.NotificationService) *NotificationsHandler {
	return &NotificationsHandler{service: s}
}

func (h *NotificationsHandler) GetNotifications(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c, "User not authenticated")
		return
	}

	pagination := utils.GetPagination(c)

	notifications, total, err := h.service.GetNotifications(userID.(string), pagination.Page, pagination.PageSize)
	if err != nil {
		utils.InternalError(c, "Failed to fetch notifications")
		return
	}

	utils.Paginated(c, notifications, total, pagination)
}

func (h *NotificationsHandler) GetNotification(c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c, "User not authenticated")
		return
	}

	notification, err := h.service.GetNotification(id)
	if err != nil {
		if errors.Is(err, services.ErrNotFound) {
			utils.NotFound(c, "Notification not found")
			return
		}
		utils.InternalError(c, "Failed to fetch notification")
		return
	}

	if notification.UserID != userID.(string) {
		utils.NotFound(c, "Notification not found")
		return
	}

	utils.Success(c, notification)
}

func (h *NotificationsHandler) GetUnreadCount(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c, "User not authenticated")
		return
	}

	count, err := h.service.GetUnreadCount(userID.(string))
	if err != nil {
		utils.InternalError(c, "Failed to fetch unread count")
		return
	}

	utils.Success(c, gin.H{"unread_count": count})
}

func (h *NotificationsHandler) MarkRead(c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c, "User not authenticated")
		return
	}

	notif, err := h.service.GetNotification(id)
	if err != nil || notif == nil || notif.UserID != userID.(string) {
		utils.NotFound(c, "Notification not found")
		return
	}

	if err := h.service.MarkRead(id); err != nil {
		if errors.Is(err, services.ErrNotFound) {
			utils.NotFound(c, "Notification not found")
			return
		}
		utils.InternalError(c, "Failed to mark notification as read")
		return
	}

	utils.SuccessWithMessage(c, "Notification marked as read", nil)
}

func (h *NotificationsHandler) MarkAllRead(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c, "User not authenticated")
		return
	}

	if err := h.service.MarkAllRead(userID.(string)); err != nil {
		utils.InternalError(c, "Failed to mark all notifications as read")
		return
	}

	utils.SuccessWithMessage(c, "All notifications marked as read", nil)
}

func (h *NotificationsHandler) DeleteNotification(c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c, "User not authenticated")
		return
	}

	notif, err := h.service.GetNotification(id)
	if err != nil || notif == nil || notif.UserID != userID.(string) {
		utils.NotFound(c, "Notification not found")
		return
	}

	if err := h.service.DeleteNotification(id); err != nil {
		if errors.Is(err, services.ErrNotFound) {
			utils.NotFound(c, "Notification not found")
			return
		}
		utils.InternalError(c, "Failed to delete notification")
		return
	}

	utils.SuccessWithMessage(c, "Notification deleted", nil)
}

func (h *NotificationsHandler) GetDashboard(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c, "User not authenticated")
		return
	}

	data, err := h.service.GetDashboard(userID.(string))
	if err != nil {
		utils.InternalError(c, "Failed to fetch dashboard data")
		return
	}

	utils.Success(c, data)
}
