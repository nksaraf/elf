import { Environment, Task, Command } from './types';
import _ from 'lodash';
import crossSpawn from 'cross-spawn';

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
  const resolved_args = template(args.join(' '), env);
  console.log('⚙️ ', command, resolved_args);
  const { status } = crossSpawn.sync(command, resolved_args.split(' '), { stdio: 'inherit' });
  if (status !== 0) {
    throw new Error(`${command} failed with status code ${status}`);
  }
};

const run = ({ command, args }: Command, env: Environment) => {
  try {
    run_command({ command, args }, env, 0, []);
  } catch (error) {
    console.log(error);
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

const run_alias = (alias: string, args: string[], env: Environment) => {
  const [command, ...cmd_args] = alias.split(' ').concat(args);
  exec({ command, args: cmd_args }, env);
};

const run_task = (
  { name, commands }: Task,
  argv: string[],
  env: Environment,
  depth: number,
  history: string[]
) => {
  if (depth > 3 || history.find(item => item === name)) {
    throw new Error('Too deep');
  }

  for (let i = 0; i < commands.length; i += 1) {
    run_command(commands[i], env, depth + 1, history.concat([name]));
  }
};

const list = (env: Environment) =>
  Object.keys(env.path).filter(
    command => _.isObject(env.path[command]) && 'name' in (env.path[command] as Task)
  );

export default (e: Environment) => {
  const env = { ...e };
  return {
    run: ({ command, args }: Command) => run({ command, args }, env),
    list: () => list(env),
    exec
  };
};
