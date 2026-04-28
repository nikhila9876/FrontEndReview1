package com.fsad.portal.dto;

public class SuccessResponseDto<T> {

    private boolean success;
    private T data;

    public SuccessResponseDto() {
    }

    public SuccessResponseDto(boolean success, T data) {
        this.success = success;
        this.data = data;
    }

    public static <T> SuccessResponseDto<T> ok(T data) {
        return new SuccessResponseDto<>(true, data);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
