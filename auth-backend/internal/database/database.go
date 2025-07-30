package database

import (
	"database/sql"
	"log"
	"net/http"

	"golang.org/x/crypto/bcrypt"
	_ "modernc.org/sqlite"
)

type UserJSON struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

var ( 
	db *sql.DB
	users []UserJSON
)

func SetupDatabase() (error) {
	var err error
	db, err = sql.Open("sqlite", "./users.db")
	if err != nil {
		return err
	}

	createTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL
	);`
	_, err = db.Exec(createTable)
	return err
}

func hashPassword(password string) (hashedPassword []byte, errString string, httpStatusCode int) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, `{"message":"password hashing failed"}`, http.StatusInternalServerError
	}

	return hashedPassword, "", http.StatusOK
}



func RegisterUser(username, password string) (errString string, httpStatusCode int) {
	
	// hashing the password
	passwordHash, errString, httpStatusCode := hashPassword(password)
	if errString != "" {
		log.Println("hash error: ", errString)
		return errString, httpStatusCode
	}
	log.Printf("Registering\nUser: %v\nPassword: %v\n", username, passwordHash)

	// insert into the database
	stmt, err := db.Prepare("INSERT INTO users(username, password) VALUES(?, ?)")
	if err != nil {
		log.Println("db error: ", err)
		return `{"message":"database error"}`, http.StatusInternalServerError
	}
	_, err = stmt.Exec(username, string(passwordHash))
	if err != nil {
		log.Println("username already exists: ", err)
		return `{"message":"username already exists"}`, http.StatusConflict
	}

	return "", http.StatusOK
}

func LoginUser(username, password string) (errString string, httpStatusCode int) {
	var storedPasswordHash string
	err := db.QueryRow("SELECT password FROM users WHERE username = ?", username).Scan(&storedPasswordHash)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Println("Login failed: user not found:", username)
			return `{"message":"invalid username or password"}`, http.StatusUnauthorized
		}
		log.Println("Database error during login:", err)
		return `{"message":"database error"}`, http.StatusInternalServerError
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedPasswordHash), []byte(password))
	if err != nil {
		log.Println("comparing hash...\ninvalid username or password error: ", err)
		return `{"message":"comparing hash...invalid username or password"}`, http.StatusUnauthorized
	}
	
	log.Println("successfully logging in user: ", username)
	return "", http.StatusOK
}
