import { useState, useMemo } from 'react';
import { Search, Mic, MicOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge, StatusDot } from '../components/ui/Badge';
import { Select } from '../components/ui/Input';
import { PageLoader } from '../components/ui/Loading';

const DEPARTMENTS = ['All', 'Engineering', 'Design', 'Human Resources', 'Analytics', 'Marketing', 'Finance'];
const STATUSES = ['All', 'active', 'on-leave'];

export function Team() {
  const { employees, loading, addNotification } = useApp();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');

  const { isListening, startListening } = useVoiceSearch(
    (transcript) => {
      setSearch(transcript);
      addNotification({
        type: 'info',
        title: 'Voice Search',
        message: `Searching for "${transcript}"`,
      });
    },
    (error) => addNotification({ type: 'warning', title: 'Voice Search', message: error })
  );

  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.role.toLowerCase().includes(search.toLowerCase());
      const matchesDept = department === 'All' || emp.department === department;
      const matchesStatus = status === 'All' || emp.status === status;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, search, department, status]);

  if (loading.employees) {
    return <PageLoader message="Loading team directory..." />;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          {filtered.length} of {employees.length} team members
        </p>
      </div>

      <Card className="!p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={startListening}
              className={`absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 transition-colors ${
                isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-primary-600'
              }`}
              title="Voice search"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>
          <Select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="sm:w-48"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="sm:w-40"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((emp, index) => (
          <Card
            key={emp.id}
            className="!p-4 transition-all hover:shadow-md animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="h-16 w-16 rounded-full bg-gray-200"
                />
                <StatusDot
                  status={emp.status}
                  className="absolute bottom-0 right-0 h-3 w-3 ring-2 ring-white dark:ring-gray-900"
                />
              </div>
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{emp.name}</h3>
              <p className="text-sm text-primary-600 dark:text-primary-400">{emp.role}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{emp.department}</p>
              <p className="mt-2 text-xs text-gray-400">{emp.email}</p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant={emp.status === 'active' ? 'success' : 'warning'}>
                  {emp.status}
                </Badge>
                <span className="text-xs text-gray-400">{emp.location}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No team members match your search criteria.</p>
        </div>
      )}
    </div>
  );
}
