#requires -Version 7.4
param(
    [Parameter(Mandatory)] [string] $Certificate,
    [Parameter(Mandatory)] [string] $DeploymentSha
)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
$ref = 'ajguiknpwgkpoelwhsnv'
$bucket = 'globows-media'
$private = Join-Path $env:LOCALAPPDATA 'GlobowsLM/FREE-01'
$scope = [Security.Cryptography.DataProtectionScope]::CurrentUser
$destination = Join-Path $private ("P25-backup-" + (Get-Date -Format 'yyyyMMdd-HHmmss'))
$null = New-Item -ItemType Directory $destination
$dump = Join-Path $destination 'staging.dump'
$sealed = Join-Path $destination 'postgres.dump.dpapi'
$container = 'globows-v2-p25-restore-' + [Guid]::NewGuid().ToString('N').Substring(0,12)
$image = 'postgres:17.12-bookworm@sha256:1eff563f6c868b9b433566e9f3cf6e5c79fbd3b95bf70ec7277d376cdbfc50d7'
$started = $false

function Read-Secret($name) {
    $value = Get-Content -LiteralPath (Join-Path $private "$name.dpapi") -Raw | ConvertTo-SecureString
    [Net.NetworkCredential]::new('', $value).Password
}

function Seal-File($path, [byte[]] $bytes) {
    [IO.File]::WriteAllBytes($path, [Security.Cryptography.ProtectedData]::Protect($bytes, $null, $scope))
}

function Read-Sealed($path) {
    ,([Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes($path), $null, $scope))
}

