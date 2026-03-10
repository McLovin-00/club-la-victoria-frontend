import type { Page } from "@playwright/test";

export const seleccionarEnCombo = async (
  page: Page,
  label: string,
  opcion: string,
): Promise<void> => {
  const trigger = page
    .locator(`label:has-text("${label}")`)
    .first()
    .locator("xpath=..")
    .locator("button")
    .first();

  await trigger.click();
  await page.getByRole("option", { name: opcion }).first().click();
};
