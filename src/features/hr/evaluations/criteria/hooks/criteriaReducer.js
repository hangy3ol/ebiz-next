import { v4 as uuidv4 } from 'uuid';

export const ACTION_TYPES = {
  KEEP: 'KEEP',
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  REPLACE_ALL: 'REPLACE_ALL',
};

export const initialCriteriaState = {
  level1: [],
  level2: [],
  level3: [],
};

export function criteriaReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.KEEP: {
      return action.payload;
    }

    case ACTION_TYPES.INSERT: {
      const { level: levelType, item: newItemData } = action.payload;
      const siblings = state[levelType].filter(
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
        level: levelType.replace('level', ''),
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
                ...item,
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

    case ACTION_TYPES.REPLACE_ALL: {
      const copiedData = action.payload; // 기존 데이터에 'delete' 액션 부여

      const deletedItems = {
        level1: state.level1.map((item) => ({ ...item, action: 'delete' })),
        level2: state.level2.map((item) => ({ ...item, action: 'delete' })),
        level3: state.level3.map((item) => ({ ...item, action: 'delete' })),
      }; // 복사된 데이터에 'insert' 액션 및 새로운 UUID 부여

      const idMap = new Map();
      const newLevel1 = copiedData.level1.map((item) => {
        const newId = uuidv4();
        idMap.set(item.id, newId);
        return { ...item, id: newId, action: 'insert' };
      });

      const newLevel2 = copiedData.level2.map((item) => {
        const newId = uuidv4();
        idMap.set(item.id, newId);
        return {
          ...item,
          id: newId,
          parentId: idMap.get(item.parentId) || item.parentId,
          action: 'insert',
        };
      });

      const newLevel3 = copiedData.level3.map((item) => {
        const newId = uuidv4();
        return {
          ...item,
          id: newId,
          parentId: idMap.get(item.parentId) || item.parentId,
          action: 'insert',
        };
      });

      return {
        level1: [...deletedItems.level1, ...newLevel1],
        level2: [...deletedItems.level2, ...newLevel2],
        level3: [...deletedItems.level3, ...newLevel3],
      };
    }

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}
