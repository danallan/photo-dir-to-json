import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            reporter: ['text', 'json-summary', 'json'],
            reportOnFailure: true,
            exclude: [
                ...configDefaults.coverage.exclude,
                'temp/**',
                'build/**',
            ],
        },
    },
});
