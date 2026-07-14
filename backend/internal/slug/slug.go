package slug

import (
	"regexp"
	"strings"
)

var nonAlphanumericPattern = regexp.MustCompile(`[^a-z0-9]+`)

// ToSlug mirrors frontend/src/utils/slug.ts toSlug for URL-safe player lookup.
func ToSlug(value string) string {
	slug := strings.ToLower(strings.TrimSpace(value))
	slug = nonAlphanumericPattern.ReplaceAllString(slug, "-")
	return strings.Trim(slug, "-")
}
