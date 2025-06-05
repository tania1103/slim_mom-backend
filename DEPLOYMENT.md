# 🚀 SlimMom API - Production Deployment Guide

## 📋 Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **Docker**: v20.0.0 or higher  
- **Docker Compose**: v2.0.0 or higher
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 10GB available space

### Environment Setup
1. **MongoDB Atlas** (recommended) or self-hosted MongoDB
2. **SSL Certificate** for HTTPS
3. **Email Service** (Gmail, SendGrid, etc.)
4. **Domain Name** with DNS configured

## 🔧 Pre-Deployment Checklist

### 1. Environment Configuration
```bash
# Copy and configure environment file
cp .env.example .env.production

# Edit with your production values
nano .env.production
```

### 2. Required Environment Variables
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/slimmom_prod

# JWT Secrets (generate secure 32+ character strings)
JWT_SECRET=your_secure_jwt_secret_min_32_characters
REFRESH_SECRET=your_secure_refresh_secret_min_32_characters

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-app@gmail.com
EMAIL_PASS=your-app-password

# Security
NODE_ENV=production
BCRYPT_ROUNDS=12
```

### 3. SSL Certificate Setup
```bash
# Create SSL directory
mkdir ssl

# Add your SSL certificate files
# ssl/cert.pem (certificate)
# ssl/key.pem (private key)
```

## 🚀 Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd server

# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh production
```

#### Manual Docker Deployment
```bash
# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f slimmom-api

# Check status
docker-compose ps
```

### Option 2: Direct Node.js Deployment

#### Installation
```bash
# Install dependencies
npm ci --production

# Create logs directory
mkdir -p logs

# Start with PM2 (recommended)
npm install -g pm2
pm2 start ecosystem.config.js --env production

# Or start directly
NODE_ENV=production node server.js
```

## 🔍 Post-Deployment Verification

### 1. Health Checks
```bash
# Basic health check
curl http://localhost:5000/health

# Detailed health check
curl http://localhost:5000/health/detailed

# API documentation
curl http://localhost:5000/api-docs
```

### 2. Test API Endpoints
```bash
# Search products
curl "http://localhost:5000/api/products/search?search=apple"

# User registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

### 3. Monitor Performance
- **CPU Usage**: Should be < 50% under normal load
- **Memory Usage**: Should be < 80% of available RAM
- **Response Time**: Should be < 500ms for most endpoints
- **Error Rate**: Should be < 1%

## 📊 Monitoring & Maintenance

### Log Files
```bash
# Application logs
tail -f logs/combined.log

# Error logs
tail -f logs/error.log

# Security logs
tail -f logs/security.log

# Docker logs
docker-compose logs -f slimmom-api
```

### Performance Monitoring
```bash
# Check cache performance
curl http://localhost:5000/health/detailed | jq '.cache'

# Monitor memory usage
curl http://localhost:5000/health/detailed | jq '.memory'

# Check database connection
curl http://localhost:5000/health/detailed | jq '.database'
```

### Backup Strategy
```bash
# MongoDB backup (if using Docker)
docker exec slimmom-mongodb mongodump --out /backup

# Application data backup
tar -czf slimmom-backup-$(date +%Y%m%d).tar.gz logs/ uploads/
```

## 🔒 Security Considerations

### SSL/TLS Configuration
- **Use strong ciphers**: TLSv1.2 minimum
- **HTTP Strict Transport Security**: Enabled
- **Certificate validation**: Automated renewal recommended

### Firewall Rules
```bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP (redirects to HTTPS)
ufw allow 443   # HTTPS
ufw deny 5000   # Block direct API access
```

### Rate Limiting
- **Global**: 100 requests/15 minutes
- **Authentication**: 5 requests/15 minutes
- **Search**: 20 requests/minute

## 🚨 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check environment variables
docker-compose config

# Check logs
docker-compose logs slimmom-api

# Restart services
docker-compose restart
```

#### 2. Database Connection Issues
```bash
# Test MongoDB connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(err => console.error('Error:', err))"

# Check network connectivity
docker-compose exec slimmom-api ping mongodb
```

#### 3. Performance Issues
```bash
# Check resource usage
docker stats

# Monitor slow queries
curl http://localhost:5000/health/detailed

# Clear cache
curl -X POST http://localhost:5000/admin/cache/clear
```

### Emergency Procedures

#### 1. Quick Rollback
```bash
# Stop current deployment
docker-compose down

# Deploy previous version
git checkout <previous-commit>
./deploy.sh production
```

#### 2. Scale Up
```bash
# Increase container resources
docker-compose up -d --scale slimmom-api=3
```

## 📈 Scaling Considerations

### Horizontal Scaling
- **Load Balancer**: Nginx or cloud load balancer
- **Container Orchestration**: Kubernetes or Docker Swarm
- **Database**: MongoDB Atlas with auto-scaling

### Vertical Scaling
- **CPU**: Monitor CPU usage, scale up if > 80%
- **Memory**: Scale up if > 85% usage
- **Storage**: Monitor disk space for logs

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to server
      run: |
        ssh user@server 'cd /app && git pull && ./deploy.sh production'
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- **Weekly**: Check logs, update dependencies
- **Monthly**: Security audit, performance review
- **Quarterly**: Full backup test, disaster recovery drill

### Monitoring Alerts
Set up alerts for:
- **High error rate** (> 5%)
- **Slow response times** (> 2s)
- **High memory usage** (> 90%)
- **Database connection failures**

---

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database connection tested
- [ ] Email service configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Rate limiting tested
- [ ] Health checks passing
- [ ] Documentation updated

**🚀 Ready for Production Deployment!**