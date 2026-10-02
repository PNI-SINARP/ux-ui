
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile("C:\Users\Paula\.gemini\antigravity\brain\90032ea8-a288-42e7-8f21-763a4b65ae04\.user_uploaded\media_1789492168571.png")
$dict = @{}
for($y=0; $y -lt $img.Height; $y+=5){
    for($x=0; $x -lt $img.Width; $x+=5){
        $p = $img.GetPixel($x,$y)
        $hex = "#{0:X2}{1:X2}{2:X2}" -f $p.R, $p.G, $p.B
        $dict[$hex] = [int]$dict[$hex] + 1
    }
}
$dict.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 30

