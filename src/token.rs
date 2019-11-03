use lazy_static::lazy_static;
use std::cmp::Ordering;
use std::collections::HashMap;
use std::fmt;
use std::hash::{Hash, Hasher};

#[derive(Debug, PartialEq, Eq, Hash)]
pub struct Token {
  pub typ: Type,
  pub lexeme: String,
  pub literal: Option<Literal>,
  pub line: usize,
  pub offset: usize,
}

impl Token {
  pub fn in_types(&self, types: &[Type]) -> bool {
    for typ in types {
      if &self.typ == typ {
        return true;
      }
    }

    false
  }
}

impl Default for Token {
  fn default() -> Self {
    Token {
      typ: Type::EOF,
      lexeme: "".to_string(),
      literal: None,
      line: 0,
      offset: 0,
    }
  }
}

impl fmt::Display for Token {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{:?} {} {:?}", self.typ, self.lexeme, self.literal)
  }
}

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy)]
pub enum Type {
  LeftParen,
  RightParen,
  LeftBrace,
  RightBrace,
  Comma,
  Dot,
  Colon,
  Minus,
  Plus,
  Semicolon,
  Slash,
  Star,
  Bang,
  BangEqual,
  Equal,
  EqualEqual,
  Greater,
  GreaterEqual,
  Less,
  LessEqual,

  Identifier,
  String,
  Number,

  Whitespace,
  Newline,
  Indent,
  Dedent,

  And,
  Class,
  Else,
  False,
  Fun,
  For,
  If,
  Nil,
  Or,
  Print,
  Return,
  Super,
  This,
  True,
  Var,
  While,
  Break,
  EOF,
}

impl Type {
  pub fn reserved(keyword: &str) -> Option<&Self> {
    RESERVED.get(keyword)
  }
}

lazy_static! {
  static ref RESERVED: HashMap<&'static str, Type> = [
    ("and", Type::And),
    ("class", Type::Class),
    ("else", Type::Else),
    ("false", Type::False),
    ("fun", Type::Fun),
    ("for", Type::For),
    ("if", Type::If),
    ("nil", Type::Nil),
    ("or", Type::Or),
    ("print", Type::Print),
    ("return", Type::Return),
    ("super", Type::Super),
    ("this", Type::This),
    ("true", Type::True),
    ("var", Type::Var),
    ("while", Type::While),
    ("break", Type::Break),
  ]
  .iter()
  .cloned()
  .collect();
}

#[derive(Debug, Clone)]
pub enum Literal {
  Nil,
  Boolean(bool),
  Number(f64),
  String(String),
}

impl Eq for Literal {}

impl Hash for Literal {
  fn hash<H: Hasher>(&self, state: &mut H) {
    match *self {
      Literal::Nil => "".hash(state),
      Literal::Boolean(b) => b.hash(state),
      Literal::Number(f) => f.to_bits().hash(state),
      Literal::String(ref s) => s.hash(state),
    }
  }
}

impl PartialEq for Literal {
  fn eq(&self, other: &Literal) -> bool {
    use Literal::*;

    match *self {
      Nil => match *other {
        Nil => true,
        _ => false,
      },
      Boolean(ref a) => match *other {
        Boolean(ref b) => a.eq(b),
        _ => false,
      },
      Number(ref a) => match *other {
        Number(ref b) => a.eq(b),
        _ => false,
      },
      String(ref a) => match *other {
        String(ref b) => a.eq(b),
        _ => false,
      },
    }
  }
}

impl PartialOrd<Self> for Literal {
  fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
    use Literal::*;

    match (self, other) {
      (&Nil, &Nil) => Some(Ordering::Equal),
      (&String(ref l), &String(ref r)) => l.partial_cmp(r),
      (&Number(ref l), &Number(ref r)) => l.partial_cmp(r),
      (&Boolean(ref l), &Boolean(ref r)) => l.partial_cmp(r),
      _ => None,
    }
  }
}

impl fmt::Display for Literal {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    use Literal::*;

    match *self {
      Nil => write!(f, "nil"),
      Boolean(b) => write!(f, "{}", b),
      Number(n) => write!(f, "{}", n),
      String(ref s) => write!(f, "{}", s),
    }
  }
}
