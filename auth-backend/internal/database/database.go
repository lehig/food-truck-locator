package database

import (
	"database/sql"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
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

func hashPassword(password string) (hashedPassword []byte, errString string, httpStatusCode int) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, `{"message":"password hashing failed"}`, http.StatusInternalServerError
	}

	return hashedPassword, "", http.StatusOK
}

func RegisterUser(password string) (errString string, httpStatusCode int) {
	
	// hashing the password
	passwordHash, errString, httpStatusCode := hashPassword(password) // <-- TODO: this is where I stopped 
	if errString != "" {
		return errString, httpStatusCode
	}

	// insert into the database
	stmt, err := db.Prepare("INSERT INTO users(username, password) VALUES(?, ?)")
	if err != nil {
		http.Error(w, `{"message":"database error"}`, http.StatusInternalServerError)
		return
	}
	_, err = stmt.Exec(user.Username, string(hashedPassword))
	if err != nil {
		http.Error(w, `{"message":"username already exists"}`, http.StatusConflict)
		return
	}
}
