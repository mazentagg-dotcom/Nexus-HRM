package services

import (
	"fmt"

	"github.com/google/uuid"

	"nexus-hrm/internal/models"
	"nexus-hrm/internal/utils"
)

type UserRepository interface {
	FindAll(search, status string, page, pageSize int) ([]models.User, int64, error)
	FindByID(id string) (*models.User, error)
	Create(user *models.User) error
	Update(user *models.User) error
	Deactivate(id string) error
	Count() (int64, error)
}

type UserService struct {
	repo UserRepository
}

func NewUserService(repo UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) GetUsers(search, status string, page, pageSize int) ([]models.User, int64, error) {
	return s.repo.FindAll(search, status, page, pageSize)
}

func (s *UserService) GetUser(id string) (*models.User, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *UserService) CreateUser(req *models.CreateUserRequest) (*models.User, error) {
	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	user := &models.User{
		ID:        uuid.New().String(),
		Email:     req.Email,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Password:  hash,
		Phone:     req.Phone,
	}

	if err := s.repo.Create(user); err != nil {
		return nil, err
	}

	user.Password = ""
	return user, nil
}

func (s *UserService) UpdateUser(id string, req *models.UpdateUserRequest) (*models.User, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, ErrUserNotFound
	}

	if req.FirstName != nil {
		user.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		user.LastName = *req.LastName
	}
	if req.Phone != nil {
		user.Phone = *req.Phone
	}
	if req.Avatar != nil {
		user.Avatar = req.Avatar
	}
	if req.Active != nil {
		user.Active = *req.Active
	}

	if err := s.repo.Update(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) DeactivateUser(id string) error {
	if err := s.repo.Deactivate(id); err != nil {
		return ErrUserNotFound
	}
	return nil
}
