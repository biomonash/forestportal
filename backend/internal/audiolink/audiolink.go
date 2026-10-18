package audiolink

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"path"
	"regexp"
	"strings"
	"time"

	"github.com/biomonash/forestportal/internal/db"
	"github.com/jackc/pgx/v5/pgxpool"
)

// <SITE>_<YYYYMMDD>_<HHMMSS>.(mp3|wav)  (site may or may not be hyphenated, e.g. 1D5 or 1-D-5)
var nameRe = regexp.MustCompile(`(?i)^([0-9A-Za-z-]+)_(\d{8})_(\d{6})\.(?:mp3|wav)$`)

type Recording struct {
	SiteCode   string
	RecordedAt time.Time
}

func ParseKey(key string) (Recording, error) {
	m := nameRe.FindStringSubmatch(path.Base(key))
	if m == nil {
		return Recording{}, fmt.Errorf("filename does not match <SITE>_<YYYYMMDD>_<HHMMSS>.mp3 or .wav")
	}
	// Built as a UTC wall-clock value: the timestamp column has no zone and the
	// importer stored the spreadsheet's local wall-clock time.
	t, err := time.ParseInLocation("20060102150405", m[2]+m[3], time.UTC)
	if err != nil {
		return Recording{}, err
	}
	return Recording{SiteCode: strings.ReplaceAll(m[1], "-", ""), RecordedAt: t}, nil
}

// ReadKeys accepts plain keys, or `aws s3 ls --recursive` output (key = last field).
func ReadKeys(file string) ([]string, error) {
	f, err := os.Open(file)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	var keys []string
	sc := bufio.NewScanner(f)
	for sc.Scan() {
		fields := strings.Fields(sc.Text())
		if len(fields) == 0 {
			continue
		}
		key := fields[len(fields)-1]
		lower := strings.ToLower(key)
		if strings.HasSuffix(lower, ".mp3") || strings.HasSuffix(lower, ".wav") {
			keys = append(keys, key)
		}
	}
	return keys, sc.Err()
}

// Link updates observations for every key. When live is false everything runs in
// a transaction that is rolled back, so counts are real but nothing is written.
func Link(ctx context.Context, pool *pgxpool.Pool, keys []string, live bool, shift time.Duration) error {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)
	q := db.New(pool).WithTx(tx)

	var linked, unmatched, bad int
	var rows int64
	for _, key := range keys {
		rec, err := ParseKey(key)
		if err != nil {
			fmt.Printf("SKIP  %s: %v\n", key, err)
			bad++
			continue
		}
		n, err := q.LinkRecordingToObservations(ctx, db.LinkRecordingToObservationsParams{
			File:       key,
			SiteCode:   rec.SiteCode,
			RecordedAt: rec.RecordedAt.Add(shift),
		})
		if err != nil {
			return fmt.Errorf("update %s: %w", key, err)
		}
		if n == 0 {
			fmt.Printf("NONE  %s (site=%s at=%s)\n", key, rec.SiteCode, rec.RecordedAt.Format("2006-01-02 15:04:05"))
			unmatched++
			continue
		}
		linked++
		rows += n
	}

	fmt.Printf("\nfiles: %d total, %d linked, %d with no matching observation, %d unparseable\n",
		len(keys), linked, unmatched, bad)
	fmt.Printf("observation rows updated: %d\n", rows)

	if !live {
		fmt.Println("DRY RUN: rolled back. Set LIVE=true to commit.")
		return nil
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit: %w", err)
	}
	fmt.Println("Committed.")
	return nil
}
