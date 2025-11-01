import AddIcon from '@mui/icons-material/Add'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CloseIcon from '@mui/icons-material/Close'
import MoneyOffIcon from '@mui/icons-material/MoneyOff'
import PaymentIcon from '@mui/icons-material/Payment'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import PeopleIcon from '@mui/icons-material/People'
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

interface Salary {
  id: string
  userId: string
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  paymentFrequency: string
  effectiveFrom: string
}

interface SalaryPayment {
  id: string
  userId: string
  periodStart: string
  periodEnd: string
  netAmount: number
  paymentDate: string
  paymentMethod: string
  status: string
}

interface SalaryStats {
  totalEmployees: number
  monthlyPayroll: number
  paidThisMonth: number
  pendingPayments: number
}

interface SalaryFormData {
  userId: string
  basicSalary: number
  allowances: number
  deductions: number
  paymentFrequency: string
  bankAccountNumber: string
  bankName: string
  notes: string
  effectiveFrom: string
}

interface PaymentFormData {
  userId: string
  salaryId: string
  paymentDate: string
  payPeriodStart: string
  payPeriodEnd: string
  basicAmount: number
  allowances: number
  deductions: number
  bonuses: number
  paymentMethod: string
  accountId: string
  transactionReference: string
  notes: string
}

interface SalaryTabProps {
  users: User[]
  currentUser: User | null
}

