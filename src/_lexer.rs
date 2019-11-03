// #[derive(Debug)]
// pub struct Lexer {
//     source: Vec<char>,
//     start: usize,
//     current: usize,
//     line: usize,
// }

// macro_rules! string {
//     ($value:expr) => {
//         String::from($value)
//     };
// }

// macro_rules! token {
//     ($value: expr, $token_type: expr) => {
//         Token {
//             token_type: $token_type,
//             value: string!($value),
//         }
//     };
// }

// macro_rules! match_token {
//     ($lexer: expr, $current_char: expr, $next_char: expr, $joined_token_type:expr, $default_token_type:expr) => {
//         if $lexer.match_advance($next_char) {
//             token!(
//                 format!("{}{}", $current_char, $next_char),
//                 $joined_token_type
//             )
//         } else {
//             token!(format!("{}", $current_char), $default_token_type)
//         }
//     };
// }

// pub fn feed(source: String) -> impl Iterator<Item = Token> {
//     let mut lexer = Lexer::new();
//     lexer.reset(source);
//     lexer
// }

// trait LexerT {
//     type Token;
//     fn next_token(&mut self) -> Option<Token>;
//     fn reset(&mut self, source: String);
// }

// impl Lexer {
//     fn new() -> Lexer {
//         Lexer {
//             source: vec![],
//             start: 0,
//             // stack: vec![],
//             current: 0,
//             line: 1,
//             // indent: 0,
//         }
//     }

//     fn reset(&mut self, source: String) {
//         self.source = source.chars().collect();
//         self.start = 0;
//         // self.stack = vec![];
//         self.current = 0;
//         self.line = 1;
//         // self.indent = self.next_indent();
//     }

//     fn next_token(&mut self) -> Option<Token> {
//         match self.advance() {
//             '(' => Some(token!("(", TokenType::LEFT_PAREN)),
//             ')' => Some(token!(")", TokenType::RIGHT_PAREN)),
//             '{' => Some(token!("{", TokenType::LEFT_BRACE)),
//             '}' => Some(token!("}", TokenType::RIGHT_BRACE)),
//             ',' => Some(token!(",", TokenType::COMMA)),
//             '.' => Some(token!(".", TokenType::DOT)),
//             '-' => Some(token!("-", TokenType::MINUS)),
//             '+' => Some(token!("+", TokenType::PLUS)),
//             ';' => Some(token!(";", TokenType::SEMICOLON)),
//             '*' => Some(token!("*", TokenType::STAR)), // [slash]
//             '!' => Some(match_token!(
//                 self,
//                 '!',
//                 '=',
//                 TokenType::BANG_EQUAL,
//                 TokenType::BANG
//             )),
//             '=' => Some(match_token!(
//                 self,
//                 '=',
//                 '=',
//                 TokenType::EQUAL_EQUAL,
//                 TokenType::EQUAL
//             )),
//             '<' => Some(match_token!(
//                 self,
//                 '<',
//                 '=',
//                 TokenType::LESS_EQUAL,
//                 TokenType::LESS
//             )),
//             '>' => Some(match_token!(
//                 self,
//                 '>',
//                 '=',
//                 TokenType::GREATER_EQUAL,
//                 TokenType::GREATER
//             )),
//             ' ' | '\r' | '\t' => Some(token!(" ", TokenType::WHITESPACE)),
//             '\n' => {
//                 self.line += 1;
//                 Some(token!("\n", TokenType::NEWLINE))
//             }
//             '/' => {
//                 if self.match_advance('/') {
//                     while !self.at_end_of_file() && self.peek() != '\n' {
//                         self.advance();
//                     }
//                     None
//                 } else {
//                     Some(token!("/", TokenType::SLASH))
//                 }
//             }
//             '"' => Some(self.lex_string()),
//             c => {
//                 if c.is_digit(10) {
//                     // Some(self.lex_number())
//                     Some(token!(format!("{}", c), TokenType::NUMBER))
//                 } else if c.is_alphabetic() {
//                     Some(self.lex_identifier())
//                 } else {
//                     Some(token!(format!("{}", c), TokenType::IDENTIFIER))
//                 }
//             }
//         }
//     }

//     fn lex_string(&mut self) -> Token {
//         while !self.at_end_of_file() && self.peek() != '"' {
//             if self.peek() == '\n' {
//                 self.line += 1;
//             }
//             self.advance();
//         }

//         // Unterminated string.
//         if self.at_end_of_file() {
//             panic!("Unterminated string.");
//         }

//         // The closing ".
//         if !self.match_advance('"') {
//             panic!("Unterminated string.");
//         }

//         // Trim the surrounding quotes.
//         token!(
//             self.from_source((self.start + 1)..(self.current - 1)),
//             TokenType::STRING
//         )
//     }

//     fn lex_identifier(&mut self) -> Token {
//         while self.peek().is_alphanumeric() {
//             self.advance();
//         }
//         let text = self.from_source(self.start..self.current);

//         // TokenType type = keywords.get(text);
//         // if (type == null) type = IDENTIFIER;
//         // addToken(type);
//         token!(text, TokenType::IDENTIFIER)
//     }

//     fn from_source(&self, range: std::ops::Range<usize>) -> String {
//         // Trim the surrounding quotes.
//         (&self.source[range]).into_iter().collect::<String>()
//     }

//     fn advance(&mut self) -> char {
//         self.current += 1;
//         self.source[self.current - 1]
//     }

//     fn peek(&self) -> char {
//         if self.at_end_of_file() {
//             return '\0';
//         }
//         self.source[self.current]
//     }

//     fn at_end_of_file(&self) -> bool {
//         self.current >= self.source.len()
//     }

//     fn match_advance(&mut self, expected: char) -> bool {
//         if self.at_end_of_file() {
//             return false;
//         } else if self.source[self.current] != expected {
//             return false;
//         }

//         self.current += 1;
//         true
//     }

//     fn next_indent(&mut self) -> usize {
//         // match self.peek() {
//         //     '\n' => {
//         //         self.advance();
//         //     },
//         //     '\
//         // }
//         0
//     }
// }

// impl Token {
//     pub fn is(&self, token_type: TokenType) -> bool {
//         self.token_type == token_type
//     }
// }

// impl Iterator for Lexer {
//     type Item = Token;

//     fn next(&mut self) -> Option<Self::Item> {
//         while !self.at_end_of_file() {
//             // We are at the beginning of the next lexeme.
//             self.start = self.current;
//             if let Some(token) = self.next_token() {
//                 return Some(token);
//             }
//         }

//         return Some(Token {
//             token_type: TokenType::EOF,
//             value: string!(""),
//         });
//     }
// }
