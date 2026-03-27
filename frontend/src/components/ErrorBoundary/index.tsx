import React from 'react';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to error reporting service (Sentry, etc.)
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
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
              Đã xảy ra lỗi
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
              Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại hoặc tải lại trang.
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
                    navigator.clipboard.writeText(`Error: ${errMsg}\n${errStack}`);
                  }}
                >
                  Copy lỗi
                </Button>
              )}
              <Button variant="outlined" onClick={this.handleReset}>
                Thử lại
              </Button>
              <Button variant="contained" onClick={this.handleReload}>
                Tải lại trang
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
