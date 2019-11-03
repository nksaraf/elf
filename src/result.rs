use std::error;
use std::fmt;
use std::io;
use std::result;

pub type Result<T> = result::Result<T, Error>;

#[derive(Debug)]
pub enum Error {
  /// Returned if the CLI command is used incorrectly
  Usage,
  /// Returned if there is an error reading from a file or stdin
  IO(io::Error),
  /// Returned if the scanner encounters an error
  Lexical(usize, usize, String, String),
}

impl From<io::Error> for Error {
  fn from(err: io::Error) -> Error {
    Error::IO(err)
  }
}

impl fmt::Display for Error {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match *self {
      Error::Usage => write!(f, "Usage: rlox [script]"),
      Error::IO(ref e) => e.fmt(f),
      Error::Lexical(ref line, ref offset, ref msg, ref whence) => {
        write!(f, "Lexical Error [line {}] {}: {:?}", line, msg, whence)
      }
      // Error::Parse(ref line, ref msg, ref near) => {
      //   write!(f, "Parse Error [line {}] {}: near {}", line, msg, &near)
      // }
      // Error::Runtime(ref line, ref msg, ref near) => {
      //   write!(f, "Runtime Error [line {}] {}: near {}", line, msg, &near)
      // }
      // Error::Break(ref line) => write!(
      //   f,
      //   "Runtime Error [line {}] unexpected break statement",
      //   line
      // ),
      // Error::Return(ref line, _) => write!(
      //   f,
      //   "Runtime Error [line {}] unexpected return statement",
      //   line
      // ),
    }
  }
}

impl error::Error for Error {
  fn source(&self) -> Option<&(dyn error::Error + 'static)> {
    match *self {
      Error::IO(ref e) => e.source(),
      _ => None,
    }
  }
}
