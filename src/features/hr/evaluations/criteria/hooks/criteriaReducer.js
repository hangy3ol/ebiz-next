import { v4 as uuidv4 } from 'uuid';

/**
 * Action 타입을 상수로 관리하여 휴먼 에러를 방지합니다.
 */
export const ACTION_TYPES = {
  ADD_CRITERIA: 'ADD_CRITERIA',
  UPDATE_CRITERIA: 'UPDATE_CRITERIA', // 수정 액션 타입
  // DELETE_CRITERIA: 'DELETE_CRITERIA', // 추후 확장용
};

/**
 * detail 상태의 초기값입니다.
 */
export const initialCriteriaState = {
  level1: [],
  level2: [],
  level3: [],
};

/**
 * `dispatch`를 통해 호출될 때 상태 변경을 실제로 수행하는 함수입니다.
 * @param {object} state - 현재 상태 (initialCriteriaState 형태)
 * @param {object} action - 상태 변경을 위한 명령 객체 { type, payload }
 * @returns {object} - 변경된 새로운 상태
 */
export function criteriaReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.ADD_CRITERIA: {
      const { level, item: newItemData } = action.payload;

      const siblings = state[level].filter(
        (i) => i.parentId === newItemData.parentId,
      );
      const maxSortOrder = siblings.reduce(
        (max, i) => Math.max(max, Number(i.sortOrder) || 0),
        0,
      );

      const newItem = {
        ...newItemData,
        id: uuidv4(),
        action: 'insert',
        sortOrder: newItemData.sortOrder
          ? Number(newItemData.sortOrder)
          : maxSortOrder + 1,
      };

      return {
        ...state,
        [level]: [...state[level], newItem],
      };
    }

    case ACTION_TYPES.UPDATE_CRITERIA: {
      const { level, item: updatedItem } = action.payload;

      return {
        ...state,
        [level]: state[level].map((item) =>
          item.id === updatedItem.id
            ? {
                ...updatedItem,
                action: item.action === 'insert' ? 'insert' : 'update',
              }
            : item,
        ),
      };
    }

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}
