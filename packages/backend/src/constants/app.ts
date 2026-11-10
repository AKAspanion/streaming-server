// Express 5 (send 1.x) rejects any absolute path containing a dot-segment (e.g. `~/.local/share`)
// unless dotfiles are allowed. Download paths are built by the server, never from user input.
export const DOWNLOAD_OPTIONS = { dotfiles: 'allow' } as const;
