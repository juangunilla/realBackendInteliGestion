const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('todos los modelos de estudios incluyen entregaDocumentacion', () => {
  const modelsDir = path.join(__dirname, '..', 'models', 'form');
  const files = fs.readdirSync(modelsDir).filter((file) => file.endsWith('.js'));

  for (const file of files) {
    const source = fs.readFileSync(path.join(modelsDir, file), 'utf8');
    assert.match(source, /entregaDocumentacion/);
  }
});
