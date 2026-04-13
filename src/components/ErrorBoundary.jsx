import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 32px',
          fontFamily: 'Inter, sans-serif',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 12,
          margin: 24,
          color: '#dc2626',
        }}>
          <h2 style={{ marginBottom: 12, fontSize: 18 }}>⚠ Something went wrong</h2>
          <pre style={{
            background: '#fff',
            padding: 16,
            borderRadius: 8,
            fontSize: 12,
            overflowX: 'auto',
            color: '#111827',
            border: '1px solid #e8eaed',
          }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: 16,
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#4f46e5',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
