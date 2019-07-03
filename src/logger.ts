import moo, { Token } from 'moo';
import { Command } from './types';
import chalk from 'chalk';

let lexer = moo.compile({
  whitespace: { match: /\s+/, lineBreaks: true },
  pipe: /\|/,
  redirect: /(?:\<|\>)/,
  js: /$\{.*\}/,
  option: /(?:-|--)\S+\s+[\.\w]+/,
  flag: /(?:-|--)\S+/,
  positional: /\S+/
});

let colors: { [key: string]: (value: string) => string } = {
  whitespace: value => value,
  pipe: chalk.magenta,
  redirect: chalk.magenta,
  js: chalk.magenta,
  option: chalk.blue,
  flag: chalk.cyan,
  positional: chalk.yellow
};

const colored_token = ({ type, value }: Token) => colors[type!](value!);

export const log_task = (name: string, args: string) => {
  // lexer.reset(args);
  // const tokens = Array.from(lexer);
  // console.log('📋 ', chalk.magenta(name), tokens.map(colored_token).join(''));
};

export default ({ command, args }: Command) => {
  lexer.reset(args);
  const tokens = Array.from(lexer);
  console.log('⚙️ ', chalk.green(command), tokens.map(colored_token).join(''));
};
