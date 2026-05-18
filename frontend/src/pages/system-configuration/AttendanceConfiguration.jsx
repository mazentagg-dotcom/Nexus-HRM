import { useState, useRef } from 'react'
import { Upload, Download, RefreshCw, Wifi, WifiOff, AlertCircle, CheckCircle2, Eye, Edit3, Trash2, Plus, X, Info, Clock, Database, Users, FileText, Settings, Monitor } from 'lucide-react'
import Tabs from '../../components/ui/Tabs'
import Button from '../../components/Button'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/feedback/Toast'
import { useSystemConfig } from '../../store/systemConfig'
import { Toggle, NumInput, Sel, Row, SaveBar, TextInput, SectionCard, InfoBox, fmt } from './ConfigComponents'

const SUB_TABS = [
  { id: 'source', label: 'Source', icon: Database },
  { id: 'mapping', label: 'Device Mapping', icon: Users },
  { id: 'import', label: 'Import Format', icon: FileText },
  { id: 'policy', label: 'Policy Rules', icon: Clock },
  { id: 'deductions', label: 'Deductions', icon: Settings },
  { id: 'sync', label: 'Sync Controls', icon: RefreshCw },
]

const MOCK_MAPPINGS = [
  { id: 1, name: 'Ahmed Hassan', empId: 'EMP-001', branch: 'Cairo HQ', dept: 'Engineering', deviceId: 'DEV-101', fingerprintId: 'FP-201', faceprintId: '', provider: 'ZKTeco', status: 'Mapped' },
  { id: 2, name: 'Sara Ali', empId: 'EMP-002', branch: 'Alexandria', dept: 'HR', deviceId: 'DEV-102', fingerprintId: 'FP-202', faceprintId: 'FACE-301', provider: 'ZKTeco', status: 'Mapped' },
  { id: 3, name: 'Omar Mohamed', empId: 'EMP-003', branch: 'Cairo HQ', dept: 'Finance', deviceId: '', fingerprintId: '', faceprintId: '', provider: '', status: 'Missing Device ID' },
  { id: 4, name: 'Fatima Youssef', empId: 'EMP-004', branch: 'Giza', dept: 'Marketing', deviceId: 'DEV-104', fingerprintId: 'FP-204', faceprintId: '', provider: 'HikVision', status: 'Mapped' },
  { id: 5, name: 'Karim Ibrahim', empId: 'EMP-005', branch: 'Cairo HQ', dept: 'Sales', deviceId: 'DEV-105', fingerprintId: '', faceprintId: 'FACE-305', provider: 'ZKTeco', status: 'Needs Review' },
  { id: 6, name: 'Nour El-Din', empId: 'EMP-006', branch: 'Alexandria', dept: 'Engineering', deviceId: '', fingerprintId: 'FP-206', faceprintId: '', provider: 'HikVision', status: 'Conflict' },
]

const COLUMN_ALIASES = {
  'Employee ID': ['employee id', 'emp id', 'staff id', 'worker id', 'employee code', 'code', 'id'],
  'Device User ID': ['device user id', 'device id', 'biometric id', 'attendance id', 'machine id', 'user id', 'punch id'],
  'Employee Name': ['employee name', 'staff name', 'worker name', 'full name', 'name'],
  'Branch': ['branch', 'office', 'location', 'site', 'workplace'],
  'Date': ['date', 'attendance date', 'log date', 'punch date', 'day'],
  'Clock In': ['clock in', 'check in', 'time in', 'in time', 'punch in', 'first punch'],
  'Clock Out': ['clock out', 'check out', 'time out', 'out time', 'punch out', 'last punch'],
  'Status': ['status', 'attendance status', 'state'],
  'Overtime': ['overtime', 'ot', 'extra hours', 'overtime hours'],
  'Notes': ['notes', 'remarks', 'comment', 'comments'],
}

const STATUS_COLORS = {
  Ready: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  Error: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  Mapped: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  'Missing Device ID': 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  Conflict: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  'Needs Review': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  connected: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  not_connected: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  sync_failed: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  manual_upload_only: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
}

const CONNECTION_LABELS = { connected: 'Connected', not_connected: 'Not Connected', sync_failed: 'Sync Failed', manual_upload_only: 'Manual Upload Only' }

