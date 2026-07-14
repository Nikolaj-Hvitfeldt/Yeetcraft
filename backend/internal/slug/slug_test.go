package slug

import "testing"

func TestToSlug(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{input: "Seb", expected: "seb"},
		{input: "Magisters' Terrace", expected: "magisters-terrace"},
		{input: "Midnight Season 1", expected: "midnight-season-1"},
		{input: "  Niklas  ", expected: "niklas"},
		{input: "Nexus-Point Xenas", expected: "nexus-point-xenas"},
		{input: "---hello---", expected: "hello"},
	}

	for _, testCase := range tests {
		if got := ToSlug(testCase.input); got != testCase.expected {
			t.Fatalf("ToSlug(%q) = %q, want %q", testCase.input, got, testCase.expected)
		}
	}
}
