import { register } from 'tsconfig-paths';
import { compilerOptions } from '../tsconfig.json';

// Register path aliases
register({
  baseUrl: compilerOptions.baseUrl,
  paths: compilerOptions.paths
});