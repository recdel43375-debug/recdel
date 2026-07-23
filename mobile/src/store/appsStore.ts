import { appsStorage } from './mmkv';
import type { MonitoredApp } from '../types/models';

const MONITORED_APPS_KEY = 'monitoredApps';

function readAll(): MonitoredApp[] {
  const raw = appsStorage.getString(MONITORED_APPS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MonitoredApp[];
  } catch {
    return [];
  }
}

function writeAll(apps: MonitoredApp[]) {
  appsStorage.set(MONITORED_APPS_KEY, JSON.stringify(apps));
}

export const appsStore = {
  getMonitoredApps: readAll,

  getMonitoredApp(packageName: string): MonitoredApp | undefined {
    return readAll().find((a) => a.packageName === packageName);
  },

  setMonitoredApps(packageNames: string[], resolve: (pkg: string) => Omit<MonitoredApp, 'packageName' | 'addedAt' | 'isMonitoring'>) {
    const existing = readAll();
    const existingByPkg = new Map(existing.map((a) => [a.packageName, a]));

    const next: MonitoredApp[] = packageNames.map((pkg) => {
      const prior = existingByPkg.get(pkg);
      if (prior) return prior;
      const meta = resolve(pkg);
      return {
        packageName: pkg,
        addedAt: Date.now(),
        isMonitoring: true,
        ...meta,
      };
    });

    writeAll(next);
    return next;
  },

  removeMonitoredApp(packageName: string) {
    writeAll(readAll().filter((a) => a.packageName !== packageName));
  },
};
