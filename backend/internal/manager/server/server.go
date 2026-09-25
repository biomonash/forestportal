package server

import (
	"github.com/biomonash/forestportal/internal/db"
	"github.com/biomonash/forestportal/internal/manager/upload"
	"github.com/biomonash/forestportal/internal/middlewares"
	"github.com/biomonash/forestportal/internal/species"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Server struct {
	router *gin.Engine
	q      db.Querier
}

func New(q db.Querier) *Server {
	r := gin.New()

	r.Use(gin.Logger())
	r.Use(middlewares.PanicRecovery())
	r.Use(middlewares.ErrorHandler())
	r.Use(cors.Default())

	api := r.Group("/api/manager")
	upload.Register(api, upload.NewController(q))

	speciesCtl := species.NewController(q)
	species.Register(api, speciesCtl)
	api.PUT("/species/:id", speciesCtl.UpdateSpeciesManager)

	return &Server{
		router: r,
		q:      q,
	}
}

func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}
