package com.inventory.controller;

import com.inventory.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send-report")
    public ResponseEntity<Map<String, String>> sendReport(@RequestBody EmailRequest request) {
        try {
            switch (request.getReportType()) {
                case "inventory" -> emailService.sendInventoryReport(request.getTo());
                case "project" -> emailService.sendProjectReport(request.getTo());
                case "transaction" -> emailService.sendTransactionReport(request.getTo());
                default -> {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "유효하지 않은 보고서 유형입니다."));
                }
            }
            return ResponseEntity.ok(Map.of("message", "메일이 발송되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "메일 발송 실패: " + e.getMessage()));
        }
    }

    @Data
    public static class EmailRequest {
        private String to;
        private String reportType;
    }
}
