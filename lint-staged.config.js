module.exports = {
  './**/*.{ts,tsx}': (filenames) => [
    `eslint ${filenames.join(' ')} --fix`,
    `prettier ${filenames.join(' ')} --write`,
  ],
};
