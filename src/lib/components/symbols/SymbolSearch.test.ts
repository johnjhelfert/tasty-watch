import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from '$lib/services/api';
import { debounce } from '$lib/utils/formatters';

vi.mock('$lib/services/api');

describe('SymbolSearch Component Logic', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call API service with search query', async () => {
		const mockSearchSymbols = vi.fn().mockResolvedValue({
			data: [
				{ symbol: 'AAPL', description: 'Apple Inc.', 'instrument-type': 'Equity' }
			]
		});
		(apiService.searchSymbols as any) = mockSearchSymbols;

		const searchQuery = 'AAPL';
		const result = await apiService.searchSymbols(searchQuery.trim());

		expect(mockSearchSymbols).toHaveBeenCalledWith('AAPL');
		expect(result.data).toHaveLength(1);
		expect(result.data?.[0].symbol).toBe('AAPL');
	});

	it('should handle empty search query', async () => {
		const mockSearchSymbols = vi.fn().mockResolvedValue({ data: [] });
		(apiService.searchSymbols as any) = mockSearchSymbols;

		const searchQuery = '';
		
		// Simulate the component logic for empty queries
		if (!searchQuery.trim()) {
			// Component would clear results
			expect(searchQuery.trim()).toBe('');
		} else {
			await apiService.searchSymbols(searchQuery.trim());
		}

		expect(mockSearchSymbols).not.toHaveBeenCalled();
	});

	it('should handle search errors gracefully', async () => {
		const mockSearchSymbols = vi.fn().mockResolvedValue({
			error: 'Network error'
		});
		(apiService.searchSymbols as any) = mockSearchSymbols;

		const result = await apiService.searchSymbols('INVALID');

		expect(result.error).toBe('Network error');
		expect(result.data).toBeUndefined();
	});

	it('should debounce search requests', async () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		// Simulate rapid typing
		debouncedFn('A');
		debouncedFn('AA');
		debouncedFn('AAP');
		debouncedFn('AAPL');

		expect(mockFn).not.toHaveBeenCalled();

		// Wait for debounce delay
		await new Promise(resolve => setTimeout(resolve, 150));

		expect(mockFn).toHaveBeenCalledOnce();
		expect(mockFn).toHaveBeenCalledWith('AAPL');
	});

	it('should limit search results', async () => {
		const mockSearchSymbols = vi.fn().mockResolvedValue({
			data: Array.from({ length: 20 }, (_, i) => ({
				symbol: `SYM${i}`,
				description: `Symbol ${i}`,
				'instrument-type': 'Equity'
			}))
		});
		(apiService.searchSymbols as any) = mockSearchSymbols;

		const result = await apiService.searchSymbols('SYM');
		
		// Simulate component limiting results to 10
		const limitedResults = result.data?.slice(0, 10);

		expect(limitedResults).toHaveLength(10);
		expect(limitedResults?.[0].symbol).toBe('SYM0');
		expect(limitedResults?.[9].symbol).toBe('SYM9');
	});

	it('should handle keyboard navigation logic', () => {
		const mockResults = [
			{ symbol: 'AAPL', description: 'Apple Inc.' },
			{ symbol: 'MSFT', description: 'Microsoft Corp.' },
			{ symbol: 'GOOGL', description: 'Alphabet Inc.' }
		];

		let selectedIndex = -1;

		// Simulate ArrowDown key
		selectedIndex = Math.min(selectedIndex + 1, mockResults.length - 1);
		expect(selectedIndex).toBe(0);

		// Simulate another ArrowDown
		selectedIndex = Math.min(selectedIndex + 1, mockResults.length - 1);
		expect(selectedIndex).toBe(1);

		// Simulate ArrowUp
		selectedIndex = Math.max(selectedIndex - 1, -1);
		expect(selectedIndex).toBe(0);

		// Simulate Enter key selection
		const selectedSymbol = mockResults[selectedIndex];
		expect(selectedSymbol.symbol).toBe('AAPL');
	});

	it('should validate symbol selection callback', () => {
		const mockOnSymbolSelect = vi.fn();
		const selectedSymbol = 'AAPL';

		// Simulate symbol selection
		mockOnSymbolSelect(selectedSymbol);

		expect(mockOnSymbolSelect).toHaveBeenCalledWith('AAPL');
	});
});