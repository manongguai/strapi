import * as React from 'react';

import { Layout } from '@strapi/design-system';
import { LoadingIndicatorPage, useStrapiApp } from '@strapi/helper-plugin';
import { Helmet } from 'react-helmet';
import { useIntl } from 'react-intl';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import { useEnterprise } from '../../hooks/useEnterprise';
import { useSettingsMenu } from '../../hooks/useSettingsMenu';
import { LazyCompo } from '../../utils/createRoute';

import { SettingsNav } from './components/SettingsNav';
import { ROUTES_CE, Route as IRoute } from './constants';
import { ApplicationInfoPage } from './pages/ApplicationInfo/ApplicationInfoPage';

const SettingsPage = () => {
  const { settingId } = useParams<{ settingId: string }>();
  const { settings } = useStrapiApp();
  const { formatMessage } = useIntl();
  const { isLoading, menu } = useSettingsMenu();
  const routes = useEnterprise(
    ROUTES_CE,
    async () => (await import('../../../../ee/admin/src/pages/SettingsPage/constants')).ROUTES_EE,
    {
      combine(ceRoutes, eeRoutes) {
        return [...ceRoutes, ...eeRoutes];
      },
      defaultValue: [],
    }
  );

  // Since the useSettingsMenu hook can make API calls in order to check the links permissions
  // We need to add a loading state to prevent redirecting the user while permissions are being checked
  if (isLoading) {
    return <LoadingIndicatorPage />;
  }

  if (!settingId) {
    return <Redirect to="/settings/application-infos" />;
  }

  return (
    <Layout sideNav={<SettingsNav menu={menu} />}>
      <Helmet
        title={formatMessage({
          id: 'global.settings',
          defaultMessage: 'Settings',
        })}
      />

      <Switch>
        <Route path="/settings/application-infos" component={ApplicationInfoPage} exact />
        {makeUniqueRoutes(routes).map(({ to, Component, exact }) => (
          <Route
            // TODO: convert this in the spirit of https://github.com/strapi/strapi/pull/17685
            key={to}
            path={to}
            exact={exact || false}
          >
            <LazyCompo loadComponent={Component} />
          </Route>
        ))}
        {Object.values(settings).flatMap((section) => {
          const { links } = section;

          return links.map((link) => (
            <Route
              // TODO: convert this in the spirit of https://github.com/strapi/strapi/pull/17685
              key={link.to}
              path={link.to}
              exact={link.exact || false}
            >
              <LazyCompo loadComponent={link.Component} />
            </Route>
          ));
        })}
      </Switch>
    </Layout>
  );
};

export const makeUniqueRoutes = (routes: IRoute[]) =>
  routes.filter(
    (route, index, refArray) => refArray.findIndex((obj) => obj.to === route.to) === index
  );

export { SettingsPage };
