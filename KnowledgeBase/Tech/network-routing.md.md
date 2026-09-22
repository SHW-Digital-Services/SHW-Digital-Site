---
title: Troubleshooting Local Network Routing 
date: 12-Aug-2026 
published: true 
category: 
- Tech 
isCategoryHome: false
---
When the internet goes down in the office, or staff suddenly cannot reach the shared server, diagnosing the problem logically saves hours of frustration.

### The Step-by-Step Diagnostic

Before submitting an urgent support ticket, you can perform basic triage to pinpoint the failure.

1. **Is it just one device?** If only one laptop cannot connect, the issue is likely local (a bad Wi-Fi driver, a damaged ethernet cable, or the computer needs a reboot). If the whole office is down, proceed to step 2.
    
2. **Check the Switch:** Locate the main network switch in your communications cabinet. Are the lights blinking? If it is completely dark, the switch may have lost power or failed.
    
3. **Ping the Router:** Can your computers communicate with the building's main router? Open a command prompt and try to "ping" the router's IP address (usually 192.168.1.1 or similar). If you get a reply, your internal network is fine.
    
4. **Check the Modem/ISP:** If you can reach the router but not the internet, the issue is likely with your Internet Service Provider (ISP) or the physical line coming into the building. Check the router for red warning lights.

[Back to Tech Category](about.md.md)