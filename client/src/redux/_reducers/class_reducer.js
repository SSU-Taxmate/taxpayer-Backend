import{
    SELECT_CLASS
} from '../_actions/ActionTypes'

export default function classInfo(state={},action){
    //console.log('_reducers/class_reducer/classInfo',state,action)
    switch (action.type) {
        case SELECT_CLASS:
            return {...state, classData:action.payload} /*class의 Data가 모두 들어있음 */
        default:
            return state;
    }
}