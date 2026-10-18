package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/biomonash/forestportal/internal/audiolink"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Usage: go run cmd/audiolink/main.go keys.txt
// Env:   DB_URL (required), LIVE=true to commit, SHIFT_HOURS to offset filename time.
func main() {
	if len(os.Args) < 2 {
		log.Fatal("usage: audiolink <keys-file>")
	}
	connStr := os.Getenv("DB_URL")
	if connStr == "" {
		log.Fatal("DB_URL environment variable not set")
	}
	live := os.Getenv("LIVE") == "true"

	var shift time.Duration
	if s := os.Getenv("SHIFT_HOURS"); s != "" {
		h, err := strconv.Atoi(s)
		if err != nil {
			log.Fatalf("bad SHIFT_HOURS: %v", err)
		}
		shift = time.Duration(h) * time.Hour
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-sigCh
		fmt.Println("\nInterrupt received, shutting down...")
		cancel()
	}()

	pool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer pool.Close()

	keys, err := audiolink.ReadKeys(os.Args[1])
	if err != nil {
		log.Fatalf("read keys: %v", err)
	}
	if err := audiolink.Link(ctx, pool, keys, live, shift); err != nil {
		log.Fatalf("link failed: %v", err)
	}
}