export default function SalaryTab({ users, currentUser }: SalaryTabProps): React.JSX.Element {
  const [salaries, setSalaries] = useState<Salary[]>([])
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([])
  const [showSalaryModal, setShowSalaryModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [salaryFormData, setSalaryFormData] = useState<SalaryFormData>({
    userId: '',
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    paymentFrequency: 'monthly',
    bankAccountNumber: '',
    bankName: '',
    notes: '',
    effectiveFrom: new Date().toISOString().split('T')[0]
  })
  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({
    userId: '',
    salaryId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    payPeriodStart: '',
    payPeriodEnd: '',
    basicAmount: 0,
    allowances: 0,
    deductions: 0,
    bonuses: 0,
    paymentMethod: 'bank_transfer',
    accountId: '',
    transactionReference: '',
    notes: ''
  })
  const [salaryStats, setSalaryStats] = useState<SalaryStats>({
    totalEmployees: 0,
    monthlyPayroll: 0,
    paidThisMonth: 0,
    pendingPayments: 0
  })

  useEffect(() => {
    loadSalaries()
  }, [users])

  const loadSalaries = async (): Promise<void> => {
    try {
      const [salariesData, paymentsData] = await Promise.all([
        window.api.salaries.getAll(),
        window.api.salaryPayments.getAll()
      ])

      setSalaries(salariesData)
      setSalaryPayments(paymentsData)

      // Calculate stats
      const totalEmployees = users.length
      const monthlyPayroll = salariesData.reduce(
        (sum, s) => sum + (s.paymentFrequency === 'monthly' ? s.netSalary : 0),
        0
      )

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const paidThisMonth = paymentsData
        .filter((p) => {
          const paymentDate = new Date(p.paymentDate)
          return (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear &&
            p.status === 'paid'
          )
        })
        .reduce((sum, p) => sum + p.netAmount, 0)

      const pendingPayments = paymentsData
        .filter((p) => p.status === 'pending')
        .reduce((sum, p) => sum + p.netAmount, 0)

      setSalaryStats({ totalEmployees, monthlyPayroll, paidThisMonth, pendingPayments })
    } catch (error) {
      console.error('Failed to load salaries:', error)
      toast.error('Failed to load salaries')
    }
  }

  const handleAddSalary = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!currentUser) return

    try {
      await window.api.salaries.create({
        ...salaryFormData,
        createdBy: currentUser.id
      })
      toast.success('Salary added successfully')
      setShowSalaryModal(false)
      setSalaryFormData({
        userId: '',
        basicSalary: 0,
        allowances: 0,
        deductions: 0,
        paymentFrequency: 'monthly',
        bankAccountNumber: '',
        bankName: '',
        notes: '',
        effectiveFrom: new Date().toISOString().split('T')[0]
      })
      loadSalaries()
    } catch (error) {
      console.error('Failed to add salary:', error)
      toast.error('Failed to add salary')
    }
  }

  const handleProcessPayment = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!currentUser) return

    try {
      await window.api.salaryPayments.create({
        ...paymentFormData,
        paidBy: currentUser.id
      })
      toast.success('Payment processed successfully')
      setShowPaymentModal(false)
      setPaymentFormData({
        userId: '',
        salaryId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        payPeriodStart: '',
        payPeriodEnd: '',
        basicAmount: 0,
        allowances: 0,
        deductions: 0,
        bonuses: 0,
        paymentMethod: 'bank_transfer',
        accountId: '',
        transactionReference: '',
        notes: ''
      })
      loadSalaries()
    } catch (error) {
      console.error('Failed to process payment:', error)
      toast.error('Failed to process payment')
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
                Total Employees
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {users.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Active staff members
              </Typography>
            </Box>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
              <PeopleIcon sx={{ color: 'white' }} />
            </Avatar>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Monthly Payroll
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                ${salaryStats.monthlyPayroll.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Total monthly expense
              </Typography>
            </Box>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'success.main' }}>
              <AttachMoneyIcon sx={{ color: 'white' }} />
            </Avatar>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Paid This Month
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                ${salaryStats.paidThisMonth.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Completed payments
              </Typography>
            </Box>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'secondary.main' }}>
              <PaymentIcon sx={{ color: 'white' }} />
            </Avatar>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Pending Payments
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                ${salaryStats.pendingPayments.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Awaiting payment
              </Typography>
            </Box>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'warning.main' }}>
              <PendingActionsIcon sx={{ color: 'white' }} />
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
          Salary Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowSalaryModal(true)}
        >
          Add Salary
        </Button>
      </Paper>
      {/* Salary Configurations Table */}
      {salaries.length === 0 ? (
        <Paper>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <MoneyOffIcon sx={{ fontSize: 64, color: grey[300], mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              No salary records yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add salary information for employees to get started
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Salary Configurations */}
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Salary Configurations
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Employee</StyledTableCell>
                    <StyledTableCell>Basic Salary</StyledTableCell>
                    <StyledTableCell>Allowances</StyledTableCell>
                    <StyledTableCell>Deductions</StyledTableCell>
                    <StyledTableCell>Net Salary</StyledTableCell>
                    <StyledTableCell>Frequency</StyledTableCell>
                    <StyledTableCell>Effective From</StyledTableCell>
                    <StyledTableCell>Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salaries.map((salary) => {
                    const user = users.find((u) => u.id === salary.userId)
                    return (
                      <TableRow key={salary.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user?.fullName || 'Unknown'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            ${salary.basicSalary.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="success.main">
                            +${salary.allowances.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="error.main">
                            -${salary.deductions.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${salary.netSalary.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={salary.paymentFrequency} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(salary.effectiveFrom).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="success"
                            onClick={() => {
                              setPaymentFormData({
                                ...paymentFormData,
                                salaryId: salary.id,
                                userId: salary.userId,
                                basicAmount: salary.basicSalary,
                                allowances: salary.allowances,
                                deductions: salary.deductions
                              })
                              setShowPaymentModal(true)
                            }}
                          >
                            Process Payment
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Payment History */}
          {salaryPayments.length > 0 && (
            <Paper>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Payment History
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Employee</StyledTableCell>
                      <StyledTableCell>Period</StyledTableCell>
                      <StyledTableCell>Amount</StyledTableCell>
                      <StyledTableCell>Payment Date</StyledTableCell>
                      <StyledTableCell>Method</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salaryPayments.map((payment) => {
                      const user = users.find((u) => u.id === payment.userId)
                      return (
                        <TableRow key={payment.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {user?.fullName || 'Unknown'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(payment.periodStart).toLocaleDateString()} -{' '}
                              {new Date(payment.periodEnd).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ${payment.netAmount.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {payment.paymentMethod}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={payment.status}
                              size="small"
                              color={
                                payment.status === 'paid'
                                  ? 'success'
                                  : payment.status === 'pending'
                                    ? 'warning'
                                    : 'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      )}

      {/* Salary Modal - Add Salary Configuration */}
      <Dialog
        open={showSalaryModal}
        onClose={() => setShowSalaryModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Add Salary Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Set up salary details for an employee
              </Typography>
            </Box>
            <IconButton onClick={() => setShowSalaryModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            onSubmit={handleAddSalary}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <FormControl fullWidth required>
              <InputLabel>Employee</InputLabel>
              <Select
                value={salaryFormData.userId}
                onChange={(e) => setSalaryFormData({ ...salaryFormData, userId: e.target.value })}
                label="Employee"
              >
                <MenuItem value="">Select an employee</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
            >
              <TextField
                label="Basic Salary"
                type="number"
                value={salaryFormData.basicSalary}
                onChange={(e) =>
                  setSalaryFormData({
                    ...salaryFormData,
                    basicSalary: parseFloat(e.target.value) || 0
                  })
                }
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                placeholder="5000.00"
                required
                fullWidth
              />

              <TextField
                label="Allowances"
                type="number"
                value={salaryFormData.allowances}
                onChange={(e) =>
                  setSalaryFormData({
                    ...salaryFormData,
                    allowances: parseFloat(e.target.value) || 0
                  })
                }
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                placeholder="500.00"
                fullWidth
              />
            </Box>

            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
            >
              <TextField
                label="Deductions"
                type="number"
                value={salaryFormData.deductions}
                onChange={(e) =>
                  setSalaryFormData({
                    ...salaryFormData,
                    deductions: parseFloat(e.target.value) || 0
                  })
                }
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                placeholder="200.00"
                fullWidth
              />

              <FormControl fullWidth required>
                <InputLabel>Payment Frequency</InputLabel>
                <Select
                  value={salaryFormData.paymentFrequency}
                  onChange={(e) =>
                    setSalaryFormData({ ...salaryFormData, paymentFrequency: e.target.value })
                  }
                  label="Payment Frequency"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="bi-weekly">Bi-weekly</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Paper
              sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Net Salary:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  $
                  {(
                    salaryFormData.basicSalary +
                    salaryFormData.allowances -
                    salaryFormData.deductions
                  ).toFixed(2)}
                </Typography>
              </Box>
            </Paper>

            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
            >
              <TextField
                label="Bank Name"
                type="text"
                value={salaryFormData.bankName}
                onChange={(e) => setSalaryFormData({ ...salaryFormData, bankName: e.target.value })}
                placeholder="Bank of America"
                fullWidth
              />

              <TextField
                label="Account Number"
                type="text"
                value={salaryFormData.bankAccountNumber}
                onChange={(e) =>
                  setSalaryFormData({ ...salaryFormData, bankAccountNumber: e.target.value })
                }
                placeholder="1234567890"
                fullWidth
              />
            </Box>

            <TextField
              label="Effective From"
              type="date"
              value={salaryFormData.effectiveFrom}
              onChange={(e) =>
                setSalaryFormData({ ...salaryFormData, effectiveFrom: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />

            <TextField
              label="Notes (Optional)"
              multiline
              rows={3}
              value={salaryFormData.notes}
              onChange={(e) => setSalaryFormData({ ...salaryFormData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setShowSalaryModal(false)} variant="outlined" fullWidth>
            Cancel
          </Button>
          <Button onClick={handleAddSalary} variant="contained" color="success" fullWidth>
            Add Salary
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Modal - Process Salary Payment */}
      <Dialog
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Process Salary Payment
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Record a salary payment transaction
              </Typography>
            </Box>
            <IconButton onClick={() => setShowPaymentModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            onSubmit={handleProcessPayment}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <FormControl fullWidth required>
              <InputLabel>Employee Salary</InputLabel>
              <Select
                value={paymentFormData.salaryId}
                onChange={(e) => {
                  const salary = salaries.find((s) => s.id === e.target.value)
                  setPaymentFormData({
                    ...paymentFormData,
                    salaryId: e.target.value,
                    userId: salary?.userId || '',
                    basicAmount: salary?.basicSalary || 0,
                    allowances: salary?.allowances || 0,
                    deductions: salary?.deductions || 0
                  })
                }}
                label="Employee Salary"
              >
                <MenuItem value="">Select employee salary</MenuItem>
                {salaries.map((salary) => {
                  const user = users.find((u) => u.id === salary.userId)
                  return (
                    <MenuItem key={salary.id} value={salary.id}>
                      {user?.fullName} - ${salary.netSalary.toFixed(2)} ({salary.paymentFrequency})
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>

            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
            >
              <TextField
                label="Period Start"
                type="date"
                value={paymentFormData.payPeriodStart}
                onChange={(e) =>
                  setPaymentFormData({ ...paymentFormData, payPeriodStart: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />

              <TextField
                label="Period End"
                type="date"
                value={paymentFormData.payPeriodEnd}
                onChange={(e) =>
                  setPaymentFormData({ ...paymentFormData, payPeriodEnd: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
            </Box>

            <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.300' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Basic Salary:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ${paymentFormData.basicAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Allowances:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                    +${paymentFormData.allowances.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Deductions:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                    -${paymentFormData.deductions.toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    Net Amount:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    $
                    {(
                      paymentFormData.basicAmount +
                      paymentFormData.allowances -
                      paymentFormData.deductions
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
            >
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentFormData.paymentMethod}
                  onChange={(e) =>
                    setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })
                  }
                  label="Payment Method"
                >
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Payment Date"
                type="date"
                value={paymentFormData.paymentDate}
                onChange={(e) =>
                  setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
            </Box>

            <TextField
              label="Transaction Reference"
              type="text"
              value={paymentFormData.transactionReference}
              onChange={(e) =>
                setPaymentFormData({
                  ...paymentFormData,
                  transactionReference: e.target.value
                })
              }
              placeholder="TXN123456"
              fullWidth
            />

            <TextField
              label="Notes (Optional)"
              multiline
              rows={3}
              value={paymentFormData.notes}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setShowPaymentModal(false)} variant="outlined" fullWidth>
            Cancel
          </Button>
          <Button onClick={handleProcessPayment} variant="contained" color="secondary" fullWidth>
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
