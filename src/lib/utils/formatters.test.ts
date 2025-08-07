import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	formatPrice,
	formatPercentage,
	formatChange,
	getPriceChangeClass,
	formatLastUpdated,
	debounce
} from './formatters';

describe('formatters', () => {
	describe('formatPrice', () => {
		it('formats valid prices with 2 decimal places', () => {
			expect(formatPrice(123.45)).toBe('123.45');
			expect(formatPrice(0)).toBe('0.00');
			expect(formatPrice(123.4)).toBe('123.40');
		});

		it('handles null/undefined/NaN values', () => {
			expect(formatPrice(null)).toBe('--');
			expect(formatPrice(undefined)).toBe('--');
			expect(formatPrice(NaN)).toBe('--');
		});
	});

	describe('formatPercentage', () => {
		it('formats percentages with sign display', () => {
			expect(formatPercentage(5.25)).toBe('+5.25%');
			expect(formatPercentage(-2.75)).toBe('-2.75%');
			expect(formatPercentage(0)).toBe('+0.00%');
		});

		it('handles null/undefined/NaN values', () => {
			expect(formatPercentage(null)).toBe('--');
			expect(formatPercentage(undefined)).toBe('--');
			expect(formatPercentage(NaN)).toBe('--');
		});
	});

	describe('formatChange', () => {
		it('formats change values with sign display', () => {
			expect(formatChange(1.23)).toBe('+1.23');
			expect(formatChange(-4.56)).toBe('-4.56');
			expect(formatChange(0)).toBe('+0.00');
		});

		it('handles null/undefined/NaN values', () => {
			expect(formatChange(null)).toBe('--');
			expect(formatChange(undefined)).toBe('--');
			expect(formatChange(NaN)).toBe('--');
		});
	});

	describe('getPriceChangeClass', () => {
		it('returns correct CSS classes', () => {
			expect(getPriceChangeClass(5)).toBe('positive');
			expect(getPriceChangeClass(-3)).toBe('negative');
			expect(getPriceChangeClass(0)).toBe('neutral');
		});

		it('handles null/undefined/NaN values', () => {
			expect(getPriceChangeClass(null)).toBe('neutral');
			expect(getPriceChangeClass(undefined)).toBe('neutral');
			expect(getPriceChangeClass(NaN)).toBe('neutral');
		});
	});

	describe('formatLastUpdated', () => {
		beforeEach(() => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2025-01-07T12:00:00Z'));
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('formats recent timestamps', () => {
			const now = new Date('2025-01-07T12:00:00Z');
			
			expect(formatLastUpdated(new Date(now.getTime() - 5000))).toBe('Just now');
			expect(formatLastUpdated(new Date(now.getTime() - 30000))).toBe('30s ago');
			expect(formatLastUpdated(new Date(now.getTime() - 120000))).toBe('2m ago');
		});

		it('handles null dates', () => {
			expect(formatLastUpdated(null)).toBe('Never');
		});
	});

	describe('debounce', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('debounces function calls', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 100);

			debouncedFn('arg1');
			debouncedFn('arg2');
			debouncedFn('arg3');

			expect(mockFn).not.toHaveBeenCalled();

			vi.advanceTimersByTime(100);

			expect(mockFn).toHaveBeenCalledOnce();
			expect(mockFn).toHaveBeenCalledWith('arg3');
		});
	});
});