import * as React from 'react';

import { TranslationMessage } from '../types';

import type { Permission } from './RBAC';

interface MenuItem {
  /**
   * When available, this takes precedence over the `to` property
   * for defining the route of the Component.
   */
  path?: string;
  to: string;
  icon: React.ElementType;
  intlLabel: TranslationMessage;
  /**
   * TODO: add type from the BE for what an Admin Permission looks like –
   * most likely shared throught the helper plugin...? or duplicated, idm.
   */
  permissions: Permission[];
  notificationsCount?: number;
  Component: React.LazyExoticComponent<React.ComponentType>;
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

type InjectionZoneArea =
  | 'admin.tutorials.links'
  | 'contentManager.editView.informations'
  | 'contentManager.editView.right-links'
  | 'contentManager.listView.actions'
  | 'contentManager.listView.unpublishModalAdditionalInfos'
  | 'contentManager.listView.deleteModalAdditionalInfos'
  | 'contentManager.listView.publishModalAdditionalInfos'
  | 'contentManager.listView.deleteModalAdditionalInfos';

type InjectionZoneModule = InjectionZoneArea extends `${infer Word}.${string}` ? Word : never;
type InjectionZoneContainer = InjectionZoneArea extends `${string}.${infer Word}.${string}`
  ? Word
  : never;
type InjectionZoneBlock = InjectionZoneArea extends `${string}.${string}.${infer Word}`
  ? Word
  : never;

// TODO: this should come from `core/admin/src/core/apis/Plugins`
interface Plugin {
  apis: Record<string, unknown>;
  injectionZones: Record<
    string,
    Record<string, Array<{ name: string; Component: React.ComponentType }>>
  >;
  initializer: React.ComponentType<{ setPlugin(pluginId: string): void }>;
  getInjectedComponents: (
    containerName: string,
    blockName: string
  ) => Array<{ name: string; Component: React.ComponentType }>;
  isReady: boolean;
  name: string;
  pluginId: string;
}

interface StrapiAppSettingLink extends Omit<MenuItem, 'icon' | 'notificationCount'> {
  id: string;
}

interface StrapiAppSetting {
  id: string;
  intlLabel: TranslationMessage;
  links: StrapiAppSettingLink[];
}

interface RunHookSeries {
  (hookName: string, async: true): Promise<any[]>;
  (hookName: string, async?: false): any[];
}

interface RunHookWaterfall {
  <InitialValue, Store>(
    hookName: string,
    initialValue: InitialValue,
    asynchronous: true,
    store?: Store
  ): Promise<InitialValue>;
  <InitialValue, Store>(
    hookName: string,
    initialValue: InitialValue,
    asynchronous?: false,
    store?: Store
  ): InitialValue;
}

interface StrapiAppContextValue {
  menu: MenuItem[];
  plugins: Record<string, Plugin>;
  settings: Record<string, StrapiAppSetting>;
  getPlugin: (pluginId: string) => Plugin | undefined;
  getAdminInjectedComponents: (
    moduleName: InjectionZoneModule,
    containerName: InjectionZoneContainer,
    blockName: InjectionZoneBlock
  ) => Array<{ Component: React.ComponentType; name: string }>;
  runHookParallel: (hookName: string) => Promise<unknown>;
  runHookWaterfall: RunHookWaterfall;
  runHookSeries: RunHookSeries;
}

const StrapiAppContext = React.createContext<StrapiAppContextValue>({
  getPlugin: () => undefined,
  getAdminInjectedComponents: () => [],
  menu: [],
  plugins: {},
  settings: {},
  // These functions are required but should not resolve to undefined as they do here
  runHookParallel: () => Promise.resolve(),
  runHookWaterfall: () => Promise.resolve(),
  // @ts-expect-error – TODO: fix this.
  runHookSeries: () => Promise.resolve(),
});

/* -------------------------------------------------------------------------------------------------
 * Provider
 * -----------------------------------------------------------------------------------------------*/

interface StrapiAppProviderProps extends StrapiAppContextValue {
  children: React.ReactNode;
}

const StrapiAppProvider = ({
  children,
  getPlugin,
  getAdminInjectedComponents,
  menu,
  plugins,
  runHookParallel,
  runHookSeries,
  runHookWaterfall,
  settings,
}: StrapiAppProviderProps) => {
  const contextValue = React.useMemo(
    () => ({
      getPlugin,
      getAdminInjectedComponents,
      menu,
      plugins,
      runHookParallel,
      runHookSeries,
      runHookWaterfall,
      settings,
    }),
    [
      getPlugin,
      getAdminInjectedComponents,
      menu,
      plugins,
      runHookParallel,
      runHookSeries,
      runHookWaterfall,
      settings,
    ]
  );

  return <StrapiAppContext.Provider value={contextValue}>{children}</StrapiAppContext.Provider>;
};

/* -------------------------------------------------------------------------------------------------
 * Hook
 * -----------------------------------------------------------------------------------------------*/

const useStrapiApp = () => React.useContext(StrapiAppContext);

export { StrapiAppContext, StrapiAppProvider, useStrapiApp };
export type {
  StrapiAppProviderProps,
  StrapiAppContextValue,
  MenuItem,
  Plugin,
  StrapiAppSettingLink,
  StrapiAppSetting,
  RunHookSeries,
  RunHookWaterfall,
};
