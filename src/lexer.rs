//! A module describing the Lox token Lexer.

use std::collections::{HashSet, VecDeque};
use std::ops::Index;
use std::str::Chars;

use crate::result::{Error, Result};
use crate::token::{Literal, Token, Type};

#[derive(Debug)]
pub struct Lexer<'a> {
  src: Chars<'a>,
  peeks: VecDeque<char>,
  lexeme: String,
  line: usize,
  offset: usize,
  eof: bool,
}

impl<'a> Lexer<'a> {
  /// Creates a new Lexer off a Chars iterator.
  pub fn new(c: Chars<'a>) -> Self {
    Lexer {
      src: c,
      peeks: VecDeque::with_capacity(2),
      lexeme: "".to_string(),
      line: 1,
      offset: 0,
      eof: false,
    }
  }
}

impl<'a> Lexer<'a> {
  fn advance(&mut self) -> Option<char> {
    if self.eof {
      return None;
    }

    let next_char = if self.peeks.is_empty() {
      self.src.next()
    } else {
      self.peeks.pop_front()
    };

    match next_char {
      Some(c) => {
        self.lexeme.push(c);
        self.offset += 1;
        Some(c)
      }
      None => {
        self.eof = true;
        Some('\0')
      }
    }
  }

  fn lookahead(&mut self, n: usize) -> char {
    while self.peeks.len() < n {
      if let Some(c) = self.src.next().or(Some('\0')) {
        self.peeks.push_back(c);
      }
    }

    *self.peeks.index(n - 1)
  }

  fn peek(&mut self) -> char {
    self.lookahead(1)
  }

  fn peek_next(&mut self) -> char {
    self.lookahead(2)
  }

  fn match_advance(&mut self, c: char) -> bool {
    if self.peek() == c {
      self.advance();
      return true;
    }

    false
  }

  fn advance_until_any(&mut self, c: &[char]) -> char {
    let mut last = '\0';
    let chars: HashSet<&char> = c.iter().clone().collect();

    loop {
      match self.peek() {
        ch if chars.contains(&ch) || ch == '\0' => break,
        ch => {
          last = ch;
          self.advance()
        }
      };
    }
    last
  }

  fn advance_until(&mut self, end_at: char) -> char {
    let mut last = '\0';

    loop {
      match self.peek() {
        ch if ch == end_at => break,
        '\0' => break,
        ch => {
          last = ch;
          self.advance()
        }
      };
    }
    last
  }

  fn static_token(&self, typ: Type) -> Option<Result<Token>> {
    self.literal_token(typ, None)
  }

  fn literal_token(&self, typ: Type, literal: Option<Literal>) -> Option<Result<Token>> {
    Some(Ok(Token {
      typ,
      literal,
      line: self.line,
      offset: self.offset - self.lexeme.len(),
      lexeme: self.lexeme.clone(),
    }))
  }

  fn lexical_error(&self, msg: &str) -> Option<Result<Token>> {
    Some(Err(Error::Lexical(
      self.line,
      self.offset - self.lexeme.len(),
      msg.to_string(),
      self.lexeme.clone(),
    )))
  }

  fn match_static_token(&mut self, c: char, m: Type, u: Type) -> Option<Result<Token>> {
    if self.match_advance(c) {
      self.static_token(m)
    } else {
      self.static_token(u)
    }
  }
}

