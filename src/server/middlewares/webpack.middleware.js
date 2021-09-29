/* eslint-disable import/no-extraneous-dependencies */
import os from 'os';
import webpack from 'webpack';
import whm from 'webpack-hot-middleware';
import wdm from 'webpack-dev-middleware';
import formatWebpackMessages from 'webpack-format-messages';
import { underline, bold, green, red, yellow, cyan, blue } from 'nanocolors';

import serverConfig from 'configs/server';
import config from '~/webpack/webpack.config.client';

const isInteractive = process.stdout.isTTY;

const clearConsole = () =>
  process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');

const printInstructions = () => {
  const { en0, Ethernet } = os.networkInterfaces();

  let interfaces = [];

  if (Array.isArray(en0)) {
    interfaces = en0;
  } else if (Array.isArray(Ethernet)) {
    interfaces = Ethernet;
  }

  // get last IPv4
  const [lastIPv4] = interfaces.filter(({ family }) => family === 'IPv4').splice(-1);

  const host = !lastIPv4 ? '0.0.0.0' : lastIPv4.address;

  console.log(`You can now view ${bold('app')} in the browser.\n`);
  console.log(`  ${bold('Local:')}\t\thttp://localhost:${bold(serverConfig.PORT)}`);
  console.log(`  ${bold('On Your Network:')}\thttp://${host}:${bold(serverConfig.PORT)}\n`);
  console.log('Note that the development build is not optimized.');
  console.log(`To create a production build, use ${blue('npm run build')}.\n`);
};

const compiler = webpack(config);

const webpackMiddleware = () => {
  let isFirstCompile = true;

  compiler.hooks.invalid.tap('invalid', () => {
    if (isInteractive) {
      clearConsole();
    }

    console.log('Compiling...');
  });

  compiler.hooks.done.tap('done', (stats) => {
    if (isInteractive) {
      clearConsole();
    }

    const messages = formatWebpackMessages(stats);

    const isSuccessful = !messages.errors.length && !messages.warnings.length;

    if (isSuccessful) {
      console.log(green('Compiled successfully!\n'));

      if (isInteractive || isFirstCompile) {
        printInstructions();
      }
    }
    isFirstCompile = false;

    if (messages.errors.length) {
      if (messages.errors.length > 1) {
        messages.errors.length = 1;
      }
      console.log(red('Failed to compile.\n'));
      console.log(messages.errors.join('\n\n'));

      return;
    }

    if (messages.warnings.length) {
      console.log(yellow('Compiled with warnings.\n'));
      console.log(messages.warnings.join('\n\n'));

      // Teach some ESLint tricks.
      console.log(`\nSearch for the ${underline(yellow('keywords'))} to learn more about each warning.`);
      console.log(`To ignore, add ${cyan('// eslint-disable-next-line')} to the line before.\n`);
    }
  });

  return [
    whm(compiler, { log: false, path: '/__webpack_hmr', heartbeat: 200 }),
    wdm(compiler, { serverSideRender: true, writeToDisk: true }),
  ];
};

export default webpackMiddleware;
