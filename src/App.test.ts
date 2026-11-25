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
  it('shows the sample banner, the podium and everyone else in the list', () => {
    const wrapper = mount(App, { props: { data: loadChart({}) } })
    expect(wrapper.text()).toContain('Sample data')
    expect(wrapper.findAll('.podium > li')).toHaveLength(3)
    expect(wrapper.findAll('.list > li')).toHaveLength(97)
  })

  it('renders a minimal chart and opens a row with no sections', async () => {
    const wrapper = mount(App, { props: { data: loadChart({ real: minimal }) } })
    expect(wrapper.text()).not.toContain('Sample data')
    await wrapper.find('.list .head').trigger('click')
    expect(wrapper.text()).toContain('No crossovers yet')
  })

  it('searches names, ignoring accents, and keeps the original rank', async () => {
    const wrapper = mount(App, { props: { data: loadChart({ real: minimal }) } })
    await wrapper.find('input').setValue('de fake')
    const rows = wrapper.findAll('.list > li')
    expect(rows).toHaveLength(1)
    expect(rows[0]!.find('.rank').text()).toBe('4')
  })
})
