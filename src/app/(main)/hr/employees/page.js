import EmployeeList from '@/app/(main)/hr/employees/components/EmployeeList';
import {
  fetchOfficeOptions,
  fetchDepartmentOptions,
  fetchPositionOptions,
} from '@/services/codes/codeService';
import { fetchEmployeeList } from '@/services/hr/employees/employeeService';

export default async function EmployeePage() {
  let data = [];
  let success = false;
  const filterOptions = {
    office: [],
    department: [],
    position: [],
  };

  try {
    const result = await fetchEmployeeList({ includeAll: false });
    data = result.data || [];
    success = result.success;

    const [officeResult, departmentResult, positionResult] = await Promise.all([
      fetchOfficeOptions(),
      fetchDepartmentOptions(),
      fetchPositionOptions(),
    ]);
    if (officeResult.success) {
      filterOptions.office = officeResult.data;
    }
    if (departmentResult.success) {
      filterOptions.department = departmentResult.data;
    }
    if (positionResult.success) {
      filterOptions.position = positionResult.data;
    }
  } catch (error) {
    console.error('[EmployeePage] 직원 목록 조회 실패:', error);
  }

  return (
    <EmployeeList
      initialData={data}
      initialStatus={success}
      initialFilterOptions={filterOptions}
    />
  );
}
