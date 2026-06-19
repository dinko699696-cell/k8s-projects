import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import axios from 'axios'

async function fetchMessages() {
  const res = await axios.get('/api/messages')
  return res.data
}

async function fetchHealth() {
  const res = await axios.get('/api/health')
  return res.data
}

async function fetchInfo() {
  const res = await axios.get('/api/info')
  return res.data
}

async function postMessage(text) {
  const res = await axios.post('/api/messages', { text })
  return res.data
}

export default function Dashboard() {
  const [input, setInput] = useState('')
  const queryClient = useQueryClient()

  const { data: messages } = useQuery({
    queryKey: ['messages'],
    queryFn: fetchMessages,
    refetchInterval: 10000,
  })

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 15000,
  })

  const { data: info } = useQuery({
    queryKey: ['info'],
    queryFn: fetchInfo,
  })

  const mutation = useMutation({
    mutationFn: postMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      setInput('')
    },
  })

  const isOnline = health?.status === 'ok'
  const msgCount = messages?.data?.length || 0
  const cacheSource = messages?.source

  function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return
    mutation.mutate(input)
  }

  return (
    <div className="dashboard">

      <div className="metrics">
        <div className="metric-card">
          <div className="metric-label">Messages</div>
          <div className="metric-value">{msgCount}</div>
          <div className="metric-sub green">total stored</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Cache</div>
          <div className="metric-value">{cacheSource === 'cache' ? 'HIT' : 'MISS'}</div>
          <div className="metric-sub blue">Redis status</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Backend</div>
          <div className="metric-value">{isOnline ? '●' : '○'}</div>
          <div className={`metric-sub ${isOnline ? 'green' : 'red'}`}>
            {isOnline ? 'online' : 'offline'}
          </div>
        </div>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">⬡ Services</span>
          </div>
          <div className="svc-row">
            <span className="svc-name">Backend</span>
            <span className={`svc-val ${isOnline ? 'green' : 'red'}`}>
              {isOnline ? 'online' : 'offline'}
            </span>
          </div>
          <div className="svc-row">
            <span className="svc-name">MongoDB</span>
            <span className="svc-val green">{isOnline ? 'online' : 'offline'}</span>
          </div>
          <div className="svc-row">
            <span className="svc-name">Redis</span>
            <span className="svc-val green">{isOnline ? 'online' : 'offline'}</span>
          </div>
          <div className="svc-row">
            <span className="svc-name">Cache source</span>
            <span className={`svc-val ${cacheSource === 'cache' ? 'green' : 'amber'}`}>
              {cacheSource || '—'}
            </span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">ℹ Backend info</span>
          </div>
          <div className="svc-row">
            <span className="svc-name">Node version</span>
            <span className="svc-val blue">{info?.node || '—'}</span>
          </div>
          <div className="svc-row">
            <span className="svc-name">Database</span>
            <span className="svc-val blue">{info?.database || '—'}</span>
          </div>
          <div className="svc-row">
            <span className="svc-name">Namespace</span>
            <span className="svc-val blue">{info?.namespace || '—'}</span>
          </div>
          <div className="svc-row">
            <span className="svc-name">Replicas</span>
            <span className="svc-val blue">{info?.replicas ?? '—'} / 1</span>
          </div>
          <div className="svc-row">
            <span className="svc-name">MongoDB</span>
            <span className="svc-val green">{info?.mongoUrl || '—'}</span>
          </div>
          <div className="svc-row">
            <span className="svc-name">Redis</span>
            <span className="svc-val green">{info?.redisUrl || '—'}</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">✉ Messages</span>
          <span className="panel-badge">{msgCount}</span>
        </div>
        <form className="msg-form" onSubmit={handleSubmit}>
          <input
            className="msg-input"
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button className="msg-btn" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Sending...' : 'Send'}
          </button>
        </form>
        <div className="msg-list">
          {messages?.data?.length === 0 && (
            <p className="msg-empty">No messages yet. Post one above!</p>
          )}
          {messages?.data?.map((m, i) => (
            <div className="msg-item" key={i}>
              <span className="msg-text">{m.text}</span>
              <span className="msg-time">{new Date(m.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}