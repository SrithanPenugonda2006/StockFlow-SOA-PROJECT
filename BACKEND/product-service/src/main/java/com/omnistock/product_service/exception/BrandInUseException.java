package com.omnistock.product_service.exception;

public class BrandInUseException extends RuntimeException {
    public BrandInUseException(String message) {
        super(message);
    }
}
