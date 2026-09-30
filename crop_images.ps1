# Crop individual product images from the flyers
Add-Type -AssemblyName System.Drawing

$imgDir = "C:\Users\User\.gemini\antigravity\scratch\selvan-supermarket\images"
if (!(Test-Path $imgDir)) {
    New-Item -ItemType Directory -Path $imgDir | Out-Null
}

$f1 = "C:\Users\User\.gemini\antigravity\brain\759f270d-7793-426a-84bd-e19856f5e4e3\.user_uploaded\media_1790656430741.jpg"
$f2 = "C:\Users\User\.gemini\antigravity\brain\759f270d-7793-426a-84bd-e19856f5e4e3\.user_uploaded\media_1790656438029.jpg"
$f3 = "C:\Users\User\.gemini\antigravity\brain\759f270d-7793-426a-84bd-e19856f5e4e3\.user_uploaded\media_1790656445306.jpg"

function Crop-Image($sourcePath, $cropX, $cropY, $cropW, $cropH, $outputPath) {
    $src = [System.Drawing.Image]::FromFile($sourcePath)
    
    # Boundary checks
    if ($cropX + $cropW -gt $src.Width) { $cropW = $src.Width - $cropX }
    if ($cropY + $cropH -gt $src.Height) { $cropH = $src.Height - $cropY }

    $rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
    $dest = New-Object System.Drawing.Bitmap($cropW, $cropH)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
    $g.DrawImage($src, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $dest.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $g.Dispose()
    $dest.Dispose()
    $src.Dispose()
    Write-Host "Saved: $outputPath"
}

# Image 1 (Flyer 1)
$b1 = [System.Drawing.Image]::FromFile($f1)
$W1 = $b1.Width
$H1 = $b1.Height
$b1.Dispose()
Write-Host "Flyer 1 size: $W1 x $H1"

# Flyer 1 grid: 4 columns, ~3 rows
# Col width ~ 24.5%, Row height ~ 24.5%
$colW1 = [int]($W1 * 0.245)
$rowH1 = [int]($H1 * 0.245)
$gapX1 = [int]($W1 * 0.006)
$startY1 = [int]($H1 * 0.012)
$startX1 = [int]($W1 * 0.015)

# Row 1 of Flyer 1
Crop-Image $f1 ($startX1 + 0*($colW1+$gapX1)) $startY1 $colW1 $rowH1 "$imgDir\flyer-001.jpg" # Annapoorna
Crop-Image $f1 ($startX1 + 1*($colW1+$gapX1)) $startY1 $colW1 $rowH1 "$imgDir\flyer-002.jpg" # Meiyal
Crop-Image $f1 ($startX1 + 2*($colW1+$gapX1)) $startY1 $colW1 $rowH1 "$imgDir\flyer-003.jpg" # Aachi Masala
Crop-Image $f1 ($startX1 + 3*($colW1+$gapX1)) $startY1 $colW1 $rowH1 "$imgDir\flyer-004.jpg" # Aachi Gulab Jamun

# Row 2 of Flyer 1
$r2Y1 = [int]($startY1 + $rowH1 + ($H1 * 0.012))
Crop-Image $f1 ($startX1 + 0*($colW1+$gapX1)) $r2Y1 $colW1 $rowH1 "$imgDir\flyer-005.jpg" # Aachi Payasam
Crop-Image $f1 ($startX1 + 1*($colW1+$gapX1)) $r2Y1 $colW1 $rowH1 "$imgDir\flyer-006.jpg" # MTR Hing
Crop-Image $f1 ($startX1 + 2*($colW1+$gapX1)) $r2Y1 $colW1 $rowH1 "$imgDir\flyer-007.jpg" # Vega Hair Dryer
Crop-Image $f1 ($startX1 + 3*($colW1+$gapX1)) $r2Y1 $colW1 $rowH1 "$imgDir\flyer-008.jpg" # VIP Hair Colour

# Row 3 of Flyer 1 (3 items + gap)
$r3Y1 = [int]($r2Y1 + $rowH1 + ($H1 * 0.012))
Crop-Image $f1 ($startX1 + 0*($colW1+$gapX1)) $r3Y1 $colW1 $rowH1 "$imgDir\flyer-009.jpg" # Axe Perfume
Crop-Image $f1 ($startX1 + 1*($colW1+$gapX1)) $r3Y1 $colW1 $rowH1 "$imgDir\flyer-010.jpg" # Dr Care Toilet
Crop-Image $f1 ($startX1 + 2*($colW1+$gapX1)) $r3Y1 $colW1 $rowH1 "$imgDir\flyer-011.jpg" # Dr Care Floor

# Image 2 (Flyer 2)
$b2 = [System.Drawing.Image]::FromFile($f2)
$W2 = $b2.Width
$H2 = $b2.Height
$b2.Dispose()
Write-Host "Flyer 2 size: $W2 x $H2"

$colW2 = [int]($W2 * 0.245)
$rowH2 = [int]($H2 * 0.355)
$gapX2 = [int]($W2 * 0.006)
$startY2 = [int]($H2 * 0.012)
$startX2 = [int]($W2 * 0.015)

# Row 1 of Flyer 2
Crop-Image $f2 ($startX2 + 0*($colW2+$gapX2)) $startY2 $colW2 $rowH2 "$imgDir\flyer-012.jpg" # Jet Max 2L
Crop-Image $f2 ($startX2 + 1*($colW2+$gapX2)) $startY2 $colW2 $rowH2 "$imgDir\flyer-013.jpg" # Vi Wash 1L
Crop-Image $f2 ($startX2 + 2*($colW2+$gapX2)) $startY2 $colW2 $rowH2 "$imgDir\flyer-014.jpg" # Fab 1L
Crop-Image $f2 ($startX2 + 3*($colW2+$gapX2)) $startY2 $colW2 $rowH2 "$imgDir\flyer-015.jpg" # Speed Jet Combo

# Row 2 of Flyer 2
$r2Y2 = [int]($startY2 + $rowH2 + ($H2 * 0.01))
Crop-Image $f2 ($startX2 + 0*($colW2+$gapX2)) $r2Y2 $colW2 $rowH2 "$imgDir\flyer-016.jpg" # Hardil Oil 1L
Crop-Image $f2 ($startX2 + 1*($colW2+$gapX2)) $r2Y2 $colW2 $rowH2 "$imgDir\flyer-017.jpg" # Vi Wash 5L
Crop-Image $f2 ($startX2 + 2*($colW2+$gapX2)) $r2Y2 $colW2 $rowH2 "$imgDir\flyer-018.jpg" # Budget 5L
Crop-Image $f2 ($startX2 + 3*($colW2+$gapX2)) $r2Y2 $colW2 $rowH2 "$imgDir\flyer-019.jpg" # Ruchi Gold 1L

# Row 3 of Flyer 2 (Sakthi Paneer)
$r3Y2 = [int]($r2Y2 + $rowH2 + ($H2 * 0.01))
$rowH2_paneer = [int]($H2 * 0.18)
Crop-Image $f2 ($startX2 + 0*($colW2+$gapX2)) $r3Y2 $colW2 $rowH2_paneer "$imgDir\flyer-020.jpg" # Sakthi Paneer

# Image 3 (Flyer 3)
$b3 = [System.Drawing.Image]::FromFile($f3)
$W3 = $b3.Width
$H3 = $b3.Height
$b3.Dispose()
Write-Host "Flyer 3 size: $W3 x $H3"

$colW3 = [int]($W3 * 0.245)
$rowH3 = [int]($H3 * 0.475)
$gapX3 = [int]($W3 * 0.006)
$startY3 = [int]($H3 * 0.005)
$startX3 = [int]($W3 * 0.012)

# Row 1 of Flyer 3
Crop-Image $f3 ($startX3 + 0*($colW3+$gapX3)) $startY3 $colW3 $rowH3 "$imgDir\flyer-021.jpg" # EC Wash Blue
Crop-Image $f3 ($startX3 + 1*($colW3+$gapX3)) $startY3 $colW3 $rowH3 "$imgDir\flyer-022.jpg" # EC Wash Lavender
Crop-Image $f3 ($startX3 + 2*($colW3+$gapX3)) $startY3 $colW3 $rowH3 "$imgDir\flyer-023.jpg" # Annachi Vermicelli
Crop-Image $f3 ($startX3 + 3*($colW3+$gapX3)) $startY3 $colW3 $rowH3 "$imgDir\flyer-024.jpg" # Boost 750g

# Row 2 of Flyer 3
$r2Y3 = [int]($startY3 + $rowH3 + ($H3 * 0.01))
Crop-Image $f3 ($startX3 + 0*($colW3+$gapX3)) $r2Y3 $colW3 $rowH3 "$imgDir\flyer-025.jpg" # Horlicks 750g
Crop-Image $f3 ($startX3 + 1*($colW3+$gapX3)) $r2Y3 $colW3 $rowH3 "$imgDir\flyer-026.jpg" # Aachi Health Mix
Crop-Image $f3 ($startX3 + 2*($colW3+$gapX3)) $r2Y3 $colW3 $rowH3 "$imgDir\flyer-027.jpg" # Fortune Atta
Crop-Image $f3 ($startX3 + 3*($colW3+$gapX3)) $r2Y3 $colW3 $rowH3 "$imgDir\flyer-028.jpg" # Milky Mist Ghee

Write-Host "All 28 flyer pictures successfully cropped and saved!"
