package com.inventory.repository;

import com.inventory.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findByProjectCode(String projectCode);

    List<Project> findByStatus(Project.ProjectStatus status);

    List<Project> findByClient(String client);

    @Query("SELECT p FROM Project p WHERE p.projectName LIKE %?1% OR p.projectCode LIKE %?1% OR p.client LIKE %?1%")
    List<Project> searchByKeyword(String keyword);

    boolean existsByProjectCode(String projectCode);
}
