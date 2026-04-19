import { describe, it, expect } from 'vitest';
import { usePagination } from '@/hooks/usePagination';

describe('usePagination', () => {
  // ─── totalPages <= paginationItemsToDisplay ──────────────
  it('returns all pages when totalPages <= paginationItemsToDisplay', () => {
    const result = usePagination({ currentPage: 1, totalPages: 3, paginationItemsToDisplay: 5 });
    expect(result.pages).toEqual([1, 2, 3]);
    expect(result.showLeftEllipsis).toBe(false);
    expect(result.showRightEllipsis).toBe(false);
  });

  it('returns single page correctly', () => {
    const result = usePagination({ currentPage: 1, totalPages: 1, paginationItemsToDisplay: 5 });
    expect(result.pages).toEqual([1]);
  });

  // ─── Standard window near left edge ──────────────────────
  it('returns pages near left edge with right ellipsis', () => {
    // currentPage=3, halfDisplay=2, initialRange={1,5}, adjusted: start=1, end=5
    // pages [1,2,3,4,5]; last=5 < 10 && 5 < 9 → right ellipsis true
    const result = usePagination({ currentPage: 3, totalPages: 10, paginationItemsToDisplay: 5 });
    expect(result.pages).toEqual([1, 2, 3, 4, 5]);
    expect(result.showLeftEllipsis).toBe(false);
    expect(result.showRightEllipsis).toBe(true);
  });

  // ─── Left ellipsis ────────────────────────────────────────
  it('shows left ellipsis when first displayed page > 2', () => {
    // currentPage=9, halfDisplay=2, initialRange={7,11}, adjusted: start=7, end=10
    // pages [7,8,9,10]; first=7>2 → left ellipsis true; last=10<totalPages-1=9? no (10 !< 9) → right false
    const result = usePagination({ currentPage: 9, totalPages: 10, paginationItemsToDisplay: 5 });
    expect(result.pages).toEqual([6, 7, 8, 9, 10]);
    expect(result.showLeftEllipsis).toBe(true);
    expect(result.showRightEllipsis).toBe(false);
  });

  // ─── Right ellipsis ───────────────────────────────────────
  it('shows right ellipsis when last displayed page < totalPages - 1', () => {
    // currentPage=2, halfDisplay=2, initialRange={0,4}, adjusted: start=1, end=4
    // pages [1,2,3,4]; first=1 not >2 → left false; last=4 < 9 (totalPages-1) → right true
    const result = usePagination({ currentPage: 2, totalPages: 10, paginationItemsToDisplay: 5 });
    expect(result.pages).toEqual([1, 2, 3, 4, 5]);
    expect(result.showLeftEllipsis).toBe(false);
    expect(result.showRightEllipsis).toBe(true);
  });

  // ─── Both ellipses ────────────────────────────────────────
  it('shows both ellipses when window is in the middle', () => {
    const result = usePagination({ currentPage: 6, totalPages: 20, paginationItemsToDisplay: 5 });
    expect(result.pages).toEqual([4, 5, 6, 7, 8]);
    expect(result.showLeftEllipsis).toBe(true);
    expect(result.showRightEllipsis).toBe(true);
  });

  // ─── Edge adjustment ────────────────────────────────────
  it('adjusts start when currentPage is near the end', () => {
    // currentPage=19, halfDisplay=2, initialRange={17,21}, adjusted: start=15, end=20
    const result = usePagination({ currentPage: 19, totalPages: 20, paginationItemsToDisplay: 5 });
    expect(result.pages).toEqual([16, 17, 18, 19, 20]);
    expect(result.showLeftEllipsis).toBe(true);
    expect(result.showRightEllipsis).toBe(false);
  });

  it('adjusts end when currentPage is near the start', () => {
    // currentPage=2, halfDisplay=2, initialRange={0,4}, adjusted: start=1, end=5
    const result = usePagination({ currentPage: 2, totalPages: 20, paginationItemsToDisplay: 5 });
    expect(result.pages).toEqual([1, 2, 3, 4, 5]);
    expect(result.showLeftEllipsis).toBe(false);
  });

  // ─── Boundary ─────────────────────────────────────────────
  it('handles currentPage=1 with totalPages=20', () => {
    const result = usePagination({ currentPage: 1, totalPages: 20, paginationItemsToDisplay: 5 });
    expect(result.pages).toEqual([1, 2, 3, 4, 5]);
  });

  it('handles currentPage=totalPages with totalPages=20', () => {
    const result = usePagination({ currentPage: 20, totalPages: 20, paginationItemsToDisplay: 5 });
    expect(result.pages).toEqual([16, 17, 18, 19, 20]);
  });
});
