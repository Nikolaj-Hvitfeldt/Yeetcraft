package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"

	"yeetcraft/backend/internal/testdb"
)

func main() {
	os.Exit(run(os.Args[1:]))
}

func run(arguments []string) int {
	_ = godotenv.Load()

	if len(arguments) != 1 {
		fmt.Fprintf(os.Stderr, "usage: testdb <prepare|seed|reset|verify>\n")
		return 2
	}

	command := arguments[0]
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	client, err := testdb.NewClient(ctx)
	if err != nil {
		fmt.Fprintf(os.Stderr, "testdb: %v\n", sanitizeError(err))
		return 1
	}
	defer client.Close()

	switch command {
	case "prepare":
		err = client.Prepare(ctx)
	case "seed":
		err = client.Seed(ctx)
	case "reset":
		err = client.Reset(ctx)
	case "verify":
		err = client.Verify(ctx)
	default:
		fmt.Fprintf(os.Stderr, "testdb: unknown command %q\n", command)
		return 2
	}

	if err != nil {
		fmt.Fprintf(os.Stderr, "testdb %s: %v\n", command, sanitizeError(err))
		return 1
	}

	fmt.Printf("testdb %s: ok\n", command)
	return 0
}

func sanitizeError(err error) error {
	var guardError testdb.GuardError
	if errors.As(err, &guardError) {
		return guardError
	}

	return err
}
