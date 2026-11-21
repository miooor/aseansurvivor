import globals from 'globals';

export default [
  {ignores:['dist/**','node_modules/**']},
  {
    files:['src/**/*.js','tests/**/*.js'],
    languageOptions:{globals:globals.browser},
    rules:{'no-undef':'error','no-unreachable':'error','valid-typeof':'error'}
  },
  {
    files:['scripts/**/*.mjs'],
    languageOptions:{globals:globals.node},
    rules:{'no-undef':'error','no-unreachable':'error','valid-typeof':'error'}
  }
];
