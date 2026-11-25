import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import App from './App.vue'
import { loadChart } from './chart/load'

const minimal = {
  people: [
    { rank: 1, name: 'Ada Fake', crossovers: 9 },
    { rank: 2, name: 'Bo Fake', crossovers: 7 },
    { rank: 3, name: 'Cy Fake', crossovers: 7 },
    { rank: 4, name: 'Dé Fake', crossovers: 2 },
  ],
}

describe('loadChart', () => {
  it('falls back to the sample when there is no real chart', () => {
    const { chart, isSample } = loadChart({})
    expect(isSample).toBe(true)
    expect(chart.people).toHaveLength(100)
  })

  it('accepts a real chart with only rank, name and crossovers', () => {
    const { chart, isSample } = loadChart({ real: minimal })
    expect(isSample).toBe(false)
    expect(chart.title).toBe('The Crossover 100')
  })

  it('rejects a person with no rank', () => {
    expect(() => loadChart({ real: { people: [{ name: 'No Rank', crossovers: 1 }] } })).toThrow()
  })
})

describe('App', () => {
  it('shows the sample banner and all 100 in the list', () => {
    const wrapper = mount(App, { props: { data: loadChart({}) } })
    expect(wrapper.text()).toContain('Sample data')
    expect(wrapper.findAll('.list > li')).toHaveLength(100)
  })

  it('renders the real chart with the fame chart', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).not.toContain('Sample data')
    expect(wrapper.text()).toContain('Fame isn')
  })

  it('opens a card from a list row, steps through it and closes it', async () => {
    const wrapper = mount(App, { props: { data: loadChart({ real: minimal }) }, attachTo: document.body })
    expect(wrapper.text()).not.toContain('Sample data')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    await wrapper.findAll('.list .head')[3]!.trigger('click')
    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.text()).toContain('Dé Fake')
    expect(dialog.text()).toContain('No crossovers yet')
    await wrapper.find('button[aria-label="Next person"]').trigger('click')
    expect(wrapper.find('[role="dialog"] h3').text()).toBe('Ada Fake')
    await wrapper.find('button[aria-label="Close card"]').trigger('click')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('opens a card from a dot on the fame chart', async () => {
    const wrapper = mount(App, { attachTo: document.body })
    await wrapper.find('.fame .hit').trigger('click')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('searches names, ignoring accents, and keeps the original rank', async () => {
    const wrapper = mount(App, { props: { data: loadChart({ real: minimal }) } })
    await wrapper.find('#search').setValue('de fake')
    const rows = wrapper.findAll('.list > li')
    expect(rows).toHaveLength(1)
    expect(rows[0]!.find('.rank').text()).toBe('4')
  })

})
