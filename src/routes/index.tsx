import React from 'react';
import { RouteObject } from 'react-router-dom';
import Layout from '@/pages/layout';
import Main from '@/pages/main';
import Skyline from '@/pages/skyline';
import NotFound from '@/pages/NotFound';

export default [
  {
    path: '/',
    element: <Layout />,
    children: [{ index: true, element: <Main /> }],
  },
  {
    path: '/:username/:year',
    element: <Skyline />,
  },
  {
    path: '/*',
    element: <NotFound />,
  },
] as RouteObject[];
