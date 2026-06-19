import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Header from './components/Header'
import MessageBoard from './components/MessageBoard'
import StatusBar from './components/StatusBar'
import './App.css'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <Header />
        <main className="main">
          <StatusBar />
          <MessageBoard />
        </main>
      </div>
    </QueryClientProvider>
  )
}