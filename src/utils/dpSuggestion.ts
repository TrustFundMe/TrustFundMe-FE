// Bounded Knapsack DP + Greedy for ITEMIZED donation suggestions
// Finds optimal item combinations closest to the donation amount

export type SuggestionItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export type SuggestionOption = {
  items: SuggestionItem[];
  total: number;
  diff: number; // total - amount (negative = below target, positive = above target)
  label?: string; // AI-generated short description
};

type ItemInput = {
  id: string;
  name: string;
  price: number;
  quantityLeft: number;
};

// Limits
const MAX_SCALED_BUDGET = 2000000; // 2M VND — higher cap so large amounts still generate suggestions
const MAX_ITEMS = 50;
const MAX_QTY_PER_ITEM = 20;
const MAX_OPTIONS = 5;
// MAX_RATIO: 2.0 to allow over-budget combos (e.g. buying more than target)
const MIN_RATIO = 0.05;
const MAX_RATIO = 2.0;

// ─── Helper: get item name ───────────────────────────────────────────────────

function itemToSuggestionItem(item: ItemInput, qty: number): SuggestionItem {
  return { id: item.id, name: item.name, quantity: qty, price: item.price };
}

// ─── Greedy: fill as close to target as possible ─────────────────────────────

function greedyGenerate(amount: number, items: ItemInput[]): SuggestionOption[] {
  if (amount <= 0 || items.length === 0) return [];

  const validItems = items.filter(i => i.price > 0 && i.quantityLeft > 0);
  if (validItems.length === 0) return [];

  // Sort by price ascending
  const sorted = [...validItems].sort((a, b) => a.price - b.price);

  let remaining = amount;
  const qtyMap: Record<string, number> = {};
  let totalSpent = 0;

  // Greedy: pick as many cheapest items as possible
  for (const item of sorted) {
    if (remaining <= 0) break;
    const maxCanBuy = Math.min(item.quantityLeft, Math.floor(remaining / item.price), MAX_QTY_PER_ITEM);
    if (maxCanBuy > 0) {
      qtyMap[item.id] = maxCanBuy;
      totalSpent += maxCanBuy * item.price;
      remaining -= maxCanBuy * item.price;
    }
  }

  // No items picked
  const pickedItems = Object.entries(qtyMap)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const item = sorted.find(i => i.id === id)!;
      return itemToSuggestionItem(item, qty);
    });

  if (pickedItems.length === 0) return [];

  return [{
    items: pickedItems,
    total: totalSpent,
    diff: totalSpent - amount,
    label: 'Greedy',
  }];
}

// ─── Merge + deduplicate + sort ──────────────────────────────────────────────

// ─── Brute-force: DISABLED (good for ≤4 items, fails at scale) ─────────────────
// DISABLED — using DP
// function bruteForce(amount, items): SuggestionOption[]

// ─── DP: bounded knapsack — stores ALL combos per total ─────────────────────────

