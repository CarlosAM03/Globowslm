#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

try {
    $projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
    $manifestPath = Join-Path $projectRoot 'package.json'
    $requiredPaths = @('Docs/01-ERV1.md', 'src/app/layout.tsx', 'src/app/page.tsx', 'legacy/index.html', 'assets')

    if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
        throw "No se encontró package.json en la raíz inferida: $projectRoot"
    }
    $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    if ($manifest.name -ne 'globowslm-v1') {
        throw "El paquete no corresponde al proyecto esperado: $($manifest.name)"
    }
    foreach ($relativePath in $requiredPaths) {
        if (-not (Test-Path -LiteralPath (Join-Path $projectRoot $relativePath))) {
            throw "Falta un elemento identificador del proyecto: $relativePath"
        }
    }

    $directories = @(
        'public/images',
        'public/images/brand', 'public/images/hero', 'public/images/about',
        'public/images/services', 'public/images/gallery', 'public/images/courses',
        'public/images/certifications',
        'src/components', 'src/components/ui', 'src/components/layout',
        'src/components/sections', 'src/components/sections/hero',
        'src/components/sections/about', 'src/components/sections/services-events',
        'src/components/sections/gallery', 'src/components/sections/courses',
        'src/components/sections/certifications', 'src/components/sections/trust-support',
        'src/components/sections/contact', 'src/components/shared',
        'src/config', 'src/content', 'src/hooks', 'src/lib', 'src/styles', 'src/types',
        'tests', 'tests/unit', 'tests/e2e', '.github', '.github/workflows'
    )

    $created = [System.Collections.Generic.List[string]]::new()
    $existing = [System.Collections.Generic.List[string]]::new()
    $markers = [System.Collections.Generic.List[string]]::new()

    foreach ($relativePath in $directories) {
        $target = Join-Path $projectRoot $relativePath
        if (Test-Path -LiteralPath $target -PathType Container) {
            $existing.Add($relativePath)
        }
        elseif (Test-Path -LiteralPath $target) {
            throw "Una ruta de directorio está ocupada por un archivo: $relativePath"
        }
        else {
            [void](New-Item -ItemType Directory -Path $target -ErrorAction Stop)
            $created.Add($relativePath)
        }
    }

    foreach ($relativePath in $directories) {
        $target = Join-Path $projectRoot $relativePath
        $firstChild = Get-ChildItem -LiteralPath $target -Force -ErrorAction Stop | Select-Object -First 1
        if ($null -eq $firstChild) {
            $marker = Join-Path $target '.gitkeep'
            if (-not (Test-Path -LiteralPath $marker)) {
                [void](New-Item -ItemType File -Path $marker -ErrorAction Stop)
                $markers.Add("$relativePath/.gitkeep")
            }
        }
    }

    $preserved = @('Docs/01-ERV1.md', 'legacy/index.html', 'src/app/layout.tsx', 'src/app/page.tsx', 'src/app/globals.css', 'src/app/favicon.ico', 'AGENTS.md')
    $preservedCount = @($preserved | Where-Object { Test-Path -LiteralPath (Join-Path $projectRoot $_) -PathType Leaf }).Count
    Write-Output "Raíz validada: $projectRoot"
    Write-Output "Directorios creados: $($created.Count)"
    if ($created.Count -gt 0) { $created | ForEach-Object { Write-Output "  + $_" } }
    Write-Output "Directorios existentes: $($existing.Count)"
    Write-Output "Marcadores .gitkeep creados: $($markers.Count)"
    if ($markers.Count -gt 0) { $markers | ForEach-Object { Write-Output "  + $_" } }
    Write-Output "Archivos críticos existentes preservados: $preservedCount/$($preserved.Count)"
    Write-Output 'No se modificaron archivos existentes, fotografías ni documentación.'
}
catch {
    Write-Error "Inicialización interrumpida: $($_.Exception.Message)"
    exit 1
}