function Get-Sha([byte[]] $bytes) {
    [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLowerInvariant()
}

function Copy-ToRestore($target, [byte[]] $bytes) {
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = [Diagnostics.ProcessStartInfo]::new()
    $process.StartInfo.FileName = 'docker'
    $process.StartInfo.UseShellExecute = $false
    $process.StartInfo.RedirectStandardInput = $true
    foreach ($arg in @('exec','-i',$container,'sh','-c','cat > "$1"','sh',$target)) {
        $process.StartInfo.ArgumentList.Add($arg)
    }
    try {
        $null = $process.Start()
        $process.StandardInput.BaseStream.Write($bytes)
        $process.StandardInput.BaseStream.Close()
        $process.WaitForExit()
        if ($process.ExitCode -ne 0) { throw 'No se pudo transferir el archivo al entorno aislado.' }
    } finally {
        $process.Dispose()
        [Array]::Clear($bytes)
    }
}

$inventorySql = @'
SELECT json_build_object(
  'entries', (SELECT count(*) FROM public.content_entries),
  'publishedEntries', (SELECT count(*) FROM public.content_entries WHERE "publishedRevisionId" IS NOT NULL AND "withdrawnAt" IS NULL),
  'revisions', (SELECT count(*) FROM public.content_revisions),
  'migrations', (SELECT count(*) FROM public._prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL),
  'roles', (SELECT json_agg(role ORDER BY role) FROM public.owners),
  'entriesFingerprint', (SELECT md5(string_agg(md5(to_jsonb(e)::text), '' ORDER BY id)) FROM public.content_entries e),
  'revisionsFingerprint', (SELECT md5(string_agg(md5(to_jsonb(r)::text), '' ORDER BY id)) FROM public.content_revisions r),
  'media', (SELECT json_agg(json_build_object('key',"storageKey",'size',size,'sha256',sha256) ORDER BY "storageKey") FROM public.media),
  'publishedMediaRefs', (SELECT count(*) FROM public.revision_media_refs m JOIN public.content_entries e ON e."publishedRevisionId"=m."revisionId")
);
'@
$storageSql = "SELECT coalesce(json_agg(name ORDER BY name),'[]'::json) FROM storage.objects WHERE bucket_id='globows-media';"

try {
    $env:PGPASSWORD = Read-Secret 'DatabasePassword'
    $env:PGHOST = 'aws-1-us-east-2.pooler.supabase.com'
    $env:PGPORT = '5432'
    $env:PGUSER = "postgres.$ref"
    $env:PGDATABASE = 'postgres'
    $env:PGSSLMODE = 'verify-full'
    $env:PGSSLROOTCERT = (Resolve-Path -LiteralPath $Certificate).Path
    $env:PGCONNECT_TIMEOUT = '15'
    $env:PGOPTIONS = '-c default_transaction_read_only=on'
    $tls = psql -XAt -w -v ON_ERROR_STOP=1 -c "SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid();"
    if ($tls -ne 't') { throw 'TLS del pooler al servidor no acreditado.' }
    $before = psql -XAt -w -v ON_ERROR_STOP=1 -c $inventorySql
    $objectsBefore = psql -XAt -w -v ON_ERROR_STOP=1 -c $storageSql
    $inventory = $before | ConvertFrom-Json
    $objectKeys = @($objectsBefore | ConvertFrom-Json)
    if ($inventory.entries -lt 15 -or $inventory.migrations -ne 6 -or (@($inventory.roles) -join ',') -cne 'OWNER,ADMIN' -or @($inventory.media).Count -lt 7) {
        throw 'El destino no coincide con el inventario poblado esperado.'
    }
    $expected = @{}
    foreach ($item in $inventory.media) { $expected[$item.key] = $item }
    foreach ($key in $expected.Keys) {
        if ($key -cnotin $objectKeys) { throw 'Storage carece de un objeto referenciado.' }
    }
    pg_dump -w --format=custom --no-owner --no-privileges --schema=public --file $dump
    $archive = [IO.File]::ReadAllBytes($dump)
    $dumpSha = Get-Sha $archive
    try { Seal-File $sealed $archive } finally { [Array]::Clear($archive); Remove-Item -LiteralPath $dump }

    $headers = @{ apikey = (Read-Secret 'StorageKey') }
    $media = @(
        foreach ($key in $objectKeys) {
            if ($key -notmatch '^[a-zA-Z0-9._/-]+$' -or ($key.Split('/') -contains '..')) { throw 'Clave Storage inesperada.' }
            $encoded = ($key.Split('/') | ForEach-Object { [uri]::EscapeDataString($_) }) -join '/'
            $base = "https://$ref.supabase.co/storage/v1/object"
            $anonymous = Invoke-WebRequest -Uri "$base/public/$bucket/$encoded" -SkipHttpErrorCheck -TimeoutSec 60
            if ($anonymous.StatusCode -notin 400,401,403,404) { throw 'Acceso anónimo inesperado en Storage.' }
            $response = Invoke-WebRequest -Uri "$base/authenticated/$bucket/$encoded" -Headers $headers -TimeoutSec 60
            $bytes = $response.RawContentStream.ToArray()
            $sha = Get-Sha $bytes
            $length = $bytes.Length
            if ($expected.ContainsKey($key) -and ($sha -ne $expected[$key].sha256 -or $length -ne $expected[$key].size)) {
                throw 'El tamaño o SHA de Storage difiere de PostgreSQL.'
            }
            $file = "object-$([array]::IndexOf($objectKeys, $key)).dpapi"
            try { Seal-File (Join-Path $destination $file) $bytes } finally { [Array]::Clear($bytes) }
            [pscustomobject]@{ key = $key; file = $file; sha256 = $sha; size = $length; anonymous = [int]$anonymous.StatusCode }
        }
    )
    $headers.Clear()
    $after = psql -XAt -w -v ON_ERROR_STOP=1 -c $inventorySql
    $objectsAfter = psql -XAt -w -v ON_ERROR_STOP=1 -c $storageSql
    if ($before -cne $after -or $objectsBefore -cne $objectsAfter) { throw 'Cambió el inventario durante el respaldo.' }
    Remove-Item Env:PGPASSWORD
    $manifest = [ordered]@{ deployment = $DeploymentSha; dumpSha256 = $dumpSha; media = $media }
    Seal-File (Join-Path $destination 'manifest.json.dpapi') ([Text.Encoding]::UTF8.GetBytes(($manifest | ConvertTo-Json -Depth 4)))

    $null = docker run -d --rm --name $container --network none --tmpfs /var/lib/postgresql/data --tmpfs /restore -e POSTGRES_HOST_AUTH_METHOD=trust $image
    $started = $true
    $ready = $false
    $PSNativeCommandUseErrorActionPreference = $false
    foreach ($attempt in 1..30) {
        docker exec $container pg_isready -h 127.0.0.1 -U postgres *> $null
        if ($LASTEXITCODE -eq 0) { $ready = $true; break }
        Start-Sleep -Seconds 1
    }
    $PSNativeCommandUseErrorActionPreference = $true
    if (-not $ready) { throw 'PostgreSQL aislado no inició.' }
    docker exec $container psql -U postgres -X -q -v ON_ERROR_STOP=1 -c 'CREATE ROLE globows_runtime NOLOGIN NOBYPASSRLS;'
    $archive = Read-Sealed $sealed
    if ((Get-Sha $archive) -cne $dumpSha) { throw 'SHA del respaldo PostgreSQL incorrecto.' }
    Copy-ToRestore '/restore/postgres.dump' $archive
    docker exec $container pg_restore -U postgres -d postgres --exit-on-error --no-owner --no-privileges --clean --if-exists /restore/postgres.dump
    $restored = docker exec $container psql -U postgres -d postgres -XAt -v ON_ERROR_STOP=1 -c $inventorySql
    if ($before -cne $restored) { throw 'El inventario restaurado difiere de producción.' }
    docker exec $container install -d -m 700 "/restore/$bucket"
    foreach ($item in $media) {
        $path = "/restore/$bucket/$($item.key)"
        docker exec $container mkdir -p ($path.Substring(0, $path.LastIndexOf('/')))
        Copy-ToRestore $path (Read-Sealed (Join-Path $destination $item.file))
        $digest = (docker exec $container sha256sum $path).Split(' ')[0]
        if ($digest -cne $item.sha256) { throw 'SHA de objeto restaurado incorrecto.' }
    }
    [ordered]@{
        deployment = $DeploymentSha; engine = '17.12'; encryptedDumpSha256 = (Get-FileHash $sealed).Hash.ToLowerInvariant()
        dumpSha256 = $dumpSha; entries = $inventory.entries; publishedEntries = $inventory.publishedEntries
        revisions = $inventory.revisions; migrations = $inventory.migrations; roles = $inventory.roles
        storedObjects = $media.Count; referencedObjects = $expected.Count; publishedMediaRefs = $inventory.publishedMediaRefs
        anonymousStatuses = @($media.anonymous | Sort-Object -Unique); destination = $destination; restored = $true
    } | ConvertTo-Json -Compress
} finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    if ($started) { docker stop $container | Out-Null }
    if (Test-Path -LiteralPath $dump) { Remove-Item -LiteralPath $dump }
}
