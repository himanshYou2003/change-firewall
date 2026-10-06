import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardPortFromOutput } from '../processes.js';

test('recognizes every supported dashboard readiness banner', () => {
  assert.equal(dashboardPortFromOutput('Dashboard running at http://localhost:4783'), 4783);
  assert.equal(dashboardPortFromOutput('Local Dashboard: http://127.0.0.1:4784'), 4784);
  assert.equal(dashboardPortFromOutput('✓ Live Dashboard active at: http://localhost:49186'), 49186);
  const fragmented = ['✓ Live Dashboard active', ' at: http://local', 'host:49187'].join('');
  assert.equal(dashboardPortFromOutput(fragmented), 49187);
  assert.equal(
    dashboardPortFromOutput('\u001b[36m✓ Live Dashboard active at: \u001b[4mhttp://localhost:49188\u001b[24m\u001b[39m'),
    49188
  );
});

test('rejects unrelated, unsafe, and invalid dashboard URLs', () => {
  assert.equal(dashboardPortFromOutput('server at http://localhost:4783'), undefined);
  assert.equal(dashboardPortFromOutput('Live Dashboard active at: http://example.com:4783'), undefined);
  assert.equal(dashboardPortFromOutput('Live Dashboard active at: http://localhost:80'), undefined);
});
