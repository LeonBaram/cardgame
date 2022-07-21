// require("esbuild")
//   .build({
//     write: true,
//     bundle: true,
//     minify: true,
//     sourcemap: true,
//     watch: true,
//   })
//   .then(() => console.log("watching for file changes"))
//   .catch(() => process.exit(1));

require("esbuild")
  .serve(
    {
      servedir: "client",
    },
    {
      entryPoints: ["client/main.ts"],
      outdir: "client",
      bundle: true,
      minify: true,
      sourcemap: true,
    }
  )
  .then((server) => console.log(`serving files at localhost:${server.port}`))
  .catch(() => process.exit(1));
