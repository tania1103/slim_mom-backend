# 🧪 Script PowerShell pentru Testarea Backend-ului SlimMom
# Rulează toate testele principale ale API-ului

param(
    [string]$BaseUrl = "http://localhost:5000",
    [switch]$Verbose
)

Write-Host "🚀 Începerea testării backend-ului SlimMom..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Configurare
$TestEmail = "test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$TestPassword = "Test123456!"
$Token = ""

# Funcție pentru afișarea rezultatelor
function Write-TestResult {
    param([bool]$Success, [string]$Message, [string]$Details = "")
    
    if ($Success) {
        Write-Host "✅ $Message" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor Red
    }
    
    if ($Details -and $Verbose) {
        Write-Host "   📄 $Details" -ForegroundColor Gray
    }
}

# Funcție pentru requests HTTP
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ErrorAction = 'Stop'
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = 'application/json'
        }
        
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response; StatusCode = 200 }
    }
    catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 0 }
        return @{ Success = $false; Error = $_.Exception.Message; StatusCode = $statusCode }
    }
}

Write-Host ""
Write-Host "📋 PASUL 1: Testarea conectivității de bază" -ForegroundColor Blue
Write-Host "--------------------------------------------" -ForegroundColor Blue

# Test 1: Health Check
Write-Host "🔍 Testare health check..."
$healthCheck = Invoke-ApiRequest -Url "$BaseUrl/"