impl<'a> Lexer<'a> {
  fn next_token(&mut self) -> Option<Result<Token>> {
    use Type::*;
    loop {
      if let Some(c) = self.advance() {
        match c {
          '\0' => {
            self.eof = true;
            return self.static_token(EOF);
          }
          '(' => return self.static_token(LeftParen),
          ')' => return self.static_token(RightParen),
          '{' => return self.static_token(LeftBrace),
          '}' => return self.static_token(RightBrace),
          ',' => return self.static_token(Comma),
          '.' => return self.static_token(Dot),
          '-' => return self.static_token(Minus),
          '+' => return self.static_token(Plus),
          ';' => return self.static_token(Semicolon),
          '*' => return self.static_token(Star),
          ':' => return self.static_token(Colon),

          '!' => return self.match_static_token('=', BangEqual, Bang),
          '=' => return self.match_static_token('=', EqualEqual, Equal),
          '<' => return self.match_static_token('=', LessEqual, Less),
          '>' => return self.match_static_token('=', GreaterEqual, Greater),

          '"' => return self.string(),

          '/' => match self.peek() {
            '/' => self.line_comment(),
            '*' => self.block_comment(),
            _ => return self.static_token(Slash),
          },
          ' ' | '\r' | '\t' => return self.static_token(Whitespace),
          '\n' => {
            let token = self.static_token(Newline);
            self.line += 1;
            self.offset = 0;
            return token;
          }

          c if c.is_digit(10) => return self.number(),
          c if c.is_alphanumeric() => return self.identifier_or_keyword(),

          _ => return self.lexical_error("unexpected character"),
        }
      }
    }
  }

  fn next_indent(&mut self) -> usize {
    loop {
      match self.peek() {
        '\n' => {
          self.advance();
        }
        ch if ch.is_whitespace() => {
          let mut indent = 1;
          self.advance();

          loop {
            match self.peek() {
              ch if ch != '\n' && ch.is_whitespace() => {
                indent += 1;
                self.advance();
              }
              _ => {
                break;
              }
            }
          }

          if self.peek() == '\n' {
            self.advance();
            continue;
          }
          self.lexeme.clear();
          return indent;
        }
        _ => return 0,
      }
    }
  }

  fn string(&mut self) -> Option<Result<Token>> {
    loop {
      let last = self.advance_until_any(&['\n', '"']);

      match self.peek() {
        '\n' => self.line += 1,
        '"' if last == '\\' => {
          self.lexeme.pop();
        }
        '"' => break,
        '\0' => return self.lexical_error("unterminated string"),
        _ => return self.lexical_error("unexpected character"),
      };

      self.advance();
    }

    self.advance();

    let lit: String = self
      .lexeme
      .clone()
      .chars()
      .skip(1)
      .take(self.lexeme.len() - 2)
      .collect();

    self.literal_token(Type::String, Some(Literal::String(lit)))
  }

  fn number(&mut self) -> Option<Result<Token>> {
    while self.peek().is_digit(10) {
      self.advance();
    }

    if self.peek() == '.' && self.peek_next().is_digit(10) {
      self.advance();
      while self.peek().is_digit(10) {
        self.advance();
      }
    }

    if let Ok(lit) = self.lexeme.clone().parse::<f64>() {
      return self.literal_token(Type::Number, Some(Literal::Number(lit)));
    }

    self.lexical_error("invalid numeric")
  }

  fn identifier_or_keyword(&mut self) -> Option<Result<Token>> {
    while self.peek().is_alphanumeric() {
      self.advance();
    }

    let lex: &str = self.lexeme.as_ref();
    match Type::reserved(lex) {
      Some(typ) => match *typ {
        Type::Nil => self.literal_token(*typ, Some(Literal::Nil)),
        Type::True => self.literal_token(*typ, Some(Literal::Boolean(true))),
        Type::False => self.literal_token(*typ, Some(Literal::Boolean(false))),
        _ => self.static_token(*typ),
      },
      None => self.static_token(Type::Identifier),
    }
  }

  fn line_comment(&mut self) {
    self.advance_until('\n');
    self.lexeme.clear();
  }

  fn block_comment(&mut self) {
    self.advance(); // *

    loop {
      let last = self.advance_until_any(&['\n', '/']);
      let next = self.peek();
      match (last, next) {
        (_, '\n') => self.line += 1,
        ('*', '/') => {
          self.advance(); // *
          self.advance(); // /
          break;
        }
        (_, '\0') => break,
        (_, _) => (), // noop
      }
      self.advance();
    }

    self.lexeme.clear();
  }
}

impl<'a> Iterator for Lexer<'a> {
  type Item = Result<Token>;
  fn next(&mut self) -> Option<Self::Item> {
    if self.eof {
      return None;
    }

    self.lexeme.clear();
    self.next_token()
  }
}

