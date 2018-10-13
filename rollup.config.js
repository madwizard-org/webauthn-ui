
import typescript from 'rollup-plugin-typescript';
const env = process.env.NODE_ENV;

const banner = "/*!\n\n webauthn-ui library (C) 2018 Thomas Bleeker (www.madwizard.org) - MIT license \n\n*/\n";
const devMode = (env === 'development');
export default {
    input: './src/index.ts',
    output: [
        {
            file: 'dist/umd/webauthn-ui.js',
            format: 'umd',
            name: 'WebAuthnUI',
            banner: banner,
            sourcemap: devMode,
        },
        {
            file: 'dist/es/webauthn-ui.js',
            format: 'es',
            banner: banner,
            sourcemap: devMode,
        },
    ],

    plugins: [typescript()]

}