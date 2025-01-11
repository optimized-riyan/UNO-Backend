import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { defineConfig } from "rollup";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import dotenv from 'dotenv';

const env = dotenv.config({
    path: `./.env.production`
}).parsed;

const replacements = Object.keys(env).reduce((acc, key) => {
  acc[`process.env.${key}`] = JSON.stringify(env[key]);
  return acc;
}, {});

export default defineConfig({
    input: 'dist/app.js',
    output: {
        file: 'bundle.mjs',
        format: 'esm',
        name: 'bundle',
        plugins: [terser()]
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        json(),
        replace({
            preventAssignment: true,
            ...replacements
        }),
    ]
});