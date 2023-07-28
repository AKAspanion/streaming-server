// eslint-disable-next-line @typescript-eslint/no-var-requires
require('esbuild')
  .build({
    logLevel: 'info',
    entryPoints: ['build/src/index.js'],
    bundle: true,
    minify: true,
    platform: 'node',
    define: { 'process.env.FLUENTFFMPEG_COV': '0', NODE_ENV: 'production' },
    outfile: 'dist/index.js',
  })
  .catch(() => process.exit(1));
