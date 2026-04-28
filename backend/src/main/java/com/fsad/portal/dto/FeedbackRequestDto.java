package com.fsad.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FeedbackRequestDto {

    @NotBlank(message = "Feedback message is required")
    @Size(max = 2000, message = "Feedback message cannot exceed 2000 characters")
    private String message;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
