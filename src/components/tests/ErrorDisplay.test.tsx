import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorDisplay } from '../ErrorDisplay';
import { useRouter } from 'expo-router';

jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

jest.mock('../Button', () => {
  const { Pressable, Text } = require('react-native');
  return {
    Button: ({ label, onPress }: any) => (
      <Pressable onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    )
  };
});

describe('ErrorDisplay Integration', () => {
  it('renders standard errors with Try Again button', () => {
    const handleRetry = jest.fn();
    const { getByText } = render(
      <ErrorDisplay errorCode="INVALID_FILE" onRetry={handleRetry} />
    );

    expect(getByText('Invalid File')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
    
    fireEvent.press(getByText('Try Again'));
    expect(handleRetry).toHaveBeenCalled();
  });

  it('renders PREMIUM_REQUIRED error with Go Premium button and routes to premium tab', () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    const { getByText, queryByText } = render(
      <ErrorDisplay errorCode="PREMIUM_REQUIRED" onRetry={jest.fn()} />
    );

    expect(getByText('Premium Required')).toBeTruthy();
    expect(getByText('Go Premium')).toBeTruthy();
    expect(queryByText('Try Again')).toBeNull();

    fireEvent.press(getByText('Go Premium'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/premium');
  });
});
