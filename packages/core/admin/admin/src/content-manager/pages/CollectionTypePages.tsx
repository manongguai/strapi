/**
 * This component renders all the routes for either multiple or single content types
 * including the settings views available.
 */

import * as React from 'react';

import { CheckPagePermissions, LoadingIndicatorPage } from '@strapi/helper-plugin';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import { useTypedSelector } from '../../core/store/hooks';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { useContentTypeLayout } from '../hooks/useLayouts';
import {
  SettingsViewComponentLayout,
  SettingsViewContentTypeLayout,
  formatLayoutForSettingsView,
} from '../utils/layouts';

// @ts-expect-error – This will be done in CONTENT-1952
import EditSettingsView from './EditSettingsView';
import { EditViewLayoutManager } from './EditViewLayoutManager';
// @ts-expect-error – This will be done in CONTENT-1953
import { ListSettingsView } from './ListSettingsView';
import { ListViewLayoutManager } from './ListViewLayoutManager';

const CollectionTypePages = () => {
  const match = useRouteMatch<{
    collectionType: 'collection-types' | 'single-types';
    slug: string;
  }>('/content-manager/:collectionType/:slug');

  const permissions = useTypedSelector((state) => state.admin_app.permissions);

  const { isLoading, layout, updateLayout } = useContentTypeLayout(match?.params.slug);

  const { rawContentTypeLayout, rawComponentsLayouts } = React.useMemo(() => {
    let rawContentTypeLayout: SettingsViewContentTypeLayout | null = null;
    let rawComponentsLayouts: Record<string, SettingsViewComponentLayout> | null = null;

    if (layout?.contentType) {
      rawContentTypeLayout = formatLayoutForSettingsView(layout.contentType);
    }

    if (layout?.components) {
      rawComponentsLayouts = Object.keys(layout.components).reduce<
        Record<string, SettingsViewComponentLayout>
      >((acc, current) => {
        acc[current] = formatLayoutForSettingsView(layout.components[current]);

        return acc;
      }, {});
    }

    return { rawContentTypeLayout, rawComponentsLayouts };
  }, [layout]);

  /**
   * We only support two types of collections.
   */
  if (
    !match ||
    (match.params.collectionType !== 'collection-types' &&
      match.params.collectionType !== 'single-types')
  ) {
    return <NotFoundPage />;
  }

  if (isLoading || !layout) {
    return <LoadingIndicatorPage />;
  }

  const {
    path,
    params: { collectionType, slug },
  } = match;

  /**
   * We do this cast so the params are correctly inferred on the render props.
   */
  const currentPath = path as `/content-manager/:collectionType/:slug`;

  return (
    <Switch>
      <Route path={currentPath} exact>
        {collectionType === 'collection-types' ? (
          <ListViewLayoutManager slug={slug} layout={layout} />
        ) : (
          <EditViewLayoutManager layout={layout} />
        )}
      </Route>
      <Route exact path={`${currentPath}/configurations/edit`}>
        <CheckPagePermissions
          permissions={permissions.contentManager?.collectionTypesConfigurations}
        >
          <EditSettingsView
            components={rawComponentsLayouts}
            isContentTypeView
            mainLayout={rawContentTypeLayout}
            slug={slug}
            updateLayout={updateLayout}
          />
        </CheckPagePermissions>
      </Route>
      {collectionType === 'collection-types' ? (
        <>
          <Route path={`${currentPath}/configurations/list`}>
            <CheckPagePermissions
              permissions={permissions.contentManager?.collectionTypesConfigurations}
            >
              <ListSettingsView
                layout={rawContentTypeLayout}
                slug={slug}
                updateLayout={updateLayout}
              />
            </CheckPagePermissions>
          </Route>
          <Route path={`${currentPath}/create/clone/:origin`} exact>
            <EditViewLayoutManager layout={layout} />
          </Route>
          <Route path={[`${currentPath}/create`, `${currentPath}/:id`]} exact>
            <EditViewLayoutManager layout={layout} />
          </Route>
        </>
      ) : null}
    </Switch>
  );
};

export { CollectionTypePages };
