import { CheckCircle, CloudDownload, CloudUpload } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography
} from '@mui/material'

interface BackupRestoreSectionProps {
  loading: boolean
  onBackup: () => Promise<void>
  onRestore: () => Promise<void>
}

export default function BackupRestoreSection({
  loading,
  onBackup,
  onRestore
}: BackupRestoreSectionProps): React.JSX.Element {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight="semibold" gutterBottom>
          Database Backup & Restore
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create backups of your database and restore from previous backups
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Backup Section */}
        <Paper sx={{ p: 3, bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'primary.main',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <CloudDownload sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="semibold" gutterBottom>
                Create Backup
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Download a complete backup of your pharmacy database. This includes all products,
                sales, purchases, customers, and other important data.
              </Typography>
              <Button
                onClick={onBackup}
                disabled={loading}
                variant="contained"
                startIcon={
                  loading ? <CircularProgress size={20} color="inherit" /> : <CloudDownload />
                }
              >
                {loading ? 'Creating Backup...' : 'Create Backup'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Restore Section */}
        <Paper sx={{ p: 3, bgcolor: 'error.50', border: 1, borderColor: 'error.200' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'error.main',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <CloudUpload sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="semibold" gutterBottom>
                Restore Backup
              </Typography>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Warning
                </Typography>
                <Typography variant="caption">
                  Restoring a backup will replace ALL current data with the backup data. A backup of
                  your current database will be created automatically before restoring. The
                  application will restart after restoration.
                </Typography>
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select a backup file to restore your database to a previous state.
              </Typography>
              <Button
                onClick={onRestore}
                disabled={loading}
                variant="contained"
                color="error"
                startIcon={
                  loading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />
                }
              >
                {loading ? 'Restoring...' : 'Restore Backup'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Best Practices */}
        <Paper sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="semibold" gutterBottom>
            Best Practices
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle sx={{ color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="Create regular backups daily or weekly depending on your business activity"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle sx={{ color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="Store backup files in a secure location (external drive, cloud storage)"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle sx={{ color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="Test your backups periodically to ensure they can be restored successfully"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle sx={{ color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="Keep multiple backup versions to have restore options from different time periods"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Paper>
  )
}
