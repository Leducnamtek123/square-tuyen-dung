import React from 'react';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import i18next from 'i18next';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const stack = errorInfo?.componentStack || null;
    this.setState({ componentStack: stack });
    // Log to error reporting service (Sentry, etc.)
    console.error('[ErrorBoundary] Caught error:', error);
    if (stack) console.error('[ErrorBoundary] Component stack:', stack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, componentStack: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center',
              py: 4,
            }}
          >
            <ErrorOutlineIcon
              sx={{ fontSize: 80, color: 'error.main', mb: 2, opacity: 0.8 }}
            />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              {i18next.t('common:errorBoundary.title', 'Đã xảy ra lỗi')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
              {i18next.t('common:errorBoundary.message', 'Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại hoặc tải lại trang.')}
            </Typography>
            {this.state.error && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  maxWidth: '100%',
                  overflow: 'auto',
                  textAlign: 'left',
                }}
              >
                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.message}
                </Typography>
                {this.state.componentStack && (
                  <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 1, pt: 1, borderTop: '1px solid #ddd', color: 'text.secondary', fontSize: '0.65rem', maxHeight: 200, overflow: 'auto' }}>
                    Component Stack:{this.state.componentStack}
                  </Typography>
                )}
              </Box>
            )}
            <Stack direction="row" spacing={2}>
              {this.state.error && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    const errMsg = this.state.error?.message || 'Unknown error';
                    const errStack = this.state.error?.stack || '';
                    const compStack = this.state.componentStack || '';
                    navigator.clipboard.writeText(`Error: ${errMsg}\n${errStack}\n\nComponent Stack:${compStack}`);
                  }}
                >
                  {i18next.t('common:errorBoundary.copyError', 'Copy lỗi')}
                </Button>
              )}
              <Button variant="outlined" onClick={this.handleReset}>
                {i18next.t('common:errorBoundary.retry', 'Thử lại')}
              </Button>
              <Button variant="contained" onClick={this.handleReload}>
                {i18next.t('common:errorBoundary.reload', 'Tải lại trang')}
              </Button>
            </Stack>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
