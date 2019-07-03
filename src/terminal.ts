import { Environment, Task, Command, Terminal } from './types';
import _ from 'lodash';
import crossSpawn from 'cross-spawn';
import log from './logger';
import yargs = require('yargs');
import yargsParser = require('yargs-parser');

enum CommandType {
  Task,
  Alias,
  Other,
  Error
}

const command_type = (command: string, env: Environment) => {
  if (_.isObject(env.path[command]) && 'name' in (env.path[command] as Task)) {
    return CommandType.Task;
  } else if (_.isString(env.path[command])) {
    return CommandType.Alias;
  } else if (_.isString(command)) {
    return CommandType.Other;
  } else {
    return CommandType.Error;
  }
};

const exec = ({ command, args }: Command, env: Environment) => {
  const filled_command = {
    command: template(command, env),
    args: template(args, env)
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
    console.log(error.message);
  }
};

const template = (content: string, env: Environment) => {
  const func = new Function(...Object.keys(env), 'return `' + content + '`;');
  return func.call(null, ...Object.values(env));
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
  } else if (type === CommandType.Error) {
    throw new Error('Command not found');
  }
};

const run_alias = (alias: string, args: string, env: Environment) => {
  const [command, ...cmd_args] = [alias, args].join(' ').split(' ');
  exec({ command, args: cmd_args.join(' ') }, env);
};

const run_task = (
  { name, commands }: Task,
  args: string,
  env: Environment,
  depth: number,
  history: string[]
) => {
  if (depth > 3 || history.find(item => item === name)) {
    throw new Error('Too deep');
  }

  const { _, $0, ...task_args } = yargsParser(args);
  for (let i = 0; i < commands.length; i += 1) {
    run_command(commands[i], { ...env, ...task_args }, depth + 1, history.concat([name]));
  }
};

const list = (env: Environment) =>
  Object.values(env.path).filter(value => _.isObject(value) && 'name' in (value as Task)) as Task[];

export default (e: Environment): Terminal => {
  const env = { ...e };
  return {
    run: ({ command, args }: Command) => run({ command, args }, env),
    list: () => list(env)
  };
};
