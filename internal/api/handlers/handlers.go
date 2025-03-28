// Code generated by go run -tags scripts scripts/handlers/gen_handlers.go; DO NOT EDIT.
package handlers

import (
	"github.com/Me-Phew/ada-assistant-backend/internal/api"
	"github.com/Me-Phew/ada-assistant-backend/internal/api/handlers/auth"
	"github.com/Me-Phew/ada-assistant-backend/internal/api/handlers/common"
	"github.com/Me-Phew/ada-assistant-backend/internal/api/handlers/push"
	"github.com/labstack/echo/v4"
)

func AttachAllRoutes(s *api.Server) {
	// attach our routes
	s.Router.Routes = []*echo.Route{
		auth.GetUserInfoRoute(s),
		auth.PostChangePasswordRoute(s),
		auth.PostForgotPasswordCompleteRoute(s),
		auth.PostForgotPasswordRoute(s),
		auth.PostLoginRoute(s),
		auth.PostLogoutRoute(s),
		auth.PostRefreshRoute(s),
		auth.PostRegisterRoute(s),
		common.GetHealthyRoute(s),
		common.GetReadyRoute(s),
		common.GetSwaggerRoute(s),
		common.GetVersionRoute(s),
		push.GetPushTestRoute(s),
		push.PostUpdatePushTokenRoute(s),
	}
}
