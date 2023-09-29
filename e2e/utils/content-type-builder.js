import { expect } from '@playwright/test';

export async function createComponent({ page, existingCategory, category, displayName }) {
  await page.getByRole('button', { name: 'Create new component' }).click();
  await page.getByLabel('Display name').fill(displayName);

  // Open the category select
  await page.getByPlaceholder('Select or enter a value').click();

  if (existingCategory) {
    await page.getByLabel(existingCategory).click();
  } else {
    await page.getByPlaceholder('Select or enter a value').fill(category);
    await page.getByPlaceholder('Select or enter a value').press('Enter');
  }

  await page.getByRole('button', { name: 'Continue' }).click();

  return () => deleteComponent({ page, displayName });
}

export async function deleteComponent({ page, displayName }) {
  await page.getByRole('link', { name: displayName }).click();

  // The strapi update notifier alert might be displayed in front
  // of the edit button, which prevents the click from working
  if (await page.getByLabel('Close').isVisible()) {
    await page.getByLabel('Close').click();
  }

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();

  await waitForReload({ page });
}

export async function waitForReload({ page }) {
  const MAX_RETRIES = 20;
  const RETRY_TIMEOUT = 1000;

  let retryCount = 0;

  await page.waitForTimeout(2000);

  while (retryCount < MAX_RETRIES) {
    if ((await page.locator('text=Waiting for restart...').count()) === 0) {
      // the server seems no longer to be restarting
      break;
    } else {
      await page.waitForTimeout(RETRY_TIMEOUT);
      await page.reload();
      retryCount++;
    }
  }
}

