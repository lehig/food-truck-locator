package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/lehig/food-truck-locator/internal/database"
)

const (
	C_LOCAL_SERVER = "http://localhost:3000"
	C_PORT         = ":5000"
)

func registerHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", C_LOCAL_SERVER)
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
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

	var user database.UserJSON
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

	// register the username and password
	errString, httpStatusCode := database.RegisterUser(user.Username, user.Password)
	if errString != "" {
		http.Error(w, errString, httpStatusCode)
		return
	}

	// success reponse
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "user registered successfully",
	})
	log.Println("user registered successfully")
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("login endpoint hit")

	w.Header().Set("Access-Control-Allow-Origin", C_LOCAL_SERVER)
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
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

	var user database.UserJSON
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, `{"message":"invalid json"}`, http.StatusBadRequest)
		return
	}

	errString, httpStatusCode := database.LoginUser(user.Username, user.Password)
	if errString != "" {
		http.Error(w, errString, httpStatusCode)
		return
	}
}

func main() {
	// initialize database
	err := database.SetupDatabase()
	if err != nil {
		log.Println("error in setting up database: ", err)
		return 
	}

	http.HandleFunc("/api/auth/register", registerHandler)
	http.HandleFunc("/api/auth/login", loginHandler)
	fmt.Println("Server running at ", C_PORT)
	http.ListenAndServe(C_PORT, nil)
}
