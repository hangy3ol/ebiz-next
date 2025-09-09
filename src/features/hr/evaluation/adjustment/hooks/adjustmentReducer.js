export const ACTION_TYPES = {
  REPLACE_ALL: 'REPLACE_ALL',
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
};

export const initialAdjustmentState = {
  penalty: { level1: [], level2: [] },
  reward: { level1: [], level2: [] },
};

export const adjustmentReducer = (state, action) => {
  const { type, payload } = action;
  const { division, level, item } = payload || {};

  switch (type) {
    case ACTION_TYPES.REPLACE_ALL:
      return { ...initialAdjustmentState, ...payload };

    case ACTION_TYPES.INSERT: {
      const siblings =
        level === 'level1'
          ? state[division].level1
          : state[division].level2.filter(
              (i) => String(i.parentId) === String(item.parentId),
            );

      const maxSortOrder = siblings.reduce(
        (max, i) => Math.max(max, Number(i.sortOrder) || 0),
        0,
      );

      const newItem = {
        ...item,
        id: `temp-${Date.now()}`,
        action: 'insert',
        sortOrder: item.sortOrder ? Number(item.sortOrder) : maxSortOrder + 1,
        division: division,
      };

      // [수정] 모든 계층에 spread syntax를 적용하여 새로운 참조를 보장
      return {
        ...state,
        [division]: {
          ...state[division],
          [level]: [...state[division][level], newItem],
        },
      };
    }

    case ACTION_TYPES.UPDATE: {
      // [수정] 모든 계층에 spread syntax를 적용하여 새로운 참조를 보장
      return {
        ...state,
        [division]: {
          ...state[division],
          [level]: state[division][level].map((d) =>
            String(d.id) === String(item.id)
              ? {
                  ...d,
                  ...item,
                  action: d.action === 'insert' ? 'insert' : 'update',
                }
              : d,
          ),
        },
      };
    }

    case ACTION_TYPES.DELETE: {
      let newLevel1 = [...state[division].level1];
      let newLevel2 = [...state[division].level2];

      if (level === 'level1') {
        newLevel1 = newLevel1.map((d) =>
          String(d.id) === String(item.id) ? { ...d, action: 'delete' } : d,
        );
        newLevel2 = newLevel2.map((lv2) =>
          String(lv2.parentId) === String(item.id)
            ? { ...lv2, action: 'delete' }
            : lv2,
        );
      } else {
        // level === 'level2'
        newLevel2 = newLevel2.map((d) =>
          String(d.id) === String(item.id) ? { ...d, action: 'delete' } : d,
        );
      }

      // [수정] 모든 계층에 spread syntax를 적용하여 새로운 참조를 보장
      return {
        ...state,
        [division]: {
          level1: newLevel1,
          level2: newLevel2,
        },
      };
    }

    default:
      return state;
  }
};