function StatusBadge({ status }) {
  const label = typeof status === 'string' ? (CONNECTION_LABELS[status] || status.replace(/_/g, ' ')) : status
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS[label] || 'bg-gray-100 text-gray-600'
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>{label}</span>
}

function AttendanceSourceSection({ source, setSource, saveSource, testConnection }) {
  return (
    <div className="space-y-4">
      <InfoBox>Nexus-HRM receives attendance logs from the buyer&#39;s fingerprint, faceprint, API, or CSV export. The system then matches logs to employees and calculates attendance deductions automatically.</InfoBox>
      <SectionCard title="Attendance Source">
        <Row label="Source Type">
          <Sel value={source.source_type} onChange={v => setSource(p => ({ ...p, source_type: v, connection_status: v === 'csv' ? 'manual_upload_only' : 'not_connected' }))}
            options={[{ value: 'csv', label: 'CSV/XLSX Import' }, { value: 'api', label: 'API Integration' }, { value: 'device', label: 'Device/Local Connector' }, { value: 'manual', label: 'Manual Entry' }]} />
        </Row>
        <Row label="Attendance Provider Name" helper="e.g. ZKTeco, HikVision, Suprema">
          <TextInput value={source.provider_name} onChange={v => setSource(p => ({ ...p, provider_name: v }))} placeholder="Provider name..." />
        </Row>
        <Row label="Default Branch">
          <Sel value={source.default_branch} onChange={v => setSource(p => ({ ...p, default_branch: v }))}
            options={[{ value: '', label: 'All Branches' }].concat(useBranches())} />
        </Row>
        <Row label="Auto Sync Enabled">
          <Toggle checked={source.auto_sync_enabled} onChange={v => setSource(p => ({ ...p, auto_sync_enabled: v }))} />
        </Row>
        {source.auto_sync_enabled && (
          <Row label="Sync Frequency">
            <Sel value={source.sync_frequency} onChange={v => setSource(p => ({ ...p, sync_frequency: v }))}
              options={[{ value: 'manual', label: 'Manual' }, { value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'custom', label: 'Custom' }]} />
          </Row>
        )}
        <Row label="Connection Status">
          <StatusBadge status={source.connection_status} />
        </Row>
        {source.source_type !== 'csv' && (
          <Row label="Last Sync Time">
            <span className="text-sm text-gray-500 dark:text-gray-400">{source.last_sync_time || 'Never'}</span>
          </Row>
        )}
        <SaveBar onSave={saveSource} />
      </SectionCard>
    </div>
  )
}

function useBranches() {
  const { branches } = useSystemConfig()
  return (branches || []).map(b => ({ value: b.name, label: b.name }))
}