export async function addDefaultField({
  page,
  type,
  contentTypeName,
  addMore = false,
  name,
  ...rest
}) {
  // TODO: should all locators be scoped to the modal using
  // `const modal = await page.getByLabel(contentTypeName, { exact: true })`?
  // that would make the util more robust.

  switch (type) {
    case 'Text':
      await page
        .getByRole('button', { name: 'Text Small or long text like title or description' })
        .click();
      break;

    case 'Email':
      await page.getByRole('button', { name: 'Email Email field with validations format' }).click();
      break;

    case 'RichText':
      await page
        .getByRole('button', { name: 'Rich text (Markdown) The classic rich text editor' })
        .click();
      break;

    case 'Password':
      await page.getByRole('button', { name: 'Password Password field with encryption' }).click();
      break;

    case 'Number':
      await page.getByRole('button', { name: 'Number Numbers (integer, float, decimal)' }).click();

      // Choose number format
      const { numberType = 'integer' } = rest;

      await page.getByLabel('Number format').click();

      switch (numberType) {
        case 'integer':
          await page.getByLabel('integer (ex: 10)').click();
          break;

        case 'big integer':
          await page.getByLabel('big integer (ex: 123456789)').click();
          break;

        case 'decimal':
          await page.getByLabel('decimal (ex: 2.22)').click();
          break;

        case 'float':
          await page.getByLabel('float (ex: 3.33333333)').click();
          break;
      }

      break;

    case 'Enumeration':
      await page.getByRole('button', { name: 'Enumeration List of values, then pick one' }).click();

      const { values } = rest;

      await page.getByLabel('Values (one line per value)', { exact: true }).fill(values.join('\n'));
      break;

    case 'Date':
      await page
        .getByRole('button', { name: 'Date A date picker with hours, minutes and seconds' })
        .click();

      // Choose number format
      const { dateType = 'date' } = rest;

      await page.getByLabel('Type', { exact: true }).click();

      switch (dateType) {
        case 'date':
          await page.getByLabel('date (ex: 01/01/2023)').click();
          break;

        case 'datetime':
          await page.getByLabel('datetime (ex: 01/01/2023 00:00 AM)').click();
          break;

        case 'time':
          await page.getByLabel('time (ex: 00:00 AM)').click();
          break;
      }
      break;

    case 'Boolean':
      await page.getByRole('button', { name: 'Boolean Yes or no, 1 or 0, true or false' }).click();
      break;

    case 'JSON':
      await page.getByRole('button', { name: 'JSON Data in JSON format' }).click();
      break;

    case 'Relation':
      await page.getByRole('button', { name: 'Relation Refers to a Collection Type' }).click();

      // Select source content-type
      const { relationType, sourceContentType } = rest;

      // TODO: why this label?
      await page.getByRole('button', { name: 'database' }).click();
      await page.getByRole('menuitem', { name: sourceContentType }).click();

      // TODO: these buttons don't have names yet
      switch (relationType) {
        case 'hasAndBelongsToOne':
          break;

        case 'belongsToMany':
          break;

        case 'hasMany':
          break;

        case 'hasAndBelongsToMany':
          break;

        case 'tbd':
          break;
      }

      break;

    case 'UID':
      await page.getByRole('button', { name: 'UID Unique identifier' }).click();

      const { attachedField } = rest;

      await page.getByLabel('Attached field', { exact: true }).click();

      // TODO: this doesn't work, but I can't figure out why. Using `.getByLabel(attachedField)`
      // only does not work because there are several elements on the page that matches that
      // selector and therefore it must be scoped to the modal.
      await page.getByRole('option', { name: attachedField }).click();
      break;

    case 'Component': {
      await page
        .getByRole('button', { name: 'Component Group of fields that you can repeat or reuse' })
        .click();

      const { existingComponentName, existingComponentCategory, repeatable = false } = rest;

      if (existingComponentName) {
        // TODO: improve selector
        await page
          .locator('label')
          .filter({
            hasText:
              'Use an existing componentReuse a component already created to keep your data con',
          })
          .locator('div')
          .first()
          .click();

        await page.getByLabel('Select a component').click();
        // TODO: can we make this work using a filter without category?
        await page.getByLabel(`${existingComponentCategory} - ${existingComponentName}`).click();
      }

      if (!repeatable) {
        await page
          .locator('label')
          .filter({
            hasText:
              'Single componentBest for grouping fields like full address, main information, et',
          })
          .locator('div')
          .first()
          .click();
      }
      break;
    }

    case 'DynamicZone': {
      await page
        .getByRole('button', {
          name: 'Dynamic zone Dynamically pick component when editing content',
        })
        .click();
      await page.getByLabel('Name', { exact: true }).fill(name);
      await page.getByRole('button', { name: 'Add components to the zone' }).click();

      const { existingComponentName } = rest;

      if (existingComponentName) {
        await page
          .locator('label')
          .filter({
            hasText:
              'Use an existing componentReuse a component already created to keep your data con',
          })
          .locator('div')
          .first()
          .click();

        await page.getByLabel('Select the components').click();
        await page.getByLabel(existingComponentName).click();

        // Close the combobox
        await page.keyboard.press('Escape');
      }

      break;
    }
  }

  switch (type) {
    case 'Relation':
      // TODO: this should not be dependent on the id
      await page.locator('#name').fill(name);
      break;

    case 'DynamicZone':
      // do nothing, because the name is already filled out in a previous step
      break;

    default:
      await page.getByLabel('Name', { exact: true }).fill(name);
  }

  if (addMore) {
    // the selector needs to be scoped, because there are two buttons
    // using the label "Add another field"
    await page
      .getByLabel(contentTypeName, { exact: true })
      .getByRole('button', { name: 'Add another field' })
      .click();
  } else {
    await page.getByRole('button', { name: 'Finish' }).click();
  }
}

export async function verifyFieldPresence({ page, name }) {
  await expect(page.getByText(name, { exact: true })).toBeVisible();
}

export async function createContentType({ page, type, displayName }) {
  await page.getByRole('button', { name: `Create new ${type}` }).click();
  await page.getByLabel('Display name').fill(displayName);
  await page.getByRole('button', { name: 'Continue' }).click();

  return () => deleteContentType({ page, displayName });
}

export async function deleteContentType({ page, displayName }) {
  await page.getByRole('link', { name: displayName }).click();

  // The strapi update notifier alert might be displayed in front
  // of the edit button, which prevents the click from working
  if (await page.getByLabel('Close').isVisible()) {
    await page.getByLabel('Close').click();
  }

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();

  await waitForReload({ page });
}
