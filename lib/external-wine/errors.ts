import { AppError } from "@/lib/errors";

export class ExternalWineNotConfiguredError extends AppError {
  constructor() {
    super("API de vinhos não configurada", 503);
    this.name = "ExternalWineNotConfiguredError";
  }
}

export class ExternalWineRateLimitError extends AppError {
  constructor() {
    super("Limite de consultas atingido. Tente novamente mais tarde.", 429);
    this.name = "ExternalWineRateLimitError";
  }
}

export class ExternalWineUnavailableError extends AppError {
  constructor() {
    super("Não foi possível buscar informações. Tente novamente.", 502);
    this.name = "ExternalWineUnavailableError";
  }
}
