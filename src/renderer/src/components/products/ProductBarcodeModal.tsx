import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'
import PrintIcon from '@mui/icons-material/Print'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Product } from '../../types/product'

interface ProductBarcodeModalProps {
  isOpen: boolean
  product: Product | null
  currencySymbol: string
  onClose: () => void
}

type BarcodeSize = 'small' | 'medium' | 'large'
type PrinterType = 'laser' | 'barcode'
type LayoutOption = 'a4-32' | 'a4-24' | 'a4-16' | 'a4-12'

export default function ProductBarcodeModal({
  isOpen,
  product,
  currencySymbol,
  onClose
}: ProductBarcodeModalProps): React.JSX.Element | null {
  const svgRef = useRef<SVGSVGElement>(null)
  const [barcodeSize, setBarcodeSize] = useState<BarcodeSize>('medium')
  const [printerType, setPrinterType] = useState<PrinterType>('laser')
  const [layoutOption, setLayoutOption] = useState<LayoutOption>('a4-32')
  const [showProductName, setShowProductName] = useState(true)
  const [showPrice, setShowPrice] = useState(true)
  const [barcodeGenerated, setBarcodeGenerated] = useState(false)

  // Reset barcode state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setBarcodeGenerated(false)
      if (svgRef.current) {
        // Clear SVG content
        svgRef.current.innerHTML = ''
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && product && product.barcode) {
      // Reset state at start
      setBarcodeGenerated(false)

      // Wait for SVG to be in DOM
      const generateBarcode = async () => {
        // Wait for next tick to ensure SVG is mounted
        await new Promise((resolve) => setTimeout(resolve, 50))

        if (!svgRef.current) {
          console.log('SVG ref not ready')
          return
        }

        try {
          console.log('=== Barcode Generation Debug ===')
          console.log('Product:', product.name)
          console.log('Barcode value:', product.barcode)
          console.log('Barcode length:', product.barcode.length)
          console.log('SVG element:', svgRef.current)

          // Dynamically import JsBarcode
          const barcodeModule = await import('jsbarcode')
          // JsBarcode could be default export or the module itself
          const JsBarcode = barcodeModule.default || barcodeModule

          console.log('JsBarcode module:', barcodeModule)
          console.log('JsBarcode function:', JsBarcode)
          console.log('JsBarcode type:', typeof JsBarcode)

          if (!svgRef.current) {
            console.log('SVG ref lost during async operation')
            return
          }

          if (typeof JsBarcode !== 'function') {
            console.error('JsBarcode is not a function:', JsBarcode)
            toast.error('Barcode library not loaded correctly')
            return
          }

          // Validate barcode format
          let barcodeFormat = 'CODE128' // Default fallback
          if (/^\d{13}$/.test(product.barcode)) {
            barcodeFormat = 'EAN13'
          } else if (/^\d{12}$/.test(product.barcode)) {
            barcodeFormat = 'EAN13'
          } else if (/^\d{8}$/.test(product.barcode)) {
            barcodeFormat = 'EAN8'
          }

          console.log('Using barcode format:', barcodeFormat)

          JsBarcode(svgRef.current, product.barcode, {
            format: barcodeFormat,
            width: barcodeSize === 'small' ? 1.5 : barcodeSize === 'medium' ? 2 : 3,
            height: barcodeSize === 'small' ? 40 : barcodeSize === 'medium' ? 60 : 80,
            displayValue: true,
            fontSize: barcodeSize === 'small' ? 14 : barcodeSize === 'medium' ? 16 : 20,
            margin: 10,
            background: '#ffffff',
            lineColor: '#000000',
            valid: (valid) => {
              if (!valid) {
                console.error('Barcode validation failed')
              } else {
                console.log('Barcode validation passed')
              }
            }
          })

          // Wait a bit to ensure rendering is complete
          await new Promise((resolve) => setTimeout(resolve, 50))
          setBarcodeGenerated(true)
          console.log('✓ Barcode generated successfully')
        } catch (error) {
          console.error('Error generating barcode:', error)
          if (error instanceof Error) {
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
            toast.error(`Failed to generate barcode: ${error.message}`)
          } else {
            toast.error('Failed to generate barcode')
          }
          setBarcodeGenerated(false)
        }
      }

      generateBarcode()
    } else {
      console.log('Barcode generation skipped:', {
        isOpen,
        hasProduct: !!product,
        hasBarcode: !!product?.barcode,
        hasSVG: !!svgRef.current
      })
      setBarcodeGenerated(false)
    }
  }, [isOpen, product, barcodeSize])

  if (!product) return null

  const handleDownload = (): void => {
    if (!svgRef.current) return

    try {
      // Convert SVG to PNG and download
      const svgData = new XMLSerializer().serializeToString(svgRef.current)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const img = new Image()
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      img.onload = () => {
        const padding = 20
        const textHeight = showProductName ? 30 : 0
        const priceHeight = showPrice ? 30 : 0

        canvas.width = img.width + padding * 2
        canvas.height = img.height + padding * 2 + textHeight + priceHeight

        // White background
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        let yOffset = padding

        // Draw product name
        if (showProductName) {
          ctx.fillStyle = 'black'
          ctx.font = 'bold 16px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(
            product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name,
            canvas.width / 2,
            yOffset + 18
          )
          yOffset += textHeight
        }

        // Draw barcode
        ctx.drawImage(img, padding, yOffset)
        yOffset += img.height

        // Draw price
        if (showPrice) {
          ctx.fillStyle = 'black'
          ctx.font = 'bold 18px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(
            `${currencySymbol}${product.sellingPrice.toFixed(2)}`,
            canvas.width / 2,
            yOffset + 20
          )
        }

        // Download
        canvas.toBlob((blob) => {
          if (!blob) return
          const downloadUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = `barcode-${product.sku}.png`
          link.href = downloadUrl
          link.click()
          URL.revokeObjectURL(downloadUrl)
          URL.revokeObjectURL(url)
          toast.success('Barcode downloaded successfully')
        })
      }

      img.src = url
    } catch (error) {
      console.error('Error downloading barcode:', error)
      toast.error('Failed to download barcode')
    }
  }

  const handlePrint = (): void => {
    if (printerType === 'laser') {
      handlePrintA4()
    } else {
      handlePrintBarcode()
    }
  }

  const handlePrintA4 = (): void => {
    try {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast.error('Please allow pop-ups to print')
        return
      }

      const labelsPerPage = parseInt(layoutOption.split('-')[1])
      const columns = labelsPerPage === 12 ? 3 : 4
      const rows = labelsPerPage / columns

      // Get SVG as data URL
      const svgData = svgRef.current ? new XMLSerializer().serializeToString(svgRef.current) : ''
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)

      // Generate label HTML
      const labelHTML = `
        <div class="label">
          ${showProductName ? `<div class="product-name">${product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name}</div>` : ''}
          <img src="${svgUrl}" alt="Barcode" class="barcode-img" />
          ${showPrice ? `<div class="price">${currencySymbol}${product.sellingPrice.toFixed(2)}</div>` : ''}
        </div>
      `

      const labels = Array(labelsPerPage).fill(labelHTML).join('')

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Barcode Labels</title>
            <style>
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
              }
              .label-container {
                display: grid;
                grid-template-columns: repeat(${columns}, 1fr);
                grid-template-rows: repeat(${rows}, 1fr);
                gap: 5mm;
                width: 100%;
                height: 100vh;
              }
              .label {
                border: 1px dashed #ccc;
                padding: 5mm;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                page-break-inside: avoid;
              }
              .product-name {
                font-size: 10px;
                font-weight: bold;
                margin-bottom: 3mm;
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .barcode-img {
                max-width: 90%;
                height: auto;
              }
              .price {
                font-size: 14px;
                font-weight: bold;
                margin-top: 2mm;
              }
              @media print {
                body {
                  print-color-adjust: exact;
                  -webkit-print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="label-container">
              ${labels}
            </div>
          </body>
        </html>
      `)

      printWindow.document.close()
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 250)
      }

      toast.success('Print dialog opened')
    } catch (error) {
      console.error('Error printing:', error)
      toast.error('Failed to print barcodes')
    }
  }

  const handlePrintBarcode = (): void => {
    try {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast.error('Please allow pop-ups to print')
        return
      }

      // Get SVG as data URL
      const svgData2 = svgRef.current ? new XMLSerializer().serializeToString(svgRef.current) : ''
      const svgBlob2 = new Blob([svgData2], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl2 = URL.createObjectURL(svgBlob2)

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Barcode</title>
            <style>
              @page {
                size: 57mm 32mm;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 5mm;
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
              }
              .product-name {
                font-size: 8px;
                font-weight: bold;
                margin-bottom: 2mm;
              }
              .barcode-img {
                max-width: 100%;
                height: auto;
              }
              .price {
                font-size: 10px;
                font-weight: bold;
                margin-top: 2mm;
              }
            </style>
          </head>
          <body>
            ${showProductName ? `<div class="product-name">${product.name}</div>` : ''}
            <img src="${svgUrl2}" alt="Barcode" class="barcode-img" />
            ${showPrice ? `<div class="price">${currencySymbol}${product.sellingPrice.toFixed(2)}</div>` : ''}
          </body>
        </html>
      `)

      printWindow.document.close()
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 250)
      }

      toast.success('Print dialog opened')
    } catch (error) {
      console.error('Error printing:', error)
      toast.error('Failed to print barcode')
    }
  }

  const getSizeLabel = (size: BarcodeSize): string => {
    switch (size) {
      case 'small':
        return 'Small (40mm)'
      case 'medium':
        return 'Medium (60mm)'
      case 'large':
        return 'Large (80mm)'
    }
  }

  const getLayoutLabel = (layout: LayoutOption): string => {
    switch (layout) {
      case 'a4-32':
        return 'A4 - 32 Labels per Page'
      case 'a4-24':
        return 'A4 - 24 Labels per Page'
      case 'a4-16':
        return 'A4 - 16 Labels per Page'
      case 'a4-12':
        return 'A4 - 12 Labels per Page'
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Product Barcode
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Product Info */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {product.name}
          </Typography>

          {/* Barcode Preview */}
          <Box
            sx={{
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 3,
              mb: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 150
            }}
          >
            {product.barcode ? (
              <>
                {showProductName && (
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    {product.name.length > 30
                      ? product.name.substring(0, 30) + '...'
                      : product.name}
                  </Typography>
                )}
                <svg
                  ref={svgRef}
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
                {!barcodeGenerated && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Generating barcode...
                  </Typography>
                )}
                {showPrice && (
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
                    {currencySymbol}
                    {product.sellingPrice.toFixed(2)}
                  </Typography>
                )}
              </>
            ) : (
              <Typography color="error">No barcode available for this product</Typography>
            )}
          </Box>

          {product.barcode && (
            <Typography variant="body2" color="text.secondary">
              Barcode: {product.barcode}
            </Typography>
          )}
        </Box>

        {product.barcode && (
          <>
            {/* Print Configuration */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Print Configuration
            </Typography>

            {/* Barcode Size */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Barcode Size</InputLabel>
              <Select
                value={barcodeSize}
                label="Barcode Size"
                onChange={(e) => setBarcodeSize(e.target.value as BarcodeSize)}
              >
                <MenuItem value="small">{getSizeLabel('small')}</MenuItem>
                <MenuItem value="medium">{getSizeLabel('medium')}</MenuItem>
                <MenuItem value="large">{getSizeLabel('large')}</MenuItem>
              </Select>
            </FormControl>

            {/* Printer Type */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Printer Type
              </Typography>
              <RadioGroup
                value={printerType}
                onChange={(e) => setPrinterType(e.target.value as PrinterType)}
              >
                <FormControlLabel value="laser" control={<Radio />} label="Laser/Inkjet Printer" />
                <FormControlLabel value="barcode" control={<Radio />} label="Barcode Printer" />
              </RadioGroup>
            </Box>

            {/* Layout Options (only for laser/inkjet) */}
            {printerType === 'laser' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Layout Options</InputLabel>
                <Select
                  value={layoutOption}
                  label="Layout Options"
                  onChange={(e) => setLayoutOption(e.target.value as LayoutOption)}
                >
                  <MenuItem value="a4-32">{getLayoutLabel('a4-32')}</MenuItem>
                  <MenuItem value="a4-24">{getLayoutLabel('a4-24')}</MenuItem>
                  <MenuItem value="a4-16">{getLayoutLabel('a4-16')}</MenuItem>
                  <MenuItem value="a4-12">{getLayoutLabel('a4-12')}</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* Label Content */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Label Content
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showProductName}
                    onChange={(e) => setShowProductName(e.target.checked)}
                  />
                }
                label="Show Product Name"
              />
              <FormControlLabel
                control={
                  <Checkbox checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} />
                }
                label="Show Price"
              />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {product.barcode && (
          <>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ textTransform: 'none' }}
            >
              Print {printerType === 'laser' ? layoutOption.split('-')[1] : ''}
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ textTransform: 'none' }}
            >
              Download PDF
            </Button>
          </>
        )}
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
