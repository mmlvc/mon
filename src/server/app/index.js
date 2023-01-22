import { resolve } from 'path';
import PureHttp from 'pure-http';
import helmet from 'helmet';
import favicon from 'serve-favicon';
import compression from 'compression';
import serve from 'serve-static';
import puppeteer from 'puppeteer';
import render from '../render';
import users from '../db/users.json';

const app = PureHttp();

app.use(favicon(resolve(process.cwd(), 'public/favicon.ico')));
app.use(compression());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(serve(resolve(process.cwd(), 'public')));

/* istanbul ignore next */
const websocketServerCreator = __DEV__ ? require('./websocket-server-creator').default : undefined;
const webpackMiddleware = __DEV__ ? require('../middlewares/webpack.middleware').default : undefined;

/* istanbul ignore next */
if (typeof webpackMiddleware === 'function') {
  const ws = websocketServerCreator(app);

  app.use(webpackMiddleware(ws));
}

app.get('/api/health', async (req, res) => {
  console.log('here');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36',
  );
  await page.goto('https://www.bybit.com/fiat/trade/otc/?actionType=1&token=USDT&fiat=BYN&paymentMethod=', {
    waitUntil: 'domcontentloaded',
  });

  // setTimeout(async () => {
  //   await page.screenshot({ path: './test.png' });

  //   await page.waitForSelector('.price-amount');
  //   console.log('here.....2');
  //   const data = await page.evaluate(() => document.querySelectorAll('.price-amount').textContent);
  //   console.log(data);

  //   console.log(await page.content());
  // }, 10000);

  await page.waitForSelector('.price-amount');
  console.log('here.....');

  const pagestring = await page.content();
  const getUSDRegex = /(?<=class="price-amount">).{0,4}/;

  const parsedPrice = getUSDRegex.exec(pagestring)[0];

  console.log('parsedPrice: ', parsedPrice);

  await browser.close();

  return res
    .json({
      success: true,
      data: { usdtTakerBybit: parsedPrice },
    })
    .end();
});

app.get('/api/users', (req, res) =>
  res.json({
    success: true,
    users,
  }),
);

app.get('/api/users/:id', (req, res) => {
  const user = users.find((_user) => _user.id === parseInt(req.params.id, 10)) || {};

  return res.json({
    success: true,
    user,
  });
});

app.get(/^(?!.*^\/api\/)(.*)/, render);

app.use((req, res, _next) =>
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.path}`,
  }),
);

export default app;
