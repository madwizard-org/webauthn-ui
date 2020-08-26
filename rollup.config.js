import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const env = process.env.NODE_ENV;
const devMode = (env === 'development');

const banner = `/*! webauthn-ui library (C) 2018 - ${new Date().getFullYear()} Thomas Bleeker (www.madwizard.org) - MIT license */\n`;

function cleanup() {
  // Note: it is allowed to remove the (rather large) tslib 0BSD license notice.
  // See https://github.com/microsoft/tslib/issues/47

  return {
    name: 'cleanup',
    renderChunk(code) {
      let replaced = code.replace(/\/\*![^M/]+Microsoft Corporation[\s\S]+?\*\//, '/* Microsoft tslib 0BSD licensed */');
      replaced = replaced.replace(/\r\n/g, '\n');
      return { code: replaced, map: null };
    },
  };
}

const tsPluginOpts = {
  useTsconfigDeclarationDir: true,
};

const builds = [
  {
    input: './src/index.ts',
    output: {
      file: 'dist/umd/webauthn-ui.js',
      format: 'umd',
      name: 'WebAuthnUI',
      banner,
      sourcemap: devMode,
    },
    plugins: [typescript(tsPluginOpts), cleanup()],
  },
  {
    input: './src/index.ts',
    output: {
      file: 'dist/es/webauthn-ui.js',
      format: 'es',
      banner,
      sourcemap: devMode,
    },
    plugins: [typescript(tsPluginOpts), cleanup()],
  },

];

if (!devMode) {
  builds.push(
    {
      input: './src/index.ts',
      output: {
        file: 'dist/umd/webauthn-ui.min.js',
        format: 'umd',
        name: 'WebAuthnUI',
        banner,
        sourcemap: devMode,

      },
      plugins: [typescript(tsPluginOpts), terser({ output: { comments: /webauthn-ui/ } }), cleanup()],
    },
  );
  builds.push(
    {
      input: './src/index.ts',
      output: {
        file: 'dist/es/webauthn-ui.min.js',
        format: 'es',
        banner,
        sourcemap: devMode,
      },
      plugins: [typescript(tsPluginOpts), terser({ output: { comments: /webauthn-ui/ } }), cleanup()],
    },
  );
}

export default builds;