if ($healthCheck.Success) {
    Write-TestResult -Success $true -Message "Health check" -Details "API funcționează"
    if ($Verbose) {
        Write-Host "   📄 Răspuns: $($healthCheck.Data.message)" -ForegroundColor Gray
    }
} else {
    Write-TestResult -Success $false -Message "Health check (Status: $($healthCheck.StatusCode))" -Details $healthCheck.Error
    Write-Host "❌ Backend-ul nu răspunde! Verifică dacă serverul rulează pe $BaseUrl" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 PASUL 2: Testarea autentificării" -ForegroundColor Blue
Write-Host "--------------------------------------------" -ForegroundColor Blue

# Test 2: Înregistrare utilizator
Write-Host "🔍 Testare înregistrare utilizator..."
$registerBody = @{
    name = "Test User"
    email = $TestEmail
    password = $TestPassword
} | ConvertTo-Json

$registerResult = Invoke-ApiRequest -Url "$BaseUrl/api/auth/register" -Method "POST" -Body $registerBody

if ($registerResult.Success) {
    Write-TestResult -Success $true -Message "Înregistrare utilizator" -Details "Utilizator creat: $TestEmail"
} else {
    Write-TestResult -Success $false -Message "Înregistrare utilizator (Status: $($registerResult.StatusCode))" -Details $registerResult.Error
}

# Test 3: Login utilizator
Write-Host "🔍 Testare login utilizator..."
$loginBody = @{
    email = $TestEmail
    password = $TestPassword
} | ConvertTo-Json

$loginResult = Invoke-ApiRequest -Url "$BaseUrl/api/auth/login" -Method "POST" -Body $loginBody

if ($loginResult.Success -and $loginResult.Data.token) {
    Write-TestResult -Success $true -Message "Login utilizator" -Details "Token obținut"
    $Token = $loginResult.Data.token
    Write-Host "   🔑 Token: $($Token.Substring(0, [Math]::Min(20, $Token.Length)))..." -ForegroundColor Gray
} else {
    Write-TestResult -Success $false -Message "Login utilizator (Status: $($loginResult.StatusCode))" -Details $loginResult.Error
}

Write-Host ""
Write-Host "📋 PASUL 3: Testarea produselor" -ForegroundColor Blue
Write-Host "--------------------------------------------" -ForegroundColor Blue

# Test 4: Obținerea produselor
Write-Host "🔍 Testare obținere produse..."
$productsResult = Invoke-ApiRequest -Url "$BaseUrl/api/products"

if ($productsResult.Success) {
    $productCount = if ($productsResult.Data -is [array]) { $productsResult.Data.Count } else { 1 }
    Write-TestResult -Success $true -Message "Obținere produse" -Details "$productCount produse găsite"
} else {
    Write-TestResult -Success $false -Message "Obținere produse (Status: $($productsResult.StatusCode))" -Details $productsResult.Error
}

# Test 5: Căutarea produselor
Write-Host "🔍 Testare căutare produse..."
$searchResult = Invoke-ApiRequest -Url "$BaseUrl/api/products/search?q=banana"

if ($searchResult.Success) {
    $searchCount = if ($searchResult.Data -is [array]) { $searchResult.Data.Count } else { 1 }
    Write-TestResult -Success $true -Message "Căutare produse" -Details "$searchCount rezultate pentru 'banana'"
} else {
    Write-TestResult -Success $false -Message "Căutare produse (Status: $($searchResult.StatusCode))" -Details $searchResult.Error
}

Write-Host ""
Write-Host "📋 PASUL 4: Testarea calculului de calorii" -ForegroundColor Blue
Write-Host "--------------------------------------------" -ForegroundColor Blue

if ($Token) {
    Write-Host "🔍 Testare calcul calorii..."
    $caloriesBody = @{
        age = 25
        height = 170
        weight = 70
        gender = "female"
        activityLevel = "moderate"
        bloodType = 1
    } | ConvertTo-Json
    
    $headers = @{ "Authorization" = "Bearer $Token" }
    $caloriesResult = Invoke-ApiRequest -Url "$BaseUrl/api/calories/calculate" -Method "POST" -Headers $headers -Body $caloriesBody
    
    if ($caloriesResult.Success) {
        $dailyCalories = $caloriesResult.Data.dailyCalories
        Write-TestResult -Success $true -Message "Calcul calorii" -Details "Calorii zilnice: $dailyCalories"
    } else {
        Write-TestResult -Success $false -Message "Calcul calorii (Status: $($caloriesResult.StatusCode))" -Details $caloriesResult.Error
    }
} else {
    Write-Host "⚠️  Sărind testarea calculului de calorii (lipsește token-ul)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 PASUL 5: Testarea jurnalului" -ForegroundColor Blue
Write-Host "--------------------------------------------" -ForegroundColor Blue

if ($Token) {
    Write-Host "🔍 Testare obținere jurnal..."
    $today = Get-Date -Format "yyyy-MM-dd"
    $headers = @{ "Authorization" = "Bearer $Token" }
    $diaryResult = Invoke-ApiRequest -Url "$BaseUrl/api/diary?date=$today" -Headers $headers
    
    if ($diaryResult.Success) {
        $diaryCount = if ($diaryResult.Data -is [array]) { $diaryResult.Data.Count } else { if ($diaryResult.Data) { 1 } else { 0 } }
        Write-TestResult -Success $true -Message "Obținere jurnal" -Details "$diaryCount intrări pentru $today"
    } else {
        Write-TestResult -Success $false -Message "Obținere jurnal (Status: $($diaryResult.StatusCode))" -Details $diaryResult.Error
    }
} else {
    Write-Host "⚠️  Sărind testarea jurnalului (lipsește token-ul)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 PASUL 6: Testarea profilului" -ForegroundColor Blue
Write-Host "--------------------------------------------" -ForegroundColor Blue

if ($Token) {
    Write-Host "🔍 Testare obținere profil..."
    $headers = @{ "Authorization" = "Bearer $Token" }
    $profileResult = Invoke-ApiRequest -Url "$BaseUrl/api/profile" -Headers $headers
    
    if ($profileResult.Success) {
        $userName = $profileResult.Data.name
        Write-TestResult -Success $true -Message "Obținere profil" -Details "Utilizator: $userName"
    } else {
        Write-TestResult -Success $false -Message "Obținere profil (Status: $($profileResult.StatusCode))" -Details $profileResult.Error
    }
} else {
    Write-Host "⚠️  Sărind testarea profilului (lipsește token-ul)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 PASUL 7: Testarea securității" -ForegroundColor Blue
Write-Host "--------------------------------------------" -ForegroundColor Blue

Write-Host "🔍 Testare rate limiting..."
$rateLimitDetected = $false

$wrongLoginBody = @{
    email = "nonexistent@test.com"
    password = "wrongpassword"
} | ConvertTo-Json

for ($i = 1; $i -le 6; $i++) {
    $rateResult = Invoke-ApiRequest -Url "$BaseUrl/api/auth/login" -Method "POST" -Body $wrongLoginBody
    
    if ($rateResult.StatusCode -eq 429) {
        Write-TestResult -Success $true -Message "Rate limiting" -Details "Blocat după $i încercări"
        $rateLimitDetected = $true
        break
    }
    
    Start-Sleep -Milliseconds 100
}

if (-not $rateLimitDetected) {
    Write-TestResult -Success $false -Message "Rate limiting" -Details "Nu s-a activat după 6 încercări"
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 Testarea completă!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Statistici:" -ForegroundColor Blue
Write-Host "   📧 Email test: $TestEmail" -ForegroundColor Gray
Write-Host "   🔑 Token generat: $(if ($Token) { 'DA' } else { 'NU' })" -ForegroundColor Gray
Write-Host "   🌐 URL backend: $BaseUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Pentru detalii suplimentare, rulează cu parametrul -Verbose" -ForegroundColor Yellow
Write-Host "✅ Testare completă!" -ForegroundColor Green
