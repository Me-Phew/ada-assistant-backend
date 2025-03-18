package auth

import (
	"time"

	"github.com/Me-Phew/ada-assistant-backend/internal/models"
)

type AuthenticationResult struct {
	Token      string
	User       *models.User
	ValidUntil time.Time
	Scopes     []string
}