/// Describes a type that can be converted into a token Lexer.
pub trait TokenIterator<'a> {
  fn tokens(self) -> IndentedLexer<'a>;
}

impl<'a> TokenIterator<'a> for Chars<'a> {
  fn tokens(self) -> IndentedLexer<'a> {
    IndentedLexer::new(self)
  }
}

#[derive(Debug)]
pub struct IndentedLexer<'a> {
  child: Lexer<'a>,
  indent: usize,
  stack: Vec<usize>,
  last: Token,
}

impl<'a> IndentedLexer<'a> {
  pub fn new(c: Chars<'a>) -> Self {
    let mut lexer = Lexer::new(c);
    let indent = lexer.next_indent();
    IndentedLexer {
      child: lexer,
      indent,
      stack: vec![],
      last: Token::default(),
    }
  }
}

impl<'a> Iterator for IndentedLexer<'a> {
  type Item = Result<Token>;
  fn next(&mut self) -> Option<Self::Item> {
    if self.child.eof {
      if !self.stack.is_empty() {
        self.stack.pop();
        return self.child.static_token(Type::Dedent);
      }
    }

    loop {
      self.child.lexeme.clear();
      match self.child.peek() {
        '\n' => {
          let nextIndent = self.child.next_indent();
          // println!("{:?} nextIndent: {}", self, nextIndent);
          if nextIndent == self.indent {
            return result;
          } else if nextIndent > self.indent {
            self.stack.push(self.indent);
            self.indent = nextIndent;
            println!("{:?} nextIndent: {}", self, nextIndent);

            return self.child.static_token(Type::Indent);
          } else {
            while nextIndent < self.indent {
              match self.stack.pop() {
                Some(i) => {
                  self.indent = i;
                  return self.child.static_token(Type::Dedent);
                }
                None => return self.child.lexical_error("inconsitent indentation"),
              }
            }

            if nextIndent != self.indent {
              return self.child.lexical_error("inconsitent indentation");
            }
          }

          self.indent = nextIndent;
        }
        _ => {
          return self.child.next_token();
        }
      }

      let result = self.child.next_token();
      match &result {
        Some(Ok(token)) if token.typ == Type::Newline => {
          let nextIndent = self.child.next_indent();
          // println!("{:?} nextIndent: {}", self, nextIndent);
          if nextIndent == self.indent {
            return result;
          } else if nextIndent > self.indent {
            self.stack.push(self.indent);
            self.indent = nextIndent;
            println!("{:?} nextIndent: {}", self, nextIndent);

            return self.child.static_token(Type::Indent);
          } else {
            while nextIndent < self.indent {
              match self.stack.pop() {
                Some(i) => {
                  self.indent = i;
                  return self.child.static_token(Type::Dedent);
                }
                None => return self.child.lexical_error("inconsitent indentation"),
              }
            }

            if nextIndent != self.indent {
              return self.child.lexical_error("inconsitent indentation");
            }
          }

          self.indent = nextIndent;
        }
        t => return result,
      }
    }
  }
}

//  const next = () => {
//     if (!eof) {
//       while (true) {
//         token = iter.next();
//         if (token.type === 'nl') {
//           const newIndent = iter.nextIndent();
//           if (newIndent == null) {
//             eof = true;
//             return { type: 'nl', value: 'nl' };
//           }

//           if (newIndent === indent) {
//             return { type: 'nl', value: 'nl' };
//           } else if (newIndent > indent) {
//             stack.push(indent);
//             indent = newIndent;
//             return { type: 'indent', value: 'indent' };
//           } else {
//             while (newIndent < indent) {
//               indent = stack.pop();
//               return { type: 'dedent', value: 'dedent' };
//             }
//             if (newIndent !== indent) {
//               throw new Error('inconsistent indentation');
//             }
//           }
//           indent = newIndent;

//           // ignore whitespace within lines
//         } else {
//           return token;
//         }
//       }
//     }

//     // dedent remaining blocks at eof
//     if (stack.length > 0) {
//       stack.pop();
//       return { type: 'dedent', value: 'dedent' };
//     }

//     return;
//   };
