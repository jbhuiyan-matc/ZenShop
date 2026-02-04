# Lab Deployment Guide: matcsecdesignc.com

This guide details the network, DNS, and firewall configurations required to deploy the ZenShop e-commerce site on the `matcsecdesignc.com` domain within the specified lab environment.

## 1. Network Configuration Summary

*   **Domain**: `matcsecdesignc.com`
*   **Outside Subnet**: `172.31.26.176/29`
*   **Gateway**: `172.31.26.177`
*   **Public Service IPs**:
    *   **Web/Mail (Palo Alto Outside Interface)**: `172.31.26.178`
    *   **Public DNS 1**: `172.31.26.181`
    *   **Public DNS 2**: `172.31.26.182`
*   **Internal Servers (DMZ)**:
    *   **DMZ Web Server**: `[REPLACE_WITH_DMZ_WEB_IP]` (e.g., 10.0.1.10)
    *   **DMZ DNS Server**: `[REPLACE_WITH_DMZ_DNS_IP]` (e.g., 10.0.1.11)

---

## 2. DMZ DNS Server Configuration (Authoritative Zone)

Configure your DMZ DNS server (assuming BIND9) to be authoritative for `matcsecdesignc.com`.

### `/etc/bind/named.conf.local`
Add the zone definition:

```bind
zone "matcsecdesignc.com" {
    type master;
    file "/etc/bind/zones/db.matcsecdesignc.com";
    allow-transfer { none; }; # Security: Limit zone transfers
};
```

### Zone File: `/etc/bind/zones/db.matcsecdesignc.com`
Create the zone file. **Crucial**: The A records for public services must point to the **Public IPs**, not the internal DMZ IPs, so external users resolve the correct address.

```bind
$TTL    604800
@       IN      SOA     ns1.matcsecdesignc.com. admin.matcsecdesignc.com. (
                              2         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
; Name Servers
@       IN      NS      ns1.matcsecdesignc.com.
@       IN      NS      ns2.matcsecdesignc.com.

; A Records for Name Servers (Glue)
ns1     IN      A       172.31.26.181
ns2     IN      A       172.31.26.182

; A Records for Web Services (Pointing to PA Outside IP)
@       IN      A       172.31.26.178
www     IN      A       172.31.26.178

; Mail Exchange Record
@       IN      MX      10 mail.matcsecdesignc.com.
mail    IN      A       172.31.26.178  ; Assuming mail is also NAT'd via the main IP
```

---

## 3. Palo Alto Firewall Configuration

You need to configure Destination NAT (DNAT) to forward incoming traffic from the public IPs to your private DMZ IPs, and Security Policies to allow the traffic.

### A. NAT Policies

Create the following NAT rules in **Policies > NAT**.

#### Rule 1: Web Server DNAT
*   **Name**: `NAT_Inbound_Web`
*   **Original Packet**:
    *   **Source Zone**: `Outside` (or Internet)
    *   **Destination Zone**: `Outside` (This is critical: traffic hits the outside interface)
    *   **Destination Interface**: `ethernet1/1` (Your Outside Interface)
    *   **Service**: `service-http`, `service-https` (TCP 80, 443)
    *   **Source Address**: `Any`
    *   **Destination Address**: `172.31.26.178`
*   **Translated Packet** (Destination Translation):
    *   **Translation Type**: `Dynamic IP` (with static translation usually implied for servers, or Static IP) -> **Static IP** is preferred for servers.
    *   **Translated Address**: `[DMZ_WEB_IP]`
    *   **Translated Port**: (None, leave original)

#### Rule 2: DNS Server DNAT (DNS1)
*   **Name**: `NAT_Inbound_DNS1`
*   **Original Packet**:
    *   **Destination Address**: `172.31.26.181`
    *   **Service**: `service-dns` (UDP 53, TCP 53)
*   **Translated Packet**:
    *   **Translated Address**: `[DMZ_DNS_IP]`

#### Rule 3: DNS Server DNAT (DNS2)
*   **Name**: `NAT_Inbound_DNS2`
*   **Original Packet**:
    *   **Destination Address**: `172.31.26.182`
    *   **Service**: `service-dns`
*   **Translated Packet**:
    *   **Translated Address**: `[DMZ_DNS_IP]` (Or secondary DNS IP if you have one)

### B. Security Policies

Create rules in **Policies > Security** to allow the traffic. *Note: Palo Alto security rules evaluate traffic AFTER the destination IP has been translated (Pre-NAT IP for Zone, Post-NAT IP for Address).*

#### Rule 1: Allow Web Traffic
*   **Name**: `Allow_Outside_to_DMZ_Web`
*   **Source Zone**: `Outside`
*   **Source Address**: `Any`
*   **Destination Zone**: `DMZ`
*   **Destination Address**: `172.31.26.178` (Wait: On PA, use the **Public IP** if using Pre-NAT IP matching, or **DMZ IP** if Post-NAT. Standard PA behavior is to match Destination Zone determined by route lookup of the *Post-NAT* IP, but destination address usually matches the *Pre-NAT* IP in the rule. **Verify your specific PA version behavior**. Usually: Dest Zone = DMZ, Dest IP = Public IP 172.31.26.178).
*   **Application**: `web-browsing`, `ssl`
*   **Service**: `application-default`
*   **Action**: `Allow`

#### Rule 2: Allow DNS Traffic
*   **Name**: `Allow_Outside_to_DMZ_DNS`
*   **Source Zone**: `Outside`
*   **Destination Zone**: `DMZ`
*   **Destination Address**: `172.31.26.181`, `172.31.26.182`
*   **Application**: `dns`
*   **Service**: `application-default` (or `service-dns`)
*   **Action**: `Allow`

---

## 4. Domain Registrar Configuration

Log in to your domain registrar's control panel (e.g., Namecheap, GoDaddy, or your Lab Registrar).

1.  **Child Name Servers (Glue Records)**:
    *   Look for "Advanced DNS", "Host Names", or "Glue Records".
    *   Create **ns1.matcsecdesignc.com** -> IP: `172.31.26.181`
    *   Create **ns2.matcsecdesignc.com** -> IP: `172.31.26.182`

2.  **Nameservers**:
    *   Set the authoritative nameservers for the domain to:
        *   `ns1.matcsecdesignc.com`
        *   `ns2.matcsecdesignc.com`

---

## 5. Validation Steps

Run these commands from an **external** machine (outside your lab network) to verify.

### 1. Verify DNS
Check if the internet can resolve your nameservers and domain.

```bash
# Trace the delegation path (verify glue records)
dig +trace matcsecdesignc.com

# Verify A record resolution
dig @8.8.8.8 matcsecdesignc.com
# Expected Output: ANSWER SECTION: matcsecdesignc.com. IN A 172.31.26.178

# Verify direct query to your NS
dig @172.31.26.181 matcsecdesignc.com
```

### 2. Verify Web Connectivity
Check HTTP and HTTPS connectivity.

```bash
# Test HTTP (should redirect to HTTPS if configured)
curl -I http://matcsecdesignc.com
# Expected: HTTP/1.1 301 Moved Permanently

# Test HTTPS
curl -I -k https://matcsecdesignc.com
# Expected: HTTP/2 200 OK
# Note: -k is used because the certificate might be self-signed or not match the lab root CA yet.
```
