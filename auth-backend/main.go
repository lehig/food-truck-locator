package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/lehig/food-truck-locator/internal/database"
	"golang.org/x/crypto/bcrypt"
)

const (
	C_LOCAL_SERVER = "http://localhost:5000"
	C_PORT         = ":5000"
)

var ( 
	db *sql.DB
	users []UserJSON
)

type UserJSON struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Content-Type", "application/json")

	// handle preflight request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// allow POST
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var user UserJSON

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, `{"message":"invalid json"}`, http.StatusBadRequest)
		return
	}

	user.Username = strings.TrimSpace(user.Username)
	user.Password = strings.TrimSpace(user.Password)

	if user.Password == "" || user.Username == "" {
		http.Error(w, `{"message":"username and password are required}`, http.StatusBadRequest)
		return
	}

	// hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, `{"message":"password hashing failed"}`, http.StatusInternalServerError)
		return 
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

	// success reponse
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "user registered successfully",
	})
}

func main() {
	// initialize database
	var err error
	db, err = database.SetupDatabase()
	if err != nil {
		fmt.Printf("error in setting up database: %v\n", err)
		return
	}
	
	http.HandleFunc("/api/auth/register", registerHandler)
	fmt.Println("Server running at ", C_LOCAL_SERVER)
	http.ListenAndServe(C_PORT, nil)
}