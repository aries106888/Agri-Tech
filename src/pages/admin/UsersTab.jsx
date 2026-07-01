/* ── Admin: Users Tab ────────────────────────────────────── */
import { chipByStatus } from '../../components/admin/AdminHelpers';

const UsersTab = ({ users, onView, onExport }) => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-5">
      <p className="text-sm font-bold text-ag-muted">
        {users.length} <span className="text-ag-body">registered users</span>
      </p>
      <button
        onClick={onExport}
        className="btn-secondary !min-h-0 !py-2 !text-xs"
      >
        Export CSV
      </button>
    </div>

    <div className="overflow-x-auto rounded-card border border-ag-border">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-ag-surface text-ag-muted text-xs border-b border-ag-border">
            <th className="px-4 py-3 font-bold uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 font-bold uppercase tracking-wider">Role</th>
            <th className="px-4 py-3 font-bold uppercase tracking-wider">County</th>
            <th className="px-4 py-3 font-bold uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 font-bold uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ag-border">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-ag-canvas transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-ag-primary flex items-center justify-center
                    text-white text-xs font-extrabold shrink-0">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-ag-body">{user.name}</p>
                    <p className="text-xs text-ag-muted">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-ag-surface text-ag-body">
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-ag-muted">{user.county}</td>
              <td className="px-4 py-3">
                <span className={chipByStatus(user.status)}>
                  {user.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onView(user)}
                  className="text-xs text-ag-primary font-bold hover:underline"
                >
                  View / Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default UsersTab;
