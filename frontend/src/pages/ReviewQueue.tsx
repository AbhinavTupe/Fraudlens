import { useEffect, useState } from 'react';
import { PageHeader } from '../components/shell/PageHeader';
import { Table, TBody, Td, Th, THead, Tr } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getFraudAlerts, getTransactionDetail, updateFraudAlertStatus, openInvestigation } from '../lib/api';
import { formatCurrency } from '../utils/cn';
// risk score component not required here
import type { FraudAlertItem } from '../lib/api';

export function ReviewQueue() {
  const [alerts, setAlerts] = useState<FraudAlertItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const list = await getFraudAlerts();
        if (!mounted) return;
        setAlerts(list);
      } catch (e) {
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, []);

  async function handleAcknowledge(alertId: string) {
    await updateFraudAlertStatus(alertId, 'acknowledged');
    const list = await getFraudAlerts();
    setAlerts(list);
  }

  async function handleResolve(alertId: string) {
    await updateFraudAlertStatus(alertId, 'resolved');
    const list = await getFraudAlerts();
    setAlerts(list);
  }

  async function handleClose(alertId: string) {
    await updateFraudAlertStatus(alertId, 'closed');
    const list = await getFraudAlerts();
    setAlerts(list);
  }

  async function handleOpenCase(alertId: string) {
    await openInvestigation({ fraud_alert_id: alertId, status: 'open', priority: 'medium' });
    const list = await getFraudAlerts();
    setAlerts(list);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Review Queue" description="Live fraud alerts awaiting analyst review." />

      <div className="bg-white rounded-lg shadow-sm">
        <Table>
          <THead>
            <Tr>
              <Th>Alert</Th>
              <Th>Severity</Th>
              <Th>Transaction</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Investigation</Th>
              <Th align="right">Action</Th>
            </Tr>
          </THead>
          <TBody>
            {loading || !alerts ? (
              <Tr><Td colSpan={7}>Loading…</Td></Tr>
            ) : alerts.length === 0 ? (
              <Tr><Td colSpan={7}>No active fraud alerts</Td></Tr>
            ) : (
              alerts.map((alert) => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                  onResolve={handleResolve}
                  onClose={handleClose}
                  onOpenCase={handleOpenCase}
                />
              ))
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
}

function AlertRow({
  alert,
  onAcknowledge,
  onResolve,
  onClose,
  onOpenCase,
}: {
  alert: FraudAlertItem;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onClose: (id: string) => void;
  onOpenCase: (id: string) => void;
}) {
  const [txnRef, setTxnRef] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    async function loadTxn() {
      try {
        if (!alert.transaction_id) return;
        const txn = await getTransactionDetail(alert.transaction_id);
        if (!mounted) return;
        setTxnRef(txn.transaction_reference ?? txn.id);
        setAmount(formatCurrency(Number(txn.amount ?? 0), true));
      } catch {
        // ignore
      }
    }
    void loadTxn();
    return () => { mounted = false; };
  }, [alert.transaction_id]);

  return (
    <Tr>
      <Td>
        <div className="font-medium">{alert.id}</div>
        <div className="text-xs text-gray-500">Created {new Date(alert.created_at).toISOString()}</div>
      </Td>
      <Td>
        <Badge tone={alert.severity === 'high' || alert.severity === 'critical' ? 'red' : alert.severity === 'medium' ? 'amber' : 'emerald'}>{alert.severity}</Badge>
      </Td>
      <Td>
        <div className="font-medium">{txnRef || '—'}</div>
        <div className="text-xs text-gray-500">Txn ID {alert.transaction_id ?? '—'}</div>
      </Td>
      <Td className="tabular">{amount || '—'}</Td>
      <Td>
        <Badge tone={alert.status === 'open' ? 'amber' : alert.status === 'acknowledged' ? 'emerald' : 'gray'}>{alert.status}</Badge>
      </Td>
      <Td>{alert.investigation_case ? 'Exists' : '—'}</Td>
      <Td align="right">
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => onAcknowledge(alert.id)} disabled={alert.status !== 'open'}>Acknowledge</Button>
          <Button size="sm" variant="secondary" onClick={() => onResolve(alert.id)} disabled={alert.status === 'resolved' || alert.status === 'closed'}>Resolve</Button>
          <Button size="sm" variant="secondary" onClick={() => onClose(alert.id)} disabled={alert.status === 'closed'}>Close</Button>
          <Button size="sm" variant="primary" onClick={() => onOpenCase(alert.id)}>Open case</Button>
        </div>
      </Td>
    </Tr>
  );
}
