module.exports = {
  name: 'ts-validater',
  out: './docs/',
  mode: 'file',
  exclude: ['./src/index.ts'],
  excludeExternals: true,
  excludePrivate: true,
  excludeNotExported: true,
  includeDeclarations: true,
  hideGenerator: true,
  theme: 'minimal',
  readme: './README.md',
};
