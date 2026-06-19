import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import './App.css'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <Header />
        <div className="layout">
          <Sidebar />
          <main className="content">
            <Dashboard />
          </main>
        </div>
      </div>
    </QueryClientProvider>
  )
}