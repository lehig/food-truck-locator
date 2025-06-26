package database

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
)

func SetupDatabase() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", "./users.db")
	if err != nil {
		return nil, err
	}

	createTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL
	);`
	_, err = db.Exec(createTable)
	if err != nil {
		return nil, err 
	}

	return db, nil 
}
