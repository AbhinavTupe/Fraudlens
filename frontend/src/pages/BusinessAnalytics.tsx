import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import {
  ArrowRightIcon,
  BarChart3Icon,
  DownloadIcon,
  FileTextIcon,
  GaugeIcon,
  PieChartIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  WalletIcon } from
'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { Select } from '../components/ui/Select';
import { ProgressBar } from '../components/ui/ProgressBar';
import { FinancialImpactDashboard } from '../components/analytics/FinancialImpactDashboard';
import { FairnessMonitor } from '../components/analytics/FairnessMonitor';
import { BusinessInsightsPanel } from '../components/analytics/BusinessInsightsPanel';
import {
  analyticsKpis,
  decisionDistribution,
  financialImpact,
  geographies,
  merchantFilters,
  monthlyTrends,
  operationalMetrics,
  paymentMethodFilters } from
'../data/analytics';
import { libraryReports } from '../data/reports';

const kpiIcons = [ShieldCheckIcon, WalletIcon, TrendingUpIcon, GaugeIcon];

const trendTabs = [
{ id: 'prevented', label: 'Fraud prevented' },
{ id: 'losses', label: 'Net losses' },
{ id: 'approval', label: 'Approval rate' }];


const dateRanges = [
{ value: 'quarter', label: 'This quarter', months: 3 },
{ value: 'half', label: 'Last 6 months', months: 6 },
{ value: 'ytd', label: 'Year to date', months: 7 }];


/** Filters reshape the trend series so the chart always reflects the current slice. */
const merchantWeight: Record<string, number> = { all: 1, northwind: 0.34, atlas: 0.21, halcyon: 0.16, vertex: 0.29 };
const methodWeight: Record<string, number> = { all: 1, card: 0.62, wire: 0.21, openbanking: 0.09, wallet: 0.08 };
const geoWeight: Record<string, number> = { all: 1, na: 0.46, emea: 0.31, apac: 0.15, latam: 0.08 };

