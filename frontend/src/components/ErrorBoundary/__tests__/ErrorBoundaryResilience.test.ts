import React from 'react';
import ErrorBoundary from '../index';

describe('ErrorBoundary Resilience & Error Recovery', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('getDerivedStateFromError updates state to hasError = true with error object', () => {
    const error = new Error('Client-side API response was null and triggered crash');
    const state = ErrorBoundary.getDerivedStateFromError(error);

    expect(state).toEqual({
      hasError: true,
      error,
    });
  });

  it('handleReset resets error boundary state so component can re-attempt rendering', () => {
    const boundary = new ErrorBoundary({ children: React.createElement('div', null, 'child') });
    boundary.state = {
      hasError: true,
      error: new Error('Runtime crash in table component'),
      componentStack: 'in TableBody',
    };
    boundary.setState = jest.fn((newState) => {
      Object.assign(boundary.state, newState);
    });

    boundary.handleReset();

    expect(boundary.setState).toHaveBeenCalledWith({
      hasError: false,
      error: null,
      componentStack: null,
    });
    expect(boundary.state).toEqual({
      hasError: false,
      error: null,
      componentStack: null,
    });
  });

  it('componentDidCatch logs error and updates componentStack', () => {
    const boundary = new ErrorBoundary({ children: React.createElement('div', null, 'child') });
    boundary.setState = jest.fn();

    const err = new Error('HTTP 500 Unhandled Error in JobDetail');
    const info = { componentStack: 'in JobDetailPage\n in div' };

    boundary.componentDidCatch(err, info);

    expect(boundary.setState).toHaveBeenCalledWith({
      componentStack: 'in JobDetailPage\n in div',
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ErrorBoundary] Caught error:', err);
  });

  it('returns fallback prop when hasError is true and fallback is provided', () => {
    const customFallback = React.createElement('div', { id: 'custom-fallback' }, 'Error occurred');
    const boundary = new ErrorBoundary({
      children: React.createElement('div', null, 'normal child'),
      fallback: customFallback,
    });
    boundary.state = {
      hasError: true,
      error: new Error('Failed to load HRM attendance'),
      componentStack: null,
    };

    const rendered = boundary.render();
    expect(rendered).toBe(customFallback);
  });

  it('returns children normally when hasError is false', () => {
    const child = React.createElement('div', { id: 'normal-content' }, 'All OK');
    const boundary = new ErrorBoundary({ children: child });
    boundary.state = {
      hasError: false,
      error: null,
      componentStack: null,
    };

    const rendered = boundary.render();
    expect(rendered).toBe(child);
  });
});