function dpGenerate(amount: number, items: ItemInput[]): SuggestionOption[] {
  const scaledAmount = Math.min(amount, MAX_SCALED_BUDGET);
  if (scaledAmount <= 0) return [];

  // Include all items regardless of price — allow buying expensive single items
  // DP will only pick at most 1 of an expensive item (since maxQty = floor(amount/price) = 0 or 1)
  const eligible = items
    .filter(i => i.price > 0)
    .slice(0, MAX_ITEMS);
  if (eligible.length === 0) return [];

  // Map<total, SuggestionOption[]> — collect ALL unique combos per total
  const allCombos = new Map<number, SuggestionOption[]>();

  const n = eligible.length;
  const start = Date.now();

  // DP[i][b] = all combos reaching exactly total b using items 0..i-1
  // Stored as Map<key, quantityMap> → key is sorted name×qty string
  const dp: Map<number, Map<string, Record<string, number>>>[] = [];

  // Initialize dp[0] with empty combo at total 0
  const initCombo = new Map<string, Record<string, number>>();
  initCombo.set('', {});
  dp[0] = new Map<number, Map<string, Record<string, number>>>();
  dp[0].set(0, initCombo);

  for (let i = 0; i < n; i++) {
    if (Date.now() - start > 100) break;

    const item = eligible[i];
    const price = item.price;
    const maxQty = Math.min(item.quantityLeft, MAX_QTY_PER_ITEM, Math.floor(amount / price));
    if (maxQty === 0) continue;

    dp[i + 1] = new Map<number, Map<string, Record<string, number>>>();

    for (let b = 0; b <= scaledAmount; b++) {
      const combosAtB = dp[i].get(b);
      if (!combosAtB || combosAtB.size === 0) continue;

      // For this combo, try adding q of current item (0..maxQty)
      for (const [, baseQtyMap] of combosAtB) {
        const qtySoFar = baseQtyMap[item.id] || 0;
        const remainingRoom = maxQty - qtySoFar;
        if (remainingRoom <= 0) continue;

        for (let q = 1; q <= remainingRoom; q++) {
          const nb = b + q * price;
          if (nb > scaledAmount) break;

          // Build new quantity map
          const newQtyMap: Record<string, number> = { ...baseQtyMap };
          newQtyMap[item.id] = qtySoFar + q;

          // Key for dedup: sorted name×qty
          const key = eligible
            .filter(it => newQtyMap[it.id])
            .map(it => `${it.name}×${newQtyMap[it.id]}`)
            .sort()
            .join('|');

          if (!dp[i + 1].has(nb)) {
            dp[i + 1].set(nb, new Map<string, Record<string, number>>());
          }
          const atNB = dp[i + 1].get(nb)!;

          // Only store if not duplicate
          if (!atNB.has(key)) {
            atNB.set(key, newQtyMap);
          }
        }
      }
    }

    // Carry forward all existing combos unchanged (item not used)
    for (let b = 0; b <= scaledAmount; b++) {
      const combosAtB = dp[i].get(b);
      if (!combosAtB || combosAtB.size === 0) continue;

      if (!dp[i + 1].has(b)) {
        dp[i + 1].set(b, new Map<string, Record<string, number>>());
      }
      const target = dp[i + 1].get(b)!;
      for (const [key, qtyMap] of combosAtB) {
        if (!target.has(key)) target.set(key, qtyMap);
      }
    }
  }

  // Collect all valid combos from final DP table
  const finalDP = dp[n] || new Map<number, Map<string, Record<string, number>>>();
  for (let b = 1; b <= scaledAmount; b++) {
    const combosAtB = finalDP.get(b);
    if (!combosAtB || combosAtB.size === 0) continue;

    const total = b;
    const ratio = total / amount;
    if (ratio < MIN_RATIO || ratio > MAX_RATIO) continue;

    for (const [, qtyMap] of combosAtB) {
      const selectedItems = eligible
        .filter(it => qtyMap[it.id])
        .map(it => itemToSuggestionItem(it, qtyMap[it.id]));

      if (selectedItems.length === 0) continue;

      const atTotal = allCombos.get(total) || [];
      const key = selectedItems.map(it => `${it.name}×${it.quantity}`).sort().join('|');
      if (!atTotal.some(o => o.items.map(i => `${i.name}×${i.quantity}`).sort().join('|') === key)) {
        atTotal.push({ items: selectedItems, total, diff: total - amount });
        allCombos.set(total, atTotal);
      }
    }
  }

  // Flatten
  const results: SuggestionOption[] = [];
  for (const [, opts] of allCombos) results.push(...opts);
  return results;
}

// ─── Merge + deduplicate + sort ──────────────────────────────────────────────

