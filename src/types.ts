export interface Command {
  command: string;
  args: string;
}

export type PositionalArgs = ({ required: string[] } | { optional: string[] })[];

export interface Task {
  name: string;
  commands: Command[];
  positional_args: PositionalArgs;
}

export interface Path {
  [key: string]: string | Task | ((args: string) => void);
}

export interface Environment {
  path: Path;
  vars: { [key: string]: string | object | any };
}

export interface RunFile {
  env: Environment;
  [key: string]: string | object | (string | object)[];
}

export interface Terminal {
  run: ({ command, args }: Command) => void;
  list: () => Task[];
}

export interface Interpreter {
  (tokens: string[]): void;
}
