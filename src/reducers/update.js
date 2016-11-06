import { Map } from 'immutable'

/**
 * The start action for the update reducer
 * @param  {Immutable.Map} state - current reducer state
 * @param  {Object} action - action object
 *
 * @return {Immutable.Map} - updated state
 */
export const start = (state, action) => {

  const uid = action.record.get(action.uidField)

  // Create updated record tuple
  // We have to create a tuple here in order to preserve the Integer typed keys
  const updatedRecord = Map([[uid, action.record]])

  // Create tuple for previous version of the item
  const previousRecord = Map([[uid, state.getIn(['raw', uid])]])

  return state.withMutations(map => {
    // Optimistically update the record
    map.set('raw', state.get('raw').merge(updatedRecord))

    // Save previous version in case the update fails
    map.set('pendingUpdate', state.get('pendingUpdate').merge(previousRecord))
  })
}

/**
 * The success action for the update reducer
 * @param  {Immutable.Map} state - current reducer state
 * @param  {Object} action - action object
 *
 * @return {Immutable.Map} - updated state
 */
 export const success = (state, action) => {

   const uid = action.record.get(action.uidField)

   // Remove the item pending update
   return state.deleteIn(['pendingUpdate', uid])
 }

/**
 * The error action for the update reducer
 * Reverts store change on failure
 * @param  {Immutable.Map} state - current reducer state
 * @param  {Object} action - action object
 *
 * @return {Immutable.Map} - updated state
 */
export const error = (state, action) => {

  const uid = action.record.get(action.uidField)

  // Create reverted record tuple
  // We have to create a tuple here in order to preserve the Integer typped keys
  const updatedRecord = Map([[uid, state.getIn(['pendingUpdate', uid])]])
  return state.set('raw', state.get('raw').merge(updatedRecord))
}

export default {
  start,
  success,
  error
}
