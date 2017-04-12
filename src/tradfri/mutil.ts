'use strict'

export module mutil {
  export function scale(range, value) {
    let oldRange = (range.fromMax - 0)
    let newRange = (range.toMax - 0)
    return Math.round((value * newRange) / oldRange)
  }
}
