// features/hr/evaluation/adjustment/hooks/adjustmentReducer.js

import { v4 as uuidv4 } from 'uuid'; // uuid 임포트

export const ACTION_TYPES = {
  KEEP: 'KEEP', // KEEP 액션 추가
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  REPLACE_ALL: 'REPLACE_ALL',
};

export const initialAdjustmentState = {
  penalty: { level1: [], level2: [] },
  reward: { level1: [], level2: [] },
};

export const adjustmentReducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case ACTION_TYPES.KEEP: {
      // payload로 받은 데이터로 상태를 완전히 교체 (초기 데이터 로드용)
      return payload;
    }

    case ACTION_TYPES.REPLACE_ALL: {
      const copiedData = payload; // 복사된 detail 데이터
      // 1. 기존 state의 모든 항목에 'delete' 액션 부여

      const markAsDeleted = (arr) =>
        arr.map((item) => ({ ...item, action: 'delete' }));
      const deletedItems = {
        penalty: {
          level1: markAsDeleted(state.penalty.level1),
          level2: markAsDeleted(state.penalty.level2),
        },
        reward: {
          level1: markAsDeleted(state.reward.level1),
          level2: markAsDeleted(state.reward.level2),
        },
      }; // 2. 복사된 데이터에 새로운 ID와 'insert' 액션 부여

      const idMap = new Map();
      const newLevel1 = copiedData.level1.map((item) => {
        const newId = uuidv4();
        idMap.set(item.id, newId);
        return { ...item, id: newId, action: 'insert' };
      });
      const newLevel2 = copiedData.level2.map((item) => ({
        ...item,
        id: uuidv4(),
        parentId: idMap.get(item.parentId) || item.parentId,
        action: 'insert',
      })); // 3. 'insert'된 항목들을 penalty와 reward로 다시 분류

      const newPenaltyItems = {
        level1: newLevel1.filter((i) => i.division === 'penalty'),
        level2: newLevel2.filter((i) => i.division === 'penalty'),
      };
      const newRewardItems = {
        level1: newLevel1.filter((i) => i.division === 'reward'),
        level2: newLevel2.filter((i) => i.division === 'reward'),
      }; // 4. 'deleted' 항목과 'inserted' 항목을 합쳐서 새로운 state 반환

      return {
        penalty: {
          level1: [...deletedItems.penalty.level1, ...newPenaltyItems.level1],
          level2: [...deletedItems.penalty.level2, ...newPenaltyItems.level2],
        },
        reward: {
          level1: [...deletedItems.reward.level1, ...newRewardItems.level1],
          level2: [...deletedItems.reward.level2, ...newRewardItems.level2],
        },
      };
    } // INSERT, UPDATE, DELETE 로직은 기존 코드를 유지하되, payload 구조에 맞게 수정

    case ACTION_TYPES.INSERT: {
      const { division, level, item } = payload;
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
      return {
        ...state,
        [division]: {
          ...state[division],
          [level]: [...state[division][level], newItem],
        },
      };
    }

    case ACTION_TYPES.UPDATE: {
      const { division, level, item } = payload;
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
      const { division, level, item } = payload;
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
        newLevel2 = newLevel2.map((d) =>
          String(d.id) === String(item.id) ? { ...d, action: 'delete' } : d,
        );
      }
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
