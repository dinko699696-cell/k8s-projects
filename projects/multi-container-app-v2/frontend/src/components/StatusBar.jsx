import { useState, useEffect } from 'react'
import axios from 'axios'

const services = [
  { name: 'Backend', url: '/api/health' },
  { name: 'MongoDB', key: 'mongo' },
  { name: 'Redis', key: 'redis' },
]

function StatusDot({ status }) {
  const colors = {
    online: '#22c55e',
    offline: '#ef4444',
    checking: '#f59e0b',
  }
  return (
    <span style={{
      display: 'inline-block',
      width: 10, height: 10,
      borderRadius: '50%',
      background: colors[status],
      marginRight: 6
    }} />
  )
}

export default function StatusBar() {
  const [backend, setBackend] = useState('checking')
  const [source, setSource] = useState(null)

  useEffect(() => {
    axios.get('/api/health')
      .then(() => setBackend('online'))
      .catch(() => setBackend('offline'))
  }, [])

  useEffect(() => {
    axios.get('/api/messages')
      .then(res => setSource(res.data.source))
      .catch(() => {})
  }, [])

  return (
    <div className="status-bar">
      <div className="status-item">
        <StatusDot status={backend} />
        <span>Backend: <strong>{backend}</strong></span>
      </div>
      <div className="status-item">
        <StatusDot status={backend === 'online' ? 'online' : 'offline'} />
        <span>MongoDB: <strong>{backend === 'online' ? 'online' : 'offline'}</strong></span>
      </div>
      <div className="status-item">
        <StatusDot status={backend === 'online' ? 'online' : 'offline'} />
        <span>Redis: <strong>{backend === 'online' ? 'online' : 'offline'}</strong></span>
      </div>
      {source && (
        <div className="status-item source-badge">
          <span>Cache: <strong>{source === 'cache' ? '✓ Hit' : '✗ Miss'}</strong></span>
        </div>
      )}
    </div>
  )
}