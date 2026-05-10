package models

import "time"

type ReviewCycle struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type ReviewAssignment struct {
	ID           string     `json:"id"`
	CycleID      string     `json:"cycle_id"`
	EmployeeID   string     `json:"employee_id"`
	ReviewerID   string     `json:"reviewer_id"`
	Status       string     `json:"status"`
	SubmittedAt  *time.Time `json:"submitted_at,omitempty"`
	OverallScore *float64   `json:"overall_score,omitempty"`
}

type ReviewRating struct {
	ID           string `json:"id"`
	AssignmentID string `json:"assignment_id"`
	QuestionID   string `json:"question_id"`
	Score        int    `json:"score"`
	Comment      string `json:"comment"`
}

type ReviewQuestion struct {
	ID       string `json:"id"`
	Text     string `json:"text"`
	Category string `json:"category"`
	OrderNum int    `json:"order_num"`
	IsActive bool   `json:"is_active"`
}

type ReviewResponse struct {
	ID           string    `json:"id"`
	AssignmentID string    `json:"assignment_id"`
	QuestionID   string    `json:"question_id"`
	Score        int       `json:"score"`
	Comment      string    `json:"comment"`
	CreatedAt    time.Time `json:"created_at"`
}

type ReviewSummary struct {
	ID           string    `json:"id"`
	CycleID      string    `json:"cycle_id"`
	EmployeeID   string    `json:"employee_id"`
	AverageScore float64   `json:"average_score"`
	TotalReviews int       `json:"total_reviews"`
	Strengths    string    `json:"strengths"`
	Improvements string    `json:"improvements"`
	CreatedAt    time.Time `json:"created_at"`
}
