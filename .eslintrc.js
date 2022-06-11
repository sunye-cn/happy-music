module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    // 'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    // '@vue/standard'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
    // parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/comment-directive': 'off',
    // 'indent': 0,
    'space-before-function-paren': 0,
    quotes: ['warn', 'single']
  }
}
