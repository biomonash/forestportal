package stats

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/biomonash/forestportal/internal/db"
	"github.com/biomonash/forestportal/internal/utils"
	"github.com/gin-gonic/gin"
)

// --- Structs ---

type ObservationOverviewRequest struct {
	ObservationStatsInput
}

type ObservationOverviewResponse struct {
	ObservationStats
	NativeCount int64             `json:"nativeSpeciesCount"`
	CountByTaxa map[db.Taxa]int64 `json:"countByTaxa"`
}

type ObservationTimeSeriesRequest struct {
	ObservationStatsInput
}

type ObservationTimeSeriesResponse struct {
	Series map[string][]TimeSeriesPoint `json:"series"`
}

type ObservationMonthlyTimeSeriesResponse struct {
	Series map[string][]TimeSeriesPoint `json:"series"`
}

type ObservationMonthlyTimeSeriesAllYearsResponse struct {
	Series map[string][]MonthlyPoint `json:"series"`
}

type MonthlyPoint struct {
	Month int32 `json:"month"`
	ObservationStats
}

// ObservationOverview godoc
//
//	@Summary		Observation overview
//	@Description	Observation overview
//	@Tags			statistics
//	@Accept			json
//	@Produce		json
//	@Param			from		query		string		False	"Search start from"		format(date-time)
//	@Param			to			query		string		False	"Search end to"			format(date-time)
//	@Param			block[]		query		[]integer	False	"Filter by site block"	collectionFormat(multi)
//	@Param			siteCode[]	query		[]string	False	"Filter by site code"	collectionFormat(multi)
//	@Param			taxa		query		string		False	"Filter by taxa"
//	@Param			commonName	query		string		False	"Filter by species common_name"
//	@Success		200			{object}	ObservationOverviewResponse
//	@Error			400 																																																																																																					{object}	gin.H
//	@Router			/stats/observations [get]
func (u *Controller) ObservationOverview(c *gin.Context) {
	var req ObservationOverviewRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(utils.NewHttpError(http.StatusBadRequest, "failed to parse input", err))
		return
	}
	ctx := c.Request.Context()

	var resp ObservationOverviewResponse

	// Use from/to for filtering

	from, to, taxa, commonName := parseObservationStatsInput(req.ObservationStatsInput)

	log.Println(req.SiteCodes)

	paramsNative := db.CountSpeciesByNativeParams{
		From:       from,
		To:         to,
		Blocks:     req.Blocks,
		SiteCodes:  req.SiteCodes,
		Taxa:       taxa,
		CommonName: commonName,
	}

	speciesGroups, err := u.q.CountSpeciesByNative(ctx, paramsNative)
	if err != nil {
		c.Error(fmt.Errorf("Failed to count native species: %w", err))
		return
	}
	for _, group := range speciesGroups {
		resp.ObservationCount += group.ObservationCount
		resp.SpeciesCount += group.SpeciesCount
		if group.IsNative {
			resp.NativeCount = group.SpeciesCount
		}
	}

	params := db.ListSpeciesCountByTaxaParams{
		From:       from,
		To:         to,
		Blocks:     req.Blocks,
		SiteCodes:  req.SiteCodes,
		Taxa:       taxa,
		CommonName: commonName,
	}
	countByCategoryRows, err := u.q.ListSpeciesCountByTaxa(ctx, params)
	if err != nil {
		c.Error(fmt.Errorf("Failed to count species by category: %w", err))
		return
	}
	resp.CountByTaxa = make(map[db.Taxa]int64)
	for _, row := range countByCategoryRows {
		resp.CountByTaxa[row.Taxa] = row.Count
	}

	c.JSON(http.StatusOK, resp)
}

// ObservationTimeSeries godoc
//
//	@Summary		Observation time series
//	@Description	Observation time series
//	@Tags			statistics
//	@Accept			json
//	@Produce		json
//	@Param			from		query		string		False	"Search start from"		format(date-time)
//	@Param			to			query		string		False	"Search end to"			format(date-time)
//	@Param			block[]		query		[]integer	False	"Filter by site block"	collectionFormat(multi)
//	@Param			siteCode[]	query		[]string	False	"Filter by site code"	collectionFormat(multi)
//	@Param			taxa		query		string		False	"Filter by taxa"
//	@Param			commonName	query		string		False	"Filter by species common name"
//	@Success		200			{object}	ObservationTimeSeriesResponse
//	@Error			400 																																																																																												{object}	gin.H
//	@Router			/stats/observations/timeseries [get]
func (u *Controller) ObservationTimeSeries(c *gin.Context) {
	var req ObservationTimeSeriesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(utils.NewHttpError(http.StatusBadRequest, "Invalid query parameters", err))
		return
	}
	ctx := c.Request.Context()

	// Parse common input parameters
	from, to, taxa, commonName := parseObservationStatsInput(req.ObservationStatsInput)

	params := db.ObservationTimeSeriesGroupByNativeParams{
		From:       from,
		To:         to,
		Blocks:     req.Blocks,
		SiteCodes:  req.SiteCodes,
		Taxa:       taxa,
		CommonName: commonName,
	}

	rows, err := u.q.ObservationTimeSeriesGroupByNative(ctx, params)
	if err != nil {
		c.Error(fmt.Errorf("Failed to fetch time series: %w", err))
		return
	}
	series := map[string][]TimeSeriesPoint{
		"native":     make([]TimeSeriesPoint, 0, len(rows)),
		"non-native": make([]TimeSeriesPoint, 0, len(rows)),
	}
	for _, row := range rows {
		key := "native"
		if !row.IsNative {
			key = "non-native"
		}
		series[key] = append(series[key], TimeSeriesPoint{
			Timestamp: row.Year.Format(time.RFC3339),
			ObservationStats: ObservationStats{
				SpeciesCount:     row.SpeciesCount,
				ObservationCount: row.ObservationCount,
			},
		})
	}
	resp := ObservationTimeSeriesResponse{Series: series}
	c.JSON(http.StatusOK, resp)
}

