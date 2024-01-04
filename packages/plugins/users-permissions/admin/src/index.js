import { prefixPluginTranslations } from '@strapi/helper-plugin';

import pluginPkg from '../../package.json';

import { PERMISSIONS } from './constants';
import getTrad from './utils/getTrad';

const name = pluginPkg.strapi.name;

export default {
  register(app) {
    // Create the plugin's settings section
    app.createSettingSection(
      {
        id: 'users-permissions',
        intlLabel: {
          id: getTrad('Settings.section-label'),
          defaultMessage: 'Users & Permissions plugin',
        },
      },
      [
        {
          intlLabel: {
            id: 'global.roles',
            defaultMessage: 'Roles',
          },
          id: 'roles',
          to: `/settings/users-permissions/roles`,
          Component: () => import('./pages/Roles'),
          permissions: PERMISSIONS.accessRoles,
          exact: true,
        },
        {
          intlLabel: {
            id: getTrad('HeaderNav.link.providers'),
            defaultMessage: 'Providers',
          },
          id: 'providers',
          to: `/settings/users-permissions/providers`,
          Component: () => import('./pages/Providers'),
          permissions: PERMISSIONS.readProviders,
          exact: true,
        },
        {
          intlLabel: {
            id: getTrad('HeaderNav.link.emailTemplates'),
            defaultMessage: 'Email templates',
          },
          id: 'email-templates',
          to: `/settings/users-permissions/email-templates`,
          Component: () => import('./pages/EmailTemplates'),
          permissions: PERMISSIONS.readEmailTemplates,
          exact: true,
        },
        {
          intlLabel: {
            id: getTrad('HeaderNav.link.advancedSettings'),
            defaultMessage: 'Advanced Settings',
          },
          id: 'advanced-settings',
          to: `/settings/users-permissions/advanced-settings`,
          Component: () => import('./pages/AdvancedSettings'),
          permissions: PERMISSIONS.readAdvancedSettings,
          exact: true,
        },
      ]
    );

    app.registerPlugin({
      id: 'users-permissions',
      name,
    });
  },
  bootstrap() {},
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, 'users-permissions'),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
