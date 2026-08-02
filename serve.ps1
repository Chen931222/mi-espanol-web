$root = Get-ChildItem 'C:\Users\User\Desktop' -Directory | Where-Object { Test-Path (Join-Path $_.FullName 'manifest.webmanifest') } | Select-Object -First 1 -ExpandProperty FullName
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8181/')
$listener.Start()
Write-Output "serving $root on http://localhost:8181/"
$mime = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.svg'='image/svg+xml'; '.json'='application/json'; '.webmanifest'='application/manifest+json'; '.jpg'='image/jpeg'; '.png'='image/png' }
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($path -eq '/') { $path = '/index.html' }
    $file = Join-Path $root ($path -replace '/', '\')
    if ((Test-Path $file -PathType Leaf) -and ($file -like "$root*")) {
      $bytes = [IO.File]::ReadAllBytes($file)
      $ext = [IO.Path]::GetExtension($file).ToLower()
      if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
    }
    $ctx.Response.OutputStream.Close()
  } catch {}
}
