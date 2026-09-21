package com.omnistock.auth_service.dto;

public class AdminOverviewStatsDTO {
    private long totalUsers;
    private long totalAdminUsers;
    private long totalManagerUsers;
    private long totalCustomerUsers;
    private long totalOrganizations;
    private long totalAuditLogs;

    public AdminOverviewStatsDTO() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalAdminUsers() { return totalAdminUsers; }
    public void setTotalAdminUsers(long totalAdminUsers) { this.totalAdminUsers = totalAdminUsers; }

    public long getTotalManagerUsers() { return totalManagerUsers; }
    public void setTotalManagerUsers(long totalManagerUsers) { this.totalManagerUsers = totalManagerUsers; }

    public long getTotalCustomerUsers() { return totalCustomerUsers; }
    public void setTotalCustomerUsers(long totalCustomerUsers) { this.totalCustomerUsers = totalCustomerUsers; }

    public long getTotalOrganizations() { return totalOrganizations; }
    public void setTotalOrganizations(long totalOrganizations) { this.totalOrganizations = totalOrganizations; }

    public long getTotalAuditLogs() { return totalAuditLogs; }
    public void setTotalAuditLogs(long totalAuditLogs) { this.totalAuditLogs = totalAuditLogs; }
}
