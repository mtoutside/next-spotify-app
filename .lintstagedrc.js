const path = require('path')

const buildEslintCommand = (fileNames) =>
  `pnpm lint --fix --file ${fileNames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`

module.exports = {
  '*.{ts,tsx}': (fileNames) => [buildEslintCommand(fileNames)],
}


