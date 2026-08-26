import { useEffect, useState } from 'react';
import { PageHeader } from '../components/shell/PageHeader';
import { Table, TBody, Td, Th, THead, Tr } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { apiFetch, type TransactionEvaluation } from '../lib/api';

interface EvaluationHistoryItem extends TransactionEvaluation {}

export function EvaluationHistory() {
  const [evaluations, setEvaluations] = useState<EvaluationHistoryItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await apiFetch<TransactionEvaluation[]>('/api/transactions/evaluations/history?limit=1000');
        if (!mounted) return;
        setEvaluations(data);
      } catch (e) {
        setEvaluations([]);
      } finally {
        setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, []);

  const filtered = evaluations?.filter((item) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      item.transaction_id.toLowerCase().includes(query) ||
      item.predicted_label?.toLowerCase().includes(query) ||
      item.model_version?.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    );
  }) ?? [];

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Evaluation History"
        description="Historical records of all fraud probability evaluations and predictions."
      />

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search by transaction ID, model version, or prediction ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500">
            {loading ? 'Loading…' : `${filtered.length} evaluations`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <THead>
              <Tr>
                <Th>Prediction ID</Th>
                <Th>Transaction ID</Th>
                <Th>Fraud Probability</Th>
                <Th>Predicted Label</Th>
                <Th>Model Version</Th>
                <Th>Threshold Used</Th>
                <Th>Evaluation Date</Th>
              </Tr>
            </THead>
            <TBody>
              {loading || !evaluations ? (
                <Tr>
                  <Td colSpan={7} className="text-center py-8 text-gray-500">
                    Loading evaluation history…
                  </Td>
                </Tr>
              ) : filtered.length === 0 ? (
                <Tr>
                  <Td colSpan={7} className="text-center py-8 text-gray-500">
                    {evaluations.length === 0 ? 'No evaluations yet' : 'No results match your search'}
                  </Td>
                </Tr>
              ) : (
                filtered.map((item) => (
                  <EvaluationRow key={item.id} evaluation={item} />
                ))
              )}
            </TBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function EvaluationRow({ evaluation }: { evaluation: EvaluationHistoryItem }) {
  const fraudProb = evaluation.fraud_probability ?? 0;
  const fraudPercent = Math.round(fraudProb * 100);
  const tone =
    fraudProb >= 0.9
      ? 'red'
      : fraudProb >= 0.75
        ? 'amber'
        : fraudProb >= 0.5
          ? 'amber'
          : 'emerald';

  return (
    <Tr>
      <Td>
        <div className="font-mono text-xs text-gray-600 break-all">{evaluation.id}</div>
      </Td>
      <Td>
        <div className="font-mono text-xs text-gray-600 break-all">{evaluation.transaction_id}</div>
      </Td>
      <Td>
        <div className="flex items-center gap-2">
          <Badge tone={tone}>{fraudPercent}%</Badge>
          <span className="tabular text-sm font-semibold text-gray-900">
            {evaluation.fraud_probability?.toFixed(4) ?? '—'}
          </span>
        </div>
      </Td>
      <Td>
        <Badge
          tone={evaluation.predicted_label === 'fraud' ? 'red' : 'emerald'}
        >
          {evaluation.predicted_label ?? '—'}
        </Badge>
      </Td>
      <Td>
        <span className="text-sm text-gray-700">
          {evaluation.model_version ?? '—'}
        </span>
      </Td>
      <Td>
        <span className="tabular text-sm text-gray-700">
          {evaluation.threshold_used?.toFixed(4) ?? '—'}
        </span>
      </Td>
      <Td>
        <div className="text-sm text-gray-600">
          {new Date(evaluation.created_at).toLocaleString()}
        </div>
      </Td>
    </Tr>
  );
}
