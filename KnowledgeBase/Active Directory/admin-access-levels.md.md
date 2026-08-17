---
title: Administrator Roles and Access Levels 
date: 11-Aug-2026 
published: true 
category: 
- Active Directory 
isCategoryHome: false
---

Not all users are created equal within a dependable Microsoft environment. Managing access levels strictly is key to maintaining a secure system.

### The Principle of Least Privilege

This core security concept dictates that a user should only be given the absolute minimum level of access required to perform their daily job functions—and nothing more.

### Standard Users vs. Administrators

- **Standard Users:** Can run approved applications, save files to their designated folders, and change their own desktop settings. They _cannot_ install unapproved software, change system-wide security settings, or access other users' private files.
    
- **Administrators:** Have full control over the system. They can create users, change global security policies, and access all data.
    

### Why Avoid Daily Admin Use?

A critical security best practice is separating administrative accounts from everyday user accounts. Even IT professionals should not use an Administrator account for their daily tasks (like checking email or browsing the web). If an Administrator clicks a malicious link in an email, the virus immediately gains full administrative control of the entire network. Admin accounts should only be logged into when explicitly performing administrative tasks, ideally from a Secure Admin Workstation (SAW).

[about.md](about.md.md)