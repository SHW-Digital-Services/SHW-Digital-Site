---
title: Password Policy configurations
date: 11-Aug-2026
published: true
catagory: Active Directory
isCatagoryHome: false
---
A strong password policy is the first line of defense against unauthorized access to your business environment.

### Standard Password Requirements

Active Directory allows you to enforce specific rules for all user passwords. We recommend configuring the following minimums:

- **Complexity:** Passwords must contain a mix of uppercase letters, lowercase letters, numbers, and special characters. We highly recommend using _passphrases_ (e.g., "coffee-planet-window-4") as they are more secure and easier to remember.
    
- **Length:** A minimum length of at least 14 characters.
    
- **History:** Preventing users from reusing their last 5 to 10 passwords.
    
- **Expiration:** While modern guidance is shifting away from frequent forced password changes, setting an expiration for highly privileged accounts is still recommended.
    

### Multi-Factor Authentication (MFA)

Passwords alone are no longer enough. We highly recommend pairing your Active Directory password policy with Multi-Factor Authentication (MFA). This requires the user to approve a prompt on their mobile phone after entering their password, drastically reducing the risk of a compromised account.