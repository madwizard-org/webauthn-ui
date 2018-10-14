import {terser} from "rollup-plugin-terser";
import typescript from 'rollup-plugin-typescript';

const env = process.env.NODE_ENV;
const devMode = (env === 'development');

const banner = "/*!\n\n webauthn-ui library (C) 2018 Thomas Bleeker (www.madwizard.org) - MIT license \n\n*/\n";

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
            plugins: [typescript()]
        },
        {
            input: './src/index.ts',
            output: {
                file: 'dist/es/webauthn-ui.js',
                format: 'es',
                banner: banner,
                sourcemap: devMode,
            },
            plugins: [typescript()]
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
                plugins: [typescript(), terser({sourcemap: devMode})]
            },
            {
                input: './src/index.ts',
                output: {
                    file: 'dist/es/webauthn-ui.mjs',
                    format: 'es',
                    banner: banner,
                    sourcemap: devMode,
                },
                plugins: [typescript(), terser({sourcemap: devMode})]
            }

        ]
    );
}

export default builds;