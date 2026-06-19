import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

async function fetchMessages() {
  const res = await axios.get('/api/messages')
  return res.data
}

async function postMessage(text) {
  const res = await axios.post('/api/messages', { text })
  return res.data
}

function Message({ text, createdAt }) {
  return (
    <div className="message">
      <p className="message-text">{text}</p>
      <span className="message-time">
        {new Date(createdAt).toLocaleString()}
      </span>
    </div>
  )
}

export default function MessageBoard() {
  const [input, setInput] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['messages'],
    queryFn: fetchMessages,
    refetchInterval: 10000,
  })

  const mutation = useMutation({
    mutationFn: postMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      setInput('')
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return
    mutation.mutate(input)
  }

  return (
    <div className="board">
      <div className="card">
        <h2>Post a Message</h2>
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            className="btn"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Messages
          <span className="count">
            {data?.data?.length || 0}
          </span>
        </h2>
        {isLoading && <p className="state-msg">Loading...</p>}
        {isError && <p className="state-msg error">Failed to load messages.</p>}
        {data?.data?.length === 0 && (
          <p className="state-msg">No messages yet. Post one above!</p>
        )}
        <div className="messages">
          {data?.data?.map((m, i) => (
            <Message key={i} text={m.text} createdAt={m.createdAt} />
          ))}
        </div>
      </div>
    </div>
  )
}