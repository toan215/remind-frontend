import { useOutletContext } from 'react-router-dom';
import '../../admin/tailwind.css';

interface LayoutContext {
  isDark: boolean;
}

interface AdminPlaceholderPageProps {
  title: string;
  description: string;
  icon: string;
}

export default function AdminPlaceholderPage({ title, description, icon }: AdminPlaceholderPageProps) {
  const { isDark } = useOutletContext<LayoutContext>();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className={`text-center max-w-md p-8 rounded-2xl border admin-fade-in ${isDark ? 'bg-admin-surface border-admin-border' : 'bg-admin-light-surface border-admin-light-border'}`}>
        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${isDark ? 'bg-admin-primary-light border border-admin-primary/20' : 'bg-admin-primary-light border border-admin-primary/20'}`}>
          <span className="text-4xl">{icon}</span>
        </div>

        {/* Title */}
        <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-admin-text' : 'text-admin-light-text'}`}>
          {title}
        </h2>

        {/* Description */}
        <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-admin-text-muted' : 'text-admin-light-text-muted'}`}>
          {description}
        </p>

        {/* Status indicator */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium ${isDark ? 'bg-admin-bg text-admin-text-dim' : 'bg-admin-light-surface-hover text-admin-light-text-dim'}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-admin-warning opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-admin-warning" />
          </span>
          Coming Soon
        </div>
      </div>
    </div>
  );
}
