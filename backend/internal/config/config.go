package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	ServerPort         string
	Environment        string
	DBHost             string
	DBPort             string
	DBUser             string
	DBPassword         string
	DBName             string
	DBSSLMode          string
	DBMaxOpen          int
	DBMaxIdle          int
	DBMaxLifetime      time.Duration
	JWTSecret          string
	JWTExpiry          time.Duration
	CORSAllowedOrigins []string
}

func Load() *Config {
	maxOpen, _ := strconv.Atoi(getEnv("DB_MAX_OPEN", "25"))
	maxIdle, _ := strconv.Atoi(getEnv("DB_MAX_IDLE", "10"))
	maxLifetime, _ := strconv.Atoi(getEnv("DB_MAX_LIFETIME", "300"))
	jwtExpiry, _ := strconv.Atoi(getEnv("JWT_EXPIRY_HOURS", "24"))

	return &Config{
		ServerPort:    getEnv("SERVER_PORT", "8120"),
		Environment:   getEnv("ENVIRONMENT", "development"),
		DBHost:        getEnv("DB_HOST", "localhost"),
		DBPort:        getEnv("DB_PORT", "5438"),
		DBUser:        getEnv("DB_USER", "nexus"),
		DBPassword:    getEnv("DB_PASSWORD", "nexus_secret_2024"),
		DBName:        getEnv("DB_NAME", "nexus_hrm"),
		DBSSLMode:     getEnv("DB_SSL_MODE", "disable"),
		DBMaxOpen:     maxOpen,
		DBMaxIdle:     maxIdle,
		DBMaxLifetime: time.Duration(maxLifetime) * time.Second,
		JWTSecret:     getEnv("JWT_SECRET", "nexus_hrm_jwt_super_secret_key_change_in_production"),
		JWTExpiry:     time.Duration(jwtExpiry) * time.Hour,
	}
}

func (c *Config) Validate() error {
	if c.DBHost == "" || c.DBUser == "" || c.DBName == "" {
		return fmt.Errorf("database configuration is incomplete")
	}
	if c.JWTSecret == "" || c.JWTSecret == "change_me_in_production" {
		return fmt.Errorf("JWT_SECRET must be set in production")
	}
	return nil
}

func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName, c.DBSSLMode,
	)
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