function DeviceMappingSection({ mappings, setMappings, startEdit, editId, editForm, setEditForm, saveMapping, cancelEdit, clearMapping }) {
  const [viewLog, setViewLog] = useState(null)
  return (
    <div className="space-y-4">
      <InfoBox>Nexus must know how to match attendance machine records to employees. Set device IDs, fingerprint IDs, and faceprint IDs for each employee.</InfoBox>
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Branch / Dept</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Device ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Fingerprint</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Faceprint</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Provider</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map(emp => (
                <tr key={emp.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  {editId === emp.id ? (
                    <>
                      <td colSpan={8} className="px-4 py-3 bg-indigo-50/50 dark:bg-indigo-900/10">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Device User ID</label>
                            <TextInput value={editForm.deviceId} onChange={v => setEditForm(p => ({ ...p, deviceId: v }))} placeholder="DEV-xxx" className="!max-w-full w-full" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Fingerprint ID</label>
                            <TextInput value={editForm.fingerprintId} onChange={v => setEditForm(p => ({ ...p, fingerprintId: v }))} placeholder="FP-xxx" className="!max-w-full w-full" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Faceprint ID</label>
                            <TextInput value={editForm.faceprintId} onChange={v => setEditForm(p => ({ ...p, faceprintId: v }))} placeholder="FACE-xxx" className="!max-w-full w-full" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Provider</label>
                            <TextInput value={editForm.provider} onChange={v => setEditForm(p => ({ ...p, provider: v }))} placeholder="ZKTeco, HikVision..." className="!max-w-full w-full" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Branch</label>
                            <TextInput value={editForm.branch} onChange={v => setEditForm(p => ({ ...p, branch: v }))} className="!max-w-full w-full" />
                          </div>
                          <div className="flex items-end gap-2">
                            <Button size="sm" onClick={() => saveMapping(emp.id)}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                          </div>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{emp.name}</div>
                        <div className="text-xs text-gray-400">{emp.empId}</div>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{emp.branch} / {emp.dept}</td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{emp.deviceId || <span className="text-gray-300 dark:text-gray-600">--</span>}</td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{emp.fingerprintId || <span className="text-gray-300 dark:text-gray-600">--</span>}</td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{emp.faceprintId || <span className="text-gray-300 dark:text-gray-600">--</span>}</td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{emp.provider || <span className="text-gray-300 dark:text-gray-600">--</span>}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={emp.status} /></td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(emp)} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><Edit3 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => clearMapping(emp.id)} className="rounded p-1 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"><Trash2 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setViewLog(emp)} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><Eye className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={!!viewLog} onClose={() => setViewLog(null)} title="Device Mapping Log" size="sm">
        {viewLog && (
          <div className="space-y-3 text-sm">
            <p><span className="text-gray-500">Employee:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{viewLog.name}</span></p>
            <p><span className="text-gray-500">Employee ID:</span> {viewLog.empId}</p>
            <p><span className="text-gray-500">Device User ID:</span> {viewLog.deviceId || 'Not set'}</p>
            <p><span className="text-gray-500">Fingerprint ID:</span> {viewLog.fingerprintId || 'Not set'}</p>
            <p><span className="text-gray-500">Faceprint ID:</span> {viewLog.faceprintId || 'Not set'}</p>
            <p><span className="text-gray-500">Provider:</span> {viewLog.provider || 'Not set'}</p>
            <p><span className="text-gray-500">Status:</span> <StatusBadge status={viewLog.status} /></p>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
              <p className="text-xs text-gray-400">Matching priority: Employee ID &gt; Device User ID &gt; Fingerprint ID &gt; Faceprint ID &gt; Email/phone fallback (if safe)</p>
              <p className="text-xs text-gray-400 mt-1">Last updated: just now (mock)</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function ImportFormatSection({ importFile, importPreview, importStatus, handleFileUpload, downloadTemplate, importLogs, clearImport, fileInputRef }) {
  return (
    <div className="space-y-4">
      <InfoBox>Nexus-HRM supports flexible CSV/XLSX attendance imports from different biometric systems. Column names are matched using aliases, not exact strings.</InfoBox>
      <SectionCard title="Supported Column Aliases" icon={FileText}>
        <div className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Field</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Accepted Aliases</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(COLUMN_ALIASES).map(([field, aliases]) => (
                  <tr key={field} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">{field}</td>
                    <td className="px-4 py-2 text-gray-500 dark:text-gray-400 text-xs">{aliases.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button size="sm" icon={Download} onClick={downloadTemplate}>Download Template</Button>
          <label className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg cursor-pointer bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
            <Upload className="h-4 w-4" /> Upload File
            <input type="file" ref={fileInputRef} accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
          </label>
          <Button size="sm" variant="ghost" onClick={clearImport} disabled={!importFile}>Clear Import</Button>
        </div>
        {importFile && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <FileText className="h-4 w-4" /> {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </SectionCard>
      {importPreview.length > 0 && (
        <SectionCard title="Import Preview">
          <div className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">#</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Status</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                      <td className="px-4 py-2 text-gray-500">{row._row}</td>
                      <td className="px-4 py-2"><StatusBadge status={row._status} /></td>
                      <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate">{JSON.stringify(row._data)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={importLogs} disabled={importStatus === 'imported'}>
              {importStatus === 'imported' ? 'Imported' : 'Import Attendance Logs'}
            </Button>
            <Button size="sm" variant="ghost" onClick={clearImport}>Clear</Button>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function PolicyRulesSection({ config, updateConfig, savePolicy }) {
  const p = config
  return (
    <div className="space-y-4">
      <SectionCard title="Basic Settings" icon={Clock}>
        <Row label="Working Hours Per Day"><NumInput value={p.working_hours_per_day} onChange={v => updateConfig({ working_hours_per_day: v })} suffix="hours" /></Row>
        <Row label="Working Days Per Month" helper="Used for salary fraction calculations"><NumInput value={p.working_days_per_month} onChange={v => updateConfig({ working_days_per_month: v })} suffix="days" /></Row>
        <Row label="Grace Period" helper="Minutes after start time before marked late"><NumInput value={p.grace_period_minutes} onChange={v => updateConfig({ grace_period_minutes: v })} suffix="min" /></Row>
        <Row label="Standard Start Time">
          <input type="time" value={p.standard_start_time} onChange={e => updateConfig({ standard_start_time: e.target.value })}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </Row>
        <Row label="Standard End Time">
          <input type="time" value={p.standard_end_time} onChange={e => updateConfig({ standard_end_time: e.target.value })}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </Row>
        <Row label="Weekend Days">
          <div className="flex gap-1">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
              <button key={d} onClick={() => {
                const days = p.weekend_days.includes(d) ? p.weekend_days.filter(x => x !== d) : [...p.weekend_days, d]
                updateConfig({ weekend_days: days })
              }} className={`px-2 py-1 text-xs rounded-lg border transition-colors ${p.weekend_days.includes(d) ? 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-300 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}>{d.slice(0, 3)}</button>
            ))}
          </div>
        </Row>
      </SectionCard>
      <SectionCard title="Overtime Settings">
        <Row label="Overtime Enabled"><Toggle checked={p.overtime_enabled} onChange={v => updateConfig({ overtime_enabled: v })} /></Row>
        {p.overtime_enabled && (
          <Row label="Overtime Rate Multiplier" helper="Overtime Pay = Hours x (Daily Salary / Hours Per Day) x Rate">
            <NumInput value={p.overtime_rate_multiplier} onChange={v => updateConfig({ overtime_rate_multiplier: v })} suffix="x" min={0.1} />
          </Row>
        )}
      </SectionCard>
      <SaveBar onSave={savePolicy} />
    </div>
  )
}

function DeductionRulesSection({ config, updateConfig, saveDeductions, newTier, setNewTier, addTier, removeTier, earlyLeave, setEarlyLeave, missingClock, setMissingClock }) {
  const p = config
  return (
    <div className="space-y-4">
      <SectionCard title="Absence Deduction" icon={AlertCircle}>
        <Row label="Absence Mode">
          <Sel value={p.absence_mode} onChange={v => updateConfig({ absence_mode: v })} options={[{ value: 'fixed', label: 'Fixed Amount' }, { value: 'progressive', label: 'Progressive' }]} />
        </Row>
        {p.absence_mode === 'fixed' ? (
          <Row label="Fixed Absence Amount" helper="Deducted per absence day"><NumInput value={p.fixed_absence_amount} onChange={v => updateConfig({ fixed_absence_amount: v })} suffix="per day" /></Row>
        ) : (
          <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Progressive amounts per day:</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {(p.progressive_absence_amounts || []).map((amt, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 w-6">D{i + 1}</span>
                  <input type="number" value={amt} readOnly
                    className="w-20 text-right text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                  <button onClick={() => removeTier(i)} className="rounded p-1 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Add:</span>
              <input type="number" placeholder="Day" value={newTier.day} onChange={e => setNewTier(p => ({ ...p, day: e.target.value }))}
                className="w-16 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <input type="number" placeholder="Amount" value={newTier.amount} onChange={e => setNewTier(p => ({ ...p, amount: e.target.value }))}
                className="w-24 text-right text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <Button size="sm" icon={Plus} onClick={addTier}>Add Tier</Button>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Additional days use the last configured amount</p>
          </div>
        )}
      </SectionCard>
      <SectionCard title="Late Deduction">
        <Row label="Enable Late Deduction"><Toggle checked={p.enable_late_deduction} onChange={v => updateConfig({ enable_late_deduction: v })} /></Row>
        {p.enable_late_deduction && (
          <>
            <Row label="Late Threshold" helper="Hours after which deduction applies"><NumInput value={p.late_threshold_hours} onChange={v => updateConfig({ late_threshold_hours: v })} suffix="hours" /></Row>
            <Row label="Deduction Type">
              <Sel value={p.late_deduction_type} onChange={v => updateConfig({ late_deduction_type: v })} options={[{ value: 'fraction', label: 'Salary Fraction' }, { value: 'fixed', label: 'Fixed Amount' }]} />
            </Row>
            {p.late_deduction_type === 'fraction' ? (
              <Row label="Salary Fraction">
                <Sel value={p.late_deduction_fraction} onChange={v => updateConfig({ late_deduction_fraction: v })} options={[{ value: 'quarter', label: 'Quarter Day' }, { value: 'half', label: 'Half Day' }, { value: 'full', label: 'Full Day' }]} />
              </Row>
            ) : (
              <Row label="Fixed Late Amount"><NumInput value={p.late_fixed_amount} onChange={v => updateConfig({ late_fixed_amount: v })} suffix="per occurrence" /></Row>
            )}
          </>
        )}
      </SectionCard>
      <SectionCard title="Early Leave Deduction" icon={Clock}>
        <Row label="Enable Early Leave Deduction"><Toggle checked={earlyLeave.enabled} onChange={v => setEarlyLeave(p => ({ ...p, enabled: v }))} /></Row>
        {earlyLeave.enabled && (
          <>
            <Row label="Early Leave Threshold" helper="Minutes before end time considered early leave">
              <NumInput value={earlyLeave.threshold} onChange={v => setEarlyLeave(p => ({ ...p, threshold: v }))} suffix="min" />
            </Row>
            <Row label="Deduction Type">
              <Sel value={earlyLeave.type} onChange={v => setEarlyLeave(p => ({ ...p, type: v }))} options={[{ value: 'fraction', label: 'Salary Fraction' }, { value: 'fixed', label: 'Fixed Amount' }]} />
            </Row>
            {earlyLeave.type === 'fraction' ? (
              <Row label="Salary Fraction">
                <Sel value={earlyLeave.fraction} onChange={v => setEarlyLeave(p => ({ ...p, fraction: v }))} options={[{ value: 'quarter', label: 'Quarter Day' }, { value: 'half', label: 'Half Day' }, { value: 'full', label: 'Full Day' }]} />
              </Row>
            ) : (
              <Row label="Fixed Early Leave Amount"><NumInput value={earlyLeave.fixedAmount} onChange={v => setEarlyLeave(p => ({ ...p, fixedAmount: v }))} suffix="per occurrence" /></Row>
            )}
          </>
        )}
      </SectionCard>
      <SectionCard title="Missing Clock-In/Out">
        <Row label="Missing Clock Behavior">
          <Sel value={missingClock.behavior} onChange={v => setMissingClock(p => ({ ...p, behavior: v }))}
            options={[{ value: 'needs_review', label: 'Needs Review' }, { value: 'mark_absent', label: 'Mark as Absent' }, { value: 'ignore', label: 'Ignore' }]} />
        </Row>
        <Row label="Deduction Applies"><Toggle checked={missingClock.deduction} onChange={v => setMissingClock(p => ({ ...p, deduction: v }))} /></Row>
      </SectionCard>
      <SectionCard title="Deduction Summary" icon={Info}>
        <InfoBox>All attendance deductions (Absence, Late, Early Leave) are calculated automatically and appear in Payslip as &quot;Attendance Rule Auto&quot; source. HR does not need to calculate them manually.</InfoBox>
      </SectionCard>
      <SaveBar onSave={saveDeductions} />
    </div>
  )
}

function SyncControlsSection({ source, setSource, syncNow, testConnection, downloadTemplate, fileInputRef, importFile, importPreview, importStatus, handleFileUpload, importLogs, clearImport }) {
  const statusIcon = source.connection_status === 'connected' ? <Wifi className="h-5 w-5 text-emerald-500" /> : source.connection_status === 'sync_failed' ? <WifiOff className="h-5 w-5 text-rose-500" /> : <Monitor className="h-5 w-5 text-gray-400" />
  return (
    <div className="space-y-4">
      <SectionCard title="Connection Status">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
          {statusIcon}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {source.source_type === 'csv' ? 'CSV Import Mode' : source.connection_status === 'connected' ? 'Connected' : 'Not Connected'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {source.source_type === 'csv'
                ? 'Upload attendance files manually using the button below.'
                : source.connection_status === 'connected'
                  ? `Provider: ${source.provider_name || 'Not set'} | Last sync: ${source.last_sync_time || 'Never'}`
                  : 'Configure attendance source in the Source tab first.'}
            </p>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Available Actions">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {source.source_type !== 'csv' && (
            <>
              <Button variant="secondary" icon={Wifi} onClick={testConnection}>Test Connection</Button>
              <Button variant="secondary" icon={RefreshCw} onClick={syncNow}>Sync Now</Button>
            </>
          )}
          <Button variant="secondary" icon={Download} onClick={downloadTemplate}>Download Template</Button>
          <label className="inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium rounded-lg cursor-pointer bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
            <Upload className="h-4 w-4" /> Upload Attendance File
            <input type="file" ref={fileInputRef} accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
          </label>
          <Button variant="secondary" icon={FileText} onClick={importLogs} disabled={!importFile || importStatus === 'imported'}>
            Import Logs ({importPreview.length} rows)
          </Button>
          <Button variant="ghost" onClick={clearImport} disabled={!importFile}>Clear Import</Button>
        </div>
        {importFile && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <FileText className="h-4 w-4" /> {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </SectionCard>
      {source.source_type === 'device' && (
        <InfoBox>A local connector may be required for biometric devices that do not provide cloud API access. Contact support for device-specific setup instructions.</InfoBox>
      )}
    </div>
  )
}

export default function AttendanceConfiguration() {
  const { config, saveConfig, updateConfig } = useSystemConfig()
  const { showToast } = useToast()
  const [subTab, setSubTab] = useState('source')
  const fileInputRef = useRef(null)

  const [source, setSource] = useState({
    source_type: 'csv', provider_name: '', default_branch: '', auto_sync_enabled: false, sync_frequency: 'manual', connection_status: 'manual_upload_only', last_sync_time: '',
  })
  const [mappings, setMappings] = useState(MOCK_MAPPINGS)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState([])
  const [importStatus, setImportStatus] = useState('idle')
  const [newTier, setNewTier] = useState({ day: '', amount: '' })
  const [earlyLeave, setEarlyLeave] = useState({ enabled: false, threshold: 30, type: 'fraction', fraction: 'half', fixedAmount: 0 })
  const [missingClock, setMissingClock] = useState({ behavior: 'needs_review', deduction: false })

  const saveSource = () => showToast('Attendance source saved', 'success')

  const testConnection = () => {
    if (source.source_type === 'csv') { showToast('CSV mode: no connection needed', 'info'); return }
    showToast('Testing connection...', 'info')
    setTimeout(() => {
      setSource(p => ({ ...p, connection_status: 'connected' }))
      showToast('Connection test successful', 'success')
    }, 1500)
  }

  const startEdit = (emp) => { setEditId(emp.id); setEditForm({ deviceId: emp.deviceId, fingerprintId: emp.fingerprintId, faceprintId: emp.faceprintId, provider: emp.provider, branch: emp.branch }) }
  const saveMapping = (id) => {
    setMappings(prev => prev.map(m => {
      if (m.id !== id) return m
      const hasId = editForm.deviceId || editForm.fingerprintId || editForm.faceprintId
      return { ...m, ...editForm, status: hasId ? 'Mapped' : 'Missing Device ID' }
    }))
    setEditId(null)
    showToast('Mapping saved', 'success')
  }
  const cancelEdit = () => setEditId(null)
  const clearMapping = (id) => {
    setMappings(prev => prev.map(m => m.id === id ? { ...m, deviceId: '', fingerprintId: '', faceprintId: '', provider: '', status: 'Missing Device ID' } : m))
    showToast('Mapping cleared', 'success')
  }

  const downloadTemplate = () => {
    const headers = Object.keys(COLUMN_ALIASES)
    const csv = headers.join(',')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'attendance_template.csv'; a.click()
    URL.revokeObjectURL(url)
    showToast('Template downloaded', 'success')
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    setImportStatus('previewing')
    const reader = new FileReader()
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').filter(l => l.trim())
      if (lines.length < 2) { setImportPreview([]); return }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const rows = lines.slice(1, 6).map((line, i) => {
        const cols = line.split(',').map(c => c.trim())
        const row = {}
        headers.forEach((h, idx) => { row[h] = cols[idx] || '' })
        const hasDate = row['date'] || row['attendance date'] || row['log date']
        const hasEmpId = row['employee id'] || row['emp id'] || row['employee name']
        return { _row: i + 1, _status: (!hasDate || !hasEmpId) ? 'Error' : 'Ready', _data: row }
      })
      setImportPreview(rows)
    }
    reader.readAsText(file)
    showToast(`File selected: ${file.name}`, 'info')
  }

  const importLogs = () => {
    if (importStatus === 'imported') return
    setImportStatus('imported')
    showToast(`${importPreview.length} attendance records imported successfully`, 'success')
  }

  const clearImport = () => {
    setImportFile(null); setImportPreview([]); setImportStatus('idle')
    if (fileInputRef.current) fileInputRef.current.value = ''
    showToast('Import cleared', 'success')
  }

  const savePolicy = async () => { try { await saveConfig(config); showToast('Attendance policy saved', 'success') } catch { showToast('Failed to save', 'error') } }
  const saveDeductions = async () => { try { await saveConfig(config); showToast('Deduction rules saved', 'success') } catch { showToast('Failed to save', 'error') } }

  const addTier = () => {
    const amt = Number(newTier.amount)
    if (!amt) { showToast('Enter a valid amount', 'error'); return }
    const current = config.progressive_absence_amounts || []
    updateConfig({ progressive_absence_amounts: [...current, amt] })
    setNewTier({ day: '', amount: '' })
    showToast('Tier added', 'success')
  }
  const removeTier = (idx) => {
    const current = config.progressive_absence_amounts || []
    updateConfig({ progressive_absence_amounts: current.filter((_, i) => i !== idx) })
    showToast('Tier removed', 'success')
  }

  const syncNow = () => {
    if (source.source_type === 'csv') { showToast('CSV mode: use Upload to import attendance', 'info'); return }
    showToast('Syncing attendance data...', 'info')
    setTimeout(() => {
      setSource(p => ({ ...p, last_sync_time: new Date().toLocaleString(), connection_status: 'connected' }))
      showToast('Sync completed', 'success')
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <div className="card-base">
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 pt-2">
          <Tabs tabs={SUB_TABS} activeTab={subTab} onChange={setSubTab} />
        </div>
        <div className="p-4">
          {subTab === 'source' && <AttendanceSourceSection source={source} setSource={setSource} saveSource={saveSource} testConnection={testConnection} />}
          {subTab === 'mapping' && <DeviceMappingSection mappings={mappings} setMappings={setMappings} startEdit={startEdit} editId={editId} editForm={editForm} setEditForm={setEditForm} saveMapping={saveMapping} cancelEdit={cancelEdit} clearMapping={clearMapping} />}
          {subTab === 'import' && <ImportFormatSection importFile={importFile} importPreview={importPreview} importStatus={importStatus} handleFileUpload={handleFileUpload} downloadTemplate={downloadTemplate} importLogs={importLogs} clearImport={clearImport} fileInputRef={fileInputRef} />}
          {subTab === 'policy' && <PolicyRulesSection config={config} updateConfig={updateConfig} savePolicy={savePolicy} />}
          {subTab === 'deductions' && <DeductionRulesSection config={config} updateConfig={updateConfig} saveDeductions={saveDeductions} newTier={newTier} setNewTier={setNewTier} addTier={addTier} removeTier={removeTier} earlyLeave={earlyLeave} setEarlyLeave={setEarlyLeave} missingClock={missingClock} setMissingClock={setMissingClock} />}
          {subTab === 'sync' && <SyncControlsSection source={source} setSource={setSource} syncNow={syncNow} testConnection={testConnection} downloadTemplate={downloadTemplate} fileInputRef={fileInputRef} importFile={importFile} importPreview={importPreview} importStatus={importStatus} handleFileUpload={handleFileUpload} importLogs={importLogs} clearImport={clearImport} />}
        </div>
      </div>
    </div>
  )
}
