import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionBar from '~/components/listings/detail/ActionBar.vue'
import { ListingStatus } from '~/types/listing'

describe('ActionBar', () => {
  describe('view mode (default)', () => {
    it('should show view mode buttons by default', () => {
      const wrapper = mount(ActionBar, {
        props: { status: ListingStatus.ACTIVE },
      })

      expect(wrapper.text()).toContain('Modifica')
      expect(wrapper.text()).toContain('Duplica')
      expect(wrapper.text()).toContain('Elimina')
      expect(wrapper.text()).not.toContain('Salva')
      expect(wrapper.text()).not.toContain('Annulla')
    })

    it('should show Pubblica button for DRAFT status', () => {
      const wrapper = mount(ActionBar, {
        props: { status: ListingStatus.DRAFT },
      })

      expect(wrapper.text()).toContain('Pubblica')
    })

    it('should not show Pubblica button for ACTIVE status', () => {
      const wrapper = mount(ActionBar, {
        props: { status: ListingStatus.ACTIVE },
      })

      expect(wrapper.text()).not.toContain('Pubblica')
    })

    it('should disable Modifica button for SOLD status', () => {
      const wrapper = mount(ActionBar, {
        props: { status: ListingStatus.SOLD },
      })

      const editButton = wrapper.find('button')
      expect(editButton.attributes('disabled')).toBeDefined()
      expect(editButton.classes()).toContain('cursor-not-allowed')
    })

    it('should emit edit event when Modifica is clicked', async () => {
      const wrapper = mount(ActionBar, {
        props: { status: ListingStatus.ACTIVE },
      })

      await wrapper.findAll('button')[0].trigger('click')
      expect(wrapper.emitted('edit')).toBeTruthy()
    })

    it('should emit duplicate event when Duplica is clicked', async () => {
      const wrapper = mount(ActionBar, {
        props: { status: ListingStatus.ACTIVE },
      })

      const duplicateButton = wrapper.findAll('button').find((b) => b.text().includes('Duplica'))
      await duplicateButton?.trigger('click')
      expect(wrapper.emitted('duplicate')).toBeTruthy()
    })

    it('should emit delete event when Elimina is clicked', async () => {
      const wrapper = mount(ActionBar, {
        props: { status: ListingStatus.ACTIVE },
      })

      const deleteButton = wrapper.findAll('button').find((b) => b.text().includes('Elimina'))
      await deleteButton?.trigger('click')
      expect(wrapper.emitted('delete')).toBeTruthy()
    })
  })

  describe('edit mode', () => {
    it('should show edit mode buttons when isEditMode is true', () => {
      const wrapper = mount(ActionBar, {
        props: {
          status: ListingStatus.ACTIVE,
          isEditMode: true,
          hasChanges: false,
          isValid: true,
        },
      })

      expect(wrapper.text()).toContain('Salva')
      expect(wrapper.text()).toContain('Annulla')
      expect(wrapper.text()).not.toContain('Modifica')
      expect(wrapper.text()).not.toContain('Duplica')
      expect(wrapper.text()).not.toContain('Elimina')
    })

    it('should disable Salva button when hasChanges is false', () => {
      const wrapper = mount(ActionBar, {
        props: {
          status: ListingStatus.ACTIVE,
          isEditMode: true,
          hasChanges: false,
          isValid: true,
        },
      })

      const saveButton = wrapper.findAll('button').find((b) => b.text().includes('Salva'))
      expect(saveButton?.attributes('disabled')).toBeDefined()
      expect(saveButton?.classes()).toContain('cursor-not-allowed')
    })

    it('should disable Salva button when isValid is false', () => {
      const wrapper = mount(ActionBar, {
        props: {
          status: ListingStatus.ACTIVE,
          isEditMode: true,
          hasChanges: true,
          isValid: false,
        },
      })

      const saveButton = wrapper.findAll('button').find((b) => b.text().includes('Salva'))
      expect(saveButton?.attributes('disabled')).toBeDefined()
    })

    it('should enable Salva button when hasChanges and isValid are true', () => {
      const wrapper = mount(ActionBar, {
        props: {
          status: ListingStatus.ACTIVE,
          isEditMode: true,
          hasChanges: true,
          isValid: true,
        },
      })

      const saveButton = wrapper.findAll('button').find((b) => b.text().includes('Salva'))
      expect(saveButton?.attributes('disabled')).toBeUndefined()
      expect(saveButton?.classes()).toContain('bg-primary-600')
    })

    it('should show validation hint when hasChanges but not valid', () => {
      const wrapper = mount(ActionBar, {
        props: {
          status: ListingStatus.ACTIVE,
          isEditMode: true,
          hasChanges: true,
          isValid: false,
        },
      })

      expect(wrapper.text()).toContain('Correggi gli errori per salvare')
    })

    it('should not show validation hint when valid', () => {
      const wrapper = mount(ActionBar, {
        props: {
          status: ListingStatus.ACTIVE,
          isEditMode: true,
          hasChanges: true,
          isValid: true,
        },
      })

      expect(wrapper.text()).not.toContain('Correggi gli errori')
    })

    it('should emit save event when Salva is clicked', async () => {
      const wrapper = mount(ActionBar, {
        props: {
          status: ListingStatus.ACTIVE,
          isEditMode: true,
          hasChanges: true,
          isValid: true,
        },
      })

      const saveButton = wrapper.findAll('button').find((b) => b.text().includes('Salva'))
      await saveButton?.trigger('click')
      expect(wrapper.emitted('save')).toBeTruthy()
    })

    it('should not emit save event when disabled', async () => {
      const wrapper = mount(ActionBar, {
        props: {
          status: ListingStatus.ACTIVE,
          isEditMode: true,
          hasChanges: false,
          isValid: true,
        },
      })

      const saveButton = wrapper.findAll('button').find((b) => b.text().includes('Salva'))
      await saveButton?.trigger('click')
      expect(wrapper.emitted('save')).toBeFalsy()
    })

    it('should emit cancel event when Annulla is clicked', async () => {
      const wrapper = mount(ActionBar, {
        props: {
          status: ListingStatus.ACTIVE,
          isEditMode: true,
          hasChanges: false,
          isValid: true,
        },
      })

      const cancelButton = wrapper.findAll('button').find((b) => b.text().includes('Annulla'))
      await cancelButton?.trigger('click')
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })
})
