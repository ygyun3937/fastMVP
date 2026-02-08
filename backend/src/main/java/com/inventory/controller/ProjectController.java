package com.inventory.controller;

import com.inventory.dto.ProjectAvailabilityResponse;
import com.inventory.dto.ProjectItemRequest;
import com.inventory.dto.ProjectRequest;
import com.inventory.model.Project;
import com.inventory.model.ProjectItem;
import com.inventory.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @GetMapping("/code/{projectCode}")
    public ResponseEntity<Project> getProjectByCode(@PathVariable String projectCode) {
        return ResponseEntity.ok(projectService.getProjectByCode(projectCode));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Project>> getProjectsByStatus(@PathVariable Project.ProjectStatus status) {
        return ResponseEntity.ok(projectService.getProjectsByStatus(status));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Project>> searchProjects(@RequestParam String keyword) {
        return ResponseEntity.ok(projectService.searchProjects(keyword));
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.createProject(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<ProjectItem>> getProjectItems(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectItems(id));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<ProjectItem> addProjectItem(
            @PathVariable Long id,
            @Valid @RequestBody ProjectItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.addProjectItem(id, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteProjectItem(@PathVariable Long itemId) {
        projectService.deleteProjectItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ProjectAvailabilityResponse> checkProjectAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.checkProjectAvailability(id));
    }
}
