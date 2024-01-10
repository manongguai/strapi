/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import { AnErrorOccurred } from '@strapi/helper-plugin';
import { Routes, Route } from 'react-router-dom';

import { pluginId } from '../pluginId';

import { HomePage } from './HomePage';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path={`/plugins/${pluginId}`}>
          <HomePage />
        </Route>
        <Route>
          <AnErrorOccurred />
        </Route>
      </Routes>
    </div>
  );
};

export { App };
