import { useEffect, useState } from 'react'

export default function DiagnosticPage(): React.JSX.Element {
  const [diagnostics, setDiagnostics] = useState({
    windowApiAvailable: false,
    electronAvailable: false,
    rootElement: false,
    timestamp: new Date().toISOString()
  })

  useEffect(() => {
    const rootElement = document.getElementById('root')
    setDiagnostics({
      windowApiAvailable: !!window.api,
      electronAvailable: !!window.electron,
      rootElement: !!rootElement,
      timestamp: new Date().toISOString()
    })

    console.log('Diagnostic Page Mounted')
    console.log('window.api:', window.api)
    console.log('window.electron:', window.electron)
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>MedixPOS Diagnostic Page</h1>
      <div style={{ marginTop: '20px' }}>
        <h2>System Status</h2>
        <ul>
          <li>
            <strong>window.api Available:</strong>{' '}
            <span style={{ color: diagnostics.windowApiAvailable ? 'green' : 'red' }}>
              {diagnostics.windowApiAvailable ? '✓ Yes' : '✗ No'}
            </span>
          </li>
          <li>
            <strong>window.electron Available:</strong>{' '}
            <span style={{ color: diagnostics.electronAvailable ? 'green' : 'red' }}>
              {diagnostics.electronAvailable ? '✓ Yes' : '✗ No'}
            </span>
          </li>
          <li>
            <strong>Root Element:</strong>{' '}
            <span style={{ color: diagnostics.rootElement ? 'green' : 'red' }}>
              {diagnostics.rootElement ? '✓ Yes' : '✗ No'}
            </span>
          </li>
          <li>
            <strong>Timestamp:</strong> {diagnostics.timestamp}
          </li>
        </ul>
      </div>
      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h3>If you see this page, React is working!</h3>
        <p>The blank screen issue is likely related to routing or authentication.</p>
      </div>
    </div>
  )
}