// ObservationMonthlyTimeSeries godoc
//
//	@Summary		Observation monthly time series
//	@Description	Observation counts grouped by month for a given date range (e.g. one year)
//	@Tags			statistics
//	@Accept			json
//	@Produce		json
//	@Param			from		query		string		False	"Search start from"		format(date-time)
//	@Param			to			query		string		False	"Search end to"			format(date-time)
//	@Param			block[]		query		[]integer	False	"Filter by site block"	collectionFormat(multi)
//	@Param			siteCode[]	query		[]string	False	"Filter by site code"	collectionFormat(multi)
//	@Param			taxa		query		string		False	"Filter by taxa"
//	@Param			commonName	query		string		False	"Filter by species common name"
//	@Success		200			{object}	ObservationMonthlyTimeSeriesResponse
//	@Error			400							{object}	gin.H
//	@Router			/stats/observations/timeseries/monthly [get]
func (u *Controller) ObservationMonthlyTimeSeries(c *gin.Context) {
	var req ObservationMonthlyTimeSeriesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(utils.NewHttpError(http.StatusBadRequest, "Invalid query parameters", err))
		return
	}
	ctx := c.Request.Context()

	from, to, taxa, commonName := parseObservationStatsInput(req.ObservationStatsInput)

	params := db.ObservationMonthFilteredTimeSeriesGroupByNativeParams{
		From: from, To: to, Blocks: req.Blocks, SiteCodes: req.SiteCodes,
		Taxa: taxa, CommonName: commonName,
	}

	rows, err := u.q.ObservationMonthFilteredTimeSeriesGroupByNative(ctx, params)
	if err != nil {
		c.Error(fmt.Errorf("Failed to fetch monthly time series: %w", err))
		return
	}
	series := map[string][]TimeSeriesPoint{
		"native":     make([]TimeSeriesPoint, 0, len(rows)),
		"non-native": make([]TimeSeriesPoint, 0, len(rows)),
	}
	for _, row := range rows {
		key := "native"
		if !row.IsNative {
			key = "non-native"
		}
		series[key] = append(series[key], TimeSeriesPoint{
			Timestamp: row.Month.Format(time.RFC3339),
			ObservationStats: ObservationStats{
				SpeciesCount:     row.SpeciesCount,
				ObservationCount: row.ObservationCount,
			},
		})
	}
	c.JSON(http.StatusOK, ObservationMonthlyTimeSeriesResponse{Series: series})
}

// ObservationMonthlyTimeSeriesAllYears godoc
//
//	@Summary		Observation monthly time series across all years
//	@Description	Observation counts grouped by calendar month (Jan-Dec), aggregated across every year in range
//	@Tags			statistics
//	@Accept			json
//	@Produce		json
//	@Param			from		query		string		False	"Search start from"		format(date-time)
//	@Param			to			query		string		False	"Search end to"			format(date-time)
//	@Param			block[]		query		[]integer	False	"Filter by site block"	collectionFormat(multi)
//	@Param			siteCode[]	query		[]string	False	"Filter by site code"	collectionFormat(multi)
//	@Param			taxa		query		string		False	"Filter by taxa"
//	@Param			commonName	query		string		False	"Filter by species common name"
//	@Success		200			{object}	ObservationMonthlyTimeSeriesAllYearsResponse
//	@Error			400							{object}	gin.H
//	@Router			/stats/observations/timeseries/monthly/all-years [get]
func (u *Controller) ObservationMonthlyTimeSeriesAllYears(c *gin.Context) {
	var req ObservationMonthlyTimeSeriesAllYearsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(utils.NewHttpError(http.StatusBadRequest, "Invalid query parameters", err))
		return
	}
	ctx := c.Request.Context()

	from, to, taxa, commonName := parseObservationStatsInput(req.ObservationStatsInput)

	params := db.ObservationMonthForAllYearFilteredTimeSeriesGroupByNativeParams{
		From: from, To: to, Blocks: req.Blocks, SiteCodes: req.SiteCodes,
		Taxa: taxa, CommonName: commonName,
	}

	rows, err := u.q.ObservationMonthForAllYearFilteredTimeSeriesGroupByNative(ctx, params)
	if err != nil {
		c.Error(fmt.Errorf("Failed to fetch monthly time series across all years: %w", err))
		return
	}
	series := map[string][]MonthlyPoint{
		"native":     make([]MonthlyPoint, 0, len(rows)),
		"non-native": make([]MonthlyPoint, 0, len(rows)),
	}
	for _, row := range rows {
		key := "native"
		if !row.IsNative {
			key = "non-native"
		}
		series[key] = append(series[key], MonthlyPoint{
			Month: row.Month,
			ObservationStats: ObservationStats{
				SpeciesCount:     row.SpeciesCount,
				ObservationCount: row.ObservationCount,
			},
		})
	}
	c.JSON(http.StatusOK, ObservationMonthlyTimeSeriesAllYearsResponse{Series: series})
}
