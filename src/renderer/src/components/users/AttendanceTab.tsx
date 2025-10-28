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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Attendance Management</h2>
            <p className="text-sm text-gray-600 mt-1">Track daily attendance and work hours</p>
          </div>
          <button
            onClick={() => setShowAttendanceModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Mark Attendance
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 font-semibold text-sm">Present Today</div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {attendanceStats.present}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-red-600 font-semibold text-sm">Absent Today</div>
              <div className="text-2xl font-bold text-red-900 mt-1">{attendanceStats.absent}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-yellow-600 font-semibold text-sm">On Leave</div>
              <div className="text-2xl font-bold text-yellow-900 mt-1">
                {attendanceStats.onLeave}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 font-semibold text-sm">Avg Work Hours</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {attendanceStats.avgHours.toFixed(1)}h
              </div>
            </div>
          </div>
          {attendanceRecords.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-lg font-medium">No attendance records yet</p>
              <p className="text-sm mt-1">Start by marking today&apos;s attendance</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Work Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((record) => {
                    const user = users.find((u) => u.id === record.userId)
                    return (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user?.username || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.checkInTime || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.checkOutTime || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === 'present'
                                ? 'bg-green-100 text-green-800'
                                : record.status === 'absent'
                                  ? 'bg-red-100 text-red-800'
                                  : record.status === 'leave'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.workHours ? `${record.workHours}h` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{record.notes || '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
                <p className="text-sm text-gray-600 mt-1">Record daily attendance for staff</p>
              </div>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Staff Member
                </label>
                <select
                  value={attendanceFormData.userId}
                  onChange={(e) =>
                    setAttendanceFormData({ ...attendanceFormData, userId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a staff member</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={attendanceFormData.date}
                  onChange={(e) =>
                    setAttendanceFormData({ ...attendanceFormData, date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={attendanceFormData.status}
                  onChange={(e) =>
                    setAttendanceFormData({ ...attendanceFormData, status: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">On Leave</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>

              {attendanceFormData.status === 'present' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Check In Time
                      </label>
                      <input
                        type="time"
                        value={attendanceFormData.checkIn}
                        onChange={(e) =>
                          setAttendanceFormData({ ...attendanceFormData, checkIn: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Check Out Time
                      </label>
                      <input
                        type="time"
                        value={attendanceFormData.checkOut}
                        onChange={(e) =>
                          setAttendanceFormData({ ...attendanceFormData, checkOut: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Work Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={attendanceFormData.workHours}
                      onChange={(e) =>
                        setAttendanceFormData({
                          ...attendanceFormData,
                          workHours: parseFloat(e.target.value) || 0
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="8.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Overtime Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={attendanceFormData.overtime}
                      onChange={(e) =>
                        setAttendanceFormData({
                          ...attendanceFormData,
                          overtime: parseFloat(e.target.value) || 0
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={attendanceFormData.notes}
                  onChange={(e) =>
                    setAttendanceFormData({ ...attendanceFormData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg"
                >
                  Mark Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
