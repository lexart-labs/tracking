import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dashboard Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700 text-sm">
          <i className="ri-error-warning-line mr-2"></i>
          Hubo un problema al cargar esta sección.
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="ml-4 underline font-bold"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
