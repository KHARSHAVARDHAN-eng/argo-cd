import * as React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {SearchBar} from './search-bar';

describe('SearchBar', () => {
    test('renders input with initial value', () => {
        render(<SearchBar value='initial' onChange={jest.fn()} />);
        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe('initial');
    });

    test('updates local input value immediately on user typing in simple mode', () => {
        const handleChange = jest.fn();
        render(<SearchBar value='' onChange={handleChange} />);
        const input = screen.getByRole('textbox') as HTMLInputElement;

        fireEvent.change(input, {target: {value: 'app-prod'}});
        expect(input.value).toBe('app-prod');
        expect(handleChange).toHaveBeenCalledWith('app-prod');
    });

    test('retains local typed input in autocomplete mode even when parent prop is stale', () => {
        const handleChange = jest.fn();
        // Simulate parent passing stale value '' while user types 'guestbook'
        const {rerender} = render(
            <SearchBar
                value=''
                onChange={handleChange}
                autocomplete={{
                    items: ['guestbook-prod', 'guestbook-staging', 'frontend-app'],
                    onSelect: jest.fn()
                }}
            />
        );

        const input = screen.getByRole('textbox') as HTMLInputElement;

        // User types 'guest'
        fireEvent.change(input, {target: {value: 'guest'}});
        expect(input.value).toBe('guest');
        expect(handleChange).toHaveBeenCalledWith('guest');

        // Parent re-renders with stale value '' (e.g. before router/query params update)
        rerender(
            <SearchBar
                value=''
                onChange={handleChange}
                autocomplete={{
                    items: ['guestbook-prod', 'guestbook-staging', 'frontend-app'],
                    onSelect: jest.fn()
                }}
            />
        );

        // Input value must remain 'guest' and NOT be wiped back to ''
        expect(input.value).toBe('guest');
    });

    test('updates local input value when parent prop changes from an external source', () => {
        const handleChange = jest.fn();
        const {rerender} = render(<SearchBar value='old-query' onChange={handleChange} />);
        const input = screen.getByRole('textbox') as HTMLInputElement;

        expect(input.value).toBe('old-query');

        // Simulate external URL change (e.g. browser back button or clear filter button)
        rerender(<SearchBar value='new-external-query' onChange={handleChange} />);
        expect(input.value).toBe('new-external-query');
    });

    test('clears input and invokes onChange when clear icon is clicked', () => {
        const handleChange = jest.fn();
        render(<SearchBar value='my-app' onChange={handleChange} />);

        const clearIcon = document.querySelector('.fa-times');
        expect(clearIcon).not.toBeNull();

        fireEvent.click(clearIcon!);
        expect(handleChange).toHaveBeenCalledWith('');
    });

    test('applies regex invalid class when regexEnabled and regex pattern is invalid', () => {
        render(<SearchBar value='[' regexEnabled={true} onChange={jest.fn()} />);
        const inputContainer = document.querySelector('.search-bar__input');
        expect(inputContainer?.classList.contains('search-bar__input--regex-invalid')).toBe(true);
    });
});
