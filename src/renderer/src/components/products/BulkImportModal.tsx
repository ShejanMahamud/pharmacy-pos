import CloseIcon from '@mui/icons-material/Close'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DownloadIcon from '@mui/icons-material/Download'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Tab,
  Tabs,
  Typography
} from '@mui/material'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { generateUniqueBarcode } from '../../utils/barcodeGenerator'

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

export default function BulkImportModal({
  isOpen,
  onClose,
  onImportComplete
}: BulkImportModalProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (activeTab === 0 && fileExtension !== 'csv') {
        toast.error('Please select a CSV file')
        return
      }
      if (activeTab === 1 && fileExtension !== 'json') {
        toast.error('Please select a JSON file')
        return
      }
      setSelectedFile(file)
      setImportResult(null)
    }
  }

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split('\n').filter((line) => line.trim())
    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid')
    }

    const headers = lines[0].split(',').map((h) => h.trim())
    const products: Record<string, string>[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim())
      if (values.length !== headers.length) continue

      const product: Record<string, string> = {}
      headers.forEach((header, index) => {
        product[header] = values[index]
      })
      products.push(product)
    }

    return products
  }

  const validateAndTransformProduct = (
    data: Record<string, string | number | boolean>
  ): Record<string, string | number | boolean | null> => {
    // Required fields validation
    if (!data.name || !data.sku) {
      throw new Error(`Missing required fields: name and sku are required`)
    }

    // Generate barcode if not provided
    const barcode = data.barcode || generateUniqueBarcode()

    return {
      name: data.name,
      genericName: data.genericName || data.generic_name || null,
      barcode: barcode,
      sku: data.sku,
      categoryId: data.categoryId || data.category_id || null,
      supplierId: data.supplierId || data.supplier_id || null,
      description: data.description || null,
      manufacturer: data.manufacturer || null,
      unit: data.unit || 'tablet',
      unitsPerPackage: parseInt(String(data.unitsPerPackage || data.units_per_package || '1')),
      packageUnit: data.packageUnit || data.package_unit || null,
      shelf: data.shelf || 'A1',
      imageUrl: data.imageUrl || data.image_url || null,
      prescriptionRequired:
        data.prescriptionRequired === 'true' || data.prescription_required === 'true' || false,
      reorderLevel: parseInt(String(data.reorderLevel || data.reorder_level || '10')),
      sellingPrice: parseFloat(String(data.sellingPrice || data.selling_price || '0')),
      costPrice: parseFloat(String(data.costPrice || data.cost_price || '0')),
      taxRate: parseFloat(String(data.taxRate || data.tax_rate || '0')),
      discountPercent: parseFloat(String(data.discountPercent || data.discount_percent || '0')),
      stockQuantity: parseInt(String(data.stockQuantity || data.stock_quantity || '0')),
      isActive: true
    }
  }

  const handleImport = async (): Promise<void> => {
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    setImporting(true)
    setImportResult(null)

    try {
      const text = await selectedFile.text()
      let rawData: Record<string, string | number | boolean>[]

      // Parse based on file type
      if (activeTab === 0) {
        // CSV
        rawData = parseCSV(text)
      } else {
        // JSON
        const parsedData = JSON.parse(text)
        if (!Array.isArray(parsedData)) {
          throw new Error('JSON file must contain an array of products')
        }
        rawData = parsedData
      }

      if (rawData.length === 0) {
        toast.error('No products found in file')
        setImporting(false)
        return
      }

      let successCount = 0
      let failedCount = 0
      const errors: string[] = []

      // Import products one by one
      for (let i = 0; i < rawData.length; i++) {
        try {
          const productData = validateAndTransformProduct(rawData[i])

          // Create product
          const newProduct = await window.api.products.create(productData)

          // Create initial inventory record
          const stockQty =
            typeof productData.stockQuantity === 'number'
              ? productData.stockQuantity
              : parseInt(String(productData.stockQuantity))
          if (stockQty > 0) {
            await window.api.inventory.updateQuantity(newProduct.id, stockQty)
          }

          successCount++
        } catch (error) {
          failedCount++
          let errorMsg = error instanceof Error ? error.message : 'Unknown error'

          // Make error messages more user-friendly
          if (errorMsg.includes('UNIQUE constraint failed: products.sku')) {
            errorMsg = `Duplicate SKU "${rawData[i].sku}" - Product already exists`
          } else if (errorMsg.includes('UNIQUE constraint failed: products.barcode')) {
            errorMsg = `Duplicate barcode "${rawData[i].barcode}" - Already in use`
          }

          errors.push(`Row ${i + 1}: ${errorMsg}`)
        }
      }

      setImportResult({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10) // Show first 10 errors
      })

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} products`)
        onImportComplete()
      }

      if (failedCount > 0) {
        toast.error(`Failed to import ${failedCount} products`)
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to import products')
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = (): void => {
    const template = activeTab === 0 ? generateCSVTemplate() : generateJSONTemplate()
    const blob = new Blob([template], { type: activeTab === 0 ? 'text/csv' : 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `products-template.${activeTab === 0 ? 'csv' : 'json'}`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Template downloaded successfully')
  }

  const generateCSVTemplate = (): string => {
    const headers = [
      'name',
      'generic_name',
      'sku',
      'barcode',
      'category_id',
      'supplier_id',
      'manufacturer',
      'unit',
      'units_per_package',
      'package_unit',
      'shelf',
      'prescription_required',
      'reorder_level',
      'selling_price',
      'cost_price',
      'tax_rate',
      'discount_percent',
      'stock_quantity',
      'description'
    ]

    const example = [
      'Paracetamol 500mg',
      'Acetaminophen',
      'PRD00001',
      '1234567890123',
      '',
      '',
      'GSK',
      'tablet',
      '10',
      'strip',
      'A1',
      'false',
      '10',
      '2.50',
      '1.50',
      '0',
      '0',
      '100',
      'Pain relief medication'
    ]

    return headers.join(',') + '\n' + example.join(',')
  }

  const generateJSONTemplate = (): string => {
    const template = [
      {
        name: 'Paracetamol 500mg',
        generic_name: 'Acetaminophen',
        sku: 'PRD00001',
        barcode: '1234567890123',
        category_id: '',
        supplier_id: '',
        manufacturer: 'GSK',
        unit: 'tablet',
        units_per_package: 10,
        package_unit: 'strip',
        shelf: 'A1',
        prescription_required: false,
        reorder_level: 10,
        selling_price: 2.5,
        cost_price: 1.5,
        tax_rate: 0,
        discount_percent: 0,
        stock_quantity: 100,
        description: 'Pain relief medication'
      }
    ]

    return JSON.stringify(template, null, 2)
  }

  const handleClose = (): void => {
    setSelectedFile(null)
    setImportResult(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Bulk Import Products
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => {
              setActiveTab(newValue)
              setSelectedFile(null)
            }}
          >
            <Tab label="CSV Import" />
            <Tab label="JSON Import" />
          </Tabs>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Required fields:</strong> name, sku
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Optional fields:</strong> generic_name, barcode (auto-generated if empty),
            category_id, supplier_id, manufacturer, unit, shelf, prices, stock, etc.
          </Typography>
          <Typography variant="body2" color="warning.main">
            <strong>Note:</strong> Products with duplicate SKU or barcode will be skipped
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
            fullWidth
          >
            Download {activeTab === 0 ? 'CSV' : 'JSON'} Template
          </Button>
        </Box>

        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            mb: 3,
            bgcolor: 'background.default'
          }}
        >
          <input
            type="file"
            accept={activeTab === 0 ? '.csv' : '.json'}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="bulk-import-file"
          />
          <label htmlFor="bulk-import-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              size="large"
            >
              Select {activeTab === 0 ? 'CSV' : 'JSON'} File
            </Button>
          </label>

          {selectedFile && (
            <Box sx={{ mt: 2 }}>
              <Chip
                label={selectedFile.name}
                onDelete={() => setSelectedFile(null)}
                color="primary"
              />
            </Box>
          )}
        </Box>

        {importing && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Importing products...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {importResult && (
          <Box sx={{ mb: 2 }}>
            <Alert severity={importResult.failed === 0 ? 'success' : 'warning'}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Import Complete
              </Typography>
              <Typography variant="body2">
                ✓ Successfully imported: {importResult.success} products
              </Typography>
              {importResult.failed > 0 && (
                <>
                  <Typography variant="body2" color="error">
                    ✗ Failed: {importResult.failed} products
                  </Typography>
                  {importResult.errors.length > 0 && (
                    <Box sx={{ mt: 1, maxHeight: 150, overflow: 'auto' }}>
                      {importResult.errors.map((error, index) => (
                        <Typography key={index} variant="caption" display="block" color="error">
                          • {error}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </>
              )}
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={importing}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!selectedFile || importing}
          startIcon={<CloudUploadIcon />}
        >
          Import Products
        </Button>
      </DialogActions>
    </Dialog>
  )
}
