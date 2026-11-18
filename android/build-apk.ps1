param(
 [string]$Tools=(Join-Path $PSScriptRoot '..\..\..\work\android-tools'),
 [string]$Jdk='',
 [string]$BuildTools='',
 [string]$AndroidJar='',
 [ValidateSet('Offline','Preview')][string]$Flavor='Offline',
 [string]$KeyStore='',
 [string]$KeyAlias='',
 [string]$Output=''
)
$ErrorActionPreference='Stop'
if(!$Jdk){$Jdk=(Get-ChildItem -LiteralPath (Join-Path $Tools 'jdk') -Directory | Select-Object -First 1).FullName}
if(!$BuildTools){$BuildTools=Join-Path $Tools 'buildtools\android-15'}
if(!$AndroidJar){$AndroidJar=Join-Path $Tools 'platform\android-35\android.jar'}
if(!$KeyStore){$KeyStore=if($Flavor -eq 'Preview'){Join-Path $env:USERPROFILE '.android/debug.keystore'}else{Join-Path $Tools 'witchy-test.jks'}}
if(!$KeyAlias){$KeyAlias=if($Flavor -eq 'Preview'){'androiddebugkey'}else{'witchytest'}}
if(!(Test-Path -LiteralPath $KeyStore)){throw 'Signing key not found; use the existing key to preserve update compatibility'}
if(!$Output){$Output=if($Flavor -eq 'Preview'){Join-Path $PSScriptRoot '..\WitchyLedger-Preview.apk'}else{Join-Path $PSScriptRoot '..\..\WitchyLedger-S25-test.apk'}}
$stage=Join-Path $env:TEMP ("witchy-build-"+[guid]::NewGuid())
New-Item -ItemType Directory -Force $stage | Out-Null
[xml]$manifest=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'AndroidManifest.xml')
if($Flavor -eq 'Preview'){
 $androidNs='http://schemas.android.com/apk/res/android'
 $manifest.manifest.SetAttribute('package','app.witchyledger.preview')
 $manifest.manifest.application.SetAttribute('label',$androidNs,'Witchy Ledger Preview') | Out-Null
 $manifest.manifest.application.activity.SetAttribute('name',$androidNs,'app.witchyledger.offline.MainActivity') | Out-Null
}
[IO.File]::WriteAllText((Join-Path $stage 'AndroidManifest.xml'),$manifest.OuterXml,[Text.UTF8Encoding]::new($false))
$assets=Join-Path $stage 'assets\www'
$classes=Join-Path $stage 'classes'
$dex=Join-Path $stage 'dex'
New-Item -ItemType Directory -Force $assets,$classes,$dex | Out-Null
Copy-Item -Path (Join-Path $PSScriptRoot '..\dist\*') -Destination $assets -Recurse -Force
$html=Get-Content -Raw -LiteralPath (Join-Path $assets 'index.html')
$html=[regex]::Replace($html,'<script[^>]*src="/registerSW.js"[^>]*></script>','')
Set-Content -LiteralPath (Join-Path $assets 'index.html') -Value $html -Encoding utf8
function Run([string]$Executable,[string[]]$Arguments){& $Executable @Arguments;if($LASTEXITCODE -ne 0){throw "Build command failed: $Executable"}}
Run (Join-Path $jdk 'bin\javac.exe') @('-encoding','UTF-8','-source','8','-target','8','-classpath',$androidJar,'-d',$classes,(Join-Path $PSScriptRoot 'MainActivity.java'))
Run (Join-Path $buildTools 'aapt2.exe') @('compile','--dir',(Join-Path $PSScriptRoot 'res'),'-o',(Join-Path $stage 'resources.zip'))
Run (Join-Path $buildTools 'aapt2.exe') @('link','-I',$androidJar,'--manifest',(Join-Path $stage 'AndroidManifest.xml'),'-A',(Join-Path $stage 'assets'),'--min-sdk-version','30','--target-sdk-version','35','-o',(Join-Path $stage 'unsigned.apk'),(Join-Path $stage 'resources.zip'))
$classFiles=@(Get-ChildItem -LiteralPath $classes -Recurse -Filter '*.class' | Select-Object -ExpandProperty FullName)
Run (Join-Path $jdk 'bin\java.exe') (@('-cp',(Join-Path $buildTools 'lib\d8.jar'),'com.android.tools.r8.D8','--lib',$androidJar,'--min-api','30','--output',$dex)+$classFiles)
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip=[IO.Compression.ZipFile]::Open((Join-Path $stage 'unsigned.apk'),[IO.Compression.ZipArchiveMode]::Update)
try{
 foreach($entry in @($zip.Entries | Where-Object {$_.FullName.Contains('\')})){
  $name=$entry.FullName.Replace('\','/');$stream=$entry.Open();$memory=[IO.MemoryStream]::new();$stream.CopyTo($memory);$stream.Dispose();$entry.Delete();$replacement=$zip.CreateEntry($name);$out=$replacement.Open();$memory.Position=0;$memory.CopyTo($out);$out.Dispose();$memory.Dispose()
 }
 [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,(Join-Path $dex 'classes.dex'),'classes.dex') | Out-Null
}finally{$zip.Dispose()}
Run (Join-Path $buildTools 'zipalign.exe') @('-f','4',(Join-Path $stage 'unsigned.apk'),(Join-Path $stage 'aligned.apk'))
Run (Join-Path $jdk 'bin\java.exe') @('-jar',(Join-Path $buildTools 'lib\apksigner.jar'),'sign','--ks',$KeyStore,'--ks-key-alias',$KeyAlias,'--ks-pass','pass:android','--key-pass','pass:android','--out',$output,(Join-Path $stage 'aligned.apk'))
Run (Join-Path $jdk 'bin\java.exe') @('-jar',(Join-Path $buildTools 'lib\apksigner.jar'),'verify','--verbose',$output)
Run (Join-Path $buildTools 'aapt.exe') @('dump','badging',$output)
Get-FileHash -Algorithm SHA256 -LiteralPath $output