function dedupOptions(options: SuggestionOption[]): SuggestionOption[] {
  const seen = new Set<string>();
  return options.filter(opt => {
    // Sort by name+quantity to catch true content duplicates regardless of id or array order
    const key = [...opt.items]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(it => `${it.name}×${it.quantity}`)
      .join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortOptions(options: SuggestionOption[], targetAmount: number): SuggestionOption[] {
  // Step 1: group options by total
  const byTotal = new Map<number, SuggestionOption[]>();
  for (const opt of options) {
    const list = byTotal.get(opt.total) || [];
    list.push(opt);
    byTotal.set(opt.total, list);
  }

  // Step 2: sort groups by closeness to targetAmount
  const sortedGroups = [...byTotal.entries()].sort((a, b) => {
    const da = Math.abs(a[0] - targetAmount);
    const db = Math.abs(b[0] - targetAmount);
    return da - db;
  });

  // Step 3: within each group, prefer fewer items (simpler)
  for (const [, opts] of sortedGroups) {
    opts.sort((a, b) => {
      const aTotalItems = a.items.reduce((s, it) => s + it.quantity, 0);
      const bTotalItems = b.items.reduce((s, it) => s + it.quantity, 0);
      if (aTotalItems !== bTotalItems) return aTotalItems - bTotalItems;
      return a.items.length - b.items.length;
    });
  }

  // Step 4: flatten, prioritizing closest totals first, max 5 results
  const results: SuggestionOption[] = [];
  for (const [total, opts] of sortedGroups) {
    if (results.length >= MAX_OPTIONS) break;
    // Closest total (diff==0) → show all combos from that total (up to MAX_OPTIONS)
    // Other totals → show up to 2 each
    const maxPerTotal = Math.abs(total - targetAmount) === 0
      ? Math.min(opts.length, MAX_OPTIONS - results.length)
      : 2;
    for (let i = 0; i < Math.min(opts.length, maxPerTotal); i++) {
      if (results.length >= MAX_OPTIONS) break;
      results.push(opts[i]);
    }
  }

  return results;
}

function smartLabel(opt: SuggestionOption, allSorted: SuggestionOption[]): string {
  // Only use default labels when AI hasn't provided one
  const exactMatch = opt.diff === 0;
  const isLowestTotal = opt.total === Math.min(...allSorted.map(o => o.total));
  const isHighestTotal = opt.total === Math.max(...allSorted.map(o => o.total));
  const isFewestTypes = opt.items.length === Math.min(...allSorted.map(o => o.items.length));
  const isMostTypes = opt.items.length === Math.max(...allSorted.map(o => o.items.length));
  const isNegativeDiff = opt.diff < 0;
  const hasMultipleTypes = opt.items.length > 1;

  if (exactMatch) return 'Đúng số tiền';
  if (opt.label === 'Greedy') return 'Greedy';
  if (isLowestTotal && isNegativeDiff) return 'Tiết kiệm nhất';
  if (isHighestTotal && !isNegativeDiff) return 'Trọn gói';
  if (hasMultipleTypes && isMostTypes) return 'Đa dạng';
  if (hasMultipleTypes && isFewestTypes) return 'Đơn giản';
  if (isNegativeDiff) return 'Sát ngân sách';
  return 'Gợi ý';
}

function applyLabels(options: SuggestionOption[]): SuggestionOption[] {
  return options.map(opt => ({
    ...opt,
    label: opt.label || smartLabel(opt, options),
  }));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateSuggestions(amount: number, items: ItemInput[]): SuggestionOption[] {
  if (!amount || amount <= 0 || !items || items.length === 0) return [];

  const validItems = items.filter(i => i.price > 0 && i.quantityLeft > 0);
  if (validItems.length === 0) return [];

  // DP first — bounded knapsack for exact combinations
  const options = dpGenerate(amount, validItems);

  // If DP returns nothing (timeout, too many items, over budget, etc.),
  // fall back to greedy to at least give a suggestion
  if (options.length === 0) {
    const greedy = greedyGenerate(amount, validItems);
    if (greedy.length > 0) {
      return applyLabels(greedy);
    }
    return [];
  }

  // Merge greedy with DP results if needed for extra diversity
  const greedyOpts = greedyGenerate(amount, validItems);
  const merged = greedyOpts.length > 0
    ? dedupOptions([...options, ...greedyOpts])
    : options;

  const sorted = sortOptions(merged, amount);
  return applyLabels(sorted);
}

export type { ItemInput };
