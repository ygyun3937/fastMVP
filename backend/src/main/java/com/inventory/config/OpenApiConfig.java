package com.inventory.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("재고 및 프로젝트 관리 시스템 API")
                        .version("1.0.0")
                        .description("""
                                프로젝트 수주 시 필요한 구성품의 재고 상황을 실시간으로 체크하고 관리하는 시스템입니다.

                                ## 주요 기능
                                - 재고 관리 (CRUD, 검색, 최소재고 알림)
                                - 프로젝트 관리 및 필요 구성품 등록
                                - 프로젝트 재고 가용성 체크 (핵심 기능)
                                - 입출고 이력 추적
                                - 알림 시스템
                                - 통계 및 보고서
                                """)
                        .contact(new Contact()
                                .name("Inventory Management System")
                                .email("support@inventory.com")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080/api")
                                .description("로컬 개발 서버")
                ));
    }
}
