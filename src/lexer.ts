import moo from 'moo';
import { readFileSync } from 'fs';

const peekable = (lexer: moo.Lexer) => {
  let here: moo.Token | undefined;

  const reset = (source: string, state?: moo.LexerState) => {
    lexer.reset(source, state);
    here = lexer.next();
  };

  const save = () => {
    return lexer.save();
  };

  const next = () => {
    const old = here;
    here = lexer.next();
    return old as any;
  };

  const peek = () => here as any;

  const nextIndent = (): any => {
    for (let token: moo.Token; (token = peek()); ) {
      if (token.type === 'nl') {
        next();
        continue;
      }
      if (token.type === 'ws') {
        const indent = token.value.length;
        next();

        const nextToken = peek();
        if (!nextToken) return;
        if (nextToken.type === 'nl') {
          next();
          continue;
        }
        return indent;
      }
      return 0;
    }
  };

  return {
    next,
    peek,
    nextIndent,
    reset,
    save
  };
};

const lex = {
  ws: /[ \t]+/,
  nl: { match: /(?:\r\n?|\n)+/, lineBreaks: true },
  word: /\w+/,
  digit: /\d+/,
  dot: /\./,
  dash: /-/,
  colon: /:/,
  bracket_open: /</,
  bracket_close: />/
};

const types = ['indent', 'dedent', 'eof'];

const indented = (lexer: moo.Lexer) => {
  let iter = peekable(lexer);
  let stack: any[] = [];
  let eof = false;
  let indent: any;
  let token: moo.Token;

  const next = () => {
    if (!eof) {
      while (true) {
        token = iter.next();
        if (token.type === 'nl') {
          const newIndent = iter.nextIndent();
          if (newIndent == null) {
            eof = true;
            return { type: 'nl', value: 'nl' };
          }

          if (newIndent === indent) {
            return { type: 'nl', value: 'nl' };
          } else if (newIndent > indent) {
            stack.push(indent);
            indent = newIndent;
            return { type: 'indent', value: 'indent' };
          } else {
            while (newIndent < indent) {
              indent = stack.pop();
              return { type: 'dedent', value: 'dedent' };
            }
            if (newIndent !== indent) {
              throw new Error('inconsistent indentation');
            }
          }
          indent = newIndent;

          // ignore whitespace within lines
        } else {
          return token;
        }
      }
    }

    // dedent remaining blocks at eof
    if (stack.length > 0) {
      stack.pop();
      return { type: 'dedent', value: 'dedent' };
    }

    return undefined;
  };

  const save = () => {
    return iter.save();
  };

  const reset = (chuck: string, info?: moo.LexerState) => {
    iter.reset(chuck, info);
    indent = iter.nextIndent();
  };

  const formatError = (token: any) => 'error';

  const has = (name: string) => Boolean([...Object.keys(lex), ...types].find(v => v === name));

  function feed(source: string) {
    lexer.reset(source);
    const tokens = [];
    while (true) {
      const c = lexer.next();
      if (c && c.type !== 'eof') {
        tokens.push(c);
      } else {
        break;
      }
    }
    return tokens;
  }

  return { next, has, formatError, save, reset, feed };
};

export default indented(moo.compile(lex));
// const source = readFileSync('.run').toString();
