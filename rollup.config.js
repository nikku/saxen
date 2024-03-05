import pkg from './package.json';

const pkgExports = pkg.exports['.'];

export default [
  {
    input: 'lib/index.js',
    output: [
      { file: pkgExports.require, format: 'cjs', sourcemap: true },
      { file: pkgExports.import, format: 'es', sourcemap: true }
    ]
  }
];