package com.inventory.service;

import com.inventory.model.Inventory;
import com.inventory.model.InventoryTransaction;
import com.inventory.model.Project;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final InventoryService inventoryService;
    private final ProjectService projectService;
    private final TransactionService transactionService;

    public void sendInventoryReport(String to) throws MessagingException {
        List<Inventory> allInventory = inventoryService.getAllInventory();
        List<Inventory> lowStock = inventoryService.getLowStockItems();
        int totalStock = allInventory.stream().mapToInt(Inventory::getCurrentStock).sum();

        StringBuilder html = new StringBuilder();
        html.append("<html><body style='font-family:sans-serif;'>");
        html.append("<h2 style='color:#1e40af;'>재고 현황 보고서</h2>");
        html.append("<div style='display:flex;gap:20px;margin-bottom:20px;'>");
        html.append(card("총 품목 수", String.valueOf(allInventory.size()), "#1e40af"));
        html.append(card("재고 부족", String.valueOf(lowStock.size()), "#ef4444"));
        html.append(card("총 재고 수량", String.valueOf(totalStock), "#10b981"));
        html.append("</div>");

        if (!lowStock.isEmpty()) {
            html.append("<h3 style='color:#ef4444;'>재고 부족 품목</h3>");
            html.append("<table style='border-collapse:collapse;width:100%;'>");
            html.append("<tr style='background:#f3f4f6;'><th style='border:1px solid #e5e7eb;padding:8px;'>품목코드</th><th style='border:1px solid #e5e7eb;padding:8px;'>품목명</th><th style='border:1px solid #e5e7eb;padding:8px;'>현재재고</th><th style='border:1px solid #e5e7eb;padding:8px;'>최소재고</th></tr>");
            for (Inventory item : lowStock) {
                html.append("<tr><td style='border:1px solid #e5e7eb;padding:8px;'>").append(item.getItemCode())
                    .append("</td><td style='border:1px solid #e5e7eb;padding:8px;'>").append(item.getItemName())
                    .append("</td><td style='border:1px solid #e5e7eb;padding:8px;color:#ef4444;font-weight:bold;'>").append(item.getCurrentStock())
                    .append("</td><td style='border:1px solid #e5e7eb;padding:8px;'>").append(item.getMinStock())
                    .append("</td></tr>");
            }
            html.append("</table>");
        }

        html.append("<h3>전체 재고 목록</h3>");
        html.append("<table style='border-collapse:collapse;width:100%;'>");
        html.append("<tr style='background:#f3f4f6;'><th style='border:1px solid #e5e7eb;padding:8px;'>품목코드</th><th style='border:1px solid #e5e7eb;padding:8px;'>품목명</th><th style='border:1px solid #e5e7eb;padding:8px;'>카테고리</th><th style='border:1px solid #e5e7eb;padding:8px;'>재고</th><th style='border:1px solid #e5e7eb;padding:8px;'>단위</th><th style='border:1px solid #e5e7eb;padding:8px;'>상태</th></tr>");
        for (Inventory item : allInventory) {
            boolean isLow = item.getCurrentStock() < item.getMinStock();
            html.append("<tr><td style='border:1px solid #e5e7eb;padding:8px;'>").append(item.getItemCode())
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;'>").append(item.getItemName())
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;'>").append(item.getCategory() != null ? item.getCategory() : "-")
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;color:").append(isLow ? "#ef4444" : "#10b981").append(";font-weight:bold;'>").append(item.getCurrentStock())
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;'>").append(item.getUnit())
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;'>").append(isLow ? "부족" : "정상")
                .append("</td></tr>");
        }
        html.append("</table></body></html>");

        sendHtmlEmail(to, "[재고관리] 재고 현황 보고서", html.toString());
    }

    public void sendProjectReport(String to) throws MessagingException {
        List<Project> allProjects = projectService.getAllProjects();

        StringBuilder html = new StringBuilder();
        html.append("<html><body style='font-family:sans-serif;'>");
        html.append("<h2 style='color:#1e40af;'>프로젝트 요약 보고서</h2>");
        html.append(card("전체 프로젝트", String.valueOf(allProjects.size()), "#1e40af"));

        html.append("<table style='border-collapse:collapse;width:100%;margin-top:20px;'>");
        html.append("<tr style='background:#f3f4f6;'><th style='border:1px solid #e5e7eb;padding:8px;'>코드</th><th style='border:1px solid #e5e7eb;padding:8px;'>프로젝트명</th><th style='border:1px solid #e5e7eb;padding:8px;'>고객사</th><th style='border:1px solid #e5e7eb;padding:8px;'>상태</th><th style='border:1px solid #e5e7eb;padding:8px;'>시작일</th><th style='border:1px solid #e5e7eb;padding:8px;'>종료일</th></tr>");
        for (Project p : allProjects) {
            html.append("<tr><td style='border:1px solid #e5e7eb;padding:8px;'>").append(p.getProjectCode())
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;'>").append(p.getProjectName())
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;'>").append(p.getClient() != null ? p.getClient() : "-")
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;'>").append(statusLabel(p.getStatus().name()))
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;'>").append(p.getStartDate() != null ? p.getStartDate() : "-")
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;'>").append(p.getEndDate() != null ? p.getEndDate() : "-")
                .append("</td></tr>");
        }
        html.append("</table></body></html>");

        sendHtmlEmail(to, "[재고관리] 프로젝트 요약 보고서", html.toString());
    }

    public void sendTransactionReport(String to) throws MessagingException {
        List<InventoryTransaction> all = transactionService.getAllTransactions();
        long inCount = all.stream().filter(t -> t.getTransactionType() == InventoryTransaction.TransactionType.IN).count();
        long outCount = all.stream().filter(t -> t.getTransactionType() == InventoryTransaction.TransactionType.OUT).count();

        StringBuilder html = new StringBuilder();
        html.append("<html><body style='font-family:sans-serif;'>");
        html.append("<h2 style='color:#1e40af;'>입출고 이력 보고서</h2>");
        html.append("<div style='display:flex;gap:20px;margin-bottom:20px;'>");
        html.append(card("총 거래", String.valueOf(all.size()), "#1e40af"));
        html.append(card("입고", String.valueOf(inCount), "#10b981"));
        html.append(card("출고", String.valueOf(outCount), "#ef4444"));
        html.append("</div>");

        html.append("<table style='border-collapse:collapse;width:100%;'>");
        html.append("<tr style='background:#f3f4f6;'><th style='border:1px solid #e5e7eb;padding:8px;'>일시</th><th style='border:1px solid #e5e7eb;padding:8px;'>유형</th><th style='border:1px solid #e5e7eb;padding:8px;'>품목</th><th style='border:1px solid #e5e7eb;padding:8px;'>수량</th><th style='border:1px solid #e5e7eb;padding:8px;'>프로젝트</th><th style='border:1px solid #e5e7eb;padding:8px;'>처리자</th></tr>");
        for (InventoryTransaction tx : all) {
            boolean isIn = tx.getTransactionType() == InventoryTransaction.TransactionType.IN;
            html.append("<tr><td style='border:1px solid #e5e7eb;padding:8px;'>").append(tx.getTransactionDate() != null ? tx.getTransactionDate().toString() : "-")
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;color:").append(isIn ? "#10b981" : "#ef4444").append(";'>").append(isIn ? "입고" : "출고")
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;'>").append(tx.getInventory() != null ? tx.getInventory().getItemName() : "-")
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;font-weight:bold;color:").append(isIn ? "#10b981" : "#ef4444").append(";'>").append(isIn ? "+" : "-").append(tx.getQuantity())
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;'>").append(tx.getProject() != null ? tx.getProject().getProjectName() : "-")
                .append("</td><td style='border:1px solid #e5e7eb;padding:8px;'>").append(tx.getCreatedBy() != null ? tx.getCreatedBy() : "-")
                .append("</td></tr>");
        }
        html.append("</table></body></html>");

        sendHtmlEmail(to, "[재고관리] 입출고 이력 보고서", html.toString());
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    private String card(String label, String value, String color) {
        return "<div style='background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;min-width:120px;'>" +
               "<div style='font-size:24px;font-weight:bold;color:" + color + ";'>" + value + "</div>" +
               "<div style='color:#6b7280;margin-top:4px;'>" + label + "</div></div>";
    }

    private String statusLabel(String status) {
        return switch (status) {
            case "PENDING" -> "대기";
            case "IN_PROGRESS" -> "진행중";
            case "COMPLETED" -> "완료";
            case "CANCELLED" -> "취소";
            default -> status;
        };
    }
}
