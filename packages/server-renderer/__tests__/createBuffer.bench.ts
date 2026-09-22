import { describe, test } from 'vite-plus/test'

import { createBuffer as _createBuffer } from '../src/render'

// move to local const to avoid import access overhead
// https://github.com/vitest-dev/vitest/issues/6903
const createBuffer = _createBuffer

function benchmark(
  name: string,
  run: () => unknown,
  options?: { setup?: () => void },
) {
  test(name, async ({ bench }) => {
    await bench(name, () => {
      options?.setup?.()
      return run()
    }).run()
  })
}

describe('createBuffer', () => {
  let stringBuffer = createBuffer()

  benchmark(
    'string only',
    () => {
      for (let i = 0; i < 10; i += 1) {
        stringBuffer.push('hello')
      }
    },
    {
      setup() {
        stringBuffer = createBuffer()
      },
    },
  )

  let stringNestedBuffer = createBuffer()

  benchmark(
    'string with nested',
    () => {
      for (let i = 0; i < 10; i += 1) {
        if (i % 3 === 0) {
          stringNestedBuffer.push('hello')
        } else {
          const buffer = createBuffer()
          buffer.push('hello')
          stringNestedBuffer.push(buffer.getBuffer())
        }
      }
    },
    {
      setup() {
        stringNestedBuffer = createBuffer()
      },
    },
  )

  benchmark(
    'string with nested async',
    () => {
      for (let i = 0; i < 10; i += 1) {
        if (i % 3 === 0) {
          const buffer = createBuffer()
          buffer.push('hello')
          stringNestedBuffer.push(Promise.resolve(buffer.getBuffer()))
        } else {
          const buffer = createBuffer()
          buffer.push('hello')
          stringNestedBuffer.push(buffer.getBuffer())
        }
      }
    },
    {
      setup() {
        stringNestedBuffer = createBuffer()
      },
    },
  )
})
