---
title: Recursively Delete a Specific Folder
background: "/img/posts/6.jpg"
date: '2022-07-20 18:35:00'
layout: post
lang: en
---

Following powershell script can be used for deleting all Debug folders inside of your project space.

```powershell
Write-Output "Removing Debug folders" ; 
Get-ChildItem . -include Debug -Recurse | ForEach-Object ($_) { 
    Write-Host "Removed: " -nonewline; 
    Write-Output $_.FullName ; 
    Remove-Item $_.FullName -Force -Recurse 
}
```

