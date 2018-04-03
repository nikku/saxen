import uglify from 'rollup-plugin-uglify';

import pkg from './package.json';

export default [
  // browser-friendly UMD build
  {
    input: 'lib/index.js',
    output: {
      name: 'Saxen',
      file: 'dist/saxen.umd.js',
      format: 'umd'
    }
  },
  {
    input: 'lib/index.js',
    output: {
      name: 'Saxen',
      file: 'dist/saxen.umd.min.js',
      format: 'umd'
    },
    plugins: [
      uglify()
    ]
  },
  {
    input: 'lib/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ]
  }
];