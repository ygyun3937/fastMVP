package com.inventory.service;

import com.inventory.dto.ProjectAvailabilityResponse;
import com.inventory.dto.ProjectItemRequest;
import com.inventory.dto.ProjectRequest;
import com.inventory.model.Inventory;
import com.inventory.model.Project;
import com.inventory.model.ProjectItem;
import com.inventory.repository.ProjectItemRepository;
import com.inventory.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectItemRepository projectItemRepository;
    private final InventoryService inventoryService;
    private final NotificationService notificationService;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다: " + id));
    }

    public Project getProjectByCode(String projectCode) {
        return projectRepository.findByProjectCode(projectCode)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다: " + projectCode));
    }

    public List<Project> getProjectsByStatus(Project.ProjectStatus status) {
        return projectRepository.findByStatus(status);
    }

    public List<Project> searchProjects(String keyword) {
        return projectRepository.searchByKeyword(keyword);
    }

    @Transactional
    public Project createProject(ProjectRequest request) {
        if (projectRepository.existsByProjectCode(request.getProjectCode())) {
            throw new RuntimeException("이미 존재하는 프로젝트 코드입니다: " + request.getProjectCode());
        }

        Project project = new Project();
        project.setProjectCode(request.getProjectCode());
        project.setProjectName(request.getProjectName());
        project.setClient(request.getClient());
        project.setStatus(request.getStatus());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setDescription(request.getDescription());

        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(Long id, ProjectRequest request) {
        Project project = getProjectById(id);

        if (!project.getProjectCode().equals(request.getProjectCode()) &&
                projectRepository.existsByProjectCode(request.getProjectCode())) {
            throw new RuntimeException("이미 존재하는 프로젝트 코드입니다: " + request.getProjectCode());
        }

        project.setProjectCode(request.getProjectCode());
        project.setProjectName(request.getProjectName());
        project.setClient(request.getClient());
        project.setStatus(request.getStatus());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setDescription(request.getDescription());

        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new RuntimeException("프로젝트를 찾을 수 없습니다: " + id);
        }
        projectRepository.deleteById(id);
    }

    public List<ProjectItem> getProjectItems(Long projectId) {
        return projectItemRepository.findByProjectId(projectId);
    }

    @Transactional
    public ProjectItem addProjectItem(Long projectId, ProjectItemRequest request) {
        Project project = getProjectById(projectId);
        Inventory inventory = inventoryService.getInventoryById(request.getInventoryId());

        ProjectItem projectItem = new ProjectItem();
        projectItem.setProject(project);
        projectItem.setInventory(inventory);
        projectItem.setRequiredQuantity(request.getRequiredQuantity());
        projectItem.setAllocatedQuantity(request.getAllocatedQuantity());
        projectItem.setNotes(request.getNotes());

        ProjectItem saved = projectItemRepository.save(projectItem);

        // 재고 가용성 체크 및 알림
        checkAvailabilityAndNotify(projectId);

        return saved;
    }

    @Transactional
    public void deleteProjectItem(Long itemId) {
        projectItemRepository.deleteById(itemId);
    }

    public ProjectAvailabilityResponse checkProjectAvailability(Long projectId) {
        Project project = getProjectById(projectId);
        List<ProjectItem> projectItems = projectItemRepository.findByProjectId(projectId);

        List<ProjectAvailabilityResponse.ItemAvailability> itemAvailabilities = new ArrayList<>();
        boolean allAvailable = true;

        for (ProjectItem item : projectItems) {
            Inventory inventory = item.getInventory();
            int requiredQty = item.getRequiredQuantity();
            int availableStock = inventory.getCurrentStock();
            int shortfall = Math.max(0, requiredQty - availableStock);
            boolean isAvailable = availableStock >= requiredQty;

            if (!isAvailable) {
                allAvailable = false;
            }

            ProjectAvailabilityResponse.ItemAvailability itemAvailability =
                    new ProjectAvailabilityResponse.ItemAvailability(
                            inventory.getId(),
                            inventory.getItemCode(),
                            inventory.getItemName(),
                            requiredQty,
                            availableStock,
                            shortfall,
                            isAvailable
                    );

            itemAvailabilities.add(itemAvailability);
        }

        return new ProjectAvailabilityResponse(
                project.getId(),
                project.getProjectName(),
                allAvailable,
                itemAvailabilities
        );
    }

    private void checkAvailabilityAndNotify(Long projectId) {
        ProjectAvailabilityResponse availability = checkProjectAvailability(projectId);
        if (!availability.isAllItemsAvailable()) {
            notificationService.createProjectShortageNotification(
                    projectId,
                    availability.getProjectName(),
                    availability.getItems()
            );
        }
    }
}
