// Generated automatically by nearley, version 2.19.0
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var indent: any;
declare var dedent: any;
declare var colon: any;
declare var bracket_open: any;
declare var word: any;
declare var bracket_close: any;
declare var nl: any;
declare var ws: any;

import lexer from './lexer';
import { NodeData } from '../../pkg/spectre';

function createToken({
  type = "none",
  value = "",
  text = "",
  offset = 0,
  lineBreaks = 0,
  line = 0,
  col = 0,
}: moo.Token) {
  return new NodeData({ token_type: type, value, text, offset, lineBreaks, line, col });
};

function ast(token: any) {
  console.log(token);
  return createToken(token);
}

interface NearleyToken {  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: NearleyToken) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: lexer,
  ParserRules: [
    {"name": "main$ebnf$1", "symbols": []},
    {"name": "main$ebnf$1", "symbols": ["main$ebnf$1", "task"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "main", "symbols": ["main$ebnf$1"]},
    {"name": "task", "symbols": ["task_header", "_?", (lexer.has("indent") ? {type: "indent"} : indent), "task_body", (lexer.has("dedent") ? {type: "dedent"} : dedent)], "postprocess":  
        function(data) {
          return { 
            name: ast(data[0][0]).value, 
            params: data[0][1].map(v => v.render()), 
            body: ast(data[3]).render()
          };
        } },
    {"name": "task_header", "symbols": ["identifier", "parameter_list", (lexer.has("colon") ? {type: "colon"} : colon)]},
    {"name": "parameter_list$ebnf$1", "symbols": ["parameter"]},
    {"name": "parameter_list$ebnf$1", "symbols": ["parameter_list$ebnf$1", "parameter"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "parameter_list", "symbols": ["parameter_list$ebnf$1"], "postprocess": function(tokens) { return tokens[0].map(p => ast(p)); }},
    {"name": "parameter$ebnf$1", "symbols": ["_"]},
    {"name": "parameter$ebnf$1", "symbols": ["parameter$ebnf$1", "_"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "parameter", "symbols": ["parameter$ebnf$1", (lexer.has("bracket_open") ? {type: "bracket_open"} : bracket_open), (lexer.has("word") ? {type: "word"} : word), (lexer.has("bracket_close") ? {type: "bracket_close"} : bracket_close)], "postprocess": function(data) { return data[data.length-2]; }},
    {"name": "task_body", "symbols": [(lexer.has("word") ? {type: "word"} : word), "br"], "postprocess": id},
    {"name": "identifier", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": id},
    {"name": "br", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)]},
    {"name": "_?$ebnf$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": id},
    {"name": "_?$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "_?", "symbols": ["_?$ebnf$1"], "postprocess": id},
    {"name": "_", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": id}
  ],
  ParserStart: "main",
};

export default grammar;
