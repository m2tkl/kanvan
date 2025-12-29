import { expect, test } from '@playwright/test'

test('drag start + immediate drop keeps card and clears skeleton', async ({ page }) => {
  await page.goto('/')

  const card = page.locator('li', { hasText: 'Design drag-and-drop flow' })
  await expect(card).toBeVisible()

  await page.evaluate(() => {
    const card = Array.from(document.querySelectorAll('li')).find((element) =>
      element.textContent?.includes('Design drag-and-drop flow'),
    )
    const list = document.querySelector('.kanban-column__list')
    const target = list?.querySelectorAll('li')[1]
    if (!card || !list || !target) {
      throw new Error('Card not found')
    }
    const rect = target.getBoundingClientRect()
    const dataTransfer = new DataTransfer()
    card.dispatchEvent(
      new DragEvent('dragstart', { dataTransfer, bubbles: true, clientY: rect.top + 4 }),
    )
    list.dispatchEvent(
      new DragEvent('dragover', { dataTransfer, bubbles: true, clientY: rect.top + 8 }),
    )
  })

  await page.waitForFunction(
    () => document.querySelectorAll('.kanban-card--placeholder').length === 1,
    null,
    { timeout: 5000 },
  )

  await page.evaluate(() => {
    const list = document.querySelector('.kanban-column__list')
    const target = list?.querySelectorAll('li')[1]
    if (!list || !target) {
      throw new Error('Card not found')
    }
    const rect = target.getBoundingClientRect()
    const dataTransfer = new DataTransfer()
    list.dispatchEvent(
      new DragEvent('drop', { dataTransfer, bubbles: true, clientY: rect.top + 8 }),
    )
    list.dispatchEvent(new DragEvent('dragend', { dataTransfer, bubbles: true }))
  })

  await expect(card).toBeVisible()
  await page.waitForFunction(
    () => document.querySelectorAll('.kanban-card--placeholder').length === 0,
    null,
    { timeout: 5000 },
  )

  const backlogCards = page.locator('.kanban-column:has-text("Backlog") .kanban-card')
  await expect(backlogCards).toHaveCount(2)
})

test('dragging with the native API reorders cards', async ({ page }) => {
  await page.goto('/')

  const source = page.locator('li', { hasText: 'Design drag-and-drop flow' })
  const target = page.locator('li', { hasText: 'Card editing UI' })
  await expect(source).toBeVisible()
  await expect(target).toBeVisible()

  const targetBox = await target.boundingBox()
  if (!targetBox) {
    throw new Error('Target box not found')
  }

  await source.dragTo(target, {
    targetPosition: { x: targetBox.width / 2, y: targetBox.height * 0.8 },
  })

  const backlogTitles = page.locator(
    '.kanban-column:has-text("Backlog") .kanban-card__title',
  )
  await expect(backlogTitles).toHaveText(['Card editing UI', 'Design drag-and-drop flow'])
})
