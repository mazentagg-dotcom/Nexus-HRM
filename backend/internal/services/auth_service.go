package services

import (
	"fmt"
	"time"

	"github.com/google/uuid"

	"nexus-hrm/internal/middleware"
	"nexus-hrm/internal/models"
	"nexus-hrm/internal/utils"
)

type AuthUserRepository interface {
	FindByEmail(email string) (*models.User, error)
	FindByID(id string) (*models.User, error)
	Create(user *models.User) error
	UpdatePassword(id, hash string) error
	UpdateLastLogin(id string) error
}

type AuthRoleRepository interface {
	FindByUserIDWithPermissions(userID string) ([]models.Role, []string, error)
	AssignRoleToUser(userID, roleID string) error
}

type AuthService struct {
	userRepo  AuthUserRepository
	roleRepo  AuthRoleRepository
	jwtSecret string
	jwtExpiry time.Duration
}

func NewAuthService(userRepo AuthUserRepository, roleRepo AuthRoleRepository, jwtSecret string, jwtExpiry time.Duration) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		roleRepo:  roleRepo,
		jwtSecret: jwtSecret,
		jwtExpiry: jwtExpiry,
	}
}

func (s *AuthService) Login(email, password string) (*models.LoginResponse, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if !utils.CheckPassword(password, user.Password) {
		return nil, ErrInvalidCredentials
	}

	if !user.Active {
		return nil, ErrUserInactive
	}

	roles, permissions, err := s.roleRepo.FindByUserIDWithPermissions(user.ID)
	if err != nil {
		return nil, err
	}

	roleName := ""
	if len(roles) > 0 {
		roleName = roles[0].Slug
	}

	token, err := middleware.GenerateToken(user.ID, user.Email, roleName, permissions, s.jwtSecret, s.jwtExpiry)
	if err != nil {
		return nil, err
	}

	if err := s.userRepo.UpdateLastLogin(user.ID); err != nil {
		return nil, err
	}

	user.Password = ""

	return &models.LoginResponse{
		Token:       token,
		User:        *user,
		Roles:       roles,
		Permissions: permissions,
		ExpiresAt:   time.Now().Add(s.jwtExpiry),
	}, nil
}

func (s *AuthService) Register(req *models.CreateUserRequest) (*models.User, error) {
	_, err := s.userRepo.FindByEmail(req.Email)
	if err == nil {
		return nil, ErrUserExists
	}

	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		ID:        uuid.New().String(),
		Email:     req.Email,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Password:  hash,
		Phone:     req.Phone,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	if len(req.RoleIDs) > 0 {
		allowedRoles := []string{"employee", "manager"}
		for _, roleID := range req.RoleIDs {
			isAllowed := false
			for _, allowed := range allowedRoles {
				if roleID == allowed {
					isAllowed = true
					break
				}
			}
			if !isAllowed {
				return nil, fmt.Errorf("self-registration only allows 'employee' or 'manager' role")
			}
			if err := s.roleRepo.AssignRoleToUser(user.ID, roleID); err != nil {
				return nil, err
			}
		}
	}

	user.Password = ""
	return user, nil
}

func (s *AuthService) GetMe(userID string) (*models.UserWithRoles, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	roles, permissions, err := s.roleRepo.FindByUserIDWithPermissions(userID)
	if err != nil {
		return nil, err
	}

	return &models.UserWithRoles{
		User:        *user,
		Roles:       roles,
		Permissions: permissions,
	}, nil
}

func (s *AuthService) ChangePassword(userID, current, new string) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return ErrUserNotFound
	}

	if !utils.CheckPassword(current, user.Password) {
		return ErrInvalidPassword
	}

	hash, err := utils.HashPassword(new)
	if err != nil {
		return err
	}

	return s.userRepo.UpdatePassword(userID, hash)
}
