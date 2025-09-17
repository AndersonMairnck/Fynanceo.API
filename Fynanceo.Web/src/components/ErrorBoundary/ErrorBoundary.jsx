import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'red', background: '#ffe6e6', border: '1px solid red', margin: '20px', borderRadius: '5px' }}>
                    <h2>⚠️ Algo deu errado no componente!</h2>
                    <p>Detalhes do erro:</p>
                    <details style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: '10px', borderRadius: '3px' }}>
                        <summary>Clique para ver detalhes técnicos</summary>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '10px', padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px' }}
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