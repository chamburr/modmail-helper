module.exports = {
    trailingComma: 'none',
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    arrowParens: 'avoid',
    endOfLine: 'lf',
    printWidth: 120,
    overrides: [
        {
            files: 'package.json',
            options: {
                tabWidth: 2
            }
        }
    ]
};
