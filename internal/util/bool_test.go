package util_test

import (
	"testing"

	"github.com/Me-Phew/ada-assistant-backend/internal/util"
	"github.com/stretchr/testify/assert"
)

func TestFalseIfNil(t *testing.T) {
	b := true
	assert.True(t, util.FalseIfNil(&b))
	b = false
	assert.False(t, util.FalseIfNil(&b))
	assert.False(t, util.FalseIfNil(nil))
}
