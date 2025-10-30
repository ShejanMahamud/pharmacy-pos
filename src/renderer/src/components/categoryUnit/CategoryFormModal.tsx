import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { Category, CategoryFormData } from '../../types/categoryUnit'

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
  formData: CategoryFormData
  onFormDataChange: (data: CategoryFormData) => void
  onSubmit: () => void
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  category,
  formData,
  onFormDataChange,
  onSubmit
}: CategoryFormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
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
            {category ? 'Update' : 'Add'} Category
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
