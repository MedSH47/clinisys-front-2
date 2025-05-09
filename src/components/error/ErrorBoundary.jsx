// src/components/ErrorBoundary.jsx
import React from 'react'
import { Alert } from 'react-bootstrap'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, error: err }
  }
  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="danger" className="m-4">
          <Alert.Heading>Something went wrong!</Alert.Heading>
          <pre>{this.state.error?.toString()}</pre>
        </Alert>
      )
    }
    return this.props.children
  }
}
