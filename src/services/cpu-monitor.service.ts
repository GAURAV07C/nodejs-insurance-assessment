import os from "os";

import { logger } from "../config/logger";

export interface CpuMonitorOptions {
  threshold?: number;
  intervalMs?: number;
}

class CpuMonitorService {
  private threshold: number;
  private intervalMs: number;

  private timer?: NodeJS.Timeout;

  private isShuttingDown = false;

  constructor(options: CpuMonitorOptions = {}) {
    this.threshold = options.threshold ?? 70;
    this.intervalMs = options.intervalMs ?? 5000;
  }

  private getCpuSnapshot() {
    const cpus = os.cpus();

    let idle = 0;
    let total = 0;

    for (const cpu of cpus) {
      const times = cpu.times;

      idle += times.idle;

      total += times.user + times.nice + times.sys + times.irq + times.idle;
    }

    return {
      idle,
      total,
    };
  }

  private calculateCpuUsage(
    previous: ReturnType<CpuMonitorService["getCpuSnapshot"]>,
    current: ReturnType<CpuMonitorService["getCpuSnapshot"]>,
  ): number {
    const idleDifference = current.idle - previous.idle;

    const totalDifference = current.total - previous.total;

    if (totalDifference <= 0) {
      return 0;
    }

    const usage = 1 - idleDifference / totalDifference;

    return Number((usage * 100).toFixed(2));
  }

  public start(): void {
    if (this.timer) {
      return;
    }

    logger.info(`CPU monitor started. Threshold: ${this.threshold}%`);

    this.timer = setInterval(() => {
      void this.checkCpuUsage();
    }, this.intervalMs);
  }

  private async checkCpuUsage(): Promise<void> {
    const previous = this.getCpuSnapshot();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const current = this.getCpuSnapshot();

    const cpuUsage = this.calculateCpuUsage(previous, current);

    logger.info(`[CPU Monitor] CPU Usage: ${cpuUsage}%`);

    if (cpuUsage >= this.threshold && !this.isShuttingDown) {
      logger.warn(
        `[CPU Monitor] CPU usage ${cpuUsage}% exceeded threshold ${this.threshold}%`,
      );

      await this.gracefulShutdown();
    }
  }

  private async gracefulShutdown(): Promise<void> {
    this.isShuttingDown = true;

    this.stop();

    logger.warn("[CPU Monitor] Initiating graceful shutdown...");

    /*
     * Give the application/process a chance
     * to finish active work.
     */

    await new Promise((resolve) => setTimeout(resolve, 1000));

    process.exit(1);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    logger.info("[CPU Monitor] Stopped");
  }
}

export const cpuMonitor = new CpuMonitorService({
  threshold: 70,
  intervalMs: 5000,
});
