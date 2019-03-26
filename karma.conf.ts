module.exports = (config) => {
    config.set({
        basePath: '.',
        frameworks: ['jasmine', 'karma-typescript'],
        browsers: ['Electron'],
        plugins: [
            'karma-jasmine',
            'karma-electron',
            'karma-typescript',
        ],
        files: [
            {pattern: 'spec/base.spec.ts'},
            {pattern: 'spec/**/*.spec.ts'},
        ],
        preprocessors: {
            '**/*.ts': 'karma-typescript'
        },
        reporters: ['progress', 'karma-typescript'],
        singleRun: true,
        autoWatch: false,
        karmaTypescriptConfig: {
            compilerOptions: {
                target: 'es5',
                module: 'commonjs',
                moduleResolution: 'node',
                isolatedModules: false,
                jsx: 'react',
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                declaration: false,
                noImplicitAny: false,
                noImplicitUseStrict: false,
                removeComments: true,
                noLib: false,
                preserveConstEnums: true,
                suppressImplicitAnyIndexErrors: true,
                strictNullChecks: false,
                lib: ["ES2015", "DOM"]
            },
            bundlerOptions: {
                entrypoints: /\.spec\.ts$/,
            },
            exclude: ['node_modules', 'app']
        }
    });
}