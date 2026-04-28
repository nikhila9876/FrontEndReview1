package com.fsad.portal.dto;

import java.util.List;

public class StudentDashboardDto {

    private UserDto user;
    private ProfileDto profile;
    private long totalProjects;
    private long completedProjects;
    private long totalMilestones;
    private long completedMilestones;
    private long totalFeedbacks;
    private List<ProjectDto> recentProjects;

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public ProfileDto getProfile() {
        return profile;
    }

    public void setProfile(ProfileDto profile) {
        this.profile = profile;
    }

    public long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(long totalProjects) {
        this.totalProjects = totalProjects;
    }

    public long getCompletedProjects() {
        return completedProjects;
    }

    public void setCompletedProjects(long completedProjects) {
        this.completedProjects = completedProjects;
    }

    public long getTotalMilestones() {
        return totalMilestones;
    }

    public void setTotalMilestones(long totalMilestones) {
        this.totalMilestones = totalMilestones;
    }

    public long getCompletedMilestones() {
        return completedMilestones;
    }

    public void setCompletedMilestones(long completedMilestones) {
        this.completedMilestones = completedMilestones;
    }

    public long getTotalFeedbacks() {
        return totalFeedbacks;
    }

    public void setTotalFeedbacks(long totalFeedbacks) {
        this.totalFeedbacks = totalFeedbacks;
    }

    public List<ProjectDto> getRecentProjects() {
        return recentProjects;
    }

    public void setRecentProjects(List<ProjectDto> recentProjects) {
        this.recentProjects = recentProjects;
    }
}
