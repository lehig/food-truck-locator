package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// Initialize database (consider doing this outside handler for better performance)
	err := database.SetupDatabase()
	if err != nil {
		log.Println("error in setting up database: ", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       `{"message":"database setup failed"}`,
		}, nil
	}

	// Set CORS headers
	headers := map[string]string{
		"Access-Control-Allow-Origin":  "*", // Change to your Amplify domain in production
		"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Content-Type":                 "application/json",
	}

	// Handle preflight request
	if request.HTTPMethod == "OPTIONS" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusOK,
			Headers:    headers,
		}, nil
	}

	// Route based on path
	switch request.Path {
	case "/api/auth/register":
		return handleRegister(request, headers)
	case "/api/auth/login":
		return handleLogin(request, headers)
	default:
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusNotFound,
			Headers:    headers,
			Body:       `{"message":"endpoint not found"}`,
		}, nil
	}
}

func handleRegister(request events.APIGatewayProxyRequest, headers map[string]string) (events.APIGatewayProxyResponse, error) {
	if request.HTTPMethod != "POST" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusMethodNotAllowed,
			Headers:    headers,
			Body:       `{"message":"method not allowed"}`,
		}, nil
	}

	var user database.UserJSON
	err := json.Unmarshal([]byte(request.Body), &user)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Headers:    headers,
			Body:       `{"message":"invalid json"}`,
		}, nil
	}

	user.Username = strings.TrimSpace(user.Username)
	user.Password = strings.TrimSpace(user.Password)

	if user.Password == "" || user.Username == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Headers:    headers,
			Body:       `{"message":"username and password are required"}`,
		}, nil
	}

	errString, httpStatusCode := database.RegisterUser(user.Username, user.Password)
	if errString != "" {
		return events.APIGatewayProxyResponse{
			StatusCode: httpStatusCode,
			Headers:    headers,
			Body:       errString,
		}, nil
	}

	response := map[string]string{"message": "user registered successfully"}
	responseBody, _ := json.Marshal(response)

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusCreated,
		Headers:    headers,
		Body:       string(responseBody),
	}, nil
}

func handleLogin(request events.APIGatewayProxyRequest, headers map[string]string) (events.APIGatewayProxyResponse, error) {
	if request.HTTPMethod != "POST" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusMethodNotAllowed,
			Headers:    headers,
			Body:       `{"message":"method not allowed"}`,
		}, nil
	}

	var user database.UserJSON
	err := json.Unmarshal([]byte(request.Body), &user)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Headers:    headers,
			Body:       `{"message":"invalid json"}`,
		}, nil
	}

	errString, httpStatusCode := database.LoginUser(user.Username, user.Password)
	if errString != "" {
		return events.APIGatewayProxyResponse{
			StatusCode: httpStatusCode,
			Headers:    headers,
			Body:       errString,
		}, nil
	}

	response := map[string]string{"message": "login successful"}
	responseBody, _ := json.Marshal(response)

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Headers:    headers,
		Body:       string(responseBody),
	}, nil
}

func main() {
	lambda.Start(handler)
}
