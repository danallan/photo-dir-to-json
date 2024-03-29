import { RuleConfigSeverity } from '@commitlint/types';

export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'subject-case': [RuleConfigSeverity.Error, 'always', ['sentence-case']],
    },
};
