import PropTypes from 'prop-types'
import { concat, keys, map, reduce } from 'ramda'
import React, { Component } from 'react'
import { Collapse } from 'react-collapse'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'render'
import { Checkbox } from 'vtex.styleguide'

import VTEXClasses from '../constants/CSSClasses'
import ArrowDown from '../images/arrow-down.svg'
import ArrowUp from '../images/arrow-up.svg'

/**
 * Search Filter Component.
 */
class SelectedFilters extends Component {
  static contextTypes = {
    intl: PropTypes.object.isRequired,
  }

  static propTypes = {
    /** If the filter is collapsed or not. */
    opened: PropTypes.bool,
    /** Selected filters. */
    selecteds: PropTypes.shape({
      Departments: PropTypes.arrayOf(PropTypes.string),
      Brands: PropTypes.arrayOf(PropTypes.string),
      SpecificationFilters: PropTypes.arrayOf(PropTypes.string),
      FullText: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    getLinkProps: PropTypes.func,
  }

  static defaultProps = {
    opened: true,
    selecteds: [],
  }

  constructor(props) {
    super(props)
    this.state = {
      opened: props.opened,
    }
  }

  getSelectedFilters() {
    const selecteds = this.props.selecteds
    return reduce(
      (accumulator, filterName) =>
        concat(
          accumulator,
          map(term => {
            return { key: `${filterName}:${term}`, value: term }
          }, selecteds[filterName])
        ),
      [],
      keys(selecteds)
    )
  }

  render() {
    const { opened } = this.state
    const selectedFilters = this.getSelectedFilters()

    return (
      <div
        className={`${
          VTEXClasses.SEARCH_FILTER_MAIN_CLASS
        } ph4 pt4 pb2 bb b--light-gray`}>
        <div
          className="pointer mb4"
          onClick={() => {
            this.setState({ opened: !opened })
          }}>
          <div className="f4">
            <FormattedMessage id="search.selected-filters" />
            <span className={`${VTEXClasses.SEARCH_FILTER_HEADER_ICON} fr`}>
              <img src={opened ? ArrowUp : ArrowDown} width={20} />
            </span>
          </div>
        </div>

        <Collapse
          isOpened={opened}
          style={{ overflowY: 'auto', maxHeight: '200px' }}>
          <div className="w-90 db">
            {selectedFilters.map(selected => {
              const pagesArgs = this.props.getLinkProps({
                opt: { Name: selected.value },
                isSelected: true,
              })
              return (
                <Link
                  key={selected.key}
                  className="w-100 flex clear-link"
                  page={pagesArgs.page}
                  params={pagesArgs.params}
                  query={pagesArgs.queryString}>
                  <Checkbox
                    checked
                    label={selected.value}
                    name="default-checkbox-group"
                    value=""
                    onChange={evt => {
                      evt.preventDefault()
                    }}
                  />
                </Link>
              )
            })}
          </div>
        </Collapse>
      </div>
    )
  }
}

export default injectIntl(SelectedFilters)