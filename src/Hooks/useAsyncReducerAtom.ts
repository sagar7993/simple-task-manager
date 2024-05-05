import { useMemo } from 'react';
import { useReducerAtom } from 'jotai/utils';
import { PrimitiveAtom } from 'jotai';

function useAsyncDispatch<Value, Action>(dispatch: (action?: Action) => void) {
	return async (action: Action) => {
		if (typeof action === 'function') {
			return Promise.resolve<Value>(action(dispatch));
		}
		return dispatch(action) as unknown as Promise<Value>;
	};
}

export function useAsyncReducerAtom<Value, Action>(atom: PrimitiveAtom<Value>, reducer: (prev: Value, action?: Action) => Promise<Value>) {
	const [state, dispatch] = useReducerAtom<Value, Action>(atom, reducer as unknown as (prev: Value, action?: Action) => Value);
	const asyncDispatch = useMemo(() => useAsyncDispatch<Value, Action>(dispatch), [dispatch]);
	return { state, dispatch: asyncDispatch };
};
