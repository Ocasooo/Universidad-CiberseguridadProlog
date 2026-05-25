import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, ShieldAlert, Ban, Swords } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { ChartsSection } from '@/components/ChartsSection';
import { AlertCard } from '@/components/AlertCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useLogsStore } from '@/store/logsStore';
import {
  computeActivityByHour,
  computeSeverityDistribution,
  computeAttackTypes,
  computeThreatDistribution,
} from '@/utils/charts';

export function Dashboard() {
  const { logs, alerts } = useLogsStore();
  const navigate = useNavigate();

  const statsCards = useMemo(() => [
    { title: 'Logs Procesados', value: logs.length, trend: 0, icon: 'FileText', suffix: 'total' },
    { title: 'Intentos Fallidos', value: logs.filter((l) => l.status === 'failure').length, trend: 0, icon: 'Swords', suffix: 'fallos' },
    { title: 'Alertas Activas', value: alerts.filter((a) => a.status === 'active').length, trend: 0, icon: 'ShieldAlert', suffix: 'activas' },
    { title: 'IPs Únicas', value: new Set(logs.map((l) => l.ip)).size, trend: 0, icon: 'Ban', suffix: 'ips' },
  ], [logs, alerts]);

  const chartData = useMemo(() => ({
    activityByHour: computeActivityByHour(logs),
    severityDistribution: computeSeverityDistribution(logs),
    attackTypes: computeAttackTypes(logs),
    threatDistribution: computeThreatDistribution(alerts),
  }), [logs, alerts]);

  const activeAlerts = alerts
    .filter((a) => a.status === 'active')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => (
          <StatsCard key={stat.title} {...stat} delay={idx} />
        ))}
      </div>

      {logs.length > 0 && <ChartsSection {...chartData} />}

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Alertas Activas Recientes</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => navigate('/alerts')}
          >
            Ver todas
            <ArrowRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {activeAlerts.map((alert, idx) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                index={idx}
              />
            ))}
            {activeAlerts.length === 0 && (
              <div className="col-span-2 py-8 text-center text-muted-foreground text-sm">
                No hay alertas activas en este momento
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}