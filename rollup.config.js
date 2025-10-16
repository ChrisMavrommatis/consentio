import terser from '@rollup/plugin-terser';

export default [
  // UMD build
  {
    input: 'src/consentio.js',
    output: {
      file: 'dist/consentio.js',
      format: 'umd',
      name: 'Consentio',
      banner: '/*! Consentio v1.0.0 | Apache-2.0 License | https://github.com/ChrisMavrommatis/consentio */'
    }
  },
  // UMD minified build
  {
    input: 'src/consentio.js',
    output: {
      file: 'dist/consentio.min.js',
      format: 'umd',
      name: 'Consentio',
      banner: '/*! Consentio v1.0.0 | Apache-2.0 License | https://github.com/ChrisMavrommatis/consentio */'
    },
    plugins: [terser()]
  },
  // ES Module build
  {
    input: 'src/consentio.js',
    output: {
      file: 'dist/consentio.esm.js',
      format: 'es',
      banner: '/*! Consentio v1.0.0 | Apache-2.0 License | https://github.com/ChrisMavrommatis/consentio */'
    }
  }
];