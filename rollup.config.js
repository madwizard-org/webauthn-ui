import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import process from 'node:process';

const env = process.env.NODE_ENV;
const devMode = (env === 'development');

const banner = `/*! webauthn-ui library (C) 2018 - ${new Date().getFullYear()} Thomas Bleeker (www.madwizard.org) - MIT license */\n`;

// Declarations are emitted separately by tsc (see the build scripts), since the official
// plugin only writes them inside the Rollup output directory.
const tsPluginOpts = {
  sourceMap: devMode,
  declaration: false,
  declarationDir: undefined,
};

const builds = [
    {
    input: './src/index.ts',
    output: {
      file: 'dist/webauthn-ui.js',
      format: 'es',
      banner,
      sourcemap: devMode,
    },
    plugins: [typescript(tsPluginOpts)],
  },
];

if (!devMode) {
  builds.push(
    {
      input: './src/index.ts',
      output: {
        file: 'dist/webauthn-ui.min.js',
        format: 'es',
        banner,
        sourcemap: devMode,
      },
      plugins: [typescript(tsPluginOpts), terser()],
    },
  );
}

export default builds;
