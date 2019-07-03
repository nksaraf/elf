#!/usr/bin/env node
import parse from './parser';
import compile from './compiler';
import processor from './processor';
import interpreter from './interpreter';

const runfile = parse();
const env = compile(runfile);
const machine = processor(env);
const interpret = interpreter(machine);

interpret(process.argv.slice(2));
