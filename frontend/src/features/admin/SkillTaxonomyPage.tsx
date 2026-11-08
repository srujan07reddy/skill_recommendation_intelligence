import { useState, useEffect } from 'react';
import { adminApi, DomainItem } from '../../api/admin.api';
import {
  Code,
  FolderTree,
  Tag,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  BookMarked,
  Layers,
} from 'lucide-react';

export function SkillTaxonomyPage() {
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTaxonomy = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getTaxonomyExplorer();
      setDomains(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load skill taxonomy.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTaxonomy();
  }, []);

  const totalCategories = domains.reduce((acc, d) => acc + d.categories.length, 0);
  const totalSkills = domains.reduce(
    (acc, d) => acc + d.categories.reduce((cAcc, c) => cAcc + c.skills.length, 0),
    0
  );
  const totalAliases = domains.reduce(
    (acc, d) =>
      acc +
      d.categories.reduce(
        (cAcc, c) => cAcc + c.skills.reduce((sAcc, s) => sAcc + s.aliases.length, 0),
        0
      ),
    0
  );

  const term = searchTerm.toLowerCase();

  const filteredDomains = domains
    .filter((d) => selectedDomain === 'ALL' || d.domain_id === selectedDomain)
    .map((domain) => {
      const filteredCategories = domain.categories
        .map((category) => {
          const filteredSkills = category.skills.filter(
            (s) =>
              s.skill_name.toLowerCase().includes(term) ||
              s.skill_code.toLowerCase().includes(term) ||
              (s.description && s.description.toLowerCase().includes(term)) ||
              s.aliases.some((a) => a.toLowerCase().includes(term))
          );
          return {
            ...category,
            skills: filteredSkills,
          };
        })
        .filter(
          (category) =>
            category.category_name.toLowerCase().includes(term) ||
            category.category_code.toLowerCase().includes(term) ||
            category.skills.length > 0
        );

      return {
        ...domain,
        categories: filteredCategories,
      };
    })
    .filter(
      (domain) =>
        domain.domain_name.toLowerCase().includes(term) ||
        domain.domain_code.toLowerCase().includes(term) ||
        domain.categories.length > 0
    );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <FolderTree className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Institutional Skill Taxonomy</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Canonical skill inventory, domain hierarchies, and alias resolution dictionary (§22.4).
          </p>
        </div>
        <button
          onClick={loadTaxonomy}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Domains
            </span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{domains.length}</p>
          <p className="text-xs text-slate-400 mt-1">Top-level skill domains</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Categories
            </span>
            <BookMarked className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalCategories}</p>
          <p className="text-xs text-slate-400 mt-1">Specialized skill clusters</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Canonical Skills
            </span>
            <Code className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalSkills}</p>
          <p className="text-xs text-slate-400 mt-1">Approved for assessment</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mapped Aliases
            </span>
            <Tag className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalAliases}</p>
          <p className="text-xs text-slate-400 mt-1">Auto-normalizing lookup keys</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search skills, codes, or aliases (e.g., Python, C++, SQL)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedDomain('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedDomain === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Domains ({domains.length})
          </button>
          {domains.map((d) => (
            <button
              key={d.domain_id}
              onClick={() => setSelectedDomain(d.domain_id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedDomain === d.domain_id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d.domain_name}
            </button>
          ))}
        </div>
      </div>

      {/* Domains & Hierarchies */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
          <p className="text-sm">Loading canonical taxonomy...</p>
        </div>
      ) : filteredDomains.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
          <FolderTree className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-base font-semibold text-slate-600">No matching skills or domains found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredDomains.map((domain) => (
            <div
              key={domain.domain_id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Layers className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{domain.domain_name}</h2>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                      {domain.domain_code}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {domain.categories.length} Categories ·{' '}
                  {domain.categories.reduce((acc, c) => acc + c.skills.length, 0)} Skills
                </div>
              </div>

              <div className="p-6 space-y-6">
                {domain.categories.map((category) => (
                  <div key={category.category_id} className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <BookMarked className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold text-slate-800 text-sm">
                          {category.category_name}
                        </h3>
                        <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {category.category_code}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {category.skills.length} approved skills
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {category.skills.map((skill) => (
                        <div
                          key={skill.skill_id}
                          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-indigo-300 shadow-xs transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-slate-900 text-sm">
                                {skill.skill_name}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                              {skill.skill_code}
                            </span>
                            {skill.description && (
                              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                                {skill.description}
                              </p>
                            )}
                          </div>

                          {skill.aliases && skill.aliases.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-slate-100">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                Aliases ({skill.aliases.length})
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {skill.aliases.map((alias, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-0.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono"
                                  >
                                    <Tag className="w-2.5 h-2.5 text-slate-400" />
                                    {alias}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
