param(
    [string]$FilePath = "public_releases\SmartOrganizer-Setup-1.2.0.exe",
    [string]$CertPath = "certificates\SmartOrganizer-CodeSigning.pfx",
    [string]$CertPassword = "SmartOrganizer2026!SecureKey",
    [string]$TimestampUrl = "http://timestamp.digicert.com",
    [switch]$ForceNewCert = $false
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " SMART ORGANIZER - AUTHENTICODE SIGNING PIPELINE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $FilePath)) {
    Write-Error "Target binary file not found: $FilePath"
    exit 1
}

$resolvedFile = (Resolve-Path $FilePath).Path
Write-Host "[1/4] Target Binary: $resolvedFile" -ForegroundColor Yellow

# Ensure certificates folder exists
$certDir = Split-Path -Path $CertPath -Parent
if ($certDir -and -not (Test-Path $certDir)) {
    New-Item -ItemType Directory -Path $certDir -Force | Out-Null
}

# Obtain or create Code Signing Certificate
$certObj = $null

if ((Test-Path $CertPath) -and (-not $ForceNewCert)) {
    Write-Host "[2/4] Loading existing certificate from: $CertPath" -ForegroundColor Green
    $securePass = ConvertTo-SecureString $CertPassword -AsPlainText -Force
    $keyFlags = [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable -bor [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::PersistKeySet
    $certObj = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($CertPath, $securePass, $keyFlags)
} else {
    Write-Host "[2/4] Generating dedicated Code Signing Certificate..." -ForegroundColor Yellow
    
    $rsa = [System.Security.Cryptography.RSA]::Create(2048)
    $subjectName = "CN=Smart Organizer Technologies Inc., O=Smart Organizer Technologies Inc., L=San Francisco, S=CA, C=US"
    $distinguishedName = [System.Security.Cryptography.X509Certificates.X500DistinguishedName]::new($subjectName)
    
    $request = [System.Security.Cryptography.X509Certificates.CertificateRequest]::new(
        $distinguishedName,
        $rsa,
        [System.Security.Cryptography.HashAlgorithmName]::SHA256,
        [System.Security.Cryptography.RSASignaturePadding]::Pkcs1
    )
    
    # Extended Key Usage: Code Signing (1.3.6.1.5.5.7.3.3)
    $codeSigningOid = [System.Security.Cryptography.Oid]::new("1.3.6.1.5.5.7.3.3", "Code Signing")
    $oidCollection = [System.Security.Cryptography.OidCollection]::new()
    [void]$oidCollection.Add($codeSigningOid)
    $eku = [System.Security.Cryptography.X509Certificates.X509EnhancedKeyUsageExtension]::new($oidCollection, $true)
    $request.CertificateExtensions.Add($eku)
    
    # Key Usage: Digital Signature
    $keyUsage = [System.Security.Cryptography.X509Certificates.X509KeyUsageExtension]::new(
        [System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]::DigitalSignature,
        $true
    )
    $request.CertificateExtensions.Add($keyUsage)
    
    # Subject Key Identifier
    $ski = [System.Security.Cryptography.X509Certificates.X509SubjectKeyIdentifierExtension]::new($request.PublicKey, $false)
    $request.CertificateExtensions.Add($ski)
    
    # Valid for 5 years
    $startDate = [System.DateTimeOffset]::UtcNow.AddDays(-1)
    $endDate = [System.DateTimeOffset]::UtcNow.AddYears(5)
    $rawCert = $request.CreateSelfSigned($startDate, $endDate)
    
    # Export PFX with password
    $pfxBytes = $rawCert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Pfx, $CertPassword)
    [System.IO.File]::WriteAllBytes($CertPath, $pfxBytes)
    
    # Export public CER
    $cerPath = [System.IO.Path]::ChangeExtension($CertPath, ".cer")
    $cerBytes = $rawCert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    [System.IO.File]::WriteAllBytes($cerPath, $cerBytes)
    
    $securePass = ConvertTo-SecureString $CertPassword -AsPlainText -Force
    $keyFlags = [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable -bor [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::PersistKeySet
    $certObj = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($CertPath, $securePass, $keyFlags)
    
    # Add public cert to CurrentUser TrustedPublisher store for seamless local execution
    try {
        $tpStore = New-Object System.Security.Cryptography.X509Certificates.X509Store("TrustedPublisher", "CurrentUser")
        $tpStore.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
        $tpStore.Add($certObj)
        $tpStore.Close()
        Write-Host "   Added publisher certificate to CurrentUser\TrustedPublisher store" -ForegroundColor DarkGreen
    } catch {
        Write-Host "   Note: Could not add to TrustedPublisher store: $($_.Exception.Message)" -ForegroundColor DarkGray
    }

    Write-Host "   Certificate created and saved to: $CertPath" -ForegroundColor Green
}

Write-Host "   Publisher Subject: $($certObj.Subject)" -ForegroundColor Cyan
Write-Host "   Certificate Thumbprint: $($certObj.Thumbprint)" -ForegroundColor Cyan
Write-Host "   Validity: $($certObj.NotBefore.ToShortDateString()) to $($certObj.NotAfter.ToShortDateString())" -ForegroundColor Cyan

# Perform Authenticode Signing
Write-Host "[3/4] Applying SHA-256 Authenticode Signature..." -ForegroundColor Yellow

$sig = $null
$timestampServers = @(
    $TimestampUrl,
    "http://timestamp.digicert.com",
    "http://timestamp.sectigo.com"
)

# Attempt signing with timestamp server
$signedWithTimestamp = $false
foreach ($tsServer in $timestampServers) {
    if ([string]::IsNullOrWhiteSpace($tsServer)) { continue }
    try {
        Write-Host "   Attempting RFC 3161 timestamping via $tsServer..." -ForegroundColor DarkGray
        $sig = Set-AuthenticodeSignature -FilePath $resolvedFile -Certificate $certObj -HashAlgorithm SHA256 -TimestampServer $tsServer -ErrorAction Stop
        if ($sig -and $sig.Status -ne "Error") {
            $signedWithTimestamp = $true
            Write-Host "   Successfully timestamped via $tsServer" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "   Timestamp server ($tsServer) unavailable or offline: $($_.Exception.Message)" -ForegroundColor DarkGray
    }
}

if (-not $signedWithTimestamp) {
    Write-Host "   Signing without external timestamp server (offline fallback)..." -ForegroundColor Yellow
    $sig = Set-AuthenticodeSignature -FilePath $resolvedFile -Certificate $certObj -HashAlgorithm SHA256
}

# Verify Signature
Write-Host "[4/4] Verifying Authenticode Signature..." -ForegroundColor Yellow
$verifySig = Get-AuthenticodeSignature -FilePath $resolvedFile

$fileHash = (Get-FileHash -Path $resolvedFile -Algorithm SHA256).Hash.ToLowerInvariant()
$fileSize = (Get-Item -Path $resolvedFile).Length

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " CODE SIGNING VERIFICATION REPORT" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " File:                  $FilePath"
Write-Host " File Size:             $fileSize bytes"
Write-Host " SHA-256 Checksum:      $fileHash"
Write-Host " Publisher Name:        $($verifySig.SignerCertificate.Subject)"
Write-Host " Issuer:                $($verifySig.SignerCertificate.Issuer)"
Write-Host " Signature Status:      $($verifySig.Status)"
Write-Host " Status Message:        $($verifySig.StatusMessage)"
if ($verifySig.TimeStamperCertificate) {
    Write-Host " TimeStamper:           $($verifySig.TimeStamperCertificate.Subject)"
} else {
    Write-Host " TimeStamper:           Self-contained signing timestamp"
}
Write-Host "==========================================================" -ForegroundColor Green

# Return summary object
[PSCustomObject]@{
    FilePath = $resolvedFile
    FileSize = $fileSize
    Sha256 = $fileHash
    Publisher = $verifySig.SignerCertificate.Subject
    Status = $verifySig.Status.ToString()
    StatusMessage = $verifySig.StatusMessage
    Timestamped = $signedWithTimestamp
}
