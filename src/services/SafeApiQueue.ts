import { SafeApiCommand } from "../commands/SafeApiCommand.js";

interface QueueConfig {
  maxConcurrent: number;
  rateLimit: number;
}

export class SafeApiQueue {
  private static instance: SafeApiQueue;
  private queue: Map<string, SafeApiCommand> = new Map();
  private processing = false;
  private activeCount = 0;
  private tokens: number;
  private lastRefill: number = Date.now();

  private constructor(private config: QueueConfig) {
    this.tokens = config.rateLimit;
  }

  static getInstance(): SafeApiQueue {
    if (!SafeApiQueue.instance) {
      SafeApiQueue.instance = new SafeApiQueue({
        maxConcurrent: 5,
        rateLimit: 5,
      });
    }
    return SafeApiQueue.instance;
  }

  addCommand(command: SafeApiCommand): void {
    const id = command.getId();
    if (!this.queue.has(id)) {
      this.queue.set(id, command);
      this.startProcessing();
    }
  }

  hasCommand(id: string): boolean {
    return this.queue.has(id);
  }

  private async startProcessing(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.size > 0 || this.activeCount > 0) {
      this.refillTokens();
      await this.processAvailableCommands();
      // To prevent CPU spinning
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    this.processing = false;
  }

  private async processAvailableCommands(): Promise<void> {
    while (
      this.queue.size > 0 &&
      this.tokens > 0 &&
      this.activeCount < this.config.maxConcurrent
    ) {
      const command = this.queue.values().next().value;
      this.queue.delete(command.getId());

      this.tokens--;
      this.activeCount++;

      this.executeCommand(command).finally(() => {
        this.activeCount--;
      });
    }
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const newTokens = Math.floor((timePassed / 1000) * this.config.rateLimit);

    this.tokens = Math.min(this.config.rateLimit, this.tokens + newTokens);
    this.lastRefill = now;
  }

  private async executeCommand(command: SafeApiCommand): Promise<void> {
    try {
      console.log(`Executing command: ${command.getId()}`);
      await command.execute();
    } catch (error) {
      console.error(`Failed to execute command: ${command.getId()}`, error);
    }
  }
}
