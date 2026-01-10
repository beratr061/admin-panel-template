/**
 * Property Test: Combobox Filters Options on Search
 * Feature: admin-panel-template, Property 18: Combobox Filters Options on Search
 * Validates: Requirements 5.3
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { Combobox, MultiCombobox, ComboboxOption } from './combobox';

// Helper to generate valid options
const generateOptions = (count: number): ComboboxOption[] => {
  return Array.from({ length: count }, (_, i) => ({
    value: `option-${i}`,
    label: `Option ${i}`,
  }));
};

describe('Combobox - Property Tests', () => {
  beforeEach(() => {
    cleanup();
  });

  /**
   * Property 18: Combobox Filters Options on Search
   * For any search term entered in combobox, only options containing the search term
   * should be displayed.
   */
  it('Property 18: For any search term, only matching options should be displayed', () => {
    fc.assert(
      fc.property(
        // Generate a list of option labels
        fc.array(fc.stringMatching(/^[a-zA-Z]{3,10}$/), { minLength: 5, maxLength: 20 }),
        // Generate a search term (substring of one of the labels or random)
        fc.stringMatching(/^[a-zA-Z]{1,5}$/),
        (labels, searchTerm) => {
          cleanup();

          // Create unique options from labels
          const uniqueLabels = [...new Set(labels)];
          const options: ComboboxOption[] = uniqueLabels.map((label, i) => ({
            value: `value-${i}`,
            label,
          }));

          if (options.length === 0) return; // Skip if no options

          const mockOnChange = vi.fn();
          render(
            <Combobox
              options={options}
              onChange={mockOnChange}
              placeholder="Select..."
            />
          );

          // Open the combobox
          const trigger = screen.getByRole('combobox');
          fireEvent.click(trigger);

          // Type in the search input
          const searchInput = screen.getByPlaceholderText('Ara...');
          fireEvent.change(searchInput, { target: { value: searchTerm } });

          // Get all displayed option buttons (excluding the search input)
          const displayedOptions = screen.queryAllByRole('button').filter(
            (btn) => btn.textContent && options.some((opt) => opt.label === btn.textContent)
          );

          // Calculate expected matching options
          const searchLower = searchTerm.toLowerCase();
          const expectedMatches = options.filter((opt) =>
            opt.label.toLowerCase().includes(searchLower)
          );

          // Verify: displayed options should match expected
          if (expectedMatches.length === 0) {
            // Should show "no results" message
            expect(screen.getByText('Sonuç bulunamadı.')).toBeInTheDocument();
          } else {
            // All displayed options should contain the search term
            displayedOptions.forEach((optionBtn) => {
              const label = optionBtn.textContent || '';
              expect(label.toLowerCase()).toContain(searchLower);
            });

            // Number of displayed options should match expected
            expect(displayedOptions.length).toBe(expectedMatches.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 18: For empty search term, all options should be displayed', () => {
    fc.assert(
      fc.property(
        // Generate a list of option labels
        fc.array(fc.stringMatching(/^[a-zA-Z]{3,10}$/), { minLength: 3, maxLength: 10 }),
        (labels) => {
          cleanup();

          // Create unique options from labels
          const uniqueLabels = [...new Set(labels)];
          const options: ComboboxOption[] = uniqueLabels.map((label, i) => ({
            value: `value-${i}`,
            label,
          }));

          if (options.length === 0) return; // Skip if no options

          const mockOnChange = vi.fn();
          render(
            <Combobox
              options={options}
              onChange={mockOnChange}
              placeholder="Select..."
            />
          );

          // Open the combobox
          const trigger = screen.getByRole('combobox');
          fireEvent.click(trigger);

          // Don't type anything (empty search)
          // Get all displayed option buttons
          const displayedOptions = screen.queryAllByRole('button').filter(
            (btn) => btn.textContent && options.some((opt) => opt.label === btn.textContent)
          );

          // All options should be displayed
          expect(displayedOptions.length).toBe(options.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 18: Search filtering is case-insensitive', () => {
    fc.assert(
      fc.property(
        // Generate a label with mixed case
        fc.stringMatching(/^[a-zA-Z]{5,10}$/),
        (label) => {
          cleanup();

          const options: ComboboxOption[] = [
            { value: 'test', label },
          ];

          // Generate search term as lowercase version of part of the label
          const searchTerm = label.substring(0, 3).toLowerCase();

          const mockOnChange = vi.fn();
          render(
            <Combobox
              options={options}
              onChange={mockOnChange}
              placeholder="Select..."
            />
          );

          // Open the combobox
          const trigger = screen.getByRole('combobox');
          fireEvent.click(trigger);

          // Type lowercase search term
          const searchInput = screen.getByPlaceholderText('Ara...');
          fireEvent.change(searchInput, { target: { value: searchTerm } });

          // The option should still be visible (case-insensitive match)
          const displayedOptions = screen.queryAllByRole('button').filter(
            (btn) => btn.textContent === label
          );

          expect(displayedOptions.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  describe('MultiCombobox - Property Tests', () => {
    it('Property 18: MultiCombobox filters options on search the same way', () => {
      fc.assert(
        fc.property(
          // Generate a list of option labels
          fc.array(fc.stringMatching(/^[a-zA-Z]{3,10}$/), { minLength: 5, maxLength: 15 }),
          // Generate a search term
          fc.stringMatching(/^[a-zA-Z]{1,4}$/),
          (labels, searchTerm) => {
            cleanup();

            // Create unique options from labels
            const uniqueLabels = [...new Set(labels)];
            const options: ComboboxOption[] = uniqueLabels.map((label, i) => ({
              value: `value-${i}`,
              label,
            }));

            if (options.length === 0) return; // Skip if no options

            const mockOnChange = vi.fn();
            render(
              <MultiCombobox
                options={options}
                value={[]}
                onChange={mockOnChange}
                placeholder="Select..."
              />
            );

            // Open the combobox
            const trigger = screen.getByRole('combobox');
            fireEvent.click(trigger);

            // Type in the search input
            const searchInput = screen.getByPlaceholderText('Ara...');
            fireEvent.change(searchInput, { target: { value: searchTerm } });

            // Calculate expected matching options
            const searchLower = searchTerm.toLowerCase();
            const expectedMatches = options.filter((opt) =>
              opt.label.toLowerCase().includes(searchLower)
            );

            // Verify filtering works
            if (expectedMatches.length === 0) {
              expect(screen.getByText('Sonuç bulunamadı.')).toBeInTheDocument();
            } else {
              const displayedOptions = screen.queryAllByRole('button').filter(
                (btn) => btn.textContent && options.some((opt) => opt.label === btn.textContent)
              );

              displayedOptions.forEach((optionBtn) => {
                const label = optionBtn.textContent || '';
                expect(label.toLowerCase()).toContain(searchLower);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
