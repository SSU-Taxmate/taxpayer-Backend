import { MenuOpenReducer } from './MenuOpenReducer';
import { combineReducers } from 'redux';
import user from './user_reducer';
import registerUser from './user_reducer';

export const Reducers = combineReducers({
    user,
    registerUser,
  menuState: MenuOpenReducer
});
