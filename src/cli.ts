import _ from 'lodash';
import yargs from 'yargs';
import jsYaml from 'js-yaml';

import parse from './parser';
import compile from './compiler';

const runfile = parse();
const env = compile(runfile);

console.log(jsYaml.dump(env));
// yargs
//   .command(['task <task>', '$0'], 'Run specified task', {}, (argv: any) =>
//     runner.runTask(argv.task)
//   )
//   .help()
//   .demandCommand().argv;
