package com.inventory.service;

import com.inventory.dto.ProjectAvailabilityResponse;
import com.inventory.model.Inventory;
import com.inventory.model.Notification;
import com.inventory.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllOrderByCreatedAtDesc();
    }

    public List<Notification> getUnreadNotifications() {
        return notificationRepository.findByIsRead(false);
    }

    public Long getUnreadCount() {
        return notificationRepository.countUnreadNotifications();
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("알림을 찾을 수 없습니다: " + id));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void createLowStockNotification(Inventory inventory) {
        // 중복 알림 방지: 같은 재고에 대한 읽지 않은 알림이 이미 있는지 확인
        List<Notification> existingNotifications = notificationRepository
                .findByType("LOW_STOCK")
                .stream()
                .filter(n -> !n.getIsRead() && n.getRelatedId().equals(inventory.getId()))
                .toList();

        if (!existingNotifications.isEmpty()) {
            return; // 이미 알림이 있으면 생성하지 않음
        }

        Notification notification = new Notification();
        notification.setType("LOW_STOCK");
        notification.setTitle("재고 부족 알림");
        notification.setMessage(String.format("[%s] %s의 재고가 최소 수량(%d) 미만입니다. 현재 재고: %d%s",
                inventory.getItemCode(),
                inventory.getItemName(),
                inventory.getMinStock(),
                inventory.getCurrentStock(),
                inventory.getUnit()));
        notification.setRelatedId(inventory.getId());
        notification.setIsRead(false);

        notificationRepository.save(notification);
    }

    @Transactional
    public void createProjectShortageNotification(Long projectId, String projectName,
                                                  List<ProjectAvailabilityResponse.ItemAvailability> items) {
        List<ProjectAvailabilityResponse.ItemAvailability> unavailableItems = items.stream()
                .filter(item -> !item.isAvailable())
                .collect(Collectors.toList());

        if (unavailableItems.isEmpty()) {
            return;
        }

        StringBuilder message = new StringBuilder();
        message.append(String.format("프로젝트 [%s]의 구성품 재고가 부족합니다:\n", projectName));

        for (ProjectAvailabilityResponse.ItemAvailability item : unavailableItems) {
            message.append(String.format("- [%s] %s: 필요 %d, 현재 %d (부족 %d)\n",
                    item.getItemCode(),
                    item.getItemName(),
                    item.getRequiredQuantity(),
                    item.getAvailableStock(),
                    item.getShortfall()));
        }

        Notification notification = new Notification();
        notification.setType("PROJECT_SHORTAGE");
        notification.setTitle("프로젝트 구성품 부족 알림");
        notification.setMessage(message.toString());
        notification.setRelatedId(projectId);
        notification.setIsRead(false);

        notificationRepository.save(notification);
    }

    @Transactional
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}
