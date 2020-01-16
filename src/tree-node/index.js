import cn from 'classnames/bind'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'

import { getDataset, isEmpty } from '../utils'
import Actions from './actions'
import NodeLabel from './node-label'
import Toggle from './toggle'

import styles from './index.css'

const cx = cn.bind(styles)

const isLeaf = children => isEmpty(children)

const getNodeCx = props => {
  const {
    keepTreeOnSearch,
    keepChildrenOnSearch,
    _children,
    matchInChildren,
    matchInParent,
    disabled,
    partial,
    hide,
    className,
    showPartiallySelected,
    readOnly,
    checked,
    _focused: focused,
  } = props

  return cx(
    'node',
    {
      leaf: isLeaf(_children),
      tree: !isLeaf(_children),
      disabled,
      hide,
      'match-in-children': keepTreeOnSearch && matchInChildren,
      'match-in-parent': keepTreeOnSearch && keepChildrenOnSearch && matchInParent,
      partial: showPartiallySelected && partial,
      readOnly,
      checked,
      focused,
    },
    className
  )
}

class TreeNode extends PureComponent {
  static propTypes = {
    _id: PropTypes.string.isRequired,
    _depth: PropTypes.number,
    _children: PropTypes.array,
    actions: PropTypes.array,
    className: PropTypes.string,
    title: PropTypes.string,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    expanded: PropTypes.bool,
    disabled: PropTypes.bool,
    partial: PropTypes.bool,
    dataset: PropTypes.object,
    keepTreeOnSearch: PropTypes.bool,
    keepChildrenOnSearch: PropTypes.bool,
    searchModeOn: PropTypes.bool,
    onNodeToggle: PropTypes.func,
    onAction: PropTypes.func,
    onCheckboxChange: PropTypes.func,
    mode: PropTypes.oneOf(['multiSelect', 'simpleSelect', 'radioSelect', 'hierarchical']),
    showPartiallySelected: PropTypes.bool,
    readOnly: PropTypes.bool,
    clientId: PropTypes.string,
    not_selectable: PropTypes.bool,
    hint: PropTypes.string,
    nodeMode: PropTypes.oneOf(['radioSelect']),
    radioGroup: PropTypes.string,
    getNodeById: PropTypes.func,
    defaults: PropTypes.bool,
  }

  getAriaAttributes = () => {
    const { _children, _depth, checked, disabled, expanded, readOnly, mode, partial } = this.props
    const attributes = {}

    attributes.role = mode === 'simpleSelect' ? 'option' : 'treeitem'
    attributes['aria-disabled'] = disabled || readOnly
    attributes['aria-selected'] = checked
    if (mode !== 'simpleSelect') {
      attributes['aria-checked'] = partial ? 'mixed' : checked
      attributes['aria-level'] = (_depth || 0) + 1
      attributes['aria-expanded'] = _children && (expanded ? 'true' : 'false')
    }
    return attributes
  }
  componentDidMount() {
    const { getNodeById, _id, defaults } = this.props
    const currentNode = getNodeById(_id)
    const { _parent, checked_, not_selectable } = currentNode
    const selectable = !not_selectable
    // const siblings = _parent ? getNodeById(_parent)._children.filter(id => id !== _id) : null
    // if (not_selectable) {
    //   if (siblings && siblings.length === 0) {
    //     const elem = document.querySelector(`li#${_id}_li>i`)
    //     // if (elem && !expanded) elem.click()
    //     if (elem) elem.click()
    //   }
    // } else {
    //   const siblings_selected = siblings ? siblings.some(id => getNodeById(id).checked) : null
    //   if (selected_by_default && defaults && !siblings_selected) {
    //     console.log({ currentNode })
    //     const elem = document.querySelector(`input#${_id}:not(:checked)`)
    //     if (elem) elem.click()
    //   }
    // }
    // if(not_selectable){
    //   const elem = document.querySelector(`li#${_id}_li>i`)
    //    // if (elem && !expanded) elem.click()
    //   if (elem) elem.click()
    // }
    if (selectable) {
      if (defaults) {
        //not labeled
        const parent = _parent ? getNodeById(_parent) : null
        const _ancestor = parent ? parent._parent : null
        const ancestor = _ancestor ? getNodeById(_ancestor) : null
        if (ancestor) {
          if (ancestor.checked) {
            // If ancestor is checked and current is selected by default
            // select it
            if (currentNode.selected_by_default) {
              const elem = document.querySelector(`input#${_id}:not(:checked)`)
              if (elem) elem.click()
            }
          }
        } else if (currentNode.selected_by_default) {
          //If there is no ancestor that means we are the top level (think auto)
          //if selected_by default select it.
          const elem = document.querySelector(`input#${_id}:not(:checked)`)
          if (elem) elem.click()
        }
      } else {
        //labeled
        //// If it's labeled it should come already checked
        //If it's labeled we should only check the input if it's checked_ (that is from the db)
        // if (checked_) {
        //   const elem = document.querySelector(`input#${_id}:not(:checked)`)
        //   if (elem) elem.click()
        // }
      }
    }
  }
  render() {
    const {
      mode,
      keepTreeOnSearch,
      _id,
      _children,
      dataset,
      _depth,
      expanded,
      title,
      label,
      partial,
      checked,
      value,
      disabled,
      actions,
      onAction,
      searchModeOn,
      onNodeToggle,
      onCheckboxChange,
      showPartiallySelected,
      readOnly,
      clientId,
      not_selectable,
      hint,
      nodeMode,
      radioGroup,
      getNodeById,
    } = this.props
    const liCx = getNodeCx(this.props)
    const style = keepTreeOnSearch || !searchModeOn ? { paddingLeft: `${(_depth || 0) * 20}px` } : {}

    const liId = `${_id}_li`

    return (
      <li className={liCx} style={style} id={liId} {...getDataset(dataset)} {...this.getAriaAttributes()}>
        <Toggle
          isLeaf={isLeaf(_children)}
          expanded={expanded}
          id={_id}
          onNodeToggle={onNodeToggle}
          getNodeById={getNodeById}
          not_selectable={not_selectable}
        />
        <NodeLabel
          title={title}
          label={label}
          id={_id}
          partial={partial}
          checked={checked}
          value={value}
          disabled={disabled}
          mode={mode}
          onCheckboxChange={onCheckboxChange}
          showPartiallySelected={showPartiallySelected}
          readOnly={readOnly}
          clientId={clientId}
          not_selectable={not_selectable}
          hint={hint}
          nodeMode={nodeMode}
          radioGroup={radioGroup}
          getNodeById={getNodeById}
        />
        <Actions actions={actions} onAction={onAction} id={_id} readOnly={readOnly} />
      </li>
    )
  }
}

export default TreeNode
