package data_test

import (
	"testing"

	"github.com/Me-Phew/ada-assistant-backend/internal/data"
	"github.com/Me-Phew/ada-assistant-backend/internal/models"
	"github.com/stretchr/testify/assert"
)

func TestUpsertableInterface(t *testing.T) {
	var user any = &models.AppUserProfile{
		UserID: "62b13d29-5c4e-420e-b991-a631d3938776",
	}

	_, ok := user.(data.Upsertable)
	assert.True(t, ok, "AppUserProfile should implement the Upsertable interface")
}
