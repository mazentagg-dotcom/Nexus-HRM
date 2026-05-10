package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct {
	db      *sql.DB
	started time.Time
}

func NewHealthHandler(db *sql.DB) *HealthHandler {
	return &HealthHandler{
		db:      db,
		started: time.Now(),
	}
}

func (h *HealthHandler) CheckHealth(c *gin.Context) {
	dbStatus := "ok"
	if err := h.db.Ping(); err != nil {
		dbStatus = "error: " + err.Error()
	}

	uptime := time.Since(h.started).String()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"status": "healthy",
			"database": gin.H{
				"status": dbStatus,
			},
			"uptime": uptime,
		},
	})
}
