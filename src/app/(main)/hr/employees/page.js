import {
  fetchOfficeOptions,
  fetchDepartmentOptions,
  fetchPositionOptions,
} from '@/common/services/codeService';
import EmployeeList from '@/features/hr/employees/components/EmployeeList';
import { fetchEmployeeList } from '@/features/hr/employees/services/employeeService';

export default async function EmployeePage() {
  const { success, result } = await fetchEmployeeList({ includeAll: false });

  if (!success) {
    throw new Error();
  }

  // 필터옵션
  const [officeResult, departmentResult, positionResult] = await Promise.all([
    fetchOfficeOptions(),
    fetchDepartmentOptions(),
    fetchPositionOptions(),
  ]);

  const filterOptions = {
    office: [],
    department: [],
    position: [],
  };

  if (officeResult.success) {
    filterOptions.office = officeResult.result;
  }
  if (departmentResult.success) {
    filterOptions.department = departmentResult.result;
  }
  if (positionResult.success) {
    filterOptions.position = positionResult.result;
  }

  return <EmployeeList initialData={result} filterOptions={filterOptions} />;
}
