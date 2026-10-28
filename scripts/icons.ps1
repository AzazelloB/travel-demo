Add-Type -AssemblyName System.Drawing
foreach ($iconSize in @(192, 512)) {
  $bitmap = [System.Drawing.Bitmap]::new($iconSize, $iconSize)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#354737'))
  $scale = $iconSize / 512.0
  $graphics.ScaleTransform($scale, $scale)
  $pen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#f3f2e7'), 19)
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $points = [System.Drawing.PointF[]]@([System.Drawing.PointF]::new(78,359),[System.Drawing.PointF]::new(197,149),[System.Drawing.PointF]::new(268,273),[System.Drawing.PointF]::new(317,191),[System.Drawing.PointF]::new(434,359),[System.Drawing.PointF]::new(78,359))
  $graphics.DrawLines($pen,$points)
  $pen.Width=13
  $graphics.DrawLines($pen,[System.Drawing.PointF[]]@([System.Drawing.PointF]::new(163,211),[System.Drawing.PointF]::new(197,246),[System.Drawing.PointF]::new(229,211)))
  $graphics.DrawLines($pen,[System.Drawing.PointF[]]@([System.Drawing.PointF]::new(292,232),[System.Drawing.PointF]::new(317,259),[System.Drawing.PointF]::new(342,232)))
  $bitmap.Save((Join-Path $PSScriptRoot "../public/icon-$iconSize.png"),[System.Drawing.Imaging.ImageFormat]::Png)
  $pen.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}
