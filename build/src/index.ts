import { buildRoot } from './path';
import { run } from './utils/process';

function runCommand(command: string) {
  return run(command, buildRoot);
}

function buildCheck() {
  return runCommand('pnpm run build:check');
}

export { buildCheck };
