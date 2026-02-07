import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagInput from './TagInput';

describe('TagInput', () => {
  it('renders with label and placeholder', () => {
    render(
      <TagInput label="Test Tags" tags={[]} onChange={jest.fn()} placeholder="Add tags" />
    );
    expect(screen.getByText('Test Tags')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add tags')).toBeInTheDocument();
  });

  it('displays existing tags', () => {
    render(
      <TagInput label="Tags" tags={['Italian', 'Mexican']} onChange={jest.fn()} />
    );
    expect(screen.getByText('Italian')).toBeInTheDocument();
    expect(screen.getByText('Mexican')).toBeInTheDocument();
  });

  it('adds a tag when Enter is pressed', async () => {
    const onChange = jest.fn();
    render(
      <TagInput label="Tags" tags={[]} onChange={onChange} placeholder="Add" />
    );

    const input = screen.getByPlaceholderText('Add');
    await userEvent.type(input, 'Italian{enter}');
    expect(onChange).toHaveBeenCalledWith(['Italian']);
  });

  it('removes a tag when X is clicked', () => {
    const onChange = jest.fn();
    render(
      <TagInput label="Tags" tags={['Italian', 'Mexican']} onChange={onChange} />
    );

    const removeBtn = screen.getByLabelText('Remove Italian');
    fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith(['Mexican']);
  });

  it('does not add duplicate tags', async () => {
    const onChange = jest.fn();
    render(
      <TagInput label="Tags" tags={['Italian']} onChange={onChange} placeholder="Add" />
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Italian{enter}');
    expect(onChange).not.toHaveBeenCalled();
  });
});
