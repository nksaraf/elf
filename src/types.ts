export interface Command {
  command: string;
  args: string[];
}

export interface Task {
  name: string;
  commands: Command[];
}

export interface Path {
  [key: string]: string | Task;
}

export interface Environment {
  path: Path;
  [key: string]: string | object;
}

export interface RunFile {
  env: Environment;
  [key: string]: string | object | (string | object)[];
}
