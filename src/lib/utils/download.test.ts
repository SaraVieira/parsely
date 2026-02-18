// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadFile } from '@/lib/utils/download';

describe('downloadFile', () => {
  let clickSpy: ReturnType<typeof vi.fn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let createElementSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    clickSpy = vi.fn();
    const fakeAnchor = {
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement;

    createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(fakeAnchor as unknown as HTMLElement);
    appendChildSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockReturnValue(fakeAnchor as unknown as HTMLElement);
    removeChildSpy = vi
      .spyOn(document.body, 'removeChild')
      .mockReturnValue(fakeAnchor as unknown as HTMLElement);
    revokeObjectURLSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {
        // no-op
      });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an anchor element and triggers download', () => {
    downloadFile('hello', 'test.txt', 'text/plain');
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('appends anchor to body before click (Firefox compat)', () => {
    const callOrder: Array<string> = [];
    appendChildSpy.mockImplementation((node: Node) => {
      callOrder.push('appendChild');
      return node;
    });
    clickSpy.mockImplementation(() => {
      callOrder.push('click');
    });
    removeChildSpy.mockImplementation((node: Node) => {
      callOrder.push('removeChild');
      return node;
    });

    downloadFile('data', 'file.json', 'application/json');

    expect(callOrder).toEqual(['appendChild', 'click', 'removeChild']);
  });

  it('revokes the object URL after download', () => {
    downloadFile('data', 'file.json', 'application/json');
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test');
  });
});
