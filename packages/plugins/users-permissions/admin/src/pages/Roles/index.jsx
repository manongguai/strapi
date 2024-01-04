import React from 'react';

import { AnErrorOccurred, CheckPagePermissions } from '@strapi/helper-plugin';
import { Route, Switch } from 'react-router-dom';

import { PERMISSIONS } from '../../constants';

import { ProtectedRolesCreatePage } from './pages/CreatePage';
import { ProtectedRolesEditPage } from './pages/EditPage';
import { ProtectedRolesListPage } from './pages/ListPage';

const Roles = () => {
  return (
    <CheckPagePermissions permissions={PERMISSIONS.accessRoles}>
      <Switch>
        <Route path="/settings/users-permissions/roles/new" exact>
          <ProtectedRolesCreatePage />
        </Route>
        <Route path="/settings/users-permissions/roles/:id" exact>
          <ProtectedRolesEditPage />
        </Route>
        <Route path="/settings/users-permissions/roles" exact>
          <ProtectedRolesListPage />
        </Route>
        <Route path="">
          <AnErrorOccurred />
        </Route>
      </Switch>
    </CheckPagePermissions>
  );
};

export default Roles;
