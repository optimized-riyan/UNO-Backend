import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { defineConfig } from "rollup";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";

export default defineConfig({
    input: 'dist/app.js',
    output: {
        file: 'bundle.js',
        format: 'esm',
        name: 'bundle',
        plugins: [terser()]
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        json(),
    ]
});