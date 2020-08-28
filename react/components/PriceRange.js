import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { useRuntime } from 'vtex.render-runtime'
import { injectIntl, intlShape } from 'react-intl'
import { Slider, InputCurrency } from 'vtex.styleguide'
import { formatCurrency } from 'vtex.format-currency'

import { facetOptionShape } from '../constants/propTypes'
import { getFilterTitle } from '../constants/SearchHelpers'
import FilterOptionTemplate from './FilterOptionTemplate'
import useSearchState from '../hooks/useSearchState'

const DEBOUNCE_TIME = 500 // ms

/** Price range slider component */
const PriceRange = ({ title, facets, intl, priceRange }) => {
  const { culture, setQuery } = useRuntime()

  const navigateTimeoutId = useRef()

  const { fuzzy, operator, searchState } = useSearchState()

  const handleChange = ([left, right]) => {
    if (navigateTimeoutId.current) {
      clearTimeout(navigateTimeoutId.current)
    }

    navigateTimeoutId.current = setTimeout(() => {
      setQuery({
        priceRange: `${left} TO ${right}`,
        page: undefined,
        fuzzy: fuzzy || undefined,
        operator: operator || undefined,
        searchState: searchState || undefined,
      })
    }, DEBOUNCE_TIME)
  }

  const slugRegex = /^de-(.*)-a-(.*)$/
  const availableOptions = facets.filter(({ slug }) => slugRegex.test(slug))

  if (!availableOptions.length) {
    return null
  }

  let minValue = Number.MAX_VALUE
  let maxValue = Number.MIN_VALUE

  availableOptions.forEach(({ slug }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, minSlug, maxSlug] = slug.match(slugRegex)

    const min = parseInt(minSlug)
    const max = parseInt(maxSlug)

    if (min < minValue) {
      minValue = min
    }
    if (max > maxValue) {
      maxValue = max
    }
  })

  const defaultValues = [minValue, maxValue]
  const currentValuesRegex = /^(.*) TO (.*)$/

  if (priceRange && currentValuesRegex.test(priceRange)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, currentMin, currentMax] = priceRange.match(currentValuesRegex)

    defaultValues[0] = parseInt(currentMin)
    defaultValues[1] = parseInt(currentMax)
  }

  const currencyValueRegex = /[^0-9.-]+/g

  const handleBlur = e => {
    const { name, value } = e.target

    const inputValue = Math.floor(Number(value.replace(currencyValueRegex, '')))

    if (
      (name === 'min' && inputValue === defaultValues[0]) ||
      (name === 'max' && inputValue === defaultValues[1])
    ) {
      return
    }

    console.log(minValue, maxValue)

    const definedValues =
      name === 'min'
        ? [inputValue < minValue ? minValue : inputValue, defaultValues[1]]
        : [defaultValues[0], inputValue > maxValue ? maxValue : inputValue]

    // const definedValues =
    //   name === 'min'
    //     ? [inputValue, defaultValues[1]]
    //     : [defaultValues[0], inputValue]

    handleChange(definedValues)
  }

  return (
    <FilterOptionTemplate
      id="priceRange"
      title={getFilterTitle(title, intl)}
      collapsable={false}
    >
      <div className="flex justify-between">
        <div className="w-40">
          <InputCurrency
            name="min"
            size="small"
            currencyCode={culture.currency}
            locale={culture.locale}
            value={defaultValues[0]}
            onBlur={handleBlur}
          />
        </div>
        <div className="w-40">
          <InputCurrency
            name="max"
            size="small"
            currencyCode={culture.currency}
            locale={culture.locale}
            value={defaultValues[1]}
            onBlur={handleBlur}
          />
        </div>
      </div>
      <Slider
        min={minValue}
        max={maxValue}
        onChange={handleChange}
        defaultValues={defaultValues}
        formatValue={value => formatCurrency({ intl, culture, value })}
        range
      />
    </FilterOptionTemplate>
  )
}

PriceRange.propTypes = {
  /** Filter title */
  title: PropTypes.string.isRequired,
  /** Available price ranges */
  facets: PropTypes.arrayOf(facetOptionShape).isRequired,
  /** Intl instance */
  intl: intlShape.isRequired,
  /** Current price range filter query parameter*/
  priceRange: PropTypes.string,
}

export default injectIntl(PriceRange)
