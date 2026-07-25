param(
    [string]$XmlPath,
    [string]$OutPath = "js/item-art-data.js"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-ItemWorksheetRows {
    param([string]$Path)

    $xml = [xml](Get-Content -LiteralPath $Path -Raw)
    $ns = [System.Xml.XmlNamespaceManager]::new($xml.NameTable)
    $ns.AddNamespace('ss', 'urn:schemas-microsoft-com:office:spreadsheet')
    return $xml.SelectNodes('//ss:Worksheet[@ss:Name="Items"]//ss:Table/ss:Row[position()>1]', $ns)
}

function Resolve-SourceXmlPath {
    param([string]$RequestedPath)

    if ($RequestedPath) {
        if (-not (Test-Path -LiteralPath $RequestedPath)) {
            throw "XML file not found: $RequestedPath"
        }
        return (Resolve-Path -LiteralPath $RequestedPath).Path
    }

    $searchRoot = 'C:\Users\Lucas\Downloads\Illustration Support Packs'
    if (-not (Test-Path -LiteralPath $searchRoot)) {
        throw "Could not find Illustration Support Packs folder at $searchRoot"
    }

    $best = Get-ChildItem -LiteralPath $searchRoot -Recurse -Filter 'Illustration_Pack_Catalog.xml' -File |
        ForEach-Object {
            $rowCount = @(Get-ItemWorksheetRows -Path $_.FullName).Count
            [pscustomobject]@{
                Path = $_.FullName
                RowCount = $rowCount
            }
        } |
        Where-Object { $_.RowCount -gt 0 } |
        Sort-Object RowCount -Descending |
        Select-Object -First 1

    if (-not $best) {
        throw "Could not locate an Illustration_Pack_Catalog.xml file with an Items worksheet."
    }

    return $best.Path
}

function Get-CellText {
    param($Row, [System.Xml.XmlNamespaceManager]$NamespaceManager, [int]$CellIndex)

    $cells = @($Row.SelectNodes('ss:Cell', $NamespaceManager))
    if ($CellIndex -ge $cells.Count) { return '' }
    $text = $cells[$CellIndex].InnerText
    if ($null -eq $text) { return '' }
    return $text.Trim()
}

$sourcePath = Resolve-SourceXmlPath -RequestedPath $XmlPath
$xml = [xml](Get-Content -LiteralPath $sourcePath -Raw)
$ns = [System.Xml.XmlNamespaceManager]::new($xml.NameTable)
$ns.AddNamespace('ss', 'urn:schemas-microsoft-com:office:spreadsheet')
$rows = @(Get-ItemWorksheetRows -Path $sourcePath)

$entries = foreach ($row in $rows) {
    $title = Get-CellText -Row $row -NamespaceManager $ns -CellIndex 0
    $artist = Get-CellText -Row $row -NamespaceManager $ns -CellIndex 1
    $pack = Get-CellText -Row $row -NamespaceManager $ns -CellIndex 2
    $notes = Get-CellText -Row $row -NamespaceManager $ns -CellIndex 3
    $imageUrl = Get-CellText -Row $row -NamespaceManager $ns -CellIndex 4

    if (-not $title -or -not $imageUrl) { continue }

    [pscustomobject]@{
        title = $title
        artist = $artist
        pack = $pack
        notes = $notes
        image_url = $imageUrl
    }
}

$entries = $entries | Sort-Object title, artist, image_url
$customItems = $entries | ForEach-Object {
    [pscustomobject]@{
        title = $_.title
        template = 'item'
        item_type = ''
        item_subtype = ''
        item_rarity = ''
        item_attunement = ''
        item_attunement_req = ''
        item_damage_dice = ''
        item_damage_type = ''
        item_range_normal = ''
        item_range_long = ''
        item_properties = @()
        item_weight = ''
        item_cost = ''
        item_description = $_.notes
        magic = $false
        creature_artwork = $_.image_url
        creature_art_credit = if ($_.artist) { "Art: $($_.artist)" } else { '' }
        custom_library_item = $true
    }
}

$json = $entries | ConvertTo-Json -Depth 4
$customJson = $customItems | ConvertTo-Json -Depth 5
$output = @(
    '/* Auto-generated from Illustration_Pack_Catalog.xml. */'
    "window.ITEM_ART_LIBRARY = $json;"
    "window.CUSTOM_ITEM_LIBRARY = $customJson;"
) -join [Environment]::NewLine

$resolvedOutPath = Join-Path (Get-Location) $OutPath
$outDir = Split-Path -Parent $resolvedOutPath
if ($outDir -and -not (Test-Path -LiteralPath $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

Set-Content -LiteralPath $resolvedOutPath -Value $output -Encoding UTF8
Write-Host "Wrote $($entries.Count) item art entries to $resolvedOutPath from $sourcePath"
