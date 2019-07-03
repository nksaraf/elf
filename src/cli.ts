#!/usr/bin/env node

import parse from './parser';
import compile from './compiler';
import terminal from './terminal';
import interpreter from './interpreter';

const runfile = parse();
const env = compile(runfile);
const term = terminal(env);
const interpret = interpreter(term);

interpret(process.argv.slice(2));
