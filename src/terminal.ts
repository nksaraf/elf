import { Environment, Task, Command, Terminal } from './types';
import _ from 'lodash';
import crossSpawn from 'cross-spawn';
import yargsParser from 'yargs-parser';

import log, { log_task } from './logger';

import STD_ENV from './env';

enum CommandType {
  Task,
  Alias,
  Func,
  Other,
  Error
}

const command_type = (command: string, env: Environment) => {
  if (
    _.isObject(env.path[command]) &&
    !_.isFunction(env.path[command]) &&
    'name' in (env.path[command] as Task)
  ) {
    return CommandType.Task;
  } else if (_.isString(env.path[command])) {
    return CommandType.Alias;
  } else if (_.isFunction(env.path[command])) {
    return CommandType.Func;
  } else if (_.isString(command)) {
    return CommandType.Other;
  } else {
    return CommandType.Error;
  }
};

const exec = ({ command, args }: Command, env: Environment) => {
  const filled_command = {
    command: template(command, env.vars),
    args: template(args, env.vars)
  };
  log(filled_command);
  const full_command = `${filled_command.command} ${filled_command.args}`;
  const { status: code } = crossSpawn.sync(full_command, [], { stdio: 'inherit', shell: true });
  if (code !== 0) {
    throw new Error(`${command} failed with status code ${code}`);
  }
};

const run = ({ command, args }: Command, env: Environment) => {
  try {
    run_command({ command, args }, env, 0, []);
  } catch (error) {
    console.log(error);
  }
};

const template = (content: string, vars: object) => {
  const func = new Function(...Object.keys(vars), 'return `' + content + '`;');
  return func.call(null, ...Object.values(vars));
};

const run_command = (
  { command, args }: Command,
  env: Environment,
  depth: number,
  history: string[]
) => {
  const type = command_type(command, env);
  if (type === CommandType.Alias) {
    run_alias(env.path[command] as string, args, env);
  } else if (type === CommandType.Task) {
    run_task(env.path[command] as Task, args, env, depth, history);
  } else if (type === CommandType.Other) {
    return exec({ command, args }, env);
  } else if (type === CommandType.Func) {
    (env.path[command] as Function)(template(args, env.vars));
  } else if (type === CommandType.Error) {
    throw new Error('Command not found');
  }
};

const run_alias = (alias: string, args: string, env: Environment) => {
  const [command, ...cmd_args] = [alias, args].join(' ').split(' ');
  exec({ command, args: cmd_args.join(' ') }, env);
};

const MAX_DEPTH = 5;

const run_task = (
  { name, commands, positional_args }: Task,
  args: string,
  env: Environment,
  depth: number,
  history: string[]
) => {
  if (depth > MAX_DEPTH || history.find(item => item === name)) {
    throw new Error('Cycle detected in dependencies or gone too deep');
  }
  log_task(name, args);

  const { _, $0, ...task_args } = yargsParser(args);
  const positionals: { [key: string]: string } = {};
  for (let i = 0; i < _.length; i++) {
    if (i > positional_args.length) {
      break;
    }

    for (let alias of Object.values(positional_args[i])[0]) {
      positionals[alias] = _[i];
    }
  }

  for (let i = 0; i < commands.length; i += 1) {
    run_command(
      commands[i],
      { path: env.path, vars: { ...env.vars, ...task_args, ...positionals } },
      depth + 1,
      history.concat([name])
    );
  }
};

const list = (env: Environment) =>
  Object.keys(env.path)
    .filter(command => command_type(command, env) === CommandType.Task)
    .map(command => env.path[command] as Task);

export default (env: Environment): Terminal => {
  env = _.merge(STD_ENV, env);
  return {
    run: ({ command, args }: Command) => run({ command, args }, env),
    list: () => list(env)
  };
};
