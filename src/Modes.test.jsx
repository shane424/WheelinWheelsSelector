import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MODE_METADATA, Modes, SelectionMode } from './Modes';

const groups = [
  { id: 'alpha', label: 'Alpha', color: '#f00', weight: 1, options: [
    { id: 'one', label: 'One', weight: 1 },
    { id: 'two', label: 'Two', weight: 3 },
  ] },
  { id: 'beta', label: 'Beta', color: '#0f0', weight: 2, options: [
    { id: 'three', label: 'Three', weight: 1 },
    { id: 'four', label: 'Four', weight: 1 },
  ] },
];
const knownOptions = new Set(groups.flatMap(group => group.options.map(option => option.label)));
const knownModes = new Set(MODE_METADATA.map(mode => mode.id));

function randomValues(...values) {
  let call = 0;
  return vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation(array => {
    array[0] = values[Math.min(call++, values.length - 1)] ?? 0;
    return array;
  });
}

function actionFor(mode) {
  if (mode.id === 'sequential') return screen.getByRole('button', { name: 'Spin both' });
  if (mode.id === 'nested') return screen.getByRole('button', { name: 'Rotate both rings' });
  if (mode.kind === 'wheel') return screen.getByRole('button', { name: new RegExp(`^${mode.name} wheel`) });
  return screen.getByRole('button', { name: `Play ${mode.name}` });
}

async function finishTimers() {
  // Two-stage wheel modes schedule the second wheel only after React commits
  // the first wheel's selected group, so flush each stage in its own act.
  for (let stage = 0; stage < 8 && vi.getTimerCount(); stage += 1) {
    await act(async () => { await vi.advanceTimersToNextTimerAsync(); });
  }
}

function expectNormalized(record, mode) {
  expect(knownModes).toContain(record.mode);
  expect(record.mode).toBe(mode.id);
  expect(Number.isNaN(Date.parse(record.time))).toBe(false);
  expect(knownOptions).toContain(record.option);
  expect(groups.some(group => group.label === record.group)).toBe(true);
  expect(groups.find(group => group.id === record.groupId)?.options.some(option => option.id === record.optionId)).toBe(true);
  expect(record.selections).toEqual(expect.any(Array));
}

describe('SelectionMode contract for every MODE_METADATA entry', () => {
  beforeEach(() => { vi.useFakeTimers(); randomValues(0); });
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

  for (const mode of MODE_METADATA) {
    it(`${mode.id}: activates once, rejects a duplicate, and returns one normalized configured result`, async () => {
      const onResult = vi.fn();
      render(<SelectionMode mode={mode} groups={groups} onResult={onResult} />);
      const action = actionFor(mode);
      expect(action.disabled).toBe(false);

      fireEvent.click(action);
      fireEvent.click(action);
      await finishTimers();

      expect(onResult).toHaveBeenCalledTimes(1);
      expectNormalized(onResult.mock.calls[0][0], mode);
    });

    it(`${mode.id}: reduced motion resolves without an animation delay`, async () => {
      const onResult = vi.fn();
      render(<SelectionMode mode={mode} groups={groups} onResult={onResult} reducedMotion />);
      fireEvent.click(actionFor(mode));
      await finishTimers();
      expect(onResult).toHaveBeenCalledTimes(1);
    });

    it(`${mode.id}: empty input disables its action without throwing`, () => {
      const onResult = vi.fn();
      expect(() => render(<SelectionMode mode={mode} groups={[]} onResult={onResult} reducedMotion />)).not.toThrow();
      expect(actionFor(mode).disabled).toBe(true);
      fireEvent.click(actionFor(mode));
      expect(onResult).not.toHaveBeenCalled();
    });
  }
});

describe('deterministic weighted boundaries', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

  it.each([
    [0, 'One'],
    [0x3fffffff, 'One'], // immediately below the 1/4 boundary
    [0x40000000, 'Two'], // exactly on the boundary belongs to the next entry
    [0xffffffff, 'Two'],
  ])('maps injected uint32 value %i to the expected weighted option', async (boundary, expected) => {
    randomValues(0, boundary, 0);
    const onResult = vi.fn();
    const mode = MODE_METADATA.find(candidate => candidate.id === 'linked');
    render(<SelectionMode mode={mode} groups={[groups[0]]} onResult={onResult} reducedMotion />);
    fireEvent.click(actionFor(mode));
    await finishTimers();
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult.mock.calls[0][0].option).toBe(expected);
  });
});

describe('multi-stage mode output', () => {
  beforeEach(() => { vi.useFakeTimers(); randomValues(0); });
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

  const expectations = {
    tournament: { intermediate: ['Round 1: Alpha · One · Beta · Three', 'Round 2: Alpha · One'], winner: 'One' },
    knockout: { intermediate: ['✕ Alpha · One', '✕ Alpha · Two', '✕ Beta · Three', '★ Beta · Four'], winner: 'Four' },
    playoffs: { intermediate: ['★ Alpha · One', '○ Beta · Three'], winner: 'One' },
    cascading: { intermediate: ['Alpha', 'One'], winner: 'One' },
    ranked: { intermediate: ['1. Alpha · One', '2. Alpha · Two', '3. Beta · Three'], winner: 'One' },
  };

  for (const [id, expected] of Object.entries(expectations)) {
    it(`${id} exposes its intermediate structure and final winner`, async () => {
      const mode = MODE_METADATA.find(candidate => candidate.id === id);
      const onResult = vi.fn();
      render(<SelectionMode mode={mode} groups={groups} onResult={onResult} />);
      fireEvent.click(actionFor(mode));

      const visual = screen.getByTestId(`${id}-visual`);
      expect([...visual.querySelectorAll('.mechanic-results > div > span')].map(node => node.textContent)).toEqual(expected.intermediate);
      expect(onResult).not.toHaveBeenCalled();

      await finishTimers();
      expect(onResult).toHaveBeenCalledTimes(1);
      expect(onResult.mock.calls[0][0]).toMatchObject({ option: expected.winner, selections: expected.intermediate });
    });
  }
});

describe('Modes navigation', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

  it('switches modes and Return to default restores Sequential wheels', async () => {
    render(<Modes groups={groups} onResult={vi.fn()} reducedMotion />);
    const tournamentCard = screen.getByRole('heading', { name: 'Tournament', level: 3 }).closest('article');
    fireEvent.click(within(tournamentCard).getByRole('button', { name: 'Play this mode' }));
    expect(screen.getByRole('heading', { name: 'Tournament', level: 2 })).toBeTruthy();
    expect(within(tournamentCard).getByRole('button').getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Return to default' }));
    expect(screen.getByRole('heading', { name: 'Sequential wheels', level: 2 })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Return to default' })).toBeNull();
    await finishTimers();
  });
});
