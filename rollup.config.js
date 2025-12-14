import pkg from './package.json';

const pkgExports = pkg.exports['.'];

export default [
  {
    input: 'lib/index.js',
    output: [
      { file: pkgExports, format: 'es', sourcemap: true }
    ]
  }
];