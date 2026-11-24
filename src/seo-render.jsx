import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { RoutedSite } from './main.jsx';
import { referencePage } from './reference-site.jsx';

export { referencePage };

export function renderPage(path, initialPage) {
  return renderToString(<MemoryRouter initialEntries={[path]}><RoutedSite initialPage={initialPage} /></MemoryRouter>);
}
