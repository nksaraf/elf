import * as nearley from 'nearley';
import grammar from './parser/grammar';

const s = 'foo  <a> <b>    <vc>:\n  a\n\n';

import lexer from './parser/lexer';
console.log(lexer.feed(s).map(t => t.type));

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
parser.feed(s);
console.log(parser.results[0][0][0]);
