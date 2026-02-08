package com.inventory.repository;

import com.inventory.model.ProjectItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectItemRepository extends JpaRepository<ProjectItem, Long> {

    List<ProjectItem> findByProjectId(Long projectId);

    List<ProjectItem> findByInventoryId(Long inventoryId);

    @Query("SELECT pi FROM ProjectItem pi WHERE pi.project.id = ?1 AND pi.requiredQuantity > pi.allocatedQuantity")
    List<ProjectItem> findUnallocatedItemsByProjectId(Long projectId);

    void deleteByProjectId(Long projectId);
}
