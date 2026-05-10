package main

import (
	"log"

	"nexus-hrm/internal/config"
	"nexus-hrm/internal/database"
	"nexus-hrm/internal/middleware"
	"nexus-hrm/internal/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	if err := cfg.Validate(); err != nil && !cfg.IsDevelopment() {
		log.Fatalf("Config validation failed: %v", err)
	}

	db, err := database.NewDatabase(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if !cfg.IsDevelopment() {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.CORS(cfg))
	r.Use(middleware.RequestLogger())
	r.Use(middleware.ErrorHandler())

	routes.SetupRoutes(r, db, cfg)

	log.Printf("Nexus HRM server starting on port %s (env: %s)", cfg.ServerPort, cfg.Environment)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
