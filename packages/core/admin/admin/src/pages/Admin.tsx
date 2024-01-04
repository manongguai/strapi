/**
 *
 * Admin
 *
 */

import * as React from 'react';

import { LoadingIndicatorPage, useStrapiApp, useTracking } from '@strapi/helper-plugin';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Route, Switch } from 'react-router-dom';

import { GuidedTourModal } from '../components/GuidedTour/Modal';
import { LeftMenu } from '../components/LeftMenu';
import { Onboarding } from '../components/Onboarding';
import { useConfiguration } from '../features/Configuration';
import { useMenu } from '../hooks/useMenu';
import { useOnce } from '../hooks/useOnce';
import { AppLayout } from '../layouts/AppLayout';

const CM = React.lazy(() =>
  import('../content-manager/pages/App').then((mod) => ({ default: mod.App }))
);
const HomePage = React.lazy(() =>
  import('./HomePage').then((mod) => ({
    default: mod.HomePage,
  }))
);
const InstalledPluginsPage = React.lazy(() =>
  import('./InstalledPluginsPage').then((mod) => ({
    default: mod.ProtectedInstalledPluginsPage,
  }))
);
const MarketplacePage = React.lazy(() =>
  import('./Marketplace/MarketplacePage').then((mod) => ({ default: mod.ProtectedMarketplacePage }))
);
const NotFoundPage = React.lazy(() =>
  import('./NotFoundPage').then(({ NotFoundPage }) => ({ default: NotFoundPage }))
);
const InternalErrorPage = React.lazy(() =>
  import('./InternalErrorPage').then(({ InternalErrorPage }) => ({
    default: InternalErrorPage,
  }))
);

const ProfilePage = React.lazy(() =>
  import('./ProfilePage').then((mod) => ({
    default: mod.ProfilePage,
  }))
);
const SettingsPage = React.lazy(() =>
  import('./Settings/SettingsPage').then((mod) => ({
    default: mod.SettingsPage,
  }))
);

const Admin = () => {
  const { trackUsage } = useTracking();

  const { isLoading, generalSectionLinks, pluginsSectionLinks } = useMenu();
  const { menu } = useStrapiApp();
  const { showTutorials } = useConfiguration('Admin');

  /**
   * Make sure the event is only send once after accessing the admin panel
   * and not at runtime for example when regenerating the permissions with the ctb
   * or with i18n
   */
  useOnce(() => {
    trackUsage('didAccessAuthenticatedAdministration');
  });

  if (isLoading) {
    return <LoadingIndicatorPage />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <AppLayout
        sideNav={
          <LeftMenu
            generalSectionLinks={generalSectionLinks}
            pluginsSectionLinks={pluginsSectionLinks}
          />
        }
      >
        <React.Suspense fallback={<LoadingIndicatorPage />}>
          <Switch>
            <Route path="/" exact>
              <HomePage />
            </Route>
            <Route path="/me" exact>
              <ProfilePage />
            </Route>
            <Route path="/content-manager">
              <CM />
            </Route>
            {menu.map(({ to, Component, exact }) => {
              if (!Component) return null;
              else {
                return (
                  <Route
                    // TODO: convert this in the spirit of https://github.com/strapi/strapi/pull/17685
                    key={to}
                    path={to}
                    exact={exact || false}
                  >
                    <React.Suspense fallback={<LoadingIndicatorPage />}>
                      <Component />
                    </React.Suspense>
                  </Route>
                );
              }
            })}

            <Route path={'/settings'} exact>
              <SettingsPage />
            </Route>
            <Route path={'/settings/:settingId'}>
              <SettingsPage />
            </Route>
            <Route path="/marketplace">
              <MarketplacePage />
            </Route>
            <Route path="/list-plugins" exact>
              <InstalledPluginsPage />
            </Route>
            <Route path="/404">
              <NotFoundPage />
            </Route>
            <Route path="/500">
              <InternalErrorPage />
            </Route>
          </Switch>
        </React.Suspense>
        <GuidedTourModal />

        {showTutorials && <Onboarding />}
      </AppLayout>
    </DndProvider>
  );
};

export { Admin };
