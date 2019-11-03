#![allow(dead_code)]

use std::env;
use std::fs;
mod lexer;
mod result;
mod token;

use lexer::TokenIterator;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() > 2 {
        println!("Usage: elvish [script]");
    } else if args.len() == 2 {
        run_file(args[1].clone());
    } else {
        run_prompt();
    }
}

fn run_file(filename: String) {
    let contents = fs::read_to_string(filename).expect("Something went wrong reading the file");
    run(contents);
}

fn run_prompt() {
    println!("Running prompt");
}

fn run(source: String) {
    for token in source.chars().tokens() {
        println!("{:?}", token);
    }
}
