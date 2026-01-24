# Test OTP Flow Script
$ErrorActionPreference = "Stop"

function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url,
        [string]$Method,
        [hashtable]$Body
    )

    Write-Host "Testing $Name ($Method $Url)..." -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Method -ne "GET") {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }

        $response = Invoke-RestMethod @params
        Write-Host " OK" -ForegroundColor Green
        return $response
    } catch {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Yellow
        if ($_.Exception.Response) {
             $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
             $responseBody = $reader.ReadToEnd()
             Write-Host "Response Body: $responseBody" -ForegroundColor Gray
        }
        return $null
    }
}

# $email = "test-" + (Get-Random) + "@example.com"
$email = "maitanthepmrthep@gmail.com"
Write-Host "Using test email: $email" -ForegroundColor Cyan

# 1. Test Backend Check Email (Direct)
Write-Host "`n--- 1. Testing Backend Direct (Port 8080) ---" -ForegroundColor Magenta
Test-Endpoint -Name "Backend Check Email" -Url "http://localhost:8080/api/users/check-email?email=$email" -Method "GET"

# 2. Test Frontend Check Email (Proxy)
Write-Host "`n--- 2. Testing Frontend Proxy (Port 3000) ---" -ForegroundColor Magenta
$feCheck = Test-Endpoint -Name "Frontend Check Email" -Url "http://localhost:3000/api/auth/check-email" -Method "POST" -Body @{ email = $email }

if ($feCheck) {
    Write-Host "Frontend Check Result: $($feCheck | ConvertTo-Json)" -ForegroundColor Gray
}

# 3. Test Frontend Send OTP
Write-Host "`n--- 3. Testing Frontend Send OTP ---" -ForegroundColor Magenta
# Note: This might fail if the user is not registered in DB, but we want to see the error message structure
Test-Endpoint -Name "Frontend Send OTP" -Url "http://localhost:3000/api/auth/send-otp" -Method "POST" -Body @{ email = $email }

# 4. Test Backend Send OTP (Direct)
Write-Host "`n--- 4. Testing Backend Send OTP (Direct - Port 8080) ---" -ForegroundColor Magenta
Test-Endpoint -Name "Backend Send OTP" -Url "http://localhost:8080/api/auth/send-otp" -Method "POST" -Body @{ email = $email }

Write-Host "`n--- Test Complete ---" -ForegroundColor Cyan
