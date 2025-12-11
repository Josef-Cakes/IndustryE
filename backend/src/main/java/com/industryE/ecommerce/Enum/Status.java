package com.industryE.ecommerce.Enum;

public enum Status {
    PENDING,        // Order created but not yet paid or processed
    PROCESSING,     // Payment verified, being prepared
    DELIVERED,      // Delivered to customer, can be marked as received
    COMPLETED,      // Customer marked as received
    CANCELLED       // Order cancelled
}
