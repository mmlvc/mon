import { resolve } from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ServerLocation, matchPath } from '@reach/router';
import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import ssrPrepass from 'react-ssr-prepass';

import App from 'client/app';
import createStore from 'client/store';
import routes from 'client/routes';

import renderHtml from './render-html';

const renderController = async (req, res) => {
  const store = createStore();

  const loadBranchData = () => {
    const promises = routes
      .filter((route) => !!route.path)
      .map((route) => {
        const matched = matchPath(route.path, req.path);

        if (matched && typeof route.loadData === 'function') {
          const thunks = route
            .loadData({ params: matched.params, getState: store.getState })
            .map((thunk) => store.dispatch(thunk));

          return Promise.all(thunks);
        }

        return Promise.resolve(null);
      });

    return Promise.all(promises);
  };

  await loadBranchData();

  const statsFile = resolve(__cwd, 'public/stats.json');

  const extractor = new ChunkExtractor({ statsFile });

  const helmetContext = {};

  const node = await ssrPrepass(
    <ChunkExtractorManager extractor={extractor}>
      <Provider store={store}>
        <ServerLocation url={req.url}>
          <HelmetProvider context={helmetContext}>
            <App />
          </HelmetProvider>
        </ServerLocation>
      </Provider>
    </ChunkExtractorManager>,
  );

  const markup = renderToString(node);

  const { helmet: head } = helmetContext;

  const initialState = store.getState();

  const html = renderHtml(head, extractor, markup, initialState);

  res.header('Content-Type', 'text/html');

  return res.send(html);
};

export default renderController;
