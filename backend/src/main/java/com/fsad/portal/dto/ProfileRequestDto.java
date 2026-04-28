package com.fsad.portal.dto;

import jakarta.validation.constraints.Size;

public class ProfileRequestDto {

    @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
    private String bio;

    @Size(max = 20, message = "Phone cannot exceed 20 characters")
    private String phone;

    @Size(max = 100, message = "Branch cannot exceed 100 characters")
    private String branch;

    @Size(max = 150, message = "College cannot exceed 150 characters")
    private String college;

    @Size(max = 250, message = "GitHub URL cannot exceed 250 characters")
    private String githubUrl;

    @Size(max = 250, message = "LinkedIn URL cannot exceed 250 characters")
    private String linkedinUrl;

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getCollege() {
        return college;
    }

    public void setCollege(String college) {
        this.college = college;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }
}
