# ZenShop HTTPS Setup — matcsecdesignc.com

## Overview

HTTPS for `matcsecdesignc.com` uses a **local Certificate Authority (ZenShop Lab Root CA)** because the domain only resolves on internal/private DNS (Let's Encrypt requires public DNS).

### Certificate Details

| Field | Value |
|-------|-------|
| **Server CN** | `matcsecdesignc.com` |
| **Issuer** | `ZenShop Lab Root CA` |
| **Valid Until** | June 30, 2028 |
| **SANs** | `matcsecdesignc.com`, `www.matcsecdesignc.com`, `auth.matcsecdesignc.com`, `store.matcsecdesignc.com`, `admin.matcsecdesignc.com` |

### Files on Server

| File | Path |
|------|------|
| Fullchain cert (Nginx) | `/etc/ssl/certs/zenshop-fullchain.crt` |
| Private key (Nginx) | `/etc/ssl/private/zenshop.key` |
| CA cert (trust store) | `/usr/local/share/ca-certificates/zenshop-lab-ca.crt` |
| CA cert (repo copy) | `zenshop-lab-ca.crt`, `zenshop-lab-ca.pem`, `zenshop-lab-ca.der` |

---

## What Was Changed

1. **Replaced self-signed cert** with a CA-signed cert (signed by ZenShop Lab Root CA)
2. **Updated Nginx configs** (`zenshop.conf` + `authentik`) to use fullchain cert
3. **Added `/ca/` endpoint** — clients can download the CA cert directly from the site
4. **Server trust store** already includes the CA via `update-ca-certificates`

---

## Client Trust Setup (Required Once Per Machine)

Browsers will show warnings until the **ZenShop Lab Root CA** is trusted on each client.

### Download the CA Certificate

From any machine on the network:
```
https://matcsecdesignc.com/ca/zenshop-lab-ca.crt   (PEM format)
https://matcsecdesignc.com/ca/zenshop-lab-ca.der   (DER format — for Windows)
```

Or copy from the server:
```bash
scp webadmin@192.168.2.51:/home/webadmin/ZenShop/zenshop-lab-ca.crt .
```

---

### Windows

1. Download `zenshop-lab-ca.der` (or `.crt`)
2. Double-click the file → **Install Certificate...**
3. Select **Local Machine** → Next
4. Choose **Place all certificates in the following store** → Browse → **Trusted Root Certification Authorities** → OK → Next → Finish
5. Restart the browser

**PowerShell (admin):**
```powershell
Import-Certificate -FilePath .\zenshop-lab-ca.crt -CertStoreLocation Cert:\LocalMachine\Root
```

---

### macOS

1. Download `zenshop-lab-ca.crt`
2. Double-click → Keychain Access opens → add to **System** keychain
3. Find "ZenShop Lab Root CA" in Keychain Access → double-click → expand **Trust** → set **When using this certificate** to **Always Trust**
4. Close and enter password to confirm

**Terminal:**
```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain zenshop-lab-ca.crt
```

---

### Linux (Ubuntu/Debian)

```bash
sudo cp zenshop-lab-ca.crt /usr/local/share/ca-certificates/zenshop-lab-ca.crt
sudo update-ca-certificates
```
This makes `curl`, `wget`, and Chromium trust the CA. Firefox uses its own store (see below).

---

### Firefox (All Platforms)

Firefox uses its own certificate store:

1. Open **Settings** → **Privacy & Security** → **Certificates** → **View Certificates...**
2. Go to the **Authorities** tab → **Import...**
3. Select `zenshop-lab-ca.crt`
4. Check **Trust this CA to identify websites** → OK

**Or via `policies.json`** (enterprise deployment):
```json
{
  "policies": {
    "Certificates": {
      "ImportEnterpriseRoots": true,
      "Install": ["/usr/local/share/ca-certificates/zenshop-lab-ca.crt"]
    }
  }
}
```
Place in:
- Linux: `/etc/firefox/policies/policies.json`
- Windows: `C:\Program Files\Mozilla Firefox\distribution\policies.json`
- macOS: `/Applications/Firefox.app/Contents/Resources/distribution/policies.json`

---

### Chrome/Edge (All Platforms)

Chrome and Edge use the **OS trust store** on all platforms, so the Windows/macOS/Linux instructions above cover them automatically.

---

## Verification

From any trusted client:
```bash
# Should show "Verify return code: 0 (ok)"
openssl s_client -connect matcsecdesignc.com:443 -servername matcsecdesignc.com < /dev/null 2>/dev/null | grep "Verify return"

# Should return HTTP 200 with no SSL errors
curl -v https://matcsecdesignc.com/ 2>&1 | grep -E "SSL|HTTP/"
```

Open `https://matcsecdesignc.com` in the browser — the padlock should show **Connection is secure** with no warnings.

---

## Nginx Configuration

Both site configs reference the same cert:
- `/etc/nginx/sites-available/zenshop.conf` → `ssl_certificate /etc/ssl/certs/zenshop-fullchain.crt`
- `/etc/nginx/sites-available/authentik` → `ssl_certificate /etc/ssl/certs/zenshop-fullchain.crt`

To test after any changes:
```bash
sudo nginx -t && sudo systemctl reload nginx
```
