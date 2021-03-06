import Immutable from 'immutable'
import BaseAction from './BaseAction'
import { isPromise } from '../utils/is'

/**
 * Class representing a update action.
 * @extends BaseAction
 */
export class Update extends BaseAction {
  /**
   * Create an instance of the update action.
   * @param {Object} config - The configuration for the action.
   */
  constructor(config) {
    super('update', config)
  }

  /**
   * Generate an action creator with the provided data.
   * @param {Object} record - item being updated.
   *
   * @returns {Function} - Returns the update action thunk.
   */
  do = (record) => {

    // Make sure record is an immutable map
    record = Immutable.Iterable.isIterable(record) ? record : Immutable.fromJS(record)

    return dispatch => {

      // Create data object to be dispatched with actions
      const { uidField, updater } = this.config
      const isAsync = typeof updater === 'function'
      const data = { record, uidField, isAsync }

      // Call BaseAction.start with dispatch and the action data
      this.start(dispatch, data)

      // If config.updater is provided, call it
      if (isAsync) {
        // Prepare BaseAction.success and BaseAction.error handlers
        // by currying with dispatch
        const success = this.success.bind(this, dispatch, data)
        const error = this.error.bind(this, dispatch, data)

        // Call updater
        const updaterAction = updater(record, success, error)

        // Return the action promise
        return isPromise(updaterAction) ? updaterAction : updaterAction(dispatch)
      }
    }
  }
}
