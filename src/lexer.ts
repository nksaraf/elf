import moo from 'moo';

let lexer = moo.compile({
  WS: /[ \t]+/,
  number: /0|[1-9][0-9]*/,
  string: /"(?:\\["\\]|[^\n"\\])*"/,
  single_option: /-\w+/,
  keyword: ['task'],
  NL: { match: /\n/, lineBreaks: true }
});
