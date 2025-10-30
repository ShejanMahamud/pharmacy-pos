import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material'
import { Unit, UnitFormData } from '../../types/categoryUnit'

interface UnitFormModalProps {
  isOpen: boolean
  onClose: () => void
  unit: Unit | null
  formData: UnitFormData
  onFormDataChange: (data: UnitFormData) => void
  onSubmit: () => void
}

export default function UnitFormModal({
  isOpen,
  onClose,
  unit,
  formData,
  onFormDataChange,
  onSubmit
}: UnitFormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{unit ? 'Edit Unit' : 'Add New Unit'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Abbreviation"
            value={formData.abbreviation}
            onChange={(e) => onFormDataChange({ ...formData, abbreviation: e.target.value })}
            required
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) =>
                onFormDataChange({ ...formData, type: e.target.value as 'base' | 'package' })
              }
              label="Type"
            >
              <MenuItem value="base">Base Unit</MenuItem>
              <MenuItem value="package">Package Unit</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {unit ? 'Update' : 'Add'} Unit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
