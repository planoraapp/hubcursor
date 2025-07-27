import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 border border-destructive/50 rounded-lg bg-destructive/5">
          <div className="text-destructive text-lg font-semibold mb-2">
            Oops! Algo deu errado
          </div>
          <p className="text-muted-foreground text-center mb-4">
            Houve um erro inesperado. Tente recarregar a página.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="habbo-green-button"
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;