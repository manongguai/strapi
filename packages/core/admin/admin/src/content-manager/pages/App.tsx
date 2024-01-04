import * as React from 'react';

import { AnyAction, createSelector } from '@reduxjs/toolkit';
import { HeaderLayout, Layout, Main } from '@strapi/design-system';
import {
  AnErrorOccurred,
  CheckPagePermissions,
  LoadingIndicatorPage,
  useGuidedTour,
} from '@strapi/helper-plugin';
import produce from 'immer';
import { Helmet } from 'react-helmet';
import { useIntl } from 'react-intl';
import { Redirect, Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';

import { DragLayer, DragLayerProps } from '../../components/DragLayer';
import { RootState } from '../../core/store/configure';
import { useTypedSelector } from '../../core/store/hooks';
import { CardDragPreview } from '../components/DragPreviews/CardDragPreview';
import { ComponentDragPreview } from '../components/DragPreviews/ComponentDragPreview';
import { RelationDragPreview } from '../components/DragPreviews/RelationDragPreview';
import { LeftMenu } from '../components/LeftMenu';
import { useContentManagerInitData } from '../hooks/useContentManagerInitData';
import { ItemTypes } from '../utils/dragAndDrop';
import { getTranslation } from '../utils/translations';

import { CollectionTypePages } from './CollectionTypePages';
import { ComponentSettingsView } from './ComponentSettingsView';
import { NoContentType } from './NoContentTypePage';
import { NoPermissions } from './NoPermissionsPage';

import type { ContentManagerLink } from '../hooks/useContentManagerInitData';
import type { Contracts } from '@strapi/plugin-content-manager/_internal/shared';

/* -------------------------------------------------------------------------------------------------
 * App
 * -----------------------------------------------------------------------------------------------*/

const App = () => {
  const contentTypeMatch = useRouteMatch(`/content-manager/:kind/:uid`);
  const { isLoading, collectionTypeLinks, models, singleTypeLinks } = useContentManagerInitData();
  const { pathname } = useLocation();
  const { formatMessage } = useIntl();
  const { startSection } = useGuidedTour();
  const startSectionRef = React.useRef(startSection);
  const permissions = useTypedSelector((state) => state.admin_app.permissions);

  React.useEffect(() => {
    if (startSectionRef.current) {
      startSectionRef.current('contentManager');
    }
  }, []);

  if (isLoading) {
    return (
      <Main aria-busy="true">
        <Helmet
          title={formatMessage({
            id: getTranslation('plugin.name'),
            defaultMessage: 'Content Manager',
          })}
        />
        <HeaderLayout
          title={formatMessage({
            id: getTranslation('header.name'),
            defaultMessage: 'Content',
          })}
        />
        <LoadingIndicatorPage />
      </Main>
    );
  }

  const authorisedModels = [...collectionTypeLinks, ...singleTypeLinks].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
  // Array of models that are displayed in the content manager
  const supportedModelsToDisplay = models.filter(({ isDisplayed }) => isDisplayed);

  // Redirect the user to the 403 page
  if (
    authorisedModels.length === 0 &&
    supportedModelsToDisplay.length > 0 &&
    pathname !== '/content-manager/403'
  ) {
    return <Redirect to="/content-manager/403" />;
  }

  // Redirect the user to the create content type page
  if (supportedModelsToDisplay.length === 0 && pathname !== '/content-manager/no-content-types') {
    return <Redirect to="/content-manager/no-content-types" />;
  }

  if (!contentTypeMatch && authorisedModels.length > 0) {
    return (
      <Redirect
        to={{
          pathname: authorisedModels[0].to,
          search: authorisedModels[0].search ?? '',
        }}
      />
    );
  }

  return (
    <>
      <Helmet
        title={formatMessage({
          id: getTranslation('plugin.name'),
          defaultMessage: 'Content Manager',
        })}
      />
      <Layout sideNav={<LeftMenu />}>
        <DragLayer renderItem={renderDraglayerItem} />
        <Switch>
          <Route path="/content-manager/components/:uid/configurations/edit">
            <CheckPagePermissions
              permissions={permissions.contentManager?.componentsConfigurations}
            >
              <ComponentSettingsView />
            </CheckPagePermissions>
          </Route>
          {/* These redirects exist because we've changed to use the same term in `:collectionType` as the admin API for simplicity */}
          <Route path="/content-manager/collectionType/:slug">
            <Redirect to="/content-manager/collection-types/:slug" />
          </Route>
          <Route path="/content-manager/singleType/:slug">
            <Redirect to="/content-manager/single-types/:slug" />
          </Route>
          <Route path="/content-manager/:collectionType/:slug">
            <CollectionTypePages />
          </Route>
          <Route path="/content-manager/403">
            <NoPermissions />
          </Route>
          <Route path="/content-manager/no-content-types">
            <NoContentType />
          </Route>
          <Route path="">
            <AnErrorOccurred />
          </Route>
        </Switch>
      </Layout>
    </>
  );
};

/* -------------------------------------------------------------------------------------------------
 * renderDraglayerItem
 * -----------------------------------------------------------------------------------------------*/

function renderDraglayerItem({ type, item }: Parameters<DragLayerProps['renderItem']>[0]) {
  if (!type || (type && typeof type !== 'string')) {
    return null;
  }

  /**
   * Because a user may have multiple relations / dynamic zones / repeable fields in the same content type,
   * we append the fieldName for the item type to make them unique, however, we then want to extract that
   * first type to apply the correct preview.
   */
  const [actualType] = type.split('_');

  switch (actualType) {
    case ItemTypes.EDIT_FIELD:
    case ItemTypes.FIELD:
      return <CardDragPreview labelField={item.labelField} />;
    case ItemTypes.COMPONENT:
    case ItemTypes.DYNAMIC_ZONE:
      return <ComponentDragPreview displayedValue={item.displayedValue} />;

    case ItemTypes.RELATION:
      return (
        <RelationDragPreview
          displayedValue={item.displayedValue}
          status={item.status}
          width={item.width}
        />
      );

    default:
      return null;
  }
}

/* -------------------------------------------------------------------------------------------------
 * reducer
 * -----------------------------------------------------------------------------------------------*/

export const SET_INIT_DATA = 'ContentManager/App/SET_INIT_DATA';

interface SetInitDataAction {
  type: typeof SET_INIT_DATA;
  authorizedCollectionTypeLinks: ContentManagerAppState['collectionTypeLinks'];
  authorizedSingleTypeLinks: ContentManagerAppState['singleTypeLinks'];
  components: ContentManagerAppState['components'];
  contentTypeSchemas: ContentManagerAppState['models'];
  fieldSizes: ContentManagerAppState['fieldSizes'];
}

interface ContentManagerAppState {
  collectionTypeLinks: ContentManagerLink[];
  components: Contracts.Init.GetInitData.Response['data']['components'];
  fieldSizes: Contracts.Init.GetInitData.Response['data']['fieldSizes'];
  models: Contracts.Init.GetInitData.Response['data']['contentTypes'];
  singleTypeLinks: ContentManagerLink[];
}

const initialState = {
  collectionTypeLinks: [],
  components: [],
  fieldSizes: {},
  models: [],
  singleTypeLinks: [],
} satisfies ContentManagerAppState;

const selectSchemas = createSelector(
  (state: RootState) => state['content-manager_app'],
  ({ components, models }) => {
    return [...components, ...models];
  }
);

const reducer = (state: ContentManagerAppState = initialState, action: AnyAction) =>
  produce(state, (draftState) => {
    switch (action.type) {
      case SET_INIT_DATA: {
        const initDataAction = action as SetInitDataAction;
        draftState.collectionTypeLinks = initDataAction.authorizedCollectionTypeLinks.filter(
          ({ isDisplayed }) => isDisplayed
        );
        draftState.singleTypeLinks = initDataAction.authorizedSingleTypeLinks.filter(
          ({ isDisplayed }) => isDisplayed
        );
        draftState.components = initDataAction.components;
        draftState.models = initDataAction.contentTypeSchemas;
        draftState.fieldSizes = initDataAction.fieldSizes;
        break;
      }
      default:
        return draftState;
    }
  });

export { App, reducer, selectSchemas };
export type { ContentManagerAppState };
