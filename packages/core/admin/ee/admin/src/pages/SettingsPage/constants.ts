import { lazy } from 'react';

import type { Route } from '../../../../../admin/src/pages/Settings/constants';

export const ROUTES_EE: Route[] = [
  ...(window.strapi.features.isEnabled(window.strapi.features.AUDIT_LOGS)
    ? [
        {
          Component: lazy(() =>
            import('./pages/AuditLogs/ListPage').then((mod) => ({ default: mod.ProtectedListPage }))
          ),
          to: '/settings/audit-logs',
          exact: true,
        },
      ]
    : []),
  ...(window.strapi.features.isEnabled(window.strapi.features.REVIEW_WORKFLOWS)
    ? [
        {
          Component: lazy(() =>
            import('./pages/ReviewWorkflows/ListPage').then((mod) => ({
              default: mod.ProtectedReviewWorkflowsPage,
            }))
          ),
          to: '/settings/review-workflows',
          exact: true,
        },
        {
          Component: lazy(() =>
            import('./pages/ReviewWorkflows/CreatePage').then((mod) => ({
              default: mod.ReviewWorkflowsCreatePage,
            }))
          ),
          to: '/settings/review-workflows/create',
          exact: true,
        },
        {
          Component: lazy(() =>
            import('./pages/ReviewWorkflows/EditPage').then((mod) => ({
              default: mod.ReviewWorkflowsEditPage,
            }))
          ),
          to: '/settings/review-workflows/:workflowId',
          exact: true,
        },
      ]
    : []),
  ...(window.strapi.features.isEnabled(window.strapi.features.SSO)
    ? [
        {
          Component: lazy(() =>
            import('./pages/SingleSignOnPage').then((mod) => ({ default: mod.ProtectedSSO }))
          ),
          to: '/settings/single-sign-on',
          exact: true,
        },
      ]
    : []),
];
