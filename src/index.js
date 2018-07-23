import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames2';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


import utils from './utils';

import './style.css';

// fake data generator
const getItems = (count, offset = 0) => {
  return Array.from({ length: count }, (v, k) => k).map(k => {
    return {
      key: `item-${k + offset}`,
      text: `item ${k + offset}`
    };
  });
};

class App extends Component {
  state = {
    choice: getItems(5),
    selection: getItems(3, 5)
  }
  /**
 * @property {string} draggedFrom
 * Tracks the where a drag starts for conditionalized behaviors/styles.
 */
  draggedFrom = null;

  /**
   * Renders Sortable html for testing mode.
   *
   * @returns {JSX} - The rendered html.
   */
  render() {
    // Rendered content.
    return (
      <DragDropContext
        onDragEnd={(result) => {
          this.handleDragEnd(result);
        }}
        onDragStart={(initial) => {
          const draggedFrom = initial.source.droppableId.split(':')[1];
          this.handleDragStart(initial, draggedFrom);
        }}
      >
        <div className="matching-component sortable-component -testing">
          {this.getResponsesList()}
          {this.getChoicesList()}
        </div>
      </DragDropContext>
    );
  }

  /**
   * Returns a draggable item.
   *
   * @see https://github.com/atlassian/react-beautiful-dnd#draggable
   * @param {Object} item - The choice object containing text and uuid.
   * @param {string} uniqueKey - Completely unique identifier for this item.
   * @param {number} index - The item's position within the containing list.
   * @returns {JSX} - The JSX.
   */
  getChoiceItem(item, uniqueKey, index) {
    // Note: Using key for Draggable interferes with react-dnd-beautiful
    return (
      <div className="match-row">
        {this.getMatchPromptSection()}
        {this.getDraggable(item, uniqueKey, index)}
      </div>
    );
  }

  getDraggable(item, uniqueKey, index) {
    return (
      <div className="dropHolder">
        <Draggable
          key={uniqueKey}
          draggableId={uniqueKey}
          index={index}
          isDragDisabled={!item}
        >
          {(draggable, state) => {
            return (
              <div
                className={classNames({
                  '-dragging': state.isDragging,
                  '-placeholder': !item,
                  'choice-item-wrapper': true,
                })}
                id={uniqueKey}
                ref={draggable.innerRef}
                {...draggable.draggableProps}
                {...draggable.dragHandleProps}
              >
                <span className='choice-item'>
                    {item && item.text}
                </span>
                {draggable.placeholder}
              </div>

            );
          }}
        </Draggable>
      </div>
    )
  }

  getMatchPromptSection() {
    return (
      <div className="match-prompt" >
        <div className="match-prompt-label">
          Just some info
        </div>
      </div>
    )
  }
  /**
   * Creates the responses list.
   *
   * @see https://github.com/atlassian/react-beautiful-dnd#droppable
   * @returns {JSX} - The JSX.
   */
  getResponsesList() {
    // const choices = this.state.choice;
    const response = this.state.selection;
    const max_length = 4;

    // Add placeholders any missing responses

    const missingCount = max_length - response.length;
    const responseKeys = missingCount > 0
      ? response.map(x => x.key).concat(Array(missingCount).fill(null))
      : response.map(x => x.key);

    return (
      <Droppable
        droppableId={`matchable:responses`}
      >
        {(droppable, state) => {
          let placeholdersCount = 0;

          return (
            <div
              className={classNames({
                '-draggingChoice': this.draggedFrom === 'choices',
                '-draggingOver': state.isDraggingOver,
                '-draggingResponse': this.draggedFrom === 'responses',
                'responses-container': true
              })}
              ref={droppable.innerRef}
            >
              <div className="match-list">
                {responseKeys
                  .map((responseKey, index) => {
                    const item = response.find(el => el.key === responseKey);
                    const key = item
                      ? `choices:${responseKey}`
                      : `placeholders:emptyResponse:${placeholdersCount++}`

                    return this.getChoiceItem(item, key, index);
                  })
                }
              </div>
              {this.draggedFrom !== 'choices' && droppable.placeholder}
            </div>
          );
        }}
      </Droppable>
    );
  }

