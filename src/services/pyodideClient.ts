import type { ExecutionResult, StaticAnalysisResult } from '../types';

type PendingResolver = {
  resolve: (val: unknown) => void;
  reject: (err: Error) => void;
};

class PyodideClient {
  private worker: Worker | null = null;
  private reqId = 0;
  private pending = new Map<number, PendingResolver>();
  private readyPromise: Promise<void> | null = null;

  private ensureWorker(): Worker {
    if (!this.worker) {
      // Cache-busted relative URL works cleanly on Apache subdirectories
      this.worker = new Worker('./pyodide-worker.js?v=9');
      this.worker.onmessage = (event) => {
        const { id, type, data, error } = event.data;
        const p = this.pending.get(id);
        if (!p) return;
        this.pending.delete(id);
        if (type === 'worker_error') {
          p.reject(new Error(error || 'Pyodide Worker Error'));
        } else {
          p.resolve(data);
        }
      };
      this.worker.onerror = (err) => {
        for (const [, p] of this.pending) {
          p.reject(new Error(err.message || 'Worker crashed'));
        }
        this.pending.clear();
      };
    }
    return this.worker;
  }

  public init(): Promise<void> {
    if (this.readyPromise) return this.readyPromise;
    this.readyPromise = new Promise<void>((resolve, reject) => {
      const w = this.ensureWorker();
      const id = ++this.reqId;
      this.pending.set(id, {
        resolve: () => resolve(),
        reject,
      });
      w.postMessage({ id, type: 'init' });
    });
    return this.readyPromise;
  }

  public async analyze(code: string): Promise<StaticAnalysisResult> {
    await this.init();
    return new Promise((resolve, reject) => {
      const w = this.ensureWorker();
      const id = ++this.reqId;
      this.pending.set(id, {
        resolve: (val) => resolve(val as StaticAnalysisResult),
        reject,
      });
      w.postMessage({ id, type: 'analyze', code });
    });
  }

  public async run(code: string, stdinLines: string[] = [], maxSteps = 600): Promise<ExecutionResult> {
    await this.init();
    return new Promise((resolve, reject) => {
      const w = this.ensureWorker();
      const id = ++this.reqId;
      this.pending.set(id, {
        resolve: (val) => resolve(val as ExecutionResult),
        reject,
      });
      w.postMessage({ id, type: 'run', code, stdinLines, maxSteps });
    });
  }
}

export const pyodideClient = new PyodideClient();
