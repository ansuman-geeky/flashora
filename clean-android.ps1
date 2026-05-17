# Flashora Android "Nuclear" Clean Script
# Use this when you get "Unable to delete directory" errors

Write-Host "Stopping Gradle, Java, and Node processes..." -ForegroundColor Cyan
# Killing node as well because Metro/Watchman/OneDrive might have handles
Get-Process | Where-Object { $_.Name -match "java|gradle|node" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Cleaning Android build artifacts..." -ForegroundColor Cyan

$pathsToDelete = @(
    ".gradle",
    "android/.gradle",
    "android/app/build",
    "android/build",
    "node_modules/@react-native/gradle-plugin/settings-plugin/build",
    "node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/build",
    "node_modules/@react-native/gradle-plugin/build"
)

foreach ($path in $pathsToDelete) {
    if (Test-Path $path) {
        Write-Host "Attempting to delete $path..." -ForegroundColor Yellow
        try {
            Remove-Item -Recurse -Force $path -ErrorAction Stop
        } catch {
            Write-Host "PowerShell failed to delete $path. Attempting aggressive CMD fallback..." -ForegroundColor Gray
            $winPath = $path.Replace("/", "\")
            $tempPath = "$winPath`_old"
            
            # 1. Try to move/rename first (often bypasses locks)
            cmd /c "move `"$winPath`" `"$tempPath`"" >$null 2>&1
            
            # 2. Try to delete either the original or the renamed one
            $targetToDelete = if (Test-Path $tempPath) { $tempPath } else { $winPath }
            cmd /c "rmdir /s /q `"$targetToDelete`"" >$null 2>&1
            
            if (Test-Path $path) {
                Write-Host "CRITICAL: Could not delete $path. The folder is likely locked by OneDrive, Antivirus, or another process." -ForegroundColor Red
                Write-Host "Tip: Try closing VS Code, Android Studio, and checking OneDrive sync status." -ForegroundColor Gray
            } else {
                Write-Host "Successfully cleaned $path using fallback." -ForegroundColor Gray
            }
        }
    }
}

Write-Host "Done! You can now run: npx expo run:android" -ForegroundColor Green
