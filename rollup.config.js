import {terser} from "rollup-plugin-terser";
import typescript from '@rollup/plugin-typescript';

const env = process.env.NODE_ENV;
const devMode = (env === 'development');

const banner = `/*! webauthn-ui library (C) 2018 - ${new Date().getFullYear()} Thomas Bleeker (www.madwizard.org) - MIT license */\n`;

function cleanup() {
    return {
        name: 'cleanup',
        renderChunk(code) {
            code = code.replace(/\r\n/g, "\n");
            return {code, map:null};
        }
    }
}

let builds =
    [
        {
            input: './src/index.ts',
            output: {
                file: 'dist/umd/webauthn-ui.js',
                format: 'umd',
                name: 'WebAuthnUI',
                banner: banner,
                sourcemap: devMode,
            },
            plugins: [typescript(),  cleanup()]
        },
        {
            input: './src/index.ts',
            output: {
                file: 'dist/es/webauthn-ui.js',
                format: 'es',
                banner: banner,
                sourcemap: devMode,
            },
            plugins: [typescript(), cleanup()]
        },

    ];

if (!devMode) {

    // Note: commments (including copyright comments) are stripped in minified mode.
    // The only external code that is bundled is from tslib. It is allowed to leave out its 0BSD licence
    // See https://github.com/microsoft/tslib/issues/47
    builds = builds.concat([
            {
                input: './src/index.ts',
                output: {
                    file: 'dist/umd/webauthn-ui.min.js',
                    format: 'umd',
                    name: 'WebAuthnUI',
                    banner: banner,
                    sourcemap: devMode,

                },
                plugins: [typescript(), terser({output: { comments: /webauthn-ui/}}), cleanup()]
            },
            {
                input: './src/index.ts',
                output: {
                    file: 'dist/es/webauthn-ui.min.js',
                    format: 'es',
                    banner: banner,
                    sourcemap: devMode,
                },
                plugins: [typescript(), terser({output: { comments: /webauthn-ui/}}), cleanup()]
            }

        ]
    );
}

export default builds;
