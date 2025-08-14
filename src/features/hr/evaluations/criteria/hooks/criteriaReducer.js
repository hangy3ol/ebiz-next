import { v4 as uuidv4 } from 'uuid';

export const ACTION_TYPES = {
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
};

export const initialCriteriaState = {
  level1: [],
  level2: [],
  level3: [],
};

export function criteriaReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.INSERT: {
      // payload에서 level 타입('level1')과 아이템 데이터를 추출합니다.
      const { level: levelType, item: newItemData } = action.payload;

      const siblings = state[levelType].filter(
        (i) => i.parentId === newItemData.parentId,
      );
      const maxSortOrder = siblings.reduce(
        (max, i) => Math.max(max, Number(i.sortOrder) || 0),
        0,
      );

      // 새로 생성되는 아이템 객체
      const newItem = {
        ...newItemData,
        id: uuidv4(),
        action: 'insert',
        level: levelType.replace('level', ''), // ⭐️ 'level' 속성 추가
        sortOrder: newItemData.sortOrder
          ? Number(newItemData.sortOrder)
          : maxSortOrder + 1,
      };

      return {
        ...state,
        [levelType]: [...state[levelType], newItem],
      };
    }

    case ACTION_TYPES.UPDATE: {
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

    case ACTION_TYPES.DELETE: {
      const { level, item: itemToDelete } = action.payload;
      const newState = JSON.parse(JSON.stringify(state));

      let targetItem = newState[level].find((i) => i.id === itemToDelete.id);
      if (targetItem) {
        targetItem.action = 'delete';
      }

      if (level === 'level1') {
        const childrenLevel2 = newState.level2.filter(
          (l2) => l2.parentId === itemToDelete.id,
        );
        const childrenLevel2Ids = childrenLevel2.map((l2) => l2.id);

        childrenLevel2.forEach((l2) => (l2.action = 'delete'));
        newState.level3.forEach((l3) => {
          if (childrenLevel2Ids.includes(l3.parentId)) {
            l3.action = 'delete';
          }
        });
      } else if (level === 'level2') {
        newState.level3.forEach((l3) => {
          if (l3.parentId === itemToDelete.id) {
            l3.action = 'delete';
          }
        });
      }

      return newState;
    }

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}
