// [신규] 파일 신규 생성

import {
  fetchOfficeOptions,
  fetchJobGroupOptions,
  fetchJobTitleOptions,
} from '@/common/services/codeService';
import { makeYearOptions } from '@/common/utils/yearOptions';
import { fetchEmployeeList } from '@/features/hr/employee/services/employeeService';
import { fetchAdjustmentList } from '@/features/hr/evaluation/adjustment/services/adjustmentService';
import { fetchCriteriaList } from '@/features/hr/evaluation/criteria/services/criteriaService';
import SettingForm from '@/features/hr/evaluation/setting/components/SettingForm';
import { fetchSettingById } from '@/features/hr/evaluation/setting/services/settingService';

export default async function EditSettingPage({ params }) {
  // 1. URL 파라미터에서 수정할 데이터의 ID 추출
  const resolvedParams = await params;
  const settingMasterId = resolvedParams?.settingMasterId;

  // 2. Promise.all을 사용하여 페이지에 필요한 모든 데이터를 병렬로 조회
  const [
    yearResult,
    officeResult,
    jobGroupResult,
    jobTitleResult,
    criteriaResult,
    adjustmentResult,
    employeeResult,
    settingDataResult,
  ] = await Promise.all([
    makeYearOptions({
      startYear: new Date().getFullYear(),
      range: 2,
      mode: 'around',
      order: 'asc',
    }),
    fetchOfficeOptions(),
    fetchJobGroupOptions({ mode: 'evaluation' }),
    fetchJobTitleOptions(),
    fetchCriteriaList({}),
    fetchAdjustmentList({}),
    fetchEmployeeList({ includeAll: false }),
    fetchSettingById(settingMasterId),
  ]);

  // 3. SettingForm에 전달할 initialData 객체 구성
  const initialData = {
    master: settingDataResult.success ? settingDataResult.master : null,
    detail: settingDataResult.success ? settingDataResult.detail : [],
    criteriaList: criteriaResult.success ? criteriaResult.result : [],
    adjustmentList: adjustmentResult.success ? adjustmentResult.result : [],
    employeeList: employeeResult.success ? employeeResult.result : [],
  };

  // 4. SettingForm에 전달할 selectOptions 객체 구성
  const selectOptions = {
    year: yearResult || [],
    office: officeResult.success ? officeResult.result : [],
    jobGroup: jobGroupResult.success ? jobGroupResult.result : [],
    jobTitle: jobTitleResult.success ? jobTitleResult.result : [],
  };

  return (
    <SettingForm
      mode="edit"
      initialData={initialData}
      selectOptions={selectOptions}
    />
  );
}