export function BusinessAnalytics() {
  const [trend, setTrend] = useState('prevented');
  const [range, setRange] = useState('quarter');
  const [merchant, setMerchant] = useState('all');
  const [method, setMethod] = useState('all');
  const [geography, setGeography] = useState('all');

  const filtersActive = merchant !== 'all' || method !== 'all' || geography !== 'all' || range !== 'quarter';
  const scale = merchantWeight[merchant] * methodWeight[method] * geoWeight[geography];

  const series = useMemo(() => {
    const months = dateRanges.find((option) => option.value === range)?.months ?? 3;
    return monthlyTrends.slice(-months).map((point) => ({
      month: point.month,
      prevented: Number((point.prevented * scale).toFixed(2)),
      losses: Number((point.losses * scale).toFixed(3)),
      approval: point.approval,
      volume: Number((point.volume * scale).toFixed(2))
    }));
  }, [range, scale]);

  const channelData = useMemo(
    () =>
    financialImpact.map((row) => ({
      ...row,
      prevented: Number((row.prevented * scale).toFixed(2)),
      losses: Number((row.losses * scale).toFixed(3))
    })),
    [scale]
  );

  function resetFilters() {
    setRange('quarter');
    setMerchant('all');
    setMethod('all');
    setGeography('all');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Analytics"
        description="The financial and operational story behind fraud decisions — what the platform delivered, where friction remains, and which risks need attention."
        meta={
        <>
            <Badge tone="emerald" dot>
              Fraud losses at record low
            </Badge>
            <Badge tone="amber">2 fairness checks on watch</Badge>
            <span className="text-xs text-gray-400">Data through 4 Aug 2026</span>
          </>
        }
        actions={
        <>
            <Button
            variant="secondary"
            icon={DownloadIcon}
            onClick={() => toast.success('Export ready', { description: 'Analytics workbook exported as XLSX.' })}>
            
              Export
            </Button>
            <Button variant="primary" icon={FileTextIcon} onClick={() => toast.success('Executive summary queued')}>
              Generate report
            </Button>
          </>
        } />
      

      <section aria-label="Executive KPIs" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analyticsKpis.map((datum, index) =>
        <KpiCard key={datum.id} datum={datum} icon={kpiIcons[index]} />
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Fraud trends"
            description="Monthly performance in millions of USD, alongside transaction volume."
            icon={BarChart3Icon}
            action={
            <Tabs tabs={trendTabs} active={trend} onChange={setTrend} className="border-b-0" layoutId="analytics-trend" />
            } />
          
          <div className="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 lg:grid-cols-4">
            <Select
              label="Date range"
              name="range"
              value={range}
              onChange={(event) => setRange(event.target.value)}
              options={dateRanges.map((option) => ({ value: option.value, label: option.label }))} />
            
            <Select
              label="Merchant"
              name="merchant"
              value={merchant}
              onChange={(event) => setMerchant(event.target.value)}
              options={merchantFilters} />
            
            <Select
              label="Payment method"
              name="method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              options={paymentMethodFilters} />
            
            <Select
              label="Geography"
              name="geography"
              value={geography}
              onChange={(event) => setGeography(event.target.value)}
              options={geographies} />
            
          </div>
          {filtersActive ?
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50/60 px-6 py-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Filtered by</span>
              {[
            dateRanges.find((option) => option.value === range)?.label,
            merchantFilters.find((option) => option.value === merchant)?.label,
            paymentMethodFilters.find((option) => option.value === method)?.label,
            geographies.find((option) => option.value === geography)?.label].

            filter((label): label is string => Boolean(label) && !label!.startsWith('All')).
            map((label) =>
            <Badge key={label} tone="blue">
                    {label}
                  </Badge>
            )}
              <Button size="sm" variant="ghost" icon={RotateCcwIcon} className="ml-auto" onClick={resetFilters}>
                Reset
              </Button>
            </div> :
          null}
          <CardBody className="pt-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={4} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip
                    cursor={{ stroke: '#d1d5db', strokeDasharray: '3 3' }}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 6px 20px -6px rgba(16,24,40,0.12)',
                      fontSize: 12,
                      padding: '8px 12px'
                    }} />
                  
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Line
                    type="monotone"
                    dataKey={trend}
                    name={trendTabs.find((tab) => tab.id === trend)?.label}
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }} />
                  
                  <Line
                    type="monotone"
                    dataKey="volume"
                    name="Volume (M)"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false} />
                  
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
          <CardFooter>
            <p className="text-xs text-gray-500">
              Prevention rose every month this year while net losses fell — the platform is scaling faster than fraud.
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader title="Decision distribution" description="Share of all scored transactions." icon={PieChartIcon} />
          <CardBody>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={decisionDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={2}
                    strokeWidth={0}>
                    
                    {decisionDistribution.map((entry) =>
                    <Cell key={entry.name} fill={entry.color} />
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12, padding: '8px 12px' }}
                    formatter={(value: number) => `${value}%`} />
                  
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-4 space-y-2.5 border-t border-gray-100 pt-4">
              {decisionDistribution.map((entry) =>
              <li key={entry.name} className="flex items-center justify-between text-[13px]">
                  <span className="inline-flex items-center gap-2 text-gray-700">
                    <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                  </span>
                  <span className="tabular font-semibold text-gray-900">{entry.value}%</span>
                </li>
              )}
            </ul>
          </CardBody>
          <CardFooter>
            <p className="text-xs text-gray-500">91.2% of customers never feel a fraud control.</p>
          </CardFooter>
        </Card>
      </div>

      <FinancialImpactDashboard />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Financial impact by channel"
            description="Fraud prevented versus losses incurred, in millions."
            icon={WalletIcon} />
          
          <CardBody>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={120} />
                  
                  <Tooltip
                    cursor={{ fill: 'rgba(16,24,40,0.04)' }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12, padding: '8px 12px' }}
                    formatter={(value: number) => `$${value}M`} />
                  
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="prevented" name="Prevented" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="losses" name="Losses" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
          <CardFooter>
            <p className="text-xs text-gray-500">Card-not-present remains the largest exposure and the largest win.</p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader
            title="Operational performance"
            description="How the fraud operation is running against targets."
            icon={GaugeIcon} />
          
          <CardBody className="space-y-4">
            {operationalMetrics.map((metric) =>
            <div key={metric.label}>
                <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[13px] font-medium text-gray-700">{metric.label}</p>
                  <span className="tabular flex items-center gap-2 text-[13px]">
                    <span className="font-semibold text-gray-900">{metric.value}</span>
                    <span className="text-gray-400">target {metric.target}</span>
                    <Badge tone={metric.status === 'on-track' ? 'emerald' : 'amber'}>
                      {metric.status === 'on-track' ? 'On track' : 'At risk'}
                    </Badge>
                  </span>
                </div>
                <ProgressBar
                value={metric.progress}
                tone={metric.status === 'on-track' ? 'emerald' : 'amber'}
                label={metric.label} />
              
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <BusinessInsightsPanel className="xl:col-span-2" />
        <FairnessMonitor />
      </div>

      <Card>
        <CardHeader
          title="Reports preview"
          description="Latest generated reports drawing on this data."
          icon={FileTextIcon}
          action={
          <Link to="/reports">
              <Button size="sm" variant="secondary" iconRight={ArrowRightIcon}>
                Reports Center
              </Button>
            </Link>
          } />
        
        <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {libraryReports.map((report) =>
          <article
            key={report.id}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft">
            
              <div className="flex items-center justify-between gap-2">
                <Badge tone="gray">{report.format}</Badge>
                <span className="text-xs text-gray-400">{report.period}</span>
              </div>
              <h3 className="mt-3 text-[13px] font-semibold leading-5 text-gray-900">{report.name}</h3>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-500">{report.summary}</p>
              <p className="mt-auto pt-3 text-[11px] text-gray-400">
                <span className="block border-t border-gray-100 pt-2.5">{report.generated}</span>
              </p>
            </article>
          )}
        </CardBody>
      </Card>
    </div>);

}