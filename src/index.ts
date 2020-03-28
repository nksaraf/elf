import nearley from 'nearley';
import grammar from './grammar';
import { readFileSync } from 'fs';

import lexer from './lexer';
console.log(lexer.feed(readFileSync('.run').toString()).map(t => t.type));

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
parser.feed(readFileSync('.run').toString());
console.log(parser.results[0][0]);
