# 🔧 Comenzi Rapide pentru Testarea Backend-ului

## Testare cu curl (Command Line)

### Health Check
```bash
curl http://localhost:5000/
```

### Înregistrare utilizator
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123456!"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!"}'
```

### Obținere produse
```bash
curl http://localhost:5000/api/products
```

### Căutare produse
```bash
curl "http://localhost:5000/api/products/search?q=banana"
```

---

## Testare cu PowerShell

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/" -Method GET
```

### Înregistrare utilizator
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "Test123456!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Login
```powershell
$loginBody = @{
    email = "test@example.com"
    password = "Test123456!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $response.token
```

### Calculul caloriilor (cu token)
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$calorieBody = @{
    age = 25
    height = 170
    weight = 70
    gender = "female"
    activityLevel = "moderate"
    bloodType = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/calories/calculate" -Method POST -Headers $headers -Body $calorieBody
```

---

## Testare cu Browser (GET requests)

### Health Check
```
http://localhost:5000/
```

### API Documentation
```
http://localhost:5000/api-docs
```

### Toate produsele
```
http://localhost:5000/api/products
```

### Căutare produse
```
http://localhost:5000/api/products/search?q=banana
```

---

## Testare cu VS Code REST Client

Creează un fișier `.http` cu următorul conținut:

```http
### Health Check
GET http://localhost:5000/

### Register User
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test123456!"
}

### Login User
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123456!"
}

### Get Products
GET http://localhost:5000/api/products

### Search Products
GET http://localhost:5000/api/products/search?q=banana

### Calculate Calories (requires token)
POST http://localhost:5000/api/calories/calculate
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "age": 25,
  "height": 170,
  "weight": 70,
  "gender": "female",
  "activityLevel": "moderate",
  "bloodType": 1
}
```

---

## Verificarea Log-urilor

### Toate log-urile
```bash
tail -f logs/combined.log
```

### Doar erorile
```bash
tail -f logs/error.log
```

### Log-uri de securitate
```bash
tail -f logs/security.log
```

---

## Testare Status Codes

### 200 - OK
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/
```

### 404 - Not Found
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/nonexistent
```

### 401 - Unauthorized
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/profile
```

### 429 - Rate Limited
```bash
# Fă 10 requests rapid
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"wrong@test.com","password":"wrong"}'
done
```
