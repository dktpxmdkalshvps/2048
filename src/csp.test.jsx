import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Content Security Policy (CSP)', () => {
  it('should not allow unsafe-inline or unsafe-eval in script-src directive', () => {
    const htmlPath = path.resolve(__dirname, '../index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    const cspMatch = htmlContent.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
    expect(cspMatch).not.toBeNull();

    const cspHeader = cspMatch[1];
    expect(cspHeader).toContain("script-src");

    const directives = cspHeader.split(';').map(d => d.trim()).filter(Boolean);
    const scriptSrcDirective = directives.find(d => d.startsWith('script-src'));
    expect(scriptSrcDirective).toBeDefined();

    expect(scriptSrcDirective).not.toContain("'unsafe-inline'");
    expect(scriptSrcDirective).not.toContain("'unsafe-eval'");
    expect(scriptSrcDirective).toContain("'self'");
  });
});
