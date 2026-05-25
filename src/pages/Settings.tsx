import { Settings, Shield, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { mockPrologRules } from '@/data/prologRules';
import { useLogsStore } from '@/store/logsStore';
import { useAppStore } from '@/store/appStore';

export function SettingsPage() {
  const { addToast } = useToast();
  const setLogs = useLogsStore((s) => s.setLogs);
  const setAlerts = useLogsStore((s) => s.setAlerts);
  const setCsvLoaded = useAppStore((s) => s.setCsvLoaded);

  const handleResetData = async () => {
    let confirmed = true;
    try {
      confirmed = await window.confirm('¿Estás seguro? Se eliminarán los datos de la sesión actual y se reiniciará la base de conocimiento Prolog.');
    } catch {
      confirmed = true;
    }
    if (!confirmed) return;

    setLogs([]);
    setAlerts([]);
    setCsvLoaded(false);
    addToast({ type: 'success', title: 'Sesión limpiada', message: 'Los datos de la sesión actual fueron eliminados.' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Configuración del Sistema</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm font-medium">Reglas del Motor Prolog</CardTitle>
            </div>
            <CardDescription>Reglas lógicas activas para detección de amenazas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockPrologRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-start gap-3 rounded-lg border border-border/30 bg-muted/10 p-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono font-medium">{rule.name}</code>
                      <Badge
                        variant={rule.severity === 'critical' ? 'critical' : rule.severity === 'high' ? 'high' : rule.severity === 'medium' ? 'medium' : 'low'}
                        className="text-[9px] px-1.5"
                      >
                        {rule.severity}
                      </Badge>
                      <Badge variant="success" className="text-[9px] px-1.5">Activa</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
                    <code className="text-[10px] font-mono text-muted-foreground block mt-1 truncate">
                      {rule.condition}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 border-destructive/30 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <CardTitle className="text-sm font-medium">Restablecer Datos</CardTitle>
            </div>
            <CardDescription>Limpia los datos de la sesión actual</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Borra los datos cargados en la sesión actual. La base de conocimiento Prolog se reinicia automáticamente cada vez que el backend arranca.
            </p>
            <Button variant="destructive" size="sm" className="gap-2" onClick={handleResetData}>
              <Trash2 className="h-4 w-4" />
              Restablecer todo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}