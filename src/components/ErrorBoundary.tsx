import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#080b10' }}>
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">💥</div>
            <h1 className="text-2xl font-bold text-white font-display mb-3">Something went wrong</h1>
            <p className="text-gray-400 text-sm mb-8 font-mono-custom">{this.state.message}</p>
            <Link to="/" onClick={() => this.setState({ hasError: false, message: '' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)', color: '#000' }}>
              Back to Home
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
