package services

import (
	"nexus-hrm/internal/models"
)

type SystemConfigRepo interface {
	Get() (*models.SystemConfig, error)
	Update(cfg *models.SystemConfig) error
}

type BranchRepo interface {
	FindAll() ([]models.CompanyBranch, error)
	Create(name string, isActive bool) (*models.CompanyBranch, error)
	Update(id int, name string, isActive bool) error
	Delete(id int) error
}

type SystemConfigService struct {
	configRepo SystemConfigRepo
	branchRepo BranchRepo
}

func NewSystemConfigService(configRepo SystemConfigRepo, branchRepo BranchRepo) *SystemConfigService {
	return &SystemConfigService{configRepo: configRepo, branchRepo: branchRepo}
}

func (s *SystemConfigService) GetConfig() (*models.SystemConfig, error) {
	return s.configRepo.Get()
}

func (s *SystemConfigService) UpdateConfig(cfg *models.SystemConfig) error {
	return s.configRepo.Update(cfg)
}

func (s *SystemConfigService) GetBranches() ([]models.CompanyBranch, error) {
	return s.branchRepo.FindAll()
}

func (s *SystemConfigService) CreateBranch(name string, isActive bool) (*models.CompanyBranch, error) {
	return s.branchRepo.Create(name, isActive)
}

func (s *SystemConfigService) UpdateBranch(id int, name string, isActive bool) error {
	return s.branchRepo.Update(id, name, isActive)
}

func (s *SystemConfigService) DeleteBranch(id int) error {
	return s.branchRepo.Delete(id)
}
