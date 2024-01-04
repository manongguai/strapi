import { lazy } from 'react';

import { MenuItem } from '@strapi/helper-plugin';

export interface Route
  extends Pick<MenuItem, 'exact' | 'to'>,
    Required<Pick<MenuItem, 'Component'>> {}

export const ROUTES_CE: Route[] = [
  {
    Component: lazy(() =>
      import('./pages/Roles/ListPage').then((mod) => ({ default: mod.ProtectedListPage }))
    ),
    to: '/settings/roles',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/Roles/CreatePage').then((mod) => ({ default: mod.ProtectedCreatePage }))
    ),
    to: '/settings/roles/duplicate/:id',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/Roles/CreatePage').then((mod) => ({ default: mod.ProtectedCreatePage }))
    ),
    to: '/settings/roles/new',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/Roles/EditPage').then((mod) => ({ default: mod.ProtectedEditPage }))
    ),
    to: '/settings/roles/:id',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/Users/ListPage').then((mod) => ({ default: mod.ProtectedListPage }))
    ),
    to: '/settings/users',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/Users/EditPage').then((mod) => ({ default: mod.ProtectedEditPage }))
    ),
    to: '/settings/users/:id',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/Webhooks/CreatePage').then((mod) => ({ default: mod.ProtectedCreatePage }))
    ),
    to: '/settings/webhooks/create',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/Webhooks/EditPage').then((mod) => ({ default: mod.ProtectedEditPage }))
    ),
    to: '/settings/webhooks/:id',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/Webhooks/ListPage').then((mod) => ({ default: mod.ProtectedListPage }))
    ),
    to: '/settings/webhooks',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/ApiTokens/ListView').then((mod) => ({ default: mod.ProtectedListView }))
    ),
    to: '/settings/api-tokens',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/ApiTokens/CreateView').then((mod) => ({ default: mod.ProtectedCreateView }))
    ),
    to: '/settings/api-tokens/create',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/ApiTokens/EditView/EditViewPage').then((mod) => ({
        default: mod.ProtectedEditView,
      }))
    ),
    to: '/settings/api-tokens/:id',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/TransferTokens/CreateView').then((mod) => ({
        default: mod.ProtectedCreateView,
      }))
    ),
    to: '/settings/transfer-tokens/create',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/TransferTokens/ListView').then((mod) => ({ default: mod.ProtectedListView }))
    ),
    to: '/settings/transfer-tokens',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/TransferTokens/EditView').then((mod) => ({ default: mod.ProtectedEditView }))
    ),
    to: '/settings/transfer-tokens/:id',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/PurchaseAuditLogs').then((mod) => ({ default: mod.PurchaseAuditLogs }))
    ),
    to: '/settings/purchase-audit-logs',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/PurchaseReviewWorkflows').then((mod) => ({
        default: mod.PurchaseReviewWorkflows,
      }))
    ),
    to: '/settings/purchase-review-workflows',
    exact: true,
  },
  {
    Component: lazy(() =>
      import('./pages/PurchaseSingleSignOn').then((mod) => ({ default: mod.PurchaseSingleSignOn }))
    ),
    to: '/settings/purchase-single-sign-on',
    exact: true,
  },
];
