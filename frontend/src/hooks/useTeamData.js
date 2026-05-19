import { useState, useEffect, useCallback } from 'react'
import { getEmployees, getAttendance } from '../api/hr'

const availabilityStatuses = ['Online', 'Away', 'On Break', 'In Meeting', 'Offline']

function getStatusForEmployee(emp, todayRecords) {
  if (!todayRecords || !todayRecords.length) return { attendance: 'Not Checked In', availability: 'Offline' }

  const todayRec = todayRecords.find(r => {
    if (!r.date) return false
    return new Date(r.date).toDateString() === new Date().toDateString()
  })

  if (!todayRec) return { attendance: 'Not Checked In', availability: 'Offline' }
  if (todayRec.status === 'absent') return { attendance: 'Absent', availability: 'Offline' }
  if (todayRec.status === 'on_leave') return { attendance: 'On Leave', availability: 'Offline' }
  if (todayRec.check_out) return { attendance: 'Present', availability: 'Online' }
  if (todayRec.check_in) return { attendance: 'Present', availability: 'Online' }
  return { attendance: 'Not Checked In', availability: 'Offline' }
}

function getStatusColor(status) {
  const map = {
    Present: 'emerald',
    Absent: 'rose',
    Late: 'amber',
    'On Leave': 'purple',
    'Not Checked In': 'gray',
    'Checked In': 'sky',
  }
  return map[status] || 'gray'
}

function getAvailabilityColor(status) {
  const map = {
    Online: 'emerald',
    Away: 'amber',
    'On Break': 'sky',
    'In Meeting': 'purple',
    Offline: 'gray',
  }
  return map[status] || 'gray'
}

export default function useTeamData() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [todayRecords, setTodayRecords] = useState([])

  const fetchTeamData = useCallback(async () => {
    setLoading(true)
    try {
      const empRes = await getEmployees({ page: 1, pageSize: 200 })
      const empData = empRes.data?.data
      const emps = empData?.items || empData || []

      const attRes = await getAttendance({ page: 1, pageSize: 500 })
      const attData = attRes.data?.data
      const atts = attData?.items || attData || []

      const today = new Date().toDateString()
      const todayAtts = atts.filter(r => r.date && new Date(r.date).toDateString() === today)

      setTeam(emps)
      setTodayRecords(todayAtts)
    } catch (e) {
      console.error('useTeamData fetch error:', e)
      setTeam([])
      setTodayRecords([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTeamData() }, [fetchTeamData])

  const getAttendanceStatus = useCallback((emp) => {
    const status = getStatusForEmployee(emp, todayRecords)
    return status
  }, [todayRecords])

  const presentCount = team.filter(e => {
    const s = getStatusForEmployee(e, todayRecords)
    return s.attendance === 'Present'
  }).length

  const absentCount = team.filter(e => {
    const s = getStatusForEmployee(e, todayRecords)
    return s.attendance === 'Absent'
  }).length

  const notCheckedCount = team.filter(e => {
    const s = getStatusForEmployee(e, todayRecords)
    return s.attendance === 'Not Checked In'
  }).length

  const onLeaveCount = team.filter(e => {
    const s = getStatusForEmployee(e, todayRecords)
    return s.attendance === 'On Leave'
  }).length

  return {
    team,
    loading,
    fetchTeamData,
    todayRecords,
    getAttendanceStatus,
    getStatusColor,
    getAvailabilityColor,
    availabilityStatuses,
    presentCount,
    absentCount,
    notCheckedCount,
    onLeaveCount,
  }
}
