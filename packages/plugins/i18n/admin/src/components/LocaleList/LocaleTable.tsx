import * as React from 'react';

import {
  Flex,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Typography,
  VisuallyHidden,
} from '@strapi/design-system';
import { onRowClick, stopPropagation } from '@strapi/helper-plugin';
import { Pencil, Trash } from '@strapi/icons';
import { useIntl } from 'react-intl';

import { getTrad } from '../../utils';

type LocaleTableProps = {
  locales?: {
    id: string;
    name: string;
    isDefault: boolean;
  }[];
  onDeleteLocale?: (locale: any) => void;
  onEditLocale?: (locale: any) => void;
};

const LocaleTable = ({ locales = [], onDeleteLocale, onEditLocale }: LocaleTableProps) => {
  const { formatMessage } = useIntl();

  return (
    <Table colCount={4} rowCount={locales.length + 1}>
      <Thead>
        <Tr>
          <Th>
            <Typography variant="sigma" textColor="neutral600">
              {formatMessage({ id: getTrad('Settings.locales.row.id') })}
            </Typography>
          </Th>
          <Th>
            <Typography variant="sigma" textColor="neutral600">
              {formatMessage({ id: getTrad('Settings.locales.row.displayName') })}
            </Typography>
          </Th>
          <Th>
            <Typography variant="sigma" textColor="neutral600">
              {formatMessage({ id: getTrad('Settings.locales.row.default-locale') })}
            </Typography>
          </Th>
          <Th>
            <VisuallyHidden>Actions</VisuallyHidden>
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {locales.map((locale: { id: string; name: string; isDefault: boolean }) => (
          <Tr
            key={locale.id}
            {...onRowClick({
              fn: () => onEditLocale!(locale),
              condition: Boolean(onEditLocale),
            })}
          >
            <Td>
              <Typography textColor="neutral800">{locale.id}</Typography>
            </Td>
            <Td>
              <Typography textColor="neutral800">{locale.name}</Typography>
            </Td>
            <Td>
              <Typography textColor="neutral800">
                {locale.isDefault
                  ? formatMessage({ id: getTrad('Settings.locales.default') })
                  : null}
              </Typography>
            </Td>
            <Td>
              <Flex gap={1} justifyContent="flex-end" {...stopPropagation}>
                {onEditLocale && (
                  <IconButton
                    onClick={() => onEditLocale(locale)}
                    label={formatMessage({ id: getTrad('Settings.list.actions.edit') })}
                    icon={<Pencil />}
                    noBorder
                  />
                )}
                {onDeleteLocale && !locale.isDefault && (
                  <IconButton
                    onClick={() => onDeleteLocale(locale)}
                    label={formatMessage({ id: getTrad('Settings.list.actions.delete') })}
                    icon={<Trash />}
                    noBorder
                  />
                )}
              </Flex>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default LocaleTable;