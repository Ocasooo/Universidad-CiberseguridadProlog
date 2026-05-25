import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Filter } from 'lucide-react';
import { AlertCard } from '@/components/AlertCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useLogsStore } from '@/store/logsStore';
import { ruleLabels } from '@/utils/mapper';
import type { Alert } from '@/types';

const ruleNames: Record<string, string> = {};
for (const [key, val] of Object.entries(ruleLabels)) {
  ruleNames[key] = val.title;
}

export function AlertsPage() {
  const { alerts } = useLogsStore();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ruleFilter, setRuleFilter] = useState('all');

  const ruleTypes = useMemo(() => {
    const types = new Set(alerts.map(a => a.rule).filter(Boolean));
    return Array.from(types);
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchSeverity = severityFilter === 'all' || a.severity === severityFilter;
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchRule = ruleFilter === 'all' || a.rule === ruleFilter;
      return matchSeverity && matchRule && matchStatus;
    });
  }, [alerts, severityFilter, statusFilter, ruleFilter]);

  const tabs = [
    { value: 'all', label: 'Todas', count: alerts.length },
    { value: 'active', label: 'Activas', count: alerts.filter((a) => a.status === 'active').length },
    { value: 'resolved', label: 'Resueltas', count: alerts.filter((a) => a.status === 'resolved').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold">Centro de Alertas</h2>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            {alerts.length} total
          </span>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={(v) => setStatusFilter(v === 'all' ? 'all' : v)}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="relative">
              {tab.label}
              <span className="ml-1.5 text-xs text-muted-foreground">({tab.count})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Severidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Medio</SelectItem>
            <SelectItem value="low">Bajo</SelectItem>
          </SelectContent>
        </Select>
        {ruleTypes.length > 0 && (
          <Select value={ruleFilter} onValueChange={setRuleFilter}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Tipo de regla" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las reglas</SelectItem>
              {ruleTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {ruleNames[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAlerts.map((alert, idx) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              index={idx}
            />
          ))}
        </div>
      </AnimatePresence>

      {filteredAlerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ShieldAlert className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">No se encontraron alertas con los filtros actuales</p>
        </div>
      )}
    </div>
  );
}