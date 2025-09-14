import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log do erro para monitoramento
        // Callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, children } = this.props;
    const { hasError } = this.state;

    // Reset automático quando props mudam (útil para recarregar dados)
    if (hasError && resetOnPropsChange && prevProps.children !== children) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
    // Pequeno delay para evitar loop infinito
    this.resetTimeoutId = window.setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Fallback personalizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão mais bonito
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Ops! Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Ocorreu um erro inesperado. Você pode tentar recarregar a página ou voltar ao início.
              </p>
              
              {/* Mostrar detalhes do erro apenas em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                      Detalhes do erro (desenvolvimento)
                    </summary>
                    <div className="space-y-2 text-gray-600">
                      <div>
                        <strong>Erro:</strong> {this.state.error.message}
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong>Componente:</strong>
                          <pre className="whitespace-pre-wrap text-xs mt-1">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                      <div>
                        <strong>ID:</strong> {this.state.errorId}
                      </div>
                    </div>
                  </details>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar o Error Boundary de forma mais simples
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
