import { format, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Loading';

const CATEGORY_COLORS = {
  meeting: 'info',
  policy: 'warning',
  event: 'success',
  compliance: 'error',
  facilities: 'info',
};

export function Announcements() {
  const { announcements, loading } = useApp();

  if (loading.announcements) {
    return <PageLoader message="Loading announcements..." />;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Announcements</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Stay updated with the latest company news
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <Card key={ann.id} className="transition-all hover:shadow-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {ann.title}
                  </h2>
                  <Badge variant={CATEGORY_COLORS[ann.category] || 'info'}>
                    {ann.category}
                  </Badge>
                  <Badge variant={ann.priority === 'high' ? 'warning' : ann.priority === 'low' ? 'success' : 'info'}>
                    {ann.priority}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {ann.author} · {ann.department} · {format(parseISO(ann.date), 'MMMM d, yyyy')}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {ann.content}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
