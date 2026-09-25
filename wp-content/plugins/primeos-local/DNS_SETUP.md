# 🌐 DNS Configuration Guide

**Domain**: primeos.primeodontologia.com.br  
**VPS IP**: 82.29.56.236  
**Provider**: Hostinger  

---

## ✅ Quick Setup

### 1. Hostinger Control Panel

```
1. Log in to Hostinger (www.hostinger.com/user)
2. Dashboard → Domains → primeodontologia.com.br
3. Click "Manage" → DNS Zone Records
```

### 2. DNS Records to Configure

Add these records:

#### A Record (Main)
```
Name:    primeos
Type:    A
Value:   82.29.56.236
TTL:     3600
```

#### A Record (Root - Optional)
```
Name:    @
Type:    A
Value:   82.29.56.236
TTL:     3600
```

#### CNAME Record (www - Optional)
```
Name:    www
Type:    CNAME
Value:   primeos.primeodontologia.com.br
TTL:     3600
```

#### MX Records (For Email - If Needed)
```
Priority: 10
Name:     @
Type:     MX
Value:    mail.primeodontologia.com.br
TTL:      3600
```

---

## 🔍 Verification

### Test DNS Resolution

```bash
# Check A record
dig primeos.primeodontologia.com.br

# Should return:
# primeos.primeodontologia.com.br. 3600 IN A 82.29.56.236

# Or use nslookup
nslookup primeos.primeodontologia.com.br

# Or use host command
host primeos.primeodontologia.com.br
```

### Test Connectivity

```bash
# Ping the domain
ping primeos.primeodontologia.com.br

# Should return: 82.29.56.236

# Test HTTP connection
curl -I http://primeos.primeodontologia.com.br

# Test HTTPS connection (after deployment)
curl -I https://primeos.primeodontologia.com.br
```

---

## ⏱️ Propagation Time

DNS changes take time to propagate globally:

| Phase | Time | Status |
|-------|------|--------|
| Record Updated | Immediate | ✅ Changes applied at registrar |
| Local Resolution | 1-5 min | ✅ Works from your network |
| ISP Cache | 5-15 min | ✅ Works from most ISPs |
| Global Propagation | 30-48 hours | ✅ Works everywhere |
| Full Propagation | 24-48 hours | ✅ Complete globally |

**Note**: Most users will be able to access within 5-30 minutes.

---

## 🆘 Troubleshooting

### DNS Not Resolving

```bash
# 1. Check if nameservers are correct
whois primeodontologia.com.br

# Should show Hostinger nameservers:
# ns1.hostinger.com
# ns2.hostinger.com
# ns3.hostinger.com

# 2. If nameservers are wrong, update them at registrar
# 3. Wait 24-48 hours for propagation
```

### Using Wrong Nameservers

```bash
# Check current nameservers
dig +short NS primeodontologia.com.br

# If not Hostinger nameservers, update at registrar:
#   - Go to your domain registrar (whoever you bought domain from)
#   - Update nameservers to:
#     - ns1.hostinger.com
#     - ns2.hostinger.com
#     - ns3.hostinger.com
#   - Wait 24-48 hours
```

### Domain Pings But App Doesn't Load

```bash
# 1. Check if VPS has the app running
ssh root@82.29.56.236
docker compose -f /root/primeos-local/docker-compose.vps.yml ps

# 2. Check if Traefik is running
docker ps | grep traefik

# 3. Check Traefik logs
docker logs traefik-proxy
```

---

## 📋 Current Configuration

```
Domain:         primeos.primeodontologia.com.br
VPS IP:         82.29.56.236
Protocol:       HTTPS (SSL via Let's Encrypt)
Reverse Proxy:  Traefik
Web Server:     Nginx (inside Docker)
Backend:        React app (inside Docker)
```

---

## 🔒 SSL Certificate

After DNS is configured and app is running:

```bash
# Check certificate (wait 2-3 minutes after deployment)
echo | openssl s_client -servername primeos.primeodontologia.com.br -connect primeos.primeodontologia.com.br:443 2>/dev/null | grep -i "subject="

# Should show:
# subject=CN = primeos.primeodontologia.com.br
```

---

## 📚 Additional Resources

- **Hostinger DNS Docs**: https://support.hostinger.com/en/articles/900016-dns-records
- **DNS Propagation Checker**: https://www.whatsmydns.net/
- **SSL Certificate Checker**: https://www.sslshoper.com/ssl-checker
- **DNS Testing**: https://mxtoolbox.com/

---

## ✅ Checklist

- [ ] DNS A record added: `primeos → 82.29.56.236`
- [ ] DNS propagates: `dig primeos.primeodontologia.com.br`
- [ ] Ping resolves: `ping primeos.primeodontologia.com.br`
- [ ] HTTP works: `curl http://primeos.primeodontologia.com.br`
- [ ] HTTPS works: `curl https://primeos.primeodontologia.com.br`
- [ ] Certificate valid: No SSL warnings
- [ ] App loads: Browser shows dashboard

