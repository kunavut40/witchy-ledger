param([string]$Tools = (Join-Path $PSScriptRoot '..\..\..\work\android-tools'))
$ErrorActionPreference='Stop'
$jdk=(Get-ChildItem -LiteralPath (Join-Path $Tools 'jdk') -Directory | Select-Object -First 1).FullName
$buildTools=Join-Path $Tools 'buildtools\android-15'
$androidJar=Join-Path $Tools 'platform\android-35\android.jar'
$androidClasses=Join-Path $Tools 'android-classpath'
if(!(Test-Path -LiteralPath $androidClasses)){Add-Type -AssemblyName System.IO.Compression.FileSystem;[IO.Compression.ZipFile]::ExtractToDirectory($androidJar,$androidClasses)}
$stage=Join-Path $Tools 'apk-build'
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
Run (Join-Path $buildTools 'aapt2.exe') @('link','-I',$androidJar,'--manifest',(Join-Path $PSScriptRoot 'AndroidManifest.xml'),'-A',(Join-Path $stage 'assets'),'--min-sdk-version','30','--target-sdk-version','35','-o',(Join-Path $stage 'unsigned.apk'),(Join-Path $stage 'resources.zip'))
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
$key=Join-Path $Tools 'witchy-test.jks'
if(!(Test-Path -LiteralPath $key)){Run (Join-Path $jdk 'bin\keytool.exe') @('-genkeypair','-keystore',$key,'-storepass','android','-keypass','android','-alias','witchytest','-keyalg','RSA','-keysize','2048','-validity','10000','-dname','CN=Witchy Ledger Local Test')}
$output=Join-Path $PSScriptRoot '..\..\WitchyLedger-S25-test.apk'
Run (Join-Path $jdk 'bin\java.exe') @('-jar',(Join-Path $buildTools 'lib\apksigner.jar'),'sign','--ks',$key,'--ks-pass','pass:android','--key-pass','pass:android','--out',$output,(Join-Path $stage 'aligned.apk'))
Run (Join-Path $jdk 'bin\java.exe') @('-jar',(Join-Path $buildTools 'lib\apksigner.jar'),'verify','--verbose',$output)
Run (Join-Path $buildTools 'aapt.exe') @('dump','badging',$output)
Get-FileHash -Algorithm SHA256 -LiteralPath $output
