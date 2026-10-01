export class PhotoUnavailableError extends Error {
  constructor() {
    super("La estimación por foto no está disponible en esta versión.");
    this.name = "PhotoUnavailableError";
  }
}

export class EstimateValidationError extends Error {
  constructor(message = "El proveedor devolvió una respuesta que no se pudo validar.") {
    super(message);
    this.name = "EstimateValidationError";
  }
}