  /**
   * Creates the choices list.
   *
   * @see https://github.com/atlassian/react-beautiful-dnd#droppable
   * @returns {JSX} - The JSX.
   */
  getChoicesList() {
    const choices = this.state.choice;
    const random = false;

    const choiceItems = random
      ? utils.shuffle(choices, this.props.seed || this.props.uuid)
      : choices;

    const response = this.state.selection;

    return (
      <Droppable
        droppableId={`matchable:choices`}
      >
        {(droppable, state) => {
          return (
            <div
              className={classNames({
                '-draggingChoice': this.draggedFrom === 'choices',
                '-draggingOver': state.isDraggingOver,
                '-draggingResponse': this.draggedFrom === 'responses',
                'choices-container': true,
              })}
              ref={droppable.innerRef}
            >
              <div>
                {() => {
                  const choiceOptions = this.getChoiceOptions(choiceItems,response);
                  return this.getDraggable(choiceOptions.item, choiceOptions.key, choiceOptions.index);
                }
              }
        {/*    )}*/}
              </div>
            </div>
          );
        }}
      </Droppable>
    );
  }


  getChoiceOptions(choiceItems,response) {
   choiceItems.map((choice, index) => {
      const choiceUsed = response.find(utils.propEq('key')(choice.key));
      const item = !choiceUsed && choice;
      const key = choiceUsed
        ? `placeholders:${choice.key}`
        : `choices:${choice.key}`;
     return {
      item , key, index
     };
  });
}

  /**
   * Called after dragging ends.
   *
   * @see https://github.com/atlassian/react-beautiful-dnd#result-dropresult
   * @param {Dropresult} result - DropResult props.
   * @returns {void} - Void.
   */
  handleDragEnd(result) {
    // If no destination, drag was cancelled
    if (result.destination) {
      this.updateResponse(result);
    }

    // Reset draggedFrom
    this.draggedFrom = null;
    // this.forceUpdate();
  }

  /**
   * Called when dragging starts.
   *
   * @see https://github.com/atlassian/react-beautiful-dnd#initial-dragstart
   * @param {DragStart} initial - DragStart props.
   * @param {string} draggedFrom - Source region, e.g. "responses" or "choices".
   * @returns {void} - Void.
   */
  handleDragStart(initial, draggedFrom) {
    // Set draggedFrom to trigger conditionalized drops/styling
    this.draggedFrom = draggedFrom;
    this.forceUpdate();
  }

  handleDragUpdate() {
    Array.from(document.querySelectorAll('.matching-component .choice-item'))
      .forEach((item) => {
        // eslint-disable-next-line no-param-reassign
        item.style.transform = '';
      });

    this.forceUpdate();
  }


  /**
   * Updates the response based on DropResult.
   *
   * @see https://github.com/atlassian/react-beautiful-dnd#result-dropresult
   * @param {Dropresult} result - DropResult props.
   * @returns {void} - Void.
   */
  updateResponse(result) {
    const selected = this.state.selection;
    const choices = this.state.choice;

    // Format of draggableId: {type}:{uuid}:{?increment}
    // eslint-disable-next-line prefer-destructuring
    const responseKey = result.draggableId.split(':')[1];

    if (this.draggedFrom === 'choices') {
      if (result.source.droppableId === result.destination.droppableId
        || selected.length >= this.max_length
      ) {
        // Can't reorder choices
        return;
      }

      // Prevent new placeholder being made when dropped at end of list
      // const dropIndex = Math.min(result.destination.index, responseLength - 1);

      // Adding response - replace key at destination
      const moveToSelected = choices.find(el => el.key === responseKey);
      const moveToChoices = selected[result.destination.index];

      selected.splice(result.destination.index, 1, moveToSelected);
      if (moveToChoices) {
        choices.splice(result.source.index, 1, moveToChoices);
      } else {
        choices.splice(result.source.index, 1);
      }
    } else if (this.draggedFrom === 'responses') {
      // Reorder within the same list.
      if (result.source.droppableId === result.destination.droppableId) {
        // selected.splice(result.source.index, 1);
        // selected.splice(result.destination.index, 0, responseKey);
        return;
      } else {
        return;
        // Removing response - delete key at source
        // selected[result.source.index] = null;
        // selected.splice(result.source.index, 1)
      }
    }
    this.setState({ choice: choices, selection: selected })
  }
}

// Put the things into the DOM!
ReactDOM.render(<App/>, document.getElementById('root'));
