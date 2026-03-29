import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mounts renders properly', () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['RouterView', 'RouterLink'],
      },
    })
    expect(wrapper.find('.msa-app').exists()).toBe(true)
  })
})
