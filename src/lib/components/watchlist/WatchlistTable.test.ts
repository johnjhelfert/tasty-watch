import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatPrice, formatChange, getPriceChangeClass } from '$lib/utils/formatters';
import type { QuoteData } from '$lib/types/api';

describe('WatchlistTable Component Logic', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should format quote prices correctly', () => {
		const mockQuote: Partial<QuoteData> = {
			symbol: 'AAPL',
			last: '150.22',
			bid: '150.20',
			ask: '150.25',
			open: '149.80',
			'prev-close': '149.50'
		};

		// Test price formatting
		expect(formatPrice(parseFloat(mockQuote.last!))).toBe('150.22');
		expect(formatPrice(parseFloat(mockQuote.bid!))).toBe('150.20');
		expect(formatPrice(parseFloat(mockQuote.ask!))).toBe('150.25');
	});

	it('should calculate price change correctly', () => {
		const mockQuote: Partial<QuoteData> = {
			last: '150.22',
			'prev-close': '149.50'
		};

		const change = parseFloat(mockQuote.last!) - parseFloat(mockQuote['prev-close']!);
		const changePercent = (change / parseFloat(mockQuote['prev-close']!)) * 100;

		expect(change).toBeCloseTo(0.72, 2);
		expect(changePercent).toBeCloseTo(0.48, 2);
		expect(getPriceChangeClass(change)).toBe('positive');
	});

	it('should format negative price changes', () => {
		const mockQuote: Partial<QuoteData> = {
			last: '148.75',
			'prev-close': '149.50'
		};

		const change = parseFloat(mockQuote.last!) - parseFloat(mockQuote['prev-close']!);
		const changePercent = (change / parseFloat(mockQuote['prev-close']!)) * 100;

		expect(change).toBeCloseTo(-0.75, 2);
		expect(changePercent).toBeCloseTo(-0.50, 2);
		expect(getPriceChangeClass(change)).toBe('negative');
		expect(formatChange(change)).toBe('-0.75');
	});

	it('should handle missing quote data gracefully', () => {
		const mockQuote: Partial<QuoteData> = {
			symbol: 'UNKNOWN'
		};

		expect(formatPrice(parseFloat(mockQuote.last || 'NaN'))).toBe('--');
		expect(formatPrice(parseFloat(mockQuote.bid || 'NaN'))).toBe('--');
		expect(getPriceChangeClass(NaN)).toBe('neutral');
	});

	it('should identify trading halted stocks', () => {
		const haltedQuote: Partial<QuoteData> = {
			symbol: 'HALTED',
			'is-trading-halted': true,
			last: '100.00'
		};

		const normalQuote: Partial<QuoteData> = {
			symbol: 'NORMAL',
			'is-trading-halted': false,
			last: '100.00'
		};

		expect(haltedQuote['is-trading-halted']).toBe(true);
		expect(normalQuote['is-trading-halted']).toBe(false);
	});

	it('should sort watchlist entries by symbol', () => {
		const mockEntries = [
			{ symbol: 'TSLA', 'instrument-type': 'Equity' },
			{ symbol: 'AAPL', 'instrument-type': 'Equity' },
			{ symbol: 'MSFT', 'instrument-type': 'Equity' }
		];

		const sorted = [...mockEntries].sort((a, b) => a.symbol.localeCompare(b.symbol));

		expect(sorted[0].symbol).toBe('AAPL');
		expect(sorted[1].symbol).toBe('MSFT');
		expect(sorted[2].symbol).toBe('TSLA');
	});

	it('should validate symbol removal logic', () => {
		const mockEntries = [
			{ symbol: 'AAPL', 'instrument-type': 'Equity' },
			{ symbol: 'TSLA', 'instrument-type': 'Equity' },
			{ symbol: 'MSFT', 'instrument-type': 'Equity' }
		];

		const symbolToRemove = 'TSLA';
		const filteredEntries = mockEntries.filter(entry => entry.symbol !== symbolToRemove);

		expect(filteredEntries).toHaveLength(2);
		expect(filteredEntries.find(entry => entry.symbol === 'TSLA')).toBeUndefined();
		expect(filteredEntries.find(entry => entry.symbol === 'AAPL')).toBeDefined();
	});

	it('should handle bid-ask spread calculation', () => {
		const mockQuote: Partial<QuoteData> = {
			bid: '150.20',
			ask: '150.25'
		};

		const spread = parseFloat(mockQuote.ask!) - parseFloat(mockQuote.bid!);
		const spreadPercent = (spread / parseFloat(mockQuote.bid!)) * 100;

		expect(spread).toBeCloseTo(0.05, 2);
		expect(spreadPercent).toBeCloseTo(0.033, 3);
	});
});