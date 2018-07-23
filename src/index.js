import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames2';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import utils from './utils';

import './style.css';

class App extends Component {
  state = {
    choices: this.getItems(5, 0, 0),
    responses: this.getItems(3, 5, 1)
  }
  draggedFrom = null;

  render() {
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

  getItems(count, offset, noOfPlaceholders) {
    let items =  Array.from({ length: count }, (v, k) => k).map(k => {
      return {
        key: `choices:${k + offset}`,
        text: `item ${k + offset}`
      };
    });

    for (let i = 0; i < noOfPlaceholders; i++) {
      items.push( {
        key: `placeholders:${i}`,
        text: `placeholder ${i}`
      });
    } 
  return items;
 }

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
    let isPlaceHolder = item.key.includes('placeholders');
    return (
      <div className="dropHolder">
        <Draggable
          key={uniqueKey}
          draggableId={uniqueKey}
          index={index}
          isDragDisabled={isPlaceHolder}
        >
          {(draggable, state) => {
            return (
              <div
                className={classNames({
                  '-dragging': state.isDragging,
                  '-placeholder': isPlaceHolder,
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
    return (
      <Droppable
        droppableId={`matchable:responses`}
      >
        {(droppable, state) => {
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
                {this.state.responses
                  .map((response, index) => {
                    return this.getChoiceItem(response, response.key, index);
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

  getChoicesList() {
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
                { 
                  this.state.choices
                  .map((choice, index) => {
                    return this.getDraggable(choice, choice.key, index);
                  })}
              </div>
            </div>
          );
        }}
      </Droppable>
    );
  }

  handleDragEnd(result) {
    if (result.destination) {
      this.updateResponse(result);
    }
    this.draggedFrom = null;
    this.forceUpdate();
  }

  handleDragStart(initial, draggedFrom) {
    this.draggedFrom = draggedFrom;
    this.forceUpdate();
  }

  updateResponse(result) {
    const responses = this.state.responses;
    const choices = this.state.choices;
    const responseKey = result.draggableId.split(':')[1];
    const droppedAt = result.destination.droppableId.split(':')[1];

    this.state[this.draggedFrom].splice(result.source.index, 1);
    this.state[droppedAt].splice(result.destination.index, 0, {key: `choices:${responseKey}`, text: `item ${responseKey}`});
    this.setState({ choices, responses });
  }
}

// Put the things into the DOM!
ReactDOM.render(<App/>, document.getElementById('root'));
