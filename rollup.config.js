import {terser} from "rollup-plugin-terser";
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
            code = code.replace(/\/\*![^M\/]+Microsoft Corporation[\s\S]+?\*\//, "/* Microsoft tslib 0BSD licensed */");
            code = code.replace(/\r\n/g, "\n");
            return {code, map:null};
        }
    }
}

const tsPluginOpts = {
    useTsconfigDeclarationDir: true
};

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
            plugins: [typescript(tsPluginOpts),  cleanup()]
        },
        {
            input: './src/index.ts',
            output: {
                file: 'dist/es/webauthn-ui.js',
                format: 'es',
                banner: banner,
                sourcemap: devMode,
            },
            plugins: [typescript(tsPluginOpts), cleanup()]
        },

    ];

if (!devMode) {


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
                plugins: [typescript(tsPluginOpts), terser({output: { comments: /webauthn-ui/}}), cleanup()]
            },
            {
                input: './src/index.ts',
                output: {
                    file: 'dist/es/webauthn-ui.min.js',
                    format: 'es',
                    banner: banner,
                    sourcemap: devMode,
                },
                plugins: [typescript(tsPluginOpts), terser({output: { comments: /webauthn-ui/}}), cleanup()]
            }

        ]
    );
}

export default builds;
