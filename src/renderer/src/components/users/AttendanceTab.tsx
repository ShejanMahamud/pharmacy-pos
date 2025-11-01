import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AddIcon from '@mui/icons-material/Add'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface User {
  id: string
  username: string
  fullName: string
}

interface AttendanceRecord {
  id: string
  userId: string
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: string
  workHours?: number
  notes?: string
}

interface AttendanceStats {
  present: number
  absent: number
  onLeave: number
  avgHours: number
}

interface AttendanceFormData {
  userId: string
  date: string
  checkIn: string
  checkOut: string
  status: string
  leaveType: string
  workHours: number
  overtime: number
  notes: string
}

interface AttendanceTabProps {
  users: User[]
  currentUser: User | null
}

export default function AttendanceTab({
  users,
  currentUser
}: AttendanceTabProps): React.JSX.Element {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [attendanceFormData, setAttendanceFormData] = useState<AttendanceFormData>({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present',
    leaveType: '',
    workHours: 0,
    overtime: 0,
    notes: ''
  })
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    present: 0,
    absent: 0,
    onLeave: 0,
    avgHours: 0
  })

  useEffect(() => {
    loadAttendance()
  }, [])

  const loadAttendance = async (): Promise<void> => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const records = await window.api.attendance.getAll({ startDate: today, endDate: today })
      setAttendanceRecords(records)

      // Calculate stats
      const present = records.filter((r) => r.status === 'present').length
      const absent = records.filter((r) => r.status === 'absent').length
      const onLeave = records.filter((r) => r.status === 'leave').length
      const totalHours = records.reduce((sum, r) => sum + (r.workHours || 0), 0)
      const avgHours = records.length > 0 ? totalHours / records.length : 0

      setAttendanceStats({ present, absent, onLeave, avgHours })
    } catch (error) {
      console.error('Failed to load attendance:', error)
      toast.error('Failed to load attendance')
    }
  }

  const handleMarkAttendance = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!currentUser) return

    try {
      await window.api.attendance.create({
        ...attendanceFormData,
        markedBy: currentUser.id
      })
      toast.success('Attendance marked successfully')
      setShowAttendanceModal(false)
      setAttendanceFormData({
        userId: '',
        date: new Date().toISOString().split('T')[0],
        checkIn: '',
        checkOut: '',
        status: 'present',
        leaveType: '',
        workHours: 0,
        overtime: 0,
        notes: ''
      })
      loadAttendance()
    } catch (error) {
      console.error('Failed to mark attendance:', error)
      toast.error('Failed to mark attendance')
    }
  }

  const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: grey[300],
      fontWeight: 600,
      fontSize: 12,
      textTransform: 'uppercase'
    }
  }))

  return (
    <Box>
      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 3
        }}
      >
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Present Today
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {attendanceStats.present}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Staff present today
              </Typography>
            </Box>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'success.main' }}>
              <CheckCircleIcon sx={{ color: 'white' }} />
            </Avatar>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Absent Today
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {attendanceStats.absent}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Staff absent today
              </Typography>
            </Box>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'error.main' }}>
              <CancelIcon sx={{ color: 'white' }} />
            </Avatar>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                On Leave
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {attendanceStats.onLeave}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Staff on leave
              </Typography>
            </Box>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'warning.main' }}>
              <EventAvailableIcon sx={{ color: 'white' }} />
            </Avatar>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Avg Work Hours
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {attendanceStats.avgHours.toFixed(1)}h
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Average hours worked
              </Typography>
            </Box>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
              <AccessTimeIcon sx={{ color: 'white' }} />
            </Avatar>
          </Box>
        </Paper>
      </Box>

      {/* Action Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Attendance Records
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAttendanceModal(true)}
        >
          Mark Attendance
        </Button>
      </Paper>

      {/* Attendance Table */}
      <Paper>
        {attendanceRecords.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <AssignmentIcon sx={{ fontSize: 64, color: grey[300], mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              No attendance records yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Start by marking today&apos;s attendance
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>User</StyledTableCell>
                  <StyledTableCell>Date</StyledTableCell>
                  <StyledTableCell>Check In</StyledTableCell>
                  <StyledTableCell>Check Out</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Work Hours</StyledTableCell>
                  <StyledTableCell>Notes</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceRecords.map((record) => {
                  const user = users.find((u) => u.id === record.userId)
                  return (
                    <TableRow key={record.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {user?.username || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(record.date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {record.checkInTime || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {record.checkOutTime || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          size="small"
                          color={
                            record.status === 'present'
                              ? 'success'
                              : record.status === 'absent'
                                ? 'error'
                                : record.status === 'leave'
                                  ? 'warning'
                                  : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {record.workHours ? `${record.workHours}h` : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {record.notes || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Mark Attendance Modal */}
      <Dialog
        open={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Mark Attendance
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Record daily attendance for staff
              </Typography>
            </Box>
            <IconButton onClick={() => setShowAttendanceModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <form onSubmit={handleMarkAttendance}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Staff Member</InputLabel>
                <Select
                  value={attendanceFormData.userId}
                  label="Staff Member"
                  onChange={(e) =>
                    setAttendanceFormData({ ...attendanceFormData, userId: e.target.value })
                  }
                >
                  <MenuItem value="">Select a staff member</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Date"
                type="date"
                value={attendanceFormData.date}
                onChange={(e) =>
                  setAttendanceFormData({ ...attendanceFormData, date: e.target.value })
                }
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={attendanceFormData.status}
                  label="Status"
                  onChange={(e) =>
                    setAttendanceFormData({ ...attendanceFormData, status: e.target.value })
                  }
                >
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="leave">On Leave</MenuItem>
                  <MenuItem value="holiday">Holiday</MenuItem>
                </Select>
              </FormControl>

              {attendanceFormData.status === 'present' && (
                <>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <TextField
                      label="Check In Time"
                      type="time"
                      value={attendanceFormData.checkIn}
                      onChange={(e) =>
                        setAttendanceFormData({ ...attendanceFormData, checkIn: e.target.value })
                      }
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Check Out Time"
                      type="time"
                      value={attendanceFormData.checkOut}
                      onChange={(e) =>
                        setAttendanceFormData({ ...attendanceFormData, checkOut: e.target.value })
                      }
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>

                  <TextField
                    label="Work Hours"
                    type="number"
                    value={attendanceFormData.workHours}
                    onChange={(e) =>
                      setAttendanceFormData({
                        ...attendanceFormData,
                        workHours: parseFloat(e.target.value) || 0
                      })
                    }
                    fullWidth
                    placeholder="8.0"
                    inputProps={{ step: 0.5, min: 0, max: 24 }}
                  />

                  <TextField
                    label="Overtime Hours"
                    type="number"
                    value={attendanceFormData.overtime}
                    onChange={(e) =>
                      setAttendanceFormData({
                        ...attendanceFormData,
                        overtime: parseFloat(e.target.value) || 0
                      })
                    }
                    fullWidth
                    placeholder="0"
                    inputProps={{ step: 0.5, min: 0 }}
                  />
                </>
              )}

              <TextField
                label="Notes (Optional)"
                value={attendanceFormData.notes}
                onChange={(e) =>
                  setAttendanceFormData({ ...attendanceFormData, notes: e.target.value })
                }
                multiline
                rows={3}
                fullWidth
                placeholder="Add any additional notes..."
              />
            </Box>
          </DialogContent>

          <Divider />

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowAttendanceModal(false)} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Mark Attendance
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
