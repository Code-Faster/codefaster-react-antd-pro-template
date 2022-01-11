const path = require("path");
const buble = require("@rollup/plugin-buble");
const cjs = require("@rollup/plugin-commonjs");
const babel = require("rollup-plugin-babel");
const node = require("@rollup/plugin-node-resolve").nodeResolve;
const replace = require("@rollup/plugin-replace");
const typescript = require("rollup-plugin-typescript2");
const copy = require("rollup-plugin-copy");
const version = process.env.VERSION || require("../package.json").version;
const license = require("../package.json").license;
const name = "index";
const extensions = [".js", ".ts"];
const banner = `/*!
  * code-dubbo-template v${version}
  * (c) ${new Date().getFullYear()} biqi li
  * @license ${license}
  */`;

const resolve = (_path) => path.resolve(__dirname, "../", _path);

module.exports = [
  // browser dev
  {
    file: resolve("dist/" + `${name}` + ".js"),
    format: "umd",
    env: "development",
  },
  {
    file: resolve("dist/" + `${name}` + ".min.js"),
    format: "umd",
    env: "production",
  },
  {
    file: resolve("dist/" + `${name}` + ".common.js"),
    format: "cjs",
  },
  {
    file: resolve("dist/" + `${name}` + ".esm.js"),
    format: "es",
  },
  {
    file: resolve("dist/" + `${name}` + ".esm.browser.js"),
    format: "es",
    env: "development",
    transpile: false,
  },
  {
    file: resolve("dist/" + `${name}` + ".esm.browser.min.js"),
    format: "es",
    env: "production",
    transpile: false,
  },
].map(genConfig);

function genConfig(opts) {
  const config = {
    input: {
      input: resolve("src/index.ts"),
      plugins: [
        replace({
          values: { __PRODUCTION__: JSON.stringify(true) },
          preventAssignment: true,
        }),
        copy({
          targets: [
            {
              src: "playground/createTemplate",
              dest: "dist/playground/",
            },
            {
              src: "src/template/.cfignore",
              dest: "dist/",
            },
          ],
        }),
        typescript(),
        node({
          extensions,
          modulesOnly: true,
        }),
        babel({
          exclude: "node_modules/**",
          extensions,
        }),
        cjs(),
        replace({
          __VERSION__: version,
        }),
      ],
    },
    output: {
      file: opts.file,
      format: opts.format,
      banner,
      name: name,
    },
  };

  if (opts.env) {
    config.input.plugins.unshift(
      replace({
        "process.env.NODE_ENV": JSON.stringify(opts.env),
      })
    );
  }

  if (opts.transpile !== false) {
    config.input.plugins.push(buble());
  }

  return config;
}
