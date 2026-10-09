import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders primary variant by default', () => {
    const { getByText } = render(
      <Button title="Primary Button" onPress={() => {}} />
    );
    const button = getByText('Primary Button').parent;
    expect(button).toBeTruthy();
  });

  it('renders secondary variant correctly', () => {
    const { getByText } = render(
      <Button title="Secondary Button" onPress={() => {}} variant="secondary" />
    );
    expect(getByText('Secondary Button')).toBeTruthy();
  });

  it('renders ghost variant correctly', () => {
    const { getByText } = render(
      <Button title="Ghost Button" onPress={() => {}} variant="ghost" />
    );
    expect(getByText('Ghost Button')).toBeTruthy();
  });

  it('disables button when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <Button title="Disabled Button" onPress={mockOnPress} disabled={true} />
    );
    
    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
    
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading prop is true', () => {
    const { queryByText } = render(
      <Button title="Loading Button" onPress={() => {}} loading={true} />
    );
    
    // Text should not be visible when loading
    expect(queryByText('Loading Button')).toBeNull();
  });

  it('disables button when loading', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <Button title="Loading Button" onPress={mockOnPress} loading={true} />
    );
    
    // Button should be disabled when loading
    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('applies fullWidth style when fullWidth prop is true', () => {
    const { getByText } = render(
      <Button title="Full Width Button" onPress={() => {}} fullWidth={true} />
    );
    expect(getByText('Full Width Button')).toBeTruthy();
  });
});
