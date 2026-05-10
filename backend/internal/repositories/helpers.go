package repositories

import (
	"database/sql"
	"fmt"
	"strconv"
	"time"
)

func toStringPtr(s sql.NullString) *string {
	if !s.Valid {
		return nil
	}
	return &s.String
}

func toTimePtr(t sql.NullTime) *time.Time {
	if !t.Valid {
		return nil
	}
	return &t.Time
}

func nullTimeToTimePtr(t sql.NullTime) *time.Time {
	if !t.Valid {
		return nil
	}
	return &t.Time
}

func itoa(i int) string {
	return strconv.Itoa(i)
}

func fmtInt(i int64) string {
	return fmt.Sprintf("%d", i)
}
