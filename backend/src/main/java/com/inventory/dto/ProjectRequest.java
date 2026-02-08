package com.inventory.dto;

import com.inventory.model.Project;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProjectRequest {

    @NotBlank(message = "프로젝트 코드는 필수입니다")
    private String projectCode;

    @NotBlank(message = "프로젝트명은 필수입니다")
    private String projectName;

    private String client;

    @NotNull(message = "상태는 필수입니다")
    private Project.ProjectStatus status;

    private LocalDate startDate;

    private LocalDate endDate;

    private String description;
}
