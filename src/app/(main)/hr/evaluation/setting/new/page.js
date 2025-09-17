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

export default async function NewSettingPage() {
  const [
    yearResult,
    officeResult,
    jobGroupResult,
    jobTitleResult,
    criteriaResult,
    adjustmentResult,
    employeeResult,
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
    fetchEmployeeList({ evaluationYear: new Date().getFullYear() }),
  ]);

  const initialData = {
    criteriaList: criteriaResult.success ? criteriaResult.result : [],
    adjustmentList: adjustmentResult.success ? adjustmentResult.result : [],
    employeeList: employeeResult.success ? employeeResult.result : [],
  };

  const selectOptions = {
    year: [],
    jobGroup: [],
    jobTitle: [],
  };

  if (yearResult) {
    selectOptions.year = yearResult;
  }
  if (officeResult) {
    selectOptions.office = officeResult.result;
  }
  if (jobGroupResult.success) {
    selectOptions.jobGroup = jobGroupResult.result;
  }
  if (jobTitleResult.success) {
    selectOptions.jobTitle = jobTitleResult.result;
  }

  console.log(initialData);
  console.log(selectOptions);

  return (
    <SettingForm
      mode="new"
      initialData={initialData}
      selectOptions={selectOptions}
    />
  );
}
