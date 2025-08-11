import {
  fetchOfficeOptions,
  fetchDepartmentOptions,
  fetchPositionOptions,
} from '@/common/services/codeService';
import EmployeeList from '@/features/hr/employess/components/EmployeeList';
import { fetchEmployeeList } from '@/services/hr/employees/employeeService';

export default async function EmployeePage() {
  const { success, result } = await fetchEmployeeList({ includeAll: false });

  if (!success) {
    throw new Error();
  }

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
    filterOptions.office = officeResult.data;
  }
  if (departmentResult.success) {
    filterOptions.department = departmentResult.data;
  }
  if (positionResult.success) {
    filterOptions.position = positionResult.data;
  }

  return <EmployeeList initialData={result} filterOptions={filterOptions} />;
}
