// pages/ has its own ESLint, Prettier and prettier-plugin-svelte, so its staged files are
// checked here (lint-staged uses the closest config and runs it from this directory).
export default {
	'**/*.{ts,js,svelte}': (filenames) => [
		`eslint ${filenames.join(' ')} --fix`,
		`prettier ${filenames.join(' ')} --write`
	]
};
