// C:\sistemas\sicab\sicab-frontend\app\constants\estados.constant.ts

export interface ConstanteMetadata {
    id: number;
    abreviatura: string;
    prefijo: string | null;
    valor: number;
    descripcion: string;
    label?: string;
}

// ==========================================
// ESTADO
export enum Estado {
    ACTIVO = 1000,
    BORRADO = 1001,
    HISTORICO = 1002,
    ANULADO = 1003,
}

export const ESTADO_ACTIVO = Estado.ACTIVO;
export const ESTADO_HISTORICO = Estado.HISTORICO;
export const ESTADO_BORRADO = Estado.BORRADO;
export const ESTADO_ANULADO = Estado.ANULADO;

export const ESTADOS_CONSULTA = [
    Estado.ACTIVO,
    Estado.HISTORICO,
    Estado.ANULADO,
] as const;

export const ESTADOS_PERMITIDOS = [
    Estado.ACTIVO,
    Estado.BORRADO,
    Estado.HISTORICO,
    Estado.ANULADO,
] as const;

export const ESTADOS_VIVOS = [
    Estado.ACTIVO,
    Estado.HISTORICO
] as const;

export const ESTADOS_VIVOS_ESPECIAL = [
    Estado.ACTIVO,
    Estado.HISTORICO,
    Estado.ANULADO
] as const;

export const ESTADO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [Estado.ACTIVO]: {
        id: Estado.ACTIVO,
        abreviatura: 'ACTIVO',
        label: 'Activo',
        prefijo: null,
        valor: 0,
        descripcion: 'Registro operativo y vigente. Habilitado en combos y reportes operativos. Permite modificaciones y transiciona a BORRADO, HISTORICO o ANULADO. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [Estado.BORRADO]: {
        id: Estado.BORRADO,
        abreviatura: 'BORRADO',
        label: 'Borrado',
        prefijo: null,
        valor: 0,
        descripcion: 'Baja lógica definitiva e irreversible. Excluido de interfaces, reportes y cálculos. Requiere que sus dependencias estén borradas o históricas. Sin reactivación.',
    },
    [Estado.HISTORICO]: {
        id: Estado.HISTORICO,
        abreviatura: 'HISTORICO',
        label: 'Histórico',
        prefijo: null,
        valor: 0,
        descripcion: 'Registro inmutable al finalizar su ciclo operativo. Excluido de selects para evitar nuevas transacciones pero incluido en históricos. Reversible a ACTIVO por administración.',
    },
    [Estado.ANULADO]: {
        id: Estado.ANULADO,
        abreviatura: 'ANULADO',
        label: 'Anulado',
        prefijo: null,
        valor: 0,
        descripcion: 'Transacción abortada irreversible e inmutable. Uso exclusivo en las tablas kardex y control_facturas.',
    },
};

// ==========================================
// EVENTO
export enum Evento {
    COMPRA = 1050,
    VENTA = 1051,
    PROFORMA = 1052,
    EGRESO_TRASPASO = 1053,
    INGRESO_TRASPASO = 1054,
    ANULACION = 1055,
    AJUSTE_INGRESO = 1056,
    AJUSTE_EGRESO = 1057,
    SOLICITUD_COMPRA = 1058,
    VENTA_RESERVA = 1059,
    DEVOLUCION_CLIENTE = 1060,
    DEVOLUCION_PROVEEDOR = 1061,
    ROBO = 1062,
    PERDIDA_CADUCIDAD = 1063,
    MERMA_ROTURA = 1064,
    INVENTARIO_FISICO_SOBRANTE = 1065,
    INVENTARIO_FISICO_FALTANTE = 1066,
    CONVERSION_UNIDADES = 1067,
    RETIRO_CUARENTENA = 1068,
    INGRESO_DONACION = 1069,
    LIBERACION_RESERVA = 1070,
}

export const EVENTO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [Evento.COMPRA]: {
        id: Evento.COMPRA,
        abreviatura: 'COMPRA',
        label: 'Compra',
        prefijo: 'LOT',
        valor: 0,
        descripcion: 'Registro de ingreso de mercadería por compra a proveedor. Afecta positivamente el stock y genera cuentas por pagar. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [Evento.VENTA]: {
        id: Evento.VENTA,
        abreviatura: 'VENTA',
        label: 'Venta',
        prefijo: 'VEN',
        valor: 0,
        descripcion: 'Registro de salida de mercadería por venta a cliente. Afecta negativamente el stock, genera facturación y movimiento de caja.',
    },
    [Evento.PROFORMA]: {
        id: Evento.PROFORMA,
        abreviatura: 'PROFORMA',
        label: 'Proforma',
        prefijo: 'PRO',
        valor: 0,
        descripcion: 'Cotización o presupuesto temporal que NO afecta stock ni finanzas. Solo documento informativo o estimación de precios.',
    },
    [Evento.EGRESO_TRASPASO]: {
        id: Evento.EGRESO_TRASPASO,
        abreviatura: 'EGRESO_TRASPASO',
        label: 'Egreso de Traspaso',
        prefijo: 'EGR',
        valor: 0,
        descripcion: 'Egreso de mercadería desde sucursal origen hacia destino. Disminuye stock en origen hasta confirmación en destino.',
    },
    [Evento.INGRESO_TRASPASO]: {
        id: Evento.INGRESO_TRASPASO,
        abreviatura: 'INGRESO_TRASPASO',
        label: 'Ingreso de Traspaso',
        prefijo: 'ING',
        valor: 0,
        descripcion: 'Ingreso de mercadería a sucursal destino procedente de origen. Aumenta stock en destino al confirmar recepción.',
    },
    [Evento.ANULACION]: {
        id: Evento.ANULACION,
        abreviatura: 'ANULACION',
        label: 'Anulación',
        prefijo: 'ANU',
        valor: 0,
        descripcion: 'Cancelación de una transacción previa (compra o venta). Revierte automáticamente el stock afectado y deja registro inmutable para auditoría.',
    },
    [Evento.AJUSTE_INGRESO]: {
        id: Evento.AJUSTE_INGRESO,
        abreviatura: 'AJUSTE_INGRESO',
        label: 'Ajuste de Ingreso',
        prefijo: 'AJI',
        valor: 0,
        descripcion: 'Incremento de stock por sobrante detectado en inventario físico. No genera transacción comercial.',
    },
    [Evento.AJUSTE_EGRESO]: {
        id: Evento.AJUSTE_EGRESO,
        abreviatura: 'AJUSTE_EGRESO',
        label: 'Ajuste de Egreso',
        prefijo: 'AJE',
        valor: 0,
        descripcion: 'Decremento de stock por faltante detectado en inventario físico. No genera transacción comercial.',
    },
    [Evento.SOLICITUD_COMPRA]: {
        id: Evento.SOLICITUD_COMPRA,
        abreviatura: 'SOLICITUD_COMPRA',
        label: 'Solicitud de Compra',
        prefijo: 'SOL',
        valor: 0,
        descripcion: 'Pedido administrativo pendiente de aprobación. No afecta stock ni finanzas hasta su conversión a COMPRA (1050).',
    },
    [Evento.VENTA_RESERVA]: {
        id: Evento.VENTA_RESERVA,
        abreviatura: 'VENTA_RESERVA',
        label: 'Venta con Reserva',
        prefijo: 'VRE',
        valor: 0,
        descripcion: 'Proforma con reserva temporal de stock por tiempo limitado. Afecta negativamente el stock (lo aparta) y puede convertirse en VENTA (1051). Requiere validez_dias para definir plazo de reserva.',
    },
    [Evento.DEVOLUCION_CLIENTE]: {
        id: Evento.DEVOLUCION_CLIENTE,
        abreviatura: 'DEVOLUCION_CLIENTE',
        label: 'Devolución de Cliente',
        prefijo: 'DCLI',
        valor: 0,
        descripcion: 'Devolución de mercadería por parte del cliente. Afecta positivamente el stock y requiere nota de crédito/débito fiscal si aplica.',
    },
    [Evento.DEVOLUCION_PROVEEDOR]: {
        id: Evento.DEVOLUCION_PROVEEDOR,
        abreviatura: 'DEVOLUCION_PROVEEDOR',
        label: 'Devolución a Proveedor',
        prefijo: 'DPRO',
        valor: 0,
        descripcion: 'Devolución de mercadería defectuosa o próxima a vencer al proveedor. Disminuye el stock y ajusta cuentas por pagar.',
    },
    [Evento.ROBO]: {
        id: Evento.ROBO,
        abreviatura: 'ROBO',
        label: 'Robo',
        prefijo: 'ROB',
        valor: 0,
        descripcion: 'Salida extraordinaria de inventario por sustracción o robo detectado. Disminuye el stock sin contrapartida comercial y genera alerta de auditoría.',
    },
    [Evento.PERDIDA_CADUCIDAD]: {
        id: Evento.PERDIDA_CADUCIDAD,
        abreviatura: 'PERDIDA_CADUCIDAD',
        label: 'Pérdida por Caducidad',
        prefijo: 'PCAD',
        valor: 0,
        descripcion: 'Baja de stock por productos vencidos o caducados detectados en control de almacén. Afecta como pérdida operativa.',
    },
    [Evento.MERMA_ROTURA]: {
        id: Evento.MERMA_ROTURA,
        abreviatura: 'MERMA_ROTURA',
        label: 'Merma o Rotura',
        prefijo: 'MER',
        valor: 0,
        descripcion: 'Salida de stock por daño físico, rotura o deterioro de medicamentos. No genera transacción comercial.',
    },
    [Evento.INVENTARIO_FISICO_SOBRANTE]: {
        id: Evento.INVENTARIO_FISICO_SOBRANTE,
        abreviatura: 'INVENTARIO_FISICO_SOBRANTE',
        label: 'Inventario Físico Sobrante',
        prefijo: 'IFSO',
        valor: 0,
        descripcion: 'Ajuste positivo por conteo físico de inventario (diferencia a favor respecto al sistema).',
    },
    [Evento.INVENTARIO_FISICO_FALTANTE]: {
        id: Evento.INVENTARIO_FISICO_FALTANTE,
        abreviatura: 'INVENTARIO_FISICO_FALTANTE',
        label: 'Inventario Físico Faltante',
        prefijo: 'IFFAL',
        valor: 0,
        descripcion: 'Ajuste negativo por conteo físico de inventario (diferencia en contra o merma no identificada).',
    },
    [Evento.CONVERSION_UNIDADES]: {
        id: Evento.CONVERSION_UNIDADES,
        abreviatura: 'CONVERSION_UNIDADES',
        label: 'Conversión de Unidades',
        prefijo: 'CENV',
        valor: 0,
        descripcion: 'Salida de productos en empaque mayor (cajas/blísteres) y reingreso automático como unidades sueltas por fraccionamiento.',
    },
    [Evento.RETIRO_CUARENTENA]: {
        id: Evento.RETIRO_CUARENTENA,
        abreviatura: 'RETIRO_CUARENTENA',
        label: 'Retiro a Cuarentena',
        prefijo: 'RCUA',
        valor: 0,
        descripcion: 'Salida temporal o definitiva de stock retenido por alerta sanitaria o control de calidad. Bloquea o saca la mercadería de la disponibilidad comercial.',
    },
    [Evento.INGRESO_DONACION]: {
        id: Evento.INGRESO_DONACION,
        abreviatura: 'INGRESO_DONACION',
        label: 'Ingreso por Donación',
        prefijo: 'DON',
        valor: 0,
        descripcion: 'Ingreso de mercadería por donación o recepción sin costo. Afecta positivamente el stock sin generar obligación de pago.',
    },
    [Evento.LIBERACION_RESERVA]: {
        id: Evento.LIBERACION_RESERVA,
        abreviatura: 'LIBERACION_RESERVA',
        label: 'Liberación de Reserva',
        prefijo: 'LRES',
        valor: 0,
        descripcion: 'Liberación de stock retenido por expiración de tiempo o anulación de reserva. Reintegra el stock disponible.',
    },
};

// ==========================================
// TIPO COMPROBANTE
export enum TipoComprobante {
    FACTURA = 1100,
    RECIBO = 1101,
    OTRO = 1102,
    NINGUNO = 1103,
}

export const TIPO_COMPROBANTE_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoComprobante.FACTURA]: {
        id: TipoComprobante.FACTURA,
        abreviatura: 'FACTURA',
        label: 'Factura',
        prefijo: null,
        valor: 0,
        descripcion: 'Documento fiscal oficial emitido por el SIN. Genera obligación tributaria y derecho a crédito fiscal. Utilizado en ventas formales que requieren comprobante fiscal.',
        es_defecto: true,
    },
    [TipoComprobante.RECIBO]: {
        id: TipoComprobante.RECIBO,
        abreviatura: 'RECIBO',
        label: 'Recibo',
        prefijo: null,
        valor: 0,
        descripcion: 'Documento interno de pago sin valor fiscal. Utilizado para comprobantes de pago, abonos parciales o registro de ingresos/egresos operativos.',
    },
    [TipoComprobante.OTRO]: {
        id: TipoComprobante.OTRO,
        abreviatura: 'OTRO',
        label: 'Otro',
        prefijo: null,
        valor: 0,
        descripcion: 'Comprobante no clasificado en las categorías anteriores. Utilizado para documentos especiales o casos excepcionales.',
    },
    [TipoComprobante.NINGUNO]: {
        id: TipoComprobante.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin comprobante fiscal definido. CONSTANTE POR DEFECTO.',
    },
};

// ==========================================
// TIPO CLIENTE
export enum TipoCliente {
    NATURAL = 1150,
    JURIDICA = 1151,
}

export const TIPO_CLIENTE_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoCliente.NATURAL]: {
        id: TipoCliente.NATURAL,
        abreviatura: 'NATURAL',
        label: 'Natural',
        prefijo: null,
        valor: 0,
        descripcion: 'Persona física individual. Requiere documento de identidad (CI, CEX, Pasaporte) para facturación. Puede tener límite de crédito personal. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoCliente.JURIDICA]: {
        id: TipoCliente.JURIDICA,
        abreviatura: 'JURIDICA',
        label: 'Jurídica',
        prefijo: null,
        valor: 0,
        descripcion: 'Persona jurídica, empresa o institución. Requiere NIT y razón social obligatoria para facturación. Puede tener límite de crédito corporativo y condiciones especiales de pago.',
    },
};

// ==========================================
// GENERO
export enum Genero {
    MASCULINO = 1200,
    FEMENINO = 1201,
}

export const GENERO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [Genero.MASCULINO]: {
        id: Genero.MASCULINO,
        abreviatura: 'MASCULINO',
        label: 'Masculino',
        prefijo: null,
        valor: 0,
        descripcion: 'Género masculino. Utilizado en trabajadores y clientes. Determina el conjunto de estados civiles disponibles (1250-1254). CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [Genero.FEMENINO]: {
        id: Genero.FEMENINO,
        abreviatura: 'FEMENINO',
        label: 'Femenino',
        prefijo: null,
        valor: 0,
        descripcion: 'Género femenino. Utilizado en trabajadores y clientes. Determina el conjunto de estados civiles disponibles (1300-1304).',
    },
};

// ==========================================
// ESTADO CIVIL MASCULINO
export enum EstadoCivilMasculino {
    SOLTERO = 1250,
    CASADO = 1251,
    DIVORCIADO = 1252,
    VIUDO = 1253,
    UNION_LIBRE = 1254,
}

export const ESTADO_CIVIL_MASCULINO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoCivilMasculino.SOLTERO]: {
        id: EstadoCivilMasculino.SOLTERO,
        abreviatura: 'SOLTERO',
        label: 'Soltero',
        prefijo: null,
        valor: 0,
        descripcion: 'Estado civil soltero para género masculino. Aplica a trabajadores y clientes de sexo masculino que no tienen vínculo conyugal legal. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoCivilMasculino.CASADO]: {
        id: EstadoCivilMasculino.CASADO,
        abreviatura: 'CASADO',
        label: 'Casado',
        prefijo: null,
        valor: 0,
        descripcion: 'Estado civil casado para género masculino. Aplica a trabajadores y clientes de sexo masculino que tienen vínculo conyugal legal registrado.',
    },
    [EstadoCivilMasculino.DIVORCIADO]: {
        id: EstadoCivilMasculino.DIVORCIADO,
        abreviatura: 'DIVORCIADO',
        label: 'Divorciado',
        prefijo: null,
        valor: 0,
        descripcion: 'Estado civil divorciado para género masculino. Aplica a trabajadores y clientes de sexo masculino que han disuelto legalmente su vínculo conyugal.',
    },
    [EstadoCivilMasculino.VIUDO]: {
        id: EstadoCivilMasculino.VIUDO,
        abreviatura: 'VIUDO',
        label: 'Viudo',
        prefijo: null,
        valor: 0,
        descripcion: 'Estado civil viudo para género masculino. Aplica a trabajadores y clientes de sexo masculino cuyo cónyuge ha fallecido.',
    },
    [EstadoCivilMasculino.UNION_LIBRE]: {
        id: EstadoCivilMasculino.UNION_LIBRE,
        abreviatura: 'UNION_LIBRE',
        label: 'Unión Libre',
        prefijo: null,
        valor: 0,
        descripcion: 'Unión libre o de hecho para género masculino. Aplica a trabajadores y clientes de sexo masculino que conviven en pareja sin vínculo matrimonial legal.',
    },
};

// ==========================================
// ESTADO CIVIL FEMENINO
export enum EstadoCivilFemenino {
    SOLTERA = 1300,
    CASADA = 1301,
    DIVORCIADA = 1302,
    VIUDA = 1303,
    UNION_LIBRE = 1304,
}

export const ESTADO_CIVIL_FEMENINO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoCivilFemenino.SOLTERA]: {
        id: EstadoCivilFemenino.SOLTERA,
        abreviatura: 'SOLTERA',
        label: 'Soltera',
        prefijo: null,
        valor: 0,
        descripcion: 'Estado civil soltera para género femenino. Aplica a trabajadoras y clientas de sexo femenino que no tienen vínculo conyugal legal. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoCivilFemenino.CASADA]: {
        id: EstadoCivilFemenino.CASADA,
        abreviatura: 'CASADA',
        label: 'Casada',
        prefijo: null,
        valor: 0,
        descripcion: 'Estado civil casada para género femenino. Aplica a trabajadoras y clientas de sexo femenino que tienen vínculo conyugal legal registrado.',
    },
    [EstadoCivilFemenino.DIVORCIADA]: {
        id: EstadoCivilFemenino.DIVORCIADA,
        abreviatura: 'DIVORCIADA',
        label: 'Divorciada',
        prefijo: null,
        valor: 0,
        descripcion: 'Estado civil divorciada para género femenino. Aplica a trabajadoras y clientas de sexo femenino que han disuelto legalmente su vínculo conyugal.',
    },
    [EstadoCivilFemenino.VIUDA]: {
        id: EstadoCivilFemenino.VIUDA,
        abreviatura: 'VIUDA',
        label: 'Viuda',
        prefijo: null,
        valor: 0,
        descripcion: 'Estado civil viuda para género femenino. Aplica a trabajadoras y clientas de sexo femenino cuyo cónyuge ha fallecido.',
    },
    [EstadoCivilFemenino.UNION_LIBRE]: {
        id: EstadoCivilFemenino.UNION_LIBRE,
        abreviatura: 'UNION_LIBRE',
        label: 'Unión Libre',
        prefijo: null,
        valor: 0,
        descripcion: 'Unión libre o de hecho para género femenino. Aplica a trabajadoras y clientas de sexo femenino que conviven en pareja sin vínculo matrimonial legal.',
    },
};

// ==========================================
// TIPO VENTA
export enum TipoVenta {
    NINGUNO = 1350,
    CON_FACTURA = 1351,
    SIN_FACTURA = 1352,
}

export const TIPO_VENTA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoVenta.NINGUNO]: {
        id: TipoVenta.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'NIN',
        valor: 0,
        descripcion: 'Sin tipo de venta definido. Utilizado exclusivamente en transacciones de compra a proveedores, proformas y ajustes de inventario. No aplica a ventas a clientes. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoVenta.CON_FACTURA]: {
        id: TipoVenta.CON_FACTURA,
        abreviatura: 'CON_FACTURA',
        label: 'Con Factura',
        prefijo: 'CF',
        valor: 0,
        descripcion: 'Venta formal con emisión de factura fiscal. Genera documento válido ante el SIN, permite crédito fiscal al cliente y debe estar asociada a una dosificación vigente en facturas.',
    },
    [TipoVenta.SIN_FACTURA]: {
        id: TipoVenta.SIN_FACTURA,
        abreviatura: 'SIN_FACTURA',
        label: 'Sin Factura',
        prefijo: 'SF',
        valor: 0,
        descripcion: 'Venta sin emisión de factura fiscal. Utilizada para ventas de mostrador, ventas a consumidor final sin exigencia de factura o transacciones que no requieren comprobante fiscal. No genera crédito fiscal.',
    },
};

// ==========================================
// TIPO PAGO
export enum TipoPago {
    NINGUNO = 1400,
    EFECTIVO = 1401,
    TARJETA = 1402,
    CHEQUE = 1403,
    VALE = 1404,
    OTRO = 1405,
    SIN_PAGO = 1406,
    TRANSFERENCIA = 1407,
    DEPOSITO = 1408,
    QR = 1409,
}

export const TIPO_PAGO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoPago.NINGUNO]: {
        id: TipoPago.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'NIN',
        valor: 0,
        descripcion: 'Sin medio de pago definido. Utilizado exclusivamente en transacciones que no involucran cobro o pago (compras, proformas, ajustes de inventario, traspasos). No aplica para ventas a clientes. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoPago.EFECTIVO]: {
        id: TipoPago.EFECTIVO,
        abreviatura: 'EFECTIVO',
        label: 'Efectivo',
        prefijo: 'EF',
        valor: 1,
        descripcion: 'Pago en efectivo en moneda local o extranjera. Aplica para ventas de mostrador y cobros inmediatos. No requiere verificación bancaria ni comprobante digital adicional.',
    },
    [TipoPago.TARJETA]: {
        id: TipoPago.TARJETA,
        abreviatura: 'TARJETA',
        label: 'Tarjeta',
        prefijo: 'TA',
        valor: 2,
        descripcion: 'Pago mediante tarjeta.',
    },
    [TipoPago.CHEQUE]: {
        id: TipoPago.CHEQUE,
        abreviatura: 'CHEQUE',
        label: 'Cheque',
        prefijo: 'CH',
        valor: 3,
        descripcion: 'Pago mediante cheque bancario. Requiere verificación de fondos y autorización previa. Debe registrarse número de cheque, banco emisor y fecha de cobro. Aplica para ventas a empresas o clientes con convenio.',
    },
    [TipoPago.VALE]: {
        id: TipoPago.VALE,
        abreviatura: 'VALE',
        label: 'Vale',
        prefijo: 'VL',
        valor: 4,
        descripcion: 'Pago mediante vale.',
    },
    [TipoPago.OTRO]: {
        id: TipoPago.OTRO,
        abreviatura: 'OTRO',
        label: 'Otro',
        prefijo: 'OT',
        valor: 5,
        descripcion: 'Otros medio de pago no contemplado en la lista. Requiere descripción detallada en el campo observaciones. Aplica para casos excepcionales, vales de salud, bonos o pagos en especie.',
    },
    [TipoPago.SIN_PAGO]: {
        id: TipoPago.SIN_PAGO,
        abreviatura: 'SIN_PAGO',
        label: 'Sin Pago',
        prefijo: 'SP',
        valor: 6,
        descripcion: 'Sin Pago.',
    },
    [TipoPago.TRANSFERENCIA]: {
        id: TipoPago.TRANSFERENCIA,
        abreviatura: 'TRANSFERENCIA',
        label: 'Transferencia',
        prefijo: 'TR',
        valor: 7,
        descripcion: 'Pago mediante transferencia bancaria (electrónica o ventanilla). Requiere comprobante de transferencia para validación. Aplica para pagos interbancarios, ventas corporativas o clientes a distancia.',
    },
    [TipoPago.DEPOSITO]: {
        id: TipoPago.DEPOSITO,
        abreviatura: 'DEPOSITO',
        label: 'Depósito',
        prefijo: 'DP',
        valor: 8,
        descripcion: 'Pago mediante depósito en cuenta bancaria de la empresa. Requiere comprobante de depósito obligatorio (voucher o captura). Aplica para pagos en ventanilla, convenios con aseguradoras o clientes sin acceso a transferencia.',
    },
    [TipoPago.QR]: {
        id: TipoPago.QR,
        abreviatura: 'QR',
        label: 'QR',
        prefijo: 'QR',
        valor: 9,
        descripcion: 'Pago mediante código QR a través de plataformas de pago (SIN, QRs, Yape, etc.). Genera comprobante digital automático. Aplica para pagos electrónicos rápidos.',
    },
};

// ==========================================
// TIPO MODELO
export enum TipoModelo {
    ARIMA = 1450,
    SARIMA = 1451,
    SERIES_TEMPORALES = 1452,
    CLASIFICACION = 1453,
    OPTIMIZACION = 1454,
    DETECCION_ANOMALIAS = 1455,
    NINGUNO = 1456,
}

export const TIPO_MODELO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoModelo.ARIMA]: {
        id: TipoModelo.ARIMA,
        abreviatura: 'ARIMA',
        label: 'ARIMA',
        prefijo: null,
        valor: 0,
        descripcion: 'Modelo ARIMA (Autoregressive Integrated Moving Average) para pronóstico de demanda de productos sin componente estacional significativa. Aplica para productos de consumo regular y estable.',
    },
    [TipoModelo.SARIMA]: {
        id: TipoModelo.SARIMA,
        abreviatura: 'SARIMA',
        label: 'SARIMA',
        prefijo: null,
        valor: 0,
        descripcion: 'Modelo SARIMA (Seasonal ARIMA) para pronóstico de demanda con componente estacional semanal, mensual o anual. Aplica para productos con patrones estacionales (alergias, gripes, vacaciones).',
    },
    [TipoModelo.SERIES_TEMPORALES]: {
        id: TipoModelo.SERIES_TEMPORALES,
        abreviatura: 'SERIES_TEMPORALES',
        label: 'Series Temporales',
        prefijo: null,
        valor: 0,
        descripcion: 'Modelo genérico de series temporales para análisis de tendencias y patrones de consumo. Utilizado como base para otros modelos más específicos.',
    },
    [TipoModelo.CLASIFICACION]: {
        id: TipoModelo.CLASIFICACION,
        abreviatura: 'CLASIFICACION',
        label: 'Clasificación',
        prefijo: null,
        valor: 0,
        descripcion: 'Modelo de clasificación para segmentación de productos, clientes o proveedores. Incluye técnicas como K-Means, ABC, RFM y clustering jerárquico.',
    },
    [TipoModelo.OPTIMIZACION]: {
        id: TipoModelo.OPTIMIZACION,
        abreviatura: 'OPTIMIZACION',
        label: 'Optimización',
        prefijo: null,
        valor: 0,
        descripcion: 'Modelo de optimización para cálculo de niveles óptimos de inventario, puntos de reorden (ROP), stock de seguridad y cantidades económicas de pedido (EOQ).',
    },
    [TipoModelo.DETECCION_ANOMALIAS]: {
        id: TipoModelo.DETECCION_ANOMALIAS,
        abreviatura: 'DETECCION_ANOMALIAS',
        label: 'Detección de Anomalías',
        prefijo: null,
        valor: 0,
        descripcion: 'Modelo para detección de anomalías en patrones de consumo, ventas y stock. Identifica comportamientos atípicos, fraudes y errores operativos.',
    },
    [TipoModelo.NINGUNO]: {
        id: TipoModelo.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin modelo definido. Para productos o módulos que no requieren análisis predictivo o no tienen datos suficientes. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// TIPO BENEFICIO
export enum TipoBeneficio {
    DESCUENTO = 1500,
    PORCENTAJE = 1501,
    MONTO_FIJO = 1502,
    CANTIDAD = 1503,
    NINGUNO = 1504,
}

export const TIPO_BENEFICIO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoBeneficio.DESCUENTO]: {
        id: TipoBeneficio.DESCUENTO,
        abreviatura: 'DESCUENTO',
        label: 'Descuento',
        prefijo: null,
        valor: 0,
        descripcion: 'Beneficio genérico que agrupa diferentes tipos de descuentos. Utilizado como categoría superior para promociones que reducen el precio final del producto.',
    },
    [TipoBeneficio.PORCENTAJE]: {
        id: TipoBeneficio.PORCENTAJE,
        abreviatura: 'PORCENTAJE',
        label: 'Porcentaje',
        prefijo: null,
        valor: 0,
        descripcion: 'Descuento porcentual sobre el precio de venta del producto. Fórmula: PrecioFinal = PrecioBase * (1 - ValorBeneficio/100). Aplica para promociones por temporada o liquidación.',
    },
    [TipoBeneficio.MONTO_FIJO]: {
        id: TipoBeneficio.MONTO_FIJO,
        abreviatura: 'MONTO_FIJO',
        label: 'Monto Fijo',
        prefijo: null,
        valor: 0,
        descripcion: 'Descuento de monto fijo en moneda local sobre el precio del producto. Fórmula: PrecioFinal = PrecioBase - ValorBeneficio. Aplica para promociones por volumen o cupones de descuento.',
    },
    [TipoBeneficio.CANTIDAD]: {
        id: TipoBeneficio.CANTIDAD,
        abreviatura: 'CANTIDAD',
        label: 'Cantidad',
        prefijo: null,
        valor: 0,
        descripcion: 'Descuento basado en cantidad de unidades adquiridas (ej. 2x1, 3x2). Fórmula: Se aplica sobre la cantidad total del ítem. Aplica para promociones de incentivo por volumen.',
    },
    [TipoBeneficio.NINGUNO]: {
        id: TipoBeneficio.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin beneficio o promoción definida. Para productos sin oferta activa o cuando no se aplica descuento. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// ESTADO PRONOSTICO
export enum EstadoPronostico {
    PENDIENTE = 1550,
    PROCESADO = 1551,
    ERROR = 1552,
    NINGUNO = 1553,
}

export const ESTADO_PRONOSTICO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoPronostico.PENDIENTE]: {
        id: EstadoPronostico.PENDIENTE,
        abreviatura: 'PENDIENTE',
        label: 'Pendiente',
        prefijo: null,
        valor: 0,
        descripcion: 'Pronóstico en cola de espera para procesamiento. El modelo aún no ha generado la predicción. Aplica para solicitudes de pronóstico recién creadas o en espera de ejecución.',
    },
    [EstadoPronostico.PROCESADO]: {
        id: EstadoPronostico.PROCESADO,
        abreviatura: 'PROCESADO',
        label: 'Procesado',
        prefijo: null,
        valor: 0,
        descripcion: 'Pronóstico completado exitosamente. El modelo generó la predicción y los resultados están disponibles en analitica_productos. Aplica para pronósticos que finalizaron sin errores.',
    },
    [EstadoPronostico.ERROR]: {
        id: EstadoPronostico.ERROR,
        abreviatura: 'ERROR',
        label: 'Error',
        prefijo: null,
        valor: 0,
        descripcion: 'Pronóstico fallido por error en el procesamiento. Puede deberse a datos insuficientes, errores en el modelo o fallos técnicos. Requiere revisión manual y posible reentrenamiento.',
    },
    [EstadoPronostico.NINGUNO]: {
        id: EstadoPronostico.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin estado de pronóstico definido. Para productos que no han sido procesados por el motor de IA o que no requieren pronóstico. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// TEMPORADA
export enum Temporada {
    NINGUNO = 1600,
    ALTA = 1601,
    MEDIA = 1602,
    BAJA = 1603,
}

export const TEMPORADA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [Temporada.NINGUNO]: {
        id: Temporada.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin temporada definida o período transicional sin estacionalidad marcada. Para productos con demanda constante o cuando no hay datos suficientes para clasificar. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [Temporada.ALTA]: {
        id: Temporada.ALTA,
        abreviatura: 'ALTA',
        label: 'Alta',
        prefijo: null,
        valor: 0,
        descripcion: 'Temporada de demanda alta con incremento significativo en ventas. Aplica en períodos de enfermedades estacionales (gripe, alergias, dengue), eventos especiales o campañas promocionales intensivas.',
    },
    [Temporada.MEDIA]: {
        id: Temporada.MEDIA,
        abreviatura: 'MEDIA',
        label: 'Media',
        prefijo: null,
        valor: 0,
        descripcion: 'Temporada de demanda media o regular con comportamiento estable dentro de los patrones normales. Aplica en períodos intermedios sin picos ni caídas significativas.',
    },
    [Temporada.BAJA]: {
        id: Temporada.BAJA,
        abreviatura: 'BAJA',
        label: 'Baja',
        prefijo: null,
        valor: 0,
        descripcion: 'Temporada de demanda baja con decremento notable en ventas. Aplica en períodos de baja incidencia de enfermedades, vacaciones o cuando el consumo disminuye estacionalmente.',
    },
};

// ==========================================
// CATEGORIA (Licencia de Conducir)
export enum CategoriaLicencia {
    NINGUNO = 1650,
    CATEGORIA_P = 1651,
    CATEGORIA_A = 1652,
    CATEGORIA_B = 1653,
    CATEGORIA_C = 1654,
}

export const CATEGORIA_LICENCIA_METADATA: Record<CategoriaLicencia, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [CategoriaLicencia.NINGUNO]: {
        id: CategoriaLicencia.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin categoría de licencia definida. Utilizado para personal administrativo o trabajadores que no requieren conducir unidades. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [CategoriaLicencia.CATEGORIA_P]: {
        id: CategoriaLicencia.CATEGORIA_P,
        abreviatura: 'CATEGORIA_P',
        label: 'Categoría P',
        prefijo: 'P',
        valor: 1,
        descripcion: 'Licencia Categoría Particular. Habilita para la conducción de vehículos livianos particulares según la normativa de tránsito local.',
    },
    [CategoriaLicencia.CATEGORIA_A]: {
        id: CategoriaLicencia.CATEGORIA_A,
        abreviatura: 'CATEGORIA_A',
        label: 'Categoría A',
        prefijo: 'A',
        valor: 2,
        descripcion: 'Licencia Categoría Profesional A. Autoriza la conducción de vehículos de servicio público liviano (taxis y afines).',
    },
    [CategoriaLicencia.CATEGORIA_B]: {
        id: CategoriaLicencia.CATEGORIA_B,
        abreviatura: 'CATEGORIA_B',
        label: 'Categoría B',
        prefijo: 'B',
        valor: 3,
        descripcion: 'Licencia Categoría Profesional B. Habilita para la conducción de vehículos de transporte de mayor capacidad o carga intermedia.',
    },
    [CategoriaLicencia.CATEGORIA_C]: {
        id: CategoriaLicencia.CATEGORIA_C,
        abreviatura: 'CATEGORIA_C',
        label: 'Categoría C',
        prefijo: 'C',
        valor: 4,
        descripcion: 'Licencia Categoría Profesional C (como se observa en la ficha del conductor). Habilita para la conducción de vehículos pesados y de transporte especializado.',
    },
};

// ==========================================
// TIPO ALMACEN
export enum TipoAlmacen {
    NORMAL = 1700,
    REFRIGERADO = 1701,
    CONGELADO = 1702,
    ESPECIAL = 1703,
    TRANSITO = 1704,
    MATERIAL_MEDICO = 1705,
    COSMETICA = 1706,
    ALIMENTOS = 1707,
    MATERIA_PRIMA = 1708,
    RECEPCION = 1709,
    DEVOLUCIONES = 1710,
    DESPACHO = 1711,
    CUARENTENA = 1712,
}

export const TIPOS_ALMACEN_VENTA_DIRECTA = [
    TipoAlmacen.NORMAL,
    TipoAlmacen.REFRIGERADO,
    TipoAlmacen.CONGELADO,
    TipoAlmacen.ESPECIAL,
    TipoAlmacen.MATERIAL_MEDICO,
    TipoAlmacen.COSMETICA,
    TipoAlmacen.ALIMENTOS,
    TipoAlmacen.MATERIA_PRIMA,
] as const;

export const TIPOS_ALMACEN_LOGISTICA_INTERNA = [
    TipoAlmacen.TRANSITO,
	TipoAlmacen.RECEPCION,
	TipoAlmacen.DEVOLUCIONES,
	TipoAlmacen.DESPACHO,
	TipoAlmacen.CUARENTENA,
] as const;

export const TIPO_ALMACEN_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoAlmacen.NORMAL]: {
        id: TipoAlmacen.NORMAL,
        abreviatura: 'NORMAL',
        label: 'Normal',
        prefijo: null,
        valor: 0,
        descripcion: 'Almacén de temperatura ambiente, para productos que no requieren condiciones especiales de conservación. Aplica para la mayoría de medicamentos de venta libre y productos de consumo regular. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoAlmacen.REFRIGERADO]: {
        id: TipoAlmacen.REFRIGERADO,
        abreviatura: 'REFRIGERADO',
        label: 'Refrigerado',
        prefijo: null,
        valor: 0,
        descripcion: 'Almacén refrigerado con temperatura controlada. Para vacunas, insulinas, biológicos y medicamentos termolábiles que requieren cadena de frío.',
    },
    [TipoAlmacen.CONGELADO]: {
        id: TipoAlmacen.CONGELADO,
        abreviatura: 'CONGELADO',
        label: 'Congelado',
        prefijo: null,
        valor: 0,
        descripcion: 'Almacén congelado con temperatura controlada. Para productos biológicos, hemoderivados y medicamentos que requieren congelación profunda para su conservación.',
    },
    [TipoAlmacen.ESPECIAL]: {
        id: TipoAlmacen.ESPECIAL,
        abreviatura: 'ESPECIAL',
        label: 'Especial',
        prefijo: null,
        valor: 0,
        descripcion: 'Almacén de alta seguridad para productos controlados (psicotrópicos, estupefacientes, sustancias fiscalizadas).',
    },
    [TipoAlmacen.TRANSITO]: {
        id: TipoAlmacen.TRANSITO,
        abreviatura: 'TRANSITO',
        label: 'Tránsito',
        prefijo: null,
        valor: 0,
        descripcion: 'Almacén temporal para mercadería en tránsito entre sucursales o en proceso de distribución. Productos con estado de "en movimiento" que no están disponibles para venta hasta su recepción en destino.',
    },
    [TipoAlmacen.MATERIAL_MEDICO]: {
        id: TipoAlmacen.MATERIAL_MEDICO,
        abreviatura: 'MATERIAL_MEDICO',
        label: 'Material Médico',
        prefijo: null,
        valor: 0,
        descripcion: 'Almacén para material médico-quirúrgico, dispositivos médicos, insumos descartables (jeringas, guantes, gasas) y equipos de diagnóstico. No requiere condiciones especiales de temperatura.',
    },
    [TipoAlmacen.COSMETICA]: {
        id: TipoAlmacen.COSMETICA,
        abreviatura: 'COSMETICA',
        label: 'Cosmética',
        prefijo: null,
        valor: 0,
        descripcion: 'Almacén para productos cosméticos, de cuidado personal, higiene y belleza. Incluye cremas, lociones, shampoos, perfumes y productos de maquillaje.',
    },
    [TipoAlmacen.ALIMENTOS]: {
        id: TipoAlmacen.ALIMENTOS,
        abreviatura: 'ALIMENTOS',
        label: 'Alimentos',
        prefijo: null,
        valor: 0,
        descripcion: 'Almacén para suplementos nutricionales, alimentos funcionales, vitaminas, minerales y productos dietéticos. Requiere condiciones de humedad controlada y protección contra contaminación cruzada.',
    },
    [TipoAlmacen.MATERIA_PRIMA]: {
        id: TipoAlmacen.MATERIA_PRIMA,
        abreviatura: 'MATERIA_PRIMA',
        label: 'Materia Prima',
        prefijo: null,
        valor: 0,
        descripcion: 'Almacén para materias primas utilizadas en farmacia magistral o preparación de fórmulas personalizadas. Incluye principios activos, excipientes, vehículos y materiales de acondicionamiento.',
    },
    [TipoAlmacen.RECEPCION]: {
        id: TipoAlmacen.RECEPCION,
        abreviatura: 'RECEPCION',
        label: 'Recepción',
        prefijo: null,
        valor: 0,
        descripcion: 'Área de recepción de mercadería y control de calidad. Zona de tránsito para productos que ingresan al sistema, pendientes de verificación, conteo y asignación a su almacén definitivo.',
    },
    [TipoAlmacen.DEVOLUCIONES]: {
        id: TipoAlmacen.DEVOLUCIONES,
        abreviatura: 'DEVOLUCIONES',
        label: 'Devoluciones',
        prefijo: null,
        valor: 0,
        descripcion: 'Área para productos en proceso de devolución a proveedores o clientes. Incluye productos defectuosos, vencidos, dañados o en espera de gestión de devolución.',
    },
    [TipoAlmacen.DESPACHO]: {
        id: TipoAlmacen.DESPACHO,
        abreviatura: 'DESPACHO',
        label: 'Despacho',
        prefijo: null,
        valor: 0,
        descripcion: 'Área de despacho, consolidación de pedidos y preparación de entregas. Productos que han sido seleccionados (picking) y están listos para distribución a clientes o traslado entre sucursales.',
    },
    [TipoAlmacen.CUARENTENA]: {
        id: TipoAlmacen.CUARENTENA,
        abreviatura: 'CUARENTENA',
        label: 'Cuarentena',
        prefijo: null,
        valor: 0,
        descripcion: 'Área de cuarentena sanitaria para productos en revisión, análisis o evaluación. Incluye productos sospechosos de contaminación, lotes en investigación o productos pendientes de liberación por control de calidad.',
    },
};

export const TIPOS_ALMACEN_VENTA_DIRECTA_METADATA = Object.fromEntries(TIPOS_ALMACEN_VENTA_DIRECTA.map(id => [id, TIPO_ALMACEN_METADATA[id]]));
export const TIPOS_ALMACEN_LOGISTICA_INTERNA_METADATA = Object.fromEntries(TIPOS_ALMACEN_LOGISTICA_INTERNA.map(id => [id, TIPO_ALMACEN_METADATA[id]]));

// ==========================================
// TIPO CUENTA
export enum TipoCuenta {
    CUENTA_CORRIENTE = 1750,
    CAJA_AHORROS = 1751,
    AHORRO_PROGRAMADO = 1752,
    PLAZO_FIJO = 1753,
    INVERSION = 1754,
    NO_APLICA = 1755,
}

export const TIPO_CUENTA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoCuenta.CUENTA_CORRIENTE]: {
        id: TipoCuenta.CUENTA_CORRIENTE,
        abreviatura: 'CUENTA_CORRIENTE',
        label: 'Cuenta Corriente',
        prefijo: null,
        valor: 0,
        descripcion: 'Cuenta corriente bancaria para operaciones diarias. Permite emisión de cheques, débitos automáticos y múltiples transacciones sin límite de operaciones. Ideal para cuentas empresariales con alta rotación. Aplica para cuentas de la empresa y de clientes corporativos.',
    },
    [TipoCuenta.CAJA_AHORROS]: {
        id: TipoCuenta.CAJA_AHORROS,
        abreviatura: 'CAJA_AHORROS',
        label: 'Caja de Ahorros',
        prefijo: null,
        valor: 0,
        descripcion: 'Cuenta de ahorros para depósitos y retiros con disponibilidad inmediata. Generalmente genera intereses y tiene límite de operaciones mensuales. Ideal para ahorro personal y cuentas de clientes individuales.',
    },
    [TipoCuenta.AHORRO_PROGRAMADO]: {
        id: TipoCuenta.AHORRO_PROGRAMADO,
        abreviatura: 'AHORRO_PROGRAMADO',
        label: 'Ahorro Programado',
        prefijo: null,
        valor: 0,
        descripcion: 'Cuenta de ahorro con depósitos programados en fechas fijas (mensuales, quincenales). Permite acumulación de fondos con propósitos específicos. Aplica para clientes con plans de ahorro o empresas que manejan fondos de reserva.',
    },
    [TipoCuenta.PLAZO_FIJO]: {
        id: TipoCuenta.PLAZO_FIJO,
        abreviatura: 'PLAZO_FIJO',
        label: 'Plazo Fijo',
        prefijo: null,
        valor: 0,
        descripcion: 'Depósito a plazo fijo con tasa de interés definida y fecha de vencimiento determinada. No permite retiros anticipados sin penalización. Aplica para inversiones de capital de trabajo o excedentes de caja.',
    },
    [TipoCuenta.INVERSION]: {
        id: TipoCuenta.INVERSION,
        abreviatura: 'INVERSION',
        label: 'Inversión',
        prefijo: null,
        valor: 0,
        descripcion: 'Cuenta de inversión con diferentes instrumentos financieros (acciones, bonos, fondos mutuos). Mayor rendimiento potencial con mayor riesgo asociado. Aplica para empresas con estrategias de inversión diversificadas.',
    },
    [TipoCuenta.NO_APLICA]: {
        id: TipoCuenta.NO_APLICA,
        abreviatura: 'NO_APLICA',
        label: 'No Aplica',
        prefijo: null,
        valor: 0,
        descripcion: 'No aplica. Utilizado como valor por defecto cuando no se registra información de cuenta bancaria. Aplica para clientes sin cuenta asociada, transacciones en efectivo o cuando el medio de pago no requiere cuenta bancaria. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// TIPO DATO
export enum TipoDato {
    STRING = 1800,
    INTEGER = 1801,
    DECIMAL = 1802,
    BOOLEAN = 1803,
    TIMESTAMP = 1804,
    JSONB = 1805,
}

export const TIPO_DATO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoDato.STRING]: {
        id: TipoDato.STRING,
        abreviatura: 'STRING',
        label: 'String',
        prefijo: null,
        valor: 0,
        descripcion: 'Tipo de dato para valores de texto. Acepta caracteres alfanuméricos, espacios y símbolos. Ejemplos: "BOB", "VEN", "CASA_MATRIZ". CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoDato.INTEGER]: {
        id: TipoDato.INTEGER,
        abreviatura: 'INTEGER',
        label: 'Integer',
        prefijo: null,
        valor: 0,
        descripcion: 'Tipo de dato para valores numéricos enteros. Acepta solo dígitos (0-9), sin puntos, comas o signos. Ejemplos: "50", "7", "365".',
    },
    [TipoDato.DECIMAL]: {
        id: TipoDato.DECIMAL,
        abreviatura: 'DECIMAL',
        label: 'Decimal',
        prefijo: null,
        valor: 0,
        descripcion: 'Tipo de dato para valores numéricos con decimales. Acepta dígitos con punto decimal opcional. Ejemplos: "13.00", "0.95", "1.50".',
    },
    [TipoDato.BOOLEAN]: {
        id: TipoDato.BOOLEAN,
        abreviatura: 'BOOLEAN',
        label: 'Boolean',
        prefijo: null,
        valor: 0,
        descripcion: 'Tipo de dato para valores lógicos binarios. Acepta exclusivamente "1" (VERDADERO/SI) o "0" (FALSO/NO).',
    },
    [TipoDato.TIMESTAMP]: {
        id: TipoDato.TIMESTAMP,
        abreviatura: 'TIMESTAMP',
        label: 'Timestamp',
        prefijo: null,
        valor: 0,
        descripcion: 'Tipo de dato para valores de fecha y hora con zona horaria (TIMESTAMPTZ). Acepta formato ISO 8601 con timezone. Ejemplos: "2026-01-01 00:00:00-04:00", "2026-01-01T00:00:00.000Z".',
    },
    [TipoDato.JSONB]: {
        id: TipoDato.JSONB,
        abreviatura: 'JSONB',
        label: 'JSONB',
        prefijo: null,
        valor: 0,
        descripcion: 'Tipo de dato para objetos JSONB. Almacena estructuras complejas anidadas. Ejemplos: {"max_size": 204800, "allowed_formats": ["png", "jpeg"]}',
    },
};

// ==========================================
// NIVEL URGENCIA
export enum NivelUrgencia {
    BAJA = 1850,
    MEDIA = 1851,
    ALTA = 1852,
    CRITICA = 1853,
    NINGUNO = 1854,
}

export const NIVEL_URGENCIA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [NivelUrgencia.BAJA]: {
        id: NivelUrgencia.BAJA,
        abreviatura: 'BAJA',
        label: 'Baja',
        prefijo: null,
        valor: 0,
        descripcion: 'Nivel de urgencia bajo. Situación monitoreable sin acción inmediata. Tiempo de respuesta sugerido: 24-48 horas. Aplica para alertas informativas o de seguimiento sin impacto crítico en operaciones.',
    },
    [NivelUrgencia.MEDIA]: {
        id: NivelUrgencia.MEDIA,
        abreviatura: 'MEDIA',
        label: 'Media',
        prefijo: null,
        valor: 0,
        descripcion: 'Nivel de urgencia medio. Requiere atención en el corto plazo pero no bloquea operaciones críticas. Tiempo de respuesta sugerido: 4-8 horas. Aplica para alertas que requieren evaluación y posible ajuste.',
    },
    [NivelUrgencia.ALTA]: {
        id: NivelUrgencia.ALTA,
        abreviatura: 'ALTA',
        label: 'Alta',
        prefijo: null,
        valor: 0,
        descripcion: 'Nivel de urgencia alto. Requiere atención prioritaria y puede afectar operaciones si no se aborda. Tiempo de respuesta sugerido: 1-2 horas. Aplica para alertas de stock crítico, vencimientos inminentes o desviaciones significativas.',
    },
    [NivelUrgencia.CRITICA]: {
        id: NivelUrgencia.CRITICA,
        abreviatura: 'CRITICA',
        label: 'Crítica',
        prefijo: null,
        valor: 0,
        descripcion: 'Nivel de urgencia crítico. Requiere acción inmediata porque bloquea operaciones esenciales o representa un riesgo grave. Tiempo de respuesta sugerido: inmediato (< 30 minutos). Aplica para quiebre de stock de medicamentos esenciales, fallos en cadena de frío o alertas de seguridad.',
    },
    [NivelUrgencia.NINGUNO]: {
        id: NivelUrgencia.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin nivel de urgencia definido. Para casos donde no aplica clasificación de urgencia. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// MOTIVO OUTLIER
export enum MotivoOutlier {
    BLOQUEO = 1900,
    FERIADO_LOCAL = 1901,
    ERROR_SISTEMA = 1902,
    PICO_ANORMAL = 1903,
    ROTURA = 1904,
    ROBO = 1905,
    SOBRANTE = 1906,
    NINGUNO = 1907,
}

export const MOTIVO_OUTLIER_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [MotivoOutlier.BLOQUEO]: {
        id: MotivoOutlier.BLOQUEO,
        abreviatura: 'BLOQUEO',
        label: 'Bloqueo',
        prefijo: null,
        valor: 0,
        descripcion: 'Anomalía por bloqueo de caminos, protestas sociales, restricciones de movilidad o desastres naturales que afectan la distribución y disponibilidad de productos. Ajusta pronósticos considerando interrupciones externas.',
    },
    [MotivoOutlier.FERIADO_LOCAL]: {
        id: MotivoOutlier.FERIADO_LOCAL,
        abreviatura: 'FERIADO_LOCAL',
        label: 'Feriado Local',
        prefijo: null,
        valor: 0,
        descripcion: 'Anomalía por día festivo local no considerado en el calendario estándar. Incluye feriados departamentales, municipales o religiosos que afectan patrones de consumo y operación.',
    },
    [MotivoOutlier.ERROR_SISTEMA]: {
        id: MotivoOutlier.ERROR_SISTEMA,
        abreviatura: 'ERROR_SISTEMA',
        label: 'Error de Sistema',
        prefijo: null,
        valor: 0,
        descripcion: 'Anomalía por error en registro de datos, fallos en integración con otros sistemas o problemas técnicos que generan datos inconsistentes. Requiere revisión y corrección manual.',
    },
    [MotivoOutlier.PICO_ANORMAL]: {
        id: MotivoOutlier.PICO_ANORMAL,
        abreviatura: 'PICO_ANORMAL',
        label: 'Pico Anormal',
        prefijo: null,
        valor: 0,
        descripcion: 'Anomalía por pico anormal de demanda no repetible. Incluye eventos puntuales como epidemias, campañas de vacunación masiva o promociones extraordinarias que distorsionan el patrón histórico.',
    },
    [MotivoOutlier.ROTURA]: {
        id: MotivoOutlier.ROTURA,
        abreviatura: 'ROTURA',
        label: 'Rotura',
        prefijo: null,
        valor: 0,
        descripcion: 'Anomalía por rotura, daño físico, deterioro o contaminación de material. Genera pérdida de inventario y requiere ajuste por merma. Aplica para productos dañados en almacén o durante el transporte.',
    },
    [MotivoOutlier.ROBO]: {
        id: MotivoOutlier.ROBO,
        abreviatura: 'ROBO',
        label: 'Robo',
        prefijo: null,
        valor: 0,
        descripcion: 'Anomalía por robo, hurto o sustracción de mercadería detectada en inventario. Genera pérdida de stock y requiere ajuste negativo con reporte a seguridad. Aplica para faltantes no justificados.',
    },
    [MotivoOutlier.SOBRANTE]: {
        id: MotivoOutlier.SOBRANTE,
        abreviatura: 'SOBRANTE',
        label: 'Sobrante',
        prefijo: null,
        valor: 0,
        descripcion: 'Anomalía por sobrante detectado en inventario físico. Genera ajuste positivo de stock. Generalmente ocasionado por errores de conteo previo, recepciones sin registrar o devoluciones no contabilizadas.',
    },
    [MotivoOutlier.NINGUNO]: {
        id: MotivoOutlier.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin motivo de outlier definido. Cuando no se identifica una causa específica para la anomalía o cuando el pronóstico no presenta desviaciones significativas. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// TIPO ANTECEDENTE
export enum TipoAntecedente {
    POSITIVO = 1950,
    NEGATIVO = 1951,
}

export const TIPO_ANTECEDENTE_METADATA: Record<TipoAntecedente, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoAntecedente.POSITIVO]: {
        id: TipoAntecedente.POSITIVO,
        abreviatura: 'POSITIVO',
        label: 'Positivo',
        prefijo: 'POS',
        valor: 1,
        descripcion: 'Antecedente positivo. Registra reconocimientos, premios, felicitaciones o buenas prácticas operativas del conductor dentro de la central de taxis. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoAntecedente.NEGATIVO]: {
        id: TipoAntecedente.NEGATIVO,
        abreviatura: 'NEGATIVO',
        label: 'Negativo',
        prefijo: 'NEG',
        valor: 2,
        descripcion: 'Antecedente negativo. Registra faltas, llamadas de atención, multas o sanciones operativas (ej. mala modulación, deudas por cambio, retrasos).',
    },
};

// ==========================================
// ESTADO MODELO
export enum EstadoModelo {
    SIN_DATOS = 2000,
    ENTRENANDO = 2001,
    ACTIVO = 2002,
    RECHAZADO = 2003,
    OBSOLETO = 2004,
}

export const ESTADO_MODELO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoModelo.SIN_DATOS]: {
        id: EstadoModelo.SIN_DATOS,
        abreviatura: 'SIN_DATOS',
        label: 'Sin Datos',
        prefijo: null,
        valor: 0,
        descripcion: 'Estado inicial cuando un producto no cuenta con datos históricos suficientes para entrenar el modelo. Requiere mínimo de registros configurado en parametros_globales. El modelo no genera predicciones hasta acumular datos suficientes. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoModelo.ENTRENANDO]: {
        id: EstadoModelo.ENTRENANDO,
        abreviatura: 'ENTRENANDO',
        label: 'Entrenando',
        prefijo: null,
        valor: 0,
        descripcion: 'Modelo en proceso de entrenamiento. El motor de IA está calculando parámetros, ajustando hiperparámetros y validando el modelo con datos históricos. No genera predicciones hasta finalizar el proceso.',
    },
    [EstadoModelo.ACTIVO]: {
        id: EstadoModelo.ACTIVO,
        abreviatura: 'ACTIVO',
        label: 'Activo',
        prefijo: null,
        valor: 0,
        descripcion: 'Modelo entrenado exitosamente y en producción. Genera predicciones de demanda, puntos de reorden y análisis de tendencias. Se actualiza periódicamente según frecuencia configurada. Estado operativo deseado para modelos funcionales.',
    },
    [EstadoModelo.RECHAZADO]: {
        id: EstadoModelo.RECHAZADO,
        abreviatura: 'RECHAZADO',
        label: 'Rechazado',
        prefijo: null,
        valor: 0,
        descripcion: 'Modelo rechazado por error de predicción (MAPE) superior al umbral permitido. No genera predicciones hasta que se reentrene con mejores datos o se ajusten los parámetros. Requiere revisión manual.',
    },
    [EstadoModelo.OBSOLETO]: {
        id: EstadoModelo.OBSOLETO,
        abreviatura: 'OBSOLETO',
        label: 'Obsoleto',
        prefijo: null,
        valor: 0,
        descripcion: 'Modelo reemplazado por una versión más reciente o mejorada. Se mantiene en histórico para trazabilidad y comparación, pero ya no se utiliza para predicciones activas. Puede reactivarse si es necesario.',
    },
};

// ==========================================
// CALIDAD RATING
export enum CalidadRating {
    PESIMO = 2050,
    DEFICIENTE = 2051,
    REGULAR = 2052,
    BUENO = 2053,
    EXCELENTE = 2054,
    NINGUNO = 2055,
}

export const CALIDAD_RATING_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [CalidadRating.PESIMO]: {
        id: CalidadRating.PESIMO,
        abreviatura: 'PESIMO',
        label: 'Pésimo',
        prefijo: null,
        valor: 0,
        descripcion: 'Calificación más baja. Proveedor con incumplimientos graves en plazos de entrega, productos defectuosos recurrentes o problemas de calidad crítica. Se recomienda evaluar discontinuación de la relación comercial.',
    },
    [CalidadRating.DEFICIENTE]: {
        id: CalidadRating.DEFICIENTE,
        abreviatura: 'DEFICIENTE',
        label: 'Deficiente',
        prefijo: null,
        valor: 0,
        descripcion: 'Calificación baja. Proveedor con incumplimientos frecuentes en calidad o plazos. Requiere supervisión estricta y seguimiento continuo. Se recomienda restringir volumen de compras.',
    },
    [CalidadRating.REGULAR]: {
        id: CalidadRating.REGULAR,
        abreviatura: 'REGULAR',
        label: 'Regular',
        prefijo: null,
        valor: 0,
        descripcion: 'Calificación media. Proveedor que cumple con lo mínimo esperado pero sin destacar. Presenta algunos incumplimientos ocasionales. Se recomienda monitoreo periódico y definir plan de mejora.',
    },
    [CalidadRating.BUENO]: {
        id: CalidadRating.BUENO,
        abreviatura: 'BUENO',
        label: 'Bueno',
        prefijo: null,
        valor: 0,
        descripcion: 'Calificación alta. Proveedor confiable que cumple consistentemente con plazos y calidad. Presenta incumplimientos menores y excepcionales. Se recomienda mantener relación y considerar aumentar volumen de compras.',
    },
    [CalidadRating.EXCELENTE]: {
        id: CalidadRating.EXCELENTE,
        abreviatura: 'EXCELENTE',
        label: 'Excelente',
        prefijo: null,
        valor: 0,
        descripcion: 'Calificación máxima. Proveedor destacado que supera expectativas en calidad, plazos, servicio y precio. Presenta incumplimientos nulos o insignificantes. Se recomienda priorizar en compras y establecer alianzas estratégicas.',
    },
    [CalidadRating.NINGUNO]: {
        id: CalidadRating.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin calificación de calidad definida. Para proveedores nuevos o cuando aún no se ha realizado evaluación formal de desempeño. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// ESTADO TRASPASO
export enum EstadoTraspaso {
    EN_TRANSITO = 2100,
    RECIBIDO = 2101,
    RECHAZADO = 2102,
    NO_APLICA = 2103,
}

export const ESTADO_TRASPASO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoTraspaso.EN_TRANSITO]: {
        id: EstadoTraspaso.EN_TRANSITO,
        abreviatura: 'EN_TRANSITO',
        label: 'En Tránsito',
        prefijo: null,
        valor: 0,
        descripcion: 'Mercancía en tránsito entre sucursales. Stock disminuido en origen pero aún no disponible en destino. El producto no está disponible para venta en ninguna de las dos sucursales durante el traslado. Estado inicial al generar el traspaso.',
    },
    [EstadoTraspaso.RECIBIDO]: {
        id: EstadoTraspaso.RECIBIDO,
        abreviatura: 'RECIBIDO',
        label: 'Recibido',
        prefijo: null,
        valor: 0,
        descripcion: 'Mercancía recibida y confirmada en sucursal destino. Stock incrementado en destino y el producto queda disponible para venta. El traspaso se considera completado exitosamente. Estado final del flujo.',
    },
    [EstadoTraspaso.RECHAZADO]: {
        id: EstadoTraspaso.RECHAZADO,
        abreviatura: 'RECHAZADO',
        label: 'Rechazado',
        prefijo: null,
        valor: 0,
        descripcion: 'Traspaso cancelado o rechazado. Reversión automática del stock en origen (se restituye la cantidad disminuida). No se realiza incremento en destino. Aplica por falta de productos, daños en transporte o decisión administrativa.',
    },
    [EstadoTraspaso.NO_APLICA]: {
        id: EstadoTraspaso.NO_APLICA,
        abreviatura: 'NO_APLICA',
        label: 'No Aplica',
        prefijo: null,
        valor: 0,
        descripcion: 'Estado por defecto para transacciones que no son traspasos inter-sucursales. Aplica para compras, ventas, proformas, ajustes y cualquier otro evento que no involucre movimiento entre almacenes. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// MODULO ESTRATEGICO
export enum ModuloEstrategico {
    FLUJO_CAJA = 2150,
    DEMANDA_INVENTARIO = 2151,
    PROVEEDORES_AHP = 2152,
    OPERACION_MERMAS = 2153,
    CLIENTES_RFM = 2154,
    PRECIOS_ELASTICIDAD = 2155,
    ANOMALIAS_FRAUDE = 2156,
    NINGUNO = 2157,
}

export const MODULO_ESTRATEGICO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [ModuloEstrategico.FLUJO_CAJA]: {
        id: ModuloEstrategico.FLUJO_CAJA,
        abreviatura: 'FLUJO_CAJA',
        label: 'Flujo de Caja',
        prefijo: null,
        valor: 0,
        descripcion: 'Módulo de análisis y pronóstico de flujo de caja e ingresos. Utiliza modelos ARIMA y LSTM para predecir ingresos, identificar estacionalidades y optimizar liquidez. Aplica para planificación financiera y gestión de tesorería.',
    },
    [ModuloEstrategico.DEMANDA_INVENTARIO]: {
        id: ModuloEstrategico.DEMANDA_INVENTARIO,
        abreviatura: 'DEMANDA_INVENTARIO',
        label: 'Demanda e Inventario',
        prefijo: null,
        valor: 0,
        descripcion: 'Módulo de pronóstico de demanda y optimización de inventario. Utiliza XGBoost para predicción de demanda y EOQ (Economic Order Quantity) para niveles óptimos de stock. Aplica para gestión de compras y reducción de quiebres.',
    },
    [ModuloEstrategico.PROVEEDORES_AHP]: {
        id: ModuloEstrategico.PROVEEDORES_AHP,
        abreviatura: 'PROVEEDORES_AHP',
        label: 'Proveedores AHP',
        prefijo: null,
        valor: 0,
        descripcion: 'Módulo de evaluación y gestión de proveedores. Utiliza AHP (Analytic Hierarchy Process) y sistemas de scoring para calificar desempeño. Aplica para selección de proveedores, negociación y evaluación continua.',
    },
    [ModuloEstrategico.OPERACION_MERMAS]: {
        id: ModuloEstrategico.OPERACION_MERMAS,
        abreviatura: 'OPERACION_MERMAS',
        label: 'Operación y Mermas',
        prefijo: null,
        valor: 0,
        descripcion: 'Módulo de análisis de operaciones diarias y control de mermas. Utiliza Teoría de Colas para optimizar atención y algoritmos genéticos para minimizar pérdidas. Aplica para eficiencia operativa y reducción de desperdicios.',
    },
    [ModuloEstrategico.CLIENTES_RFM]: {
        id: ModuloEstrategico.CLIENTES_RFM,
        abreviatura: 'CLIENTES_RFM',
        label: 'Clientes RFM',
        prefijo: null,
        valor: 0,
        descripcion: 'Módulo de segmentación y análisis de clientes. Utiliza RFM (Recencia, Frecuencia, Monto), K-Means y CLV (Customer Lifetime Value). Aplica para campañas de fidelización y marketing personalizado.',
    },
    [ModuloEstrategico.PRECIOS_ELASTICIDAD]: {
        id: ModuloEstrategico.PRECIOS_ELASTICIDAD,
        abreviatura: 'PRECIOS_ELASTICIDAD',
        label: 'Precios y Elasticidad',
        prefijo: null,
        valor: 0,
        descripcion: 'Módulo de optimización de precios y análisis de márgenes. Utiliza modelos de elasticidad de demanda y reglas de asociación Apriori. Aplica para estrategias de precios y maximización de rentabilidad.',
    },
    [ModuloEstrategico.ANOMALIAS_FRAUDE]: {
        id: ModuloEstrategico.ANOMALIAS_FRAUDE,
        abreviatura: 'ANOMALIAS_FRAUDE',
        label: 'Anomalías y Fraude',
        prefijo: null,
        valor: 0,
        descripcion: 'Módulo de detección de anomalías y prevención de fraude. Utiliza Isolation Forest y LOF (Local Outlier Factor). Aplica para identificación de comportamientos sospechosos en ventas, inventario y pagos.',
    },
    [ModuloEstrategico.NINGUNO]: {
        id: ModuloEstrategico.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin módulo estratégico definido. Valor por defecto para tareas y procesos que no pertenecen a un módulo específico o que aún no han sido clasificados. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// TIPO DOCUMENTO
export enum TipoDocumento {
    CEDULA_IDENTIDAD = 2200,
    CEDULA_IDENTIDAD_EXTRANJERO = 2201,
    PASAPORTE = 2202,
    OTRO = 2203,
    NIT = 2204,
}

export const TIPO_DOCUMENTO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoDocumento.CEDULA_IDENTIDAD]: {
        id: TipoDocumento.CEDULA_IDENTIDAD,
        abreviatura: 'CEDULA_IDENTIDAD',
        label: 'Cédula de Identidad',
        prefijo: 'CI',
        valor: 1,
        descripcion: 'Cédula de identidad boliviana. Documento nacional emitido por el SEGIP. Formato: numérico (ej. 1234567) o con complemento (ej. 1234567-1A). CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoDocumento.CEDULA_IDENTIDAD_EXTRANJERO]: {
        id: TipoDocumento.CEDULA_IDENTIDAD_EXTRANJERO,
        abreviatura: 'CEDULA_IDENTIDAD_EXTRANJERO',
        label: 'Cédula de Identidad de Extranjero',
        prefijo: 'CEX',
        valor: 2,
        descripcion: 'Cédula de identidad de extranjero. Documento para residentes no bolivianos emitido por el SEGIP. Formato: numérico con prefijo (ej. 1234567-1). Utilizado para extranjeros con residencia.',
    },
    [TipoDocumento.PASAPORTE]: {
        id: TipoDocumento.PASAPORTE,
        abreviatura: 'PASAPORTE',
        label: 'Pasaporte',
        prefijo: 'PAS',
        valor: 3,
        descripcion: 'Pasaporte. Documento de identidad internacional emitido por autoridades migratorias de cada país. Formato: alfanumérico variable (ej. AB123456). Utilizado para extranjeros sin residencia.',
    },
    [TipoDocumento.OTRO]: {
        id: TipoDocumento.OTRO,
        abreviatura: 'OTRO',
        label: 'Otro',
        prefijo: 'OTRO',
        valor: 4,
        descripcion: 'Otro tipo de documento de identidad no contemplado en las categorías anteriores. Utilizado para casos excepcionales, documentos diplomáticos, cédulas especiales o documentos temporales.',
    },
    [TipoDocumento.NIT]: {
        id: TipoDocumento.NIT,
        abreviatura: 'NIT',
        label: 'NIT',
        prefijo: 'NIT',
        valor: 5,
        descripcion: 'Número de Identificación Tributaria. Emitido por el Servicio de Impuestos Nacionales (SIN). Formato: numérico de 7-10 dígitos (ej. 1023456021).',
    },
};

// ==========================================
// ESTADO PEDIDO
export enum EstadoPedido {
    COTIZADO = 2250,
    APROBADO = 2251,
    EN_RUTA = 2252,
    RECIBIDO = 2253,
    PARCIAL = 2254,
    RECHAZADO = 2255,
    CANCELADO = 2256,
    NINGUNO = 2257,
}

export const ESTADO_PEDIDO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoPedido.COTIZADO]: {
        id: EstadoPedido.COTIZADO,
        abreviatura: 'COTIZADO',
        label: 'Cotizado',
        prefijo: 'COT',
        valor: 1,
        descripcion: 'Pedido cotizado y en espera de aprobación administrativa. No afecta stock ni genera obligación de compra. Estado inicial del flujo. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoPedido.APROBADO]: {
        id: EstadoPedido.APROBADO,
        abreviatura: 'APROBADO',
        label: 'Aprobado',
        prefijo: 'APR',
        valor: 2,
        descripcion: 'Pedido aprobado por administración y enviado al proveedor. En proceso de gestión de compra. Aún no afecta stock ni inventario.',
    },
    [EstadoPedido.EN_RUTA]: {
        id: EstadoPedido.EN_RUTA,
        abreviatura: 'EN_RUTA',
        label: 'En Ruta',
        prefijo: 'RUT',
        valor: 3,
        descripcion: 'Pedido despachado por el proveedor y en tránsito hacia la farmacia. No afecta stock hasta su recepción física. Requiere seguimiento logístico.',
    },
    [EstadoPedido.RECIBIDO]: {
        id: EstadoPedido.RECIBIDO,
        abreviatura: 'RECIBIDO',
        label: 'Recibido',
        prefijo: 'REC',
        valor: 4,
        descripcion: 'Pedido recibido completamente en almacén. Incrementa stock según los lotes y cantidades registradas. Estado final exitoso del flujo.',
    },
    [EstadoPedido.PARCIAL]: {
        id: EstadoPedido.PARCIAL,
        abreviatura: 'PARCIAL',
        label: 'Parcial',
        prefijo: 'PAR',
        valor: 5,
        descripcion: 'Pedido recibido de forma parcial. Parte de la mercadería fue recibida, pero faltan productos por llegar. Genera incremento parcial de stock y requiere seguimiento de pendientes.',
    },
    [EstadoPedido.RECHAZADO]: {
        id: EstadoPedido.RECHAZADO,
        abreviatura: 'RECHAZADO',
        label: 'Rechazado',
        prefijo: 'RCH',
        valor: 6,
        descripcion: 'Pedido rechazado por problemas de calidad, incumplimiento de especificaciones o condiciones. No afecta stock. Requiere gestión de devolución o reclamo al proveedor.',
    },
    [EstadoPedido.CANCELADO]: {
        id: EstadoPedido.CANCELADO,
        abreviatura: 'CANCELADO',
        label: 'Cancelado',
        prefijo: 'CAN',
        valor: 7,
        descripcion: 'Pedido cancelado por decisión del proveedor o de la farmacia antes de su recepción. No afecta stock. Estado final sin ejecución.',
    },
    [EstadoPedido.NINGUNO]: {
        id: EstadoPedido.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'NIN',
        valor: 0,
        descripcion: 'Sin estado de pedido definido. Valor por defecto para eventos que no son solicitudes de compra (COMPRA, VENTA, PROFORMA, etc.).',
    },
};

// ==========================================
// TIPO MONEDA
export enum TipoMoneda {
    BOLIVIANO = 2300,
    DOLAR = 2301,
    EURO = 2302,
    UFV = 2303,
}

export const TIPO_MONEDA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoMoneda.BOLIVIANO]: {
        id: TipoMoneda.BOLIVIANO,
        abreviatura: 'BOLIVIANO',
        label: 'Boliviano',
        prefijo: 'BOB',
        valor: 1,
        descripcion: 'Boliviano (Bs.). Moneda oficial de Bolivia. Utilizada como moneda base del sistema para todas las transacciones locales, facturación y reportes financieros. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoMoneda.DOLAR]: {
        id: TipoMoneda.DOLAR,
        abreviatura: 'DOLAR',
        label: 'Dólar',
        prefijo: 'USD',
        valor: 2,
        descripcion: 'Dólar estadounidense ($). Moneda de referencia internacional. Utilizada para transacciones con proveedores internacionales, precios de referencia y operaciones en moneda extranjera.',
    },
    [TipoMoneda.EURO]: {
        id: TipoMoneda.EURO,
        abreviatura: 'EURO',
        label: 'Euro',
        prefijo: 'EUR',
        valor: 3,
        descripcion: 'Euro (€). Moneda oficial de la Unión Europea. Utilizada para transacciones con proveedores europeos y operaciones internacionales en esta moneda.',
    },
    [TipoMoneda.UFV]: {
        id: TipoMoneda.UFV,
        abreviatura: 'UFV',
        label: 'UFV',
        prefijo: 'UFV',
        valor: 4,
        descripcion: 'Unidad de Fomento a la Vivienda. Unidad de cuenta indexada a la inflación en Bolivia. Utilizada para contratos de largo plazo, ajustes de precios y operaciones indexadas.',
    },
};

// ==========================================
// TIPO FACTURA
export enum TipoFactura {
    CON_FACTURA = 2350,
    SIN_FACTURA = 2351,
    NOTA_CREDITO_DEBITO = 2352,
    NINGUNO = 2353,
}

export const TIPO_FACTURA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoFactura.CON_FACTURA]: {
        id: TipoFactura.CON_FACTURA,
        abreviatura: 'CON_FACTURA',
        label: 'Con Factura',
        prefijo: 'CF',
        valor: 1,
        descripcion: 'Factura con derecho a crédito fiscal. Documento fiscal válido ante el SIN que permite al comprador descontar el IVA pagado. Requiere NIT del cliente y dosificación fiscal activa. Aplica para ventas a empresas e instituciones.',
    },
    [TipoFactura.SIN_FACTURA]: {
        id: TipoFactura.SIN_FACTURA,
        abreviatura: 'SIN_FACTURA',
        label: 'Sin Factura',
        prefijo: 'SF',
        valor: 2,
        descripcion: 'Factura sin derecho a crédito fiscal. Documento fiscal válido ante el SIN que NO permite descontar el IVA. Utilizado para ventas a consumidor final o cuando el cliente no requiere crédito fiscal.',
    },
    [TipoFactura.NOTA_CREDITO_DEBITO]: {
        id: TipoFactura.NOTA_CREDITO_DEBITO,
        abreviatura: 'NOTA_CREDITO_DEBITO',
        label: 'Nota de Crédito/Débito',
        prefijo: 'NCD',
        valor: 3,
        descripcion: 'Nota de crédito o débito para ajustes, devoluciones o correcciones de facturas previamente emitidas. Afecta los saldos fiscales y contables de la transacción original.',
    },
    [TipoFactura.NINGUNO]: {
        id: TipoFactura.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'NIN',
        valor: 4,
        descripcion: 'Sin tipo de factura definido. Valor por defecto para transacciones que no requieren facturación fiscal, como proformas, ajustes de inventario o traspasos internos. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// ESTADO FINANCIERO
export enum EstadoFinanciero {
    CANCELADO = 2400,
    PENDIENTE = 2401,
    PARCIAL = 2402,
    NINGUNO = 2403,
}

export const ESTADO_FINANCIERO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoFinanciero.CANCELADO]: {
        id: EstadoFinanciero.CANCELADO,
        abreviatura: 'CANCELADO',
        label: 'Cancelado',
        prefijo: null,
        valor: 0,
        descripcion: 'Transacción totalmente liquidada. El saldo pendiente es cero. Aplica para compras a proveedores totalmente pagadas o ventas al contado. No requiere acciones adicionales.',
    },
    [EstadoFinanciero.PENDIENTE]: {
        id: EstadoFinanciero.PENDIENTE,
        abreviatura: 'PENDIENTE',
        label: 'Pendiente',
        prefijo: null,
        valor: 0,
        descripcion: 'Transacción sin abonos registrados. El saldo pendiente es igual al monto total. Aplica para compras a crédito donde aún no se ha realizado ningún pago.',
    },
    [EstadoFinanciero.PARCIAL]: {
        id: EstadoFinanciero.PARCIAL,
        abreviatura: 'PARCIAL',
        label: 'Parcial',
        prefijo: null,
        valor: 0,
        descripcion: 'Transacción con abonos parciales registrados. El saldo pendiente es menor al monto total pero mayor a cero. Aplica para compras a crédito con pagos fraccionados.',
    },
    [EstadoFinanciero.NINGUNO]: {
        id: EstadoFinanciero.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin estado financiero definido. Valor por defecto para transacciones que no generan obligación financiera, como proformas, ajustes de inventario o movimientos internos. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// MOTIVO ANULACION
export enum MotivoAnulacion {
    FACTURA_MAL_EMITIDA = 2450,
    ERROR_DATOS_CLIENTE = 2451,
    DEVOLUCION_MERCADERIA = 2452,
    CONTINGENCIA = 2453,
    OPERACION_NO_CONCRETADA = 2454,
    NINGUNO = 2455,
}

export const MOTIVO_ANULACION_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [MotivoAnulacion.FACTURA_MAL_EMITIDA]: {
        id: MotivoAnulacion.FACTURA_MAL_EMITIDA,
        abreviatura: 'FACTURA_MAL_EMITIDA',
        label: 'Factura Mal Emitida',
        prefijo: 'FME',
        valor: 1,
        descripcion: 'Anulación por error en la emisión de la factura. Incluye errores en montos, productos, cantidades o datos fiscales. Requiere justificación detallada y autorización. Aplica para correcciones antes de notificar al SIN.',
    },
    [MotivoAnulacion.ERROR_DATOS_CLIENTE]: {
        id: MotivoAnulacion.ERROR_DATOS_CLIENTE,
        abreviatura: 'ERROR_DATOS_CLIENTE',
        label: 'Error en Datos de Cliente',
        prefijo: 'EDC',
        valor: 2,
        descripcion: 'Anulación por error en los datos del cliente. Incluye NIT incorrecto, razón social errónea o documento de identidad inválido. Aplica cuando la factura fue emitida con información fiscal incorrecta.',
    },
    [MotivoAnulacion.DEVOLUCION_MERCADERIA]: {
        id: MotivoAnulacion.DEVOLUCION_MERCADERIA,
        abreviatura: 'DEVOLUCION_MERCADERIA',
        label: 'Devolución de Mercadería',
        prefijo: 'DM',
        valor: 3,
        descripcion: 'Anulación por devolución de mercadería por parte del cliente. Revierte el stock y el valor de la transacción. Aplica para ventas anuladas por productos defectuosos, vencidos o devoluciones voluntarias.',
    },
    [MotivoAnulacion.CONTINGENCIA]: {
        id: MotivoAnulacion.CONTINGENCIA,
        abreviatura: 'CONTINGENCIA',
        label: 'Contingencia',
        prefijo: 'CON',
        valor: 4,
        descripcion: 'Anulación por contingencia operativa o técnica. Incluye fallos en el sistema de facturación, problemas de conectividad con el SIN o situaciones excepcionales. Requiere documentación de respaldo.',
    },
    [MotivoAnulacion.OPERACION_NO_CONCRETADA]: {
        id: MotivoAnulacion.OPERACION_NO_CONCRETADA,
        abreviatura: 'OPERACION_NO_CONCRETADA',
        label: 'Operación No Concretada',
        prefijo: 'ONC',
        valor: 5,
        descripcion: 'Anulación por operación que no se concretó. Incluye ventas abortadas, clientes que no completaron el pago o transacciones canceladas por acuerdo mutuo. No afecta stock si no hubo despacho.',
    },
    [MotivoAnulacion.NINGUNO]: {
        id: MotivoAnulacion.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'NIN',
        valor: 0,
        descripcion: 'Sin motivo de anulación definido. Valor por defecto para casos donde no se requiere justificación o cuando la anulación es automática por sistema (ej. expiración de reservas). CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// ESTADO LOTE
export enum EstadoLote {
    VIGENTE = 2500,
    VENCIDO = 2501,
    AGOTADO = 2502,
    NINGUNO = 2503,
}

export const ESTADO_LOTE_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoLote.VIGENTE]: {
        id: EstadoLote.VIGENTE,
        abreviatura: 'VIGENTE',
        label: 'Vigente',
        prefijo: null,
        valor: 0,
        descripcion: 'Lote con producto en buen estado y dentro de su fecha de vencimiento. Disponible para venta y despacho. Estado operativo normal del lote.',
    },
    [EstadoLote.VENCIDO]: {
        id: EstadoLote.VENCIDO,
        abreviatura: 'VENCIDO',
        label: 'Vencido',
        prefijo: null,
        valor: 0,
        descripcion: 'Lote cuya fecha de vencimiento ha sido superada. No disponible para venta ni despacho. Requiere gestión de baja o devolución. Se excluye automáticamente de transacciones de venta.',
    },
    [EstadoLote.AGOTADO]: {
        id: EstadoLote.AGOTADO,
        abreviatura: 'AGOTADO',
        label: 'Agotado',
        prefijo: null,
        valor: 0,
        descripcion: 'Lote con cantidad_actual igual a cero. No disponible para venta. Permanece en histórico para trazabilidad pero ya no tiene stock físico. Puede reactivarse solo mediante ajuste de inventario.',
    },
    [EstadoLote.NINGUNO]: {
        id: EstadoLote.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin estado de lote definido. Valor por defecto para el registro comodín o casos excepcionales donde no se requiere clasificación de estado. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// ESTADO PAGO
export enum EstadoPago {
    PENDIENTE = 2550,
    PARCIAL = 2551,
    PAGADO = 2552,
    CERRADO = 2553,
    EN_VERIFICACION = 2554,
    NINGUNO = 2555,
}

export const ESTADO_PAGO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoPago.PENDIENTE]: {
        id: EstadoPago.PENDIENTE,
        abreviatura: 'PENDIENTE',
        label: 'Pendiente',
        prefijo: null,
        valor: 0,
        descripcion: 'Estado de pago pendiente',
    },
    [EstadoPago.PARCIAL]: {
        id: EstadoPago.PARCIAL,
        abreviatura: 'PARCIAL',
        label: 'Parcial',
        prefijo: null,
        valor: 0,
        descripcion: 'Estado de pago parcial',
    },
    [EstadoPago.PAGADO]: {
        id: EstadoPago.PAGADO,
        abreviatura: 'PAGADO',
        label: 'Pagado',
        prefijo: null,
        valor: 0,
        descripcion: 'Estado de pago pagado',
    },
    [EstadoPago.CERRADO]: {
        id: EstadoPago.CERRADO,
        abreviatura: 'CERRADO',
        label: 'Cerrado',
        prefijo: null,
        valor: 0,
        descripcion: 'Estado de pago cerrado',
    },
    [EstadoPago.EN_VERIFICACION]: {
        id: EstadoPago.EN_VERIFICACION,
        abreviatura: 'EN_VERIFICACION',
        label: 'En Verificación',
        prefijo: null,
        valor: 0,
        descripcion: 'Pago en proceso de verificación bancaria',
    },
    [EstadoPago.NINGUNO]: {
        id: EstadoPago.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin estado de pago definido. Valor por defecto para registros comodín o cuando no aplica un estado específico. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// TIPO MOVIMIENTO
export enum TipoMovimiento {
    INGRESO = 2600,
    EGRESO = 2601,
}

export const TIPO_MOVIMIENTO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoMovimiento.INGRESO]: {
        id: TipoMovimiento.INGRESO,
        abreviatura: 'INGRESO',
        label: 'Ingreso',
        prefijo: null,
        valor: 0,
        descripcion: 'Movimiento que incrementa el saldo de caja. Aplica para cobros, ventas, depósitos, devoluciones de clientes y cualquier entrada de dinero. Aumenta el monto_ingresos de la caja. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoMovimiento.EGRESO]: {
        id: TipoMovimiento.EGRESO,
        abreviatura: 'EGRESO',
        label: 'Egreso',
        prefijo: null,
        valor: 0,
        descripcion: 'Movimiento que disminuye el saldo de caja. Aplica para pagos, compras, retiros, devoluciones a proveedores y cualquier salida de dinero. Aumenta el monto_egresos de la caja.',
    },
};

// ==========================================
// ESTADO CAJA
export enum EstadoCaja {
    ABIERTA = 2650,
    CERRADA = 2651,
}

export const ESTADO_CAJA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoCaja.ABIERTA]: {
        id: EstadoCaja.ABIERTA,
        abreviatura: 'ABIERTA',
        label: 'Abierta',
        prefijo: null,
        valor: 0,
        descripcion: 'Caja operativa y disponible para recibir transacciones. Permite registrar ventas, cobros, pagos y movimientos de efectivo. Estado activo durante la jornada laboral. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoCaja.CERRADA]: {
        id: EstadoCaja.CERRADA,
        abreviatura: 'CERRADA',
        label: 'Cerrada',
        prefijo: null,
        valor: 0,
        descripcion: 'Caja finalizada y cerrada. No permite registrar nuevas transacciones. Requiere arqueo físico y conciliación de montos. Estado final de la jornada.',
    },
};

// ==========================================
// TIPO ALERTA NOTIFICACION
export enum TipoAlertaNotificacion {
    SISTEMA = 2700,
    ALERTA_STOCK = 2701,
    STOCK_BAJO = 2702,
    STOCK_CRITICO = 2703,
    STOCK_EXCESO = 2704,
    VENCIMIENTO_PROXIMO = 2705,
    VENCIMIENTO_INMEDIATO = 2706,
    VENCIMIENTO_VENCIDO = 2707,
    DEMANDA_ALTA = 2708,
    DEMANDA_BAJA = 2709,
    TENDENCIA_ANOMALA = 2710,
    PREDICCION_ROP = 2711,
    PREDICCION_DEMANDA = 2712,
    FORECASTING = 2713,
    PAGOS = 2714,
    PAGO_VENCIDO = 2715,
    PAGO_PROXIMO = 2716,
    DOCUMENTOS = 2717,
    FACTURA_PENDIENTE = 2718,
    FACTURA_ANULADA = 2719,
    SEGURIDAD_ACCESO = 2720,
    SEGURIDAD_INTENTO_FALLIDO = 2721,
    SISTEMA_ERROR = 2722,
    SISTEMA_RENDIMIENTO = 2723,
    NINGUNO = 2724,
    RRHH_FALTAS = 2725,
    RRHH_CONTRATO = 2726,
    RRHH_PLANILLA = 2727,
}

export const TIPO_ALERTA_NOTIFICACION_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoAlertaNotificacion.SISTEMA]: {
        id: TipoAlertaNotificacion.SISTEMA,
        abreviatura: 'SISTEMA',
        label: 'Sistema',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta general del sistema. Notificaciones sobre eventos operativos, mantenimiento programado o cambios en la configuración. Origen: sistema.',
    },
    [TipoAlertaNotificacion.ALERTA_STOCK]: {
        id: TipoAlertaNotificacion.ALERTA_STOCK,
        abreviatura: 'ALERTA_STOCK',
        label: 'Alerta de Stock',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta relacionada con niveles de inventario. Agrupa todas las notificaciones de stock bajo, crítico o excesivo. Origen: sistema/IA.',
    },
    [TipoAlertaNotificacion.STOCK_BAJO]: {
        id: TipoAlertaNotificacion.STOCK_BAJO,
        abreviatura: 'STOCK_BAJO',
        label: 'Stock Bajo',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por stock bajo. El inventario ha caído por debajo del punto de reorden. Requiere evaluación de reposición. Acción: generar orden de compra.',
    },
    [TipoAlertaNotificacion.STOCK_CRITICO]: {
        id: TipoAlertaNotificacion.STOCK_CRITICO,
        abreviatura: 'STOCK_CRITICO',
        label: 'Stock Crítico',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por stock crítico. El inventario está por debajo del stock mínimo de seguridad. Riesgo de quiebre inminente. Acción: compra urgente o traspaso.',
    },
    [TipoAlertaNotificacion.STOCK_EXCESO]: {
        id: TipoAlertaNotificacion.STOCK_EXCESO,
        abreviatura: 'STOCK_EXCESO',
        label: 'Exceso de Stock',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por exceso de stock. El inventario supera el stock máximo permitido. Riesgo de sobre-inversión y vencimientos. Acción: revisar compras y promocionar salida.',
    },
    [TipoAlertaNotificacion.VENCIMIENTO_PROXIMO]: {
        id: TipoAlertaNotificacion.VENCIMIENTO_PROXIMO,
        abreviatura: 'VENCIMIENTO_PROXIMO',
        label: 'Vencimiento Próximo',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por vencimiento próximo (30-60 días). Productos que caducarán en el mediano plazo. Acción: planificar promociones o devoluciones.',
    },
    [TipoAlertaNotificacion.VENCIMIENTO_INMEDIATO]: {
        id: TipoAlertaNotificacion.VENCIMIENTO_INMEDIATO,
        abreviatura: 'VENCIMIENTO_INMEDIATO',
        label: 'Vencimiento Inmediato',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por vencimiento inmediato (menos de 30 días). Productos que caducarán pronto. Acción: priorizar venta, promociones agresivas o gestionar devolución.',
    },
    [TipoAlertaNotificacion.VENCIMIENTO_VENCIDO]: {
        id: TipoAlertaNotificacion.VENCIMIENTO_VENCIDO,
        abreviatura: 'VENCIMIENTO_VENCIDO',
        label: 'Vencido',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por producto vencido. Lotes que han superado su fecha de vencimiento. Acción: dar de baja, gestionar devolución o disposición final.',
    },
    [TipoAlertaNotificacion.DEMANDA_ALTA]: {
        id: TipoAlertaNotificacion.DEMANDA_ALTA,
        abreviatura: 'DEMANDA_ALTA',
        label: 'Demanda Alta',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por demanda alta inusual. Incremento significativo en ventas que podría generar quiebre de stock. Acción: evaluar reposición anticipada. Origen: IA.',
    },
    [TipoAlertaNotificacion.DEMANDA_BAJA]: {
        id: TipoAlertaNotificacion.DEMANDA_BAJA,
        abreviatura: 'DEMANDA_BAJA',
        label: 'Demanda Baja',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por demanda baja inusual. Caída significativa en ventas que podría indicar problemas de mercado. Acción: revisar precios o promociones. Origen: IA.',
    },
    [TipoAlertaNotificacion.TENDENCIA_ANOMALA]: {
        id: TipoAlertaNotificacion.TENDENCIA_ANOMALA,
        abreviatura: 'TENDENCIA_ANOMALA',
        label: 'Tendencia Anómala',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por tendencia anómala detectada. Comportamiento inusual en patrones de consumo que no corresponde a estacionalidad esperada. Acción: investigar causa. Origen: IA.',
    },
    [TipoAlertaNotificacion.PREDICCION_ROP]: {
        id: TipoAlertaNotificacion.PREDICCION_ROP,
        abreviatura: 'PREDICCION_ROP',
        label: 'Predicción ROP',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta sobre punto de reorden (ROP) calculado. Actualización del nivel óptimo de reorden basado en nuevas predicciones. Acción: revisar configuración de umbrales. Origen: IA.',
    },
    [TipoAlertaNotificacion.PREDICCION_DEMANDA]: {
        id: TipoAlertaNotificacion.PREDICCION_DEMANDA,
        abreviatura: 'PREDICCION_DEMANDA',
        label: 'Predicción de Demanda',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta sobre predicción de demanda. Resultados del pronóstico disponibles para revisión. Acción: revisar proyecciones en dashboard. Origen: IA.',
    },
    [TipoAlertaNotificacion.FORECASTING]: {
        id: TipoAlertaNotificacion.FORECASTING,
        abreviatura: 'FORECASTING',
        label: 'Forecasting',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta sobre resultados de forecasting. Actualización de proyecciones de ventas y tendencias. Acción: revisar reportes de pronóstico. Origen: IA.',
    },
    [TipoAlertaNotificacion.PAGOS]: {
        id: TipoAlertaNotificacion.PAGOS,
        abreviatura: 'PAGOS',
        label: 'Pagos',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta relacionada con pagos y cuentas por cobrar/pagar. Agrupa notificaciones de vencimientos y estados de pago. Origen: sistema.',
    },
    [TipoAlertaNotificacion.PAGO_VENCIDO]: {
        id: TipoAlertaNotificacion.PAGO_VENCIDO,
        abreviatura: 'PAGO_VENCIDO',
        label: 'Pago Vencido',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por pago vencido. Cuota o factura con fecha de vencimiento superada sin pago registrado. Acción: gestionar cobranza o aplicar multas. Origen: sistema.',
    },
    [TipoAlertaNotificacion.PAGO_PROXIMO]: {
        id: TipoAlertaNotificacion.PAGO_PROXIMO,
        abreviatura: 'PAGO_PROXIMO',
        label: 'Pago Próximo',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por pago próximo. Cuota o factura que vence en los próximos días (según configuración). Acción: preparar pago o notificar al cliente. Origen: sistema.',
    },
    [TipoAlertaNotificacion.DOCUMENTOS]: {
        id: TipoAlertaNotificacion.DOCUMENTOS,
        abreviatura: 'DOCUMENTOS',
        label: 'Documentos',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta relacionada con documentos fiscales y administrativos. Agrupa notificaciones sobre facturas y comprobantes. Origen: sistema.',
    },
    [TipoAlertaNotificacion.FACTURA_PENDIENTE]: {
        id: TipoAlertaNotificacion.FACTURA_PENDIENTE,
        abreviatura: 'FACTURA_PENDIENTE',
        label: 'Factura Pendiente',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por factura pendiente de emisión o envío. Documentos fiscales que requieren atención. Acción: completar facturación. Origen: sistema.',
    },
    [TipoAlertaNotificacion.FACTURA_ANULADA]: {
        id: TipoAlertaNotificacion.FACTURA_ANULADA,
        abreviatura: 'FACTURA_ANULADA',
        label: 'Factura Anulada',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por factura anulada. Notificación de anulación de documento fiscal. Acción: verificar motivo y documentar. Origen: sistema.',
    },
    [TipoAlertaNotificacion.SEGURIDAD_ACCESO]: {
        id: TipoAlertaNotificacion.SEGURIDAD_ACCESO,
        abreviatura: 'SEGURIDAD_ACCESO',
        label: 'Seguridad de Acceso',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por evento de seguridad de acceso. Incluye inicios de sesión desde ubicaciones desconocidas o fuera de horario. Acción: verificar actividad sospechosa. Origen: sistema.',
    },
    [TipoAlertaNotificacion.SEGURIDAD_INTENTO_FALLIDO]: {
        id: TipoAlertaNotificacion.SEGURIDAD_INTENTO_FALLIDO,
        abreviatura: 'SEGURIDAD_INTENTO_FALLIDO',
        label: 'Intento de Acceso Fallido',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por intentos fallidos de acceso. Múltiples fallos en autenticación que podrían indicar ataque de fuerza bruta. Acción: bloquear usuario o IP. Origen: sistema.',
    },
    [TipoAlertaNotificacion.SISTEMA_ERROR]: {
        id: TipoAlertaNotificacion.SISTEMA_ERROR,
        abreviatura: 'SISTEMA_ERROR',
        label: 'Error de Sistema',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por error crítico del sistema. Fallos en procesos, servicios o integraciones que requieren intervención técnica. Acción: revisar logs y solucionar. Origen: sistema.',
    },
    [TipoAlertaNotificacion.SISTEMA_RENDIMIENTO]: {
        id: TipoAlertaNotificacion.SISTEMA_RENDIMIENTO,
        abreviatura: 'SISTEMA_RENDIMIENTO',
        label: 'Rendimiento del Sistema',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por problemas de rendimiento del sistema. Tiempos de respuesta elevados, uso excesivo de recursos o cuellos de botella. Acción: optimizar o escalar recursos. Origen: sistema.',
    },
    [TipoAlertaNotificacion.NINGUNO]: {
        id: TipoAlertaNotificacion.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin tipo de alerta definido. Valor por defecto para registros comodín o casos donde no se requiere clasificación de alerta. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoAlertaNotificacion.RRHH_FALTAS]: {
        id: TipoAlertaNotificacion.RRHH_FALTAS,
        abreviatura: 'RRHH_FALTAS',
        label: 'RRHH - Faltas',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por faltas consecutivas del trabajador. Acción: contactar al trabajador.',
    },
    [TipoAlertaNotificacion.RRHH_CONTRATO]: {
        id: TipoAlertaNotificacion.RRHH_CONTRATO,
        abreviatura: 'RRHH_CONTRATO',
        label: 'RRHH - Contrato',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta por vencimiento de contrato. Acción: gestionar renovación.',
    },
    [TipoAlertaNotificacion.RRHH_PLANILLA]: {
        id: TipoAlertaNotificacion.RRHH_PLANILLA,
        abreviatura: 'RRHH_PLANILLA',
        label: 'RRHH - Planilla',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta relacionada con planillas de sueldos. Acción: revisar estado de planilla.',
    },
};

// ==========================================
// AMBIENTE
export enum Ambiente {
    PRODUCCION = 2750,
    PILOTO_PRUEBAS = 2751,
}

export const AMBIENTE_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [Ambiente.PRODUCCION]: {
        id: Ambiente.PRODUCCION,
        abreviatura: 'PRODUCCION',
        label: 'Producción',
        prefijo: null,
        valor: 1,
        descripcion: 'Ambiente del sistema en producción.',
    },
    [Ambiente.PILOTO_PRUEBAS]: {
        id: Ambiente.PILOTO_PRUEBAS,
        abreviatura: 'PILOTO_PRUEBAS',
        label: 'Piloto / Pruebas',
        prefijo: null,
        valor: 2,
        descripcion: 'Ambiente del sistema en piloto ó pruebas. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// SUBTIPO ALERTA
export enum SubtipoAlerta {
    SARIMA = 2800,
    PROPHET = 2801,
    KMEANS = 2802,
    ROP_CALC = 2803,
    PATRON_CONSUMO = 2804,
    ALERTA_PREDICTIVA = 2805,
    QUIEBRE_STOCK = 2806,
    REORDEN = 2807,
    EXCESO = 2808,
    CADUCIDAD_CRITICA = 2809,
    CADUCIDAD_ALTA = 2810,
    CADUCIDAD_MEDIA = 2811,
    NINGUNO = 2812,
}

export const SUBTIPO_ALERTA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [SubtipoAlerta.SARIMA]: {
        id: SubtipoAlerta.SARIMA,
        abreviatura: 'SARIMA',
        label: 'SARIMA',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo SARIMA',
        es_defecto: true,
    },
    [SubtipoAlerta.PROPHET]: {
        id: SubtipoAlerta.PROPHET,
        abreviatura: 'PROPHET',
        label: 'Prophet',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo PROPHET',
    },
    [SubtipoAlerta.KMEANS]: {
        id: SubtipoAlerta.KMEANS,
        abreviatura: 'KMEANS',
        label: 'K-Means',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo KMEANS',
    },
    [SubtipoAlerta.ROP_CALC]: {
        id: SubtipoAlerta.ROP_CALC,
        abreviatura: 'ROP_CALC',
        label: 'Cálculo ROP',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo ROP_CALC',
    },
    [SubtipoAlerta.PATRON_CONSUMO]: {
        id: SubtipoAlerta.PATRON_CONSUMO,
        abreviatura: 'PATRON_CONSUMO',
        label: 'Patrón de Consumo',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo PATRON_CONSUMO',
    },
    [SubtipoAlerta.ALERTA_PREDICTIVA]: {
        id: SubtipoAlerta.ALERTA_PREDICTIVA,
        abreviatura: 'ALERTA_PREDICTIVA',
        label: 'Alerta Predictiva',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo ALERTA_PREDICTIVA',
    },
    [SubtipoAlerta.QUIEBRE_STOCK]: {
        id: SubtipoAlerta.QUIEBRE_STOCK,
        abreviatura: 'QUIEBRE_STOCK',
        label: 'Quiebre de Stock',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo QUIEBRE_STOCK',
    },
    [SubtipoAlerta.REORDEN]: {
        id: SubtipoAlerta.REORDEN,
        abreviatura: 'REORDEN',
        label: 'Reorden',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo REORDEN',
    },
    [SubtipoAlerta.EXCESO]: {
        id: SubtipoAlerta.EXCESO,
        abreviatura: 'EXCESO',
        label: 'Exceso',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo EXCESO',
    },
    [SubtipoAlerta.CADUCIDAD_CRITICA]: {
        id: SubtipoAlerta.CADUCIDAD_CRITICA,
        abreviatura: 'CADUCIDAD_CRITICA',
        label: 'Caducidad Crítica',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo CADUCIDAD_CRITICA',
    },
    [SubtipoAlerta.CADUCIDAD_ALTA]: {
        id: SubtipoAlerta.CADUCIDAD_ALTA,
        abreviatura: 'CADUCIDAD_ALTA',
        label: 'Caducidad Alta',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo CADUCIDAD_ALTA',
    },
    [SubtipoAlerta.CADUCIDAD_MEDIA]: {
        id: SubtipoAlerta.CADUCIDAD_MEDIA,
        abreviatura: 'CADUCIDAD_MEDIA',
        label: 'Caducidad Media',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo CADUCIDAD_MEDIA',
    },
    [SubtipoAlerta.NINGUNO]: {
        id: SubtipoAlerta.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin subtipo de alerta definido o no aplica. CONSTANTE POR DEFECTO.',
    },
};

// ==========================================
// ORIGEN ALERTA
export enum OrigenAlerta {
    SISTEMA = 2850,
    IA = 2851,
    USUARIO = 2852,
    TAREA_PROGRAMADA = 2853,
}

export const ORIGEN_ALERTA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [OrigenAlerta.SISTEMA]: {
        id: OrigenAlerta.SISTEMA,
        abreviatura: 'SISTEMA',
        label: 'Sistema',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta generada por el sistema operativo o módulos internos. Incluye eventos de seguridad, errores de procesos y notificaciones automáticas. Origen más común. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [OrigenAlerta.IA]: {
        id: OrigenAlerta.IA,
        abreviatura: 'IA',
        label: 'Inteligencia Artificial',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta generada por el motor de Inteligencia Artificial. Incluye predicciones de demanda, detección de anomalías y análisis de tendencias. Basada en modelos de aprendizaje automático.',
    },
    [OrigenAlerta.USUARIO]: {
        id: OrigenAlerta.USUARIO,
        abreviatura: 'USUARIO',
        label: 'Usuario',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta generada manualmente por un usuario del sistema. Incluye reportes de incidencias, solicitudes de revisión o notificaciones creadas por operadores.',
    },
    [OrigenAlerta.TAREA_PROGRAMADA]: {
        id: OrigenAlerta.TAREA_PROGRAMADA,
        abreviatura: 'TAREA_PROGRAMADA',
        label: 'Tarea Programada',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta generada por tareas programadas automáticas. Incluye resultados de procesos batch, ejecución de jobs y monitoreo periódico. Ejecutada según frecuencia configurada.',
    },
};

// ==========================================
// NIVEL CRITICO
export enum NivelCritico {
    CRITICO = 2900,
    ALTA = 2901,
    MEDIA = 2902,
    BAJA = 2903,
    INFORMATIVA = 2904
}

export const NIVEL_CRITICO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [NivelCritico.CRITICO]: {
        id: NivelCritico.CRITICO,
        abreviatura: 'CRITICO',
        label: 'Crítico',
        prefijo: null,
        valor: 0,
        descripcion: 'Nivel crítico. Impacto máximo en operaciones. Requiere acción inmediata. Aplica para quiebre de stock de medicamentos esenciales, fallos de seguridad o errores que detienen el sistema.',
    },
    [NivelCritico.ALTA]: {
        id: NivelCritico.ALTA,
        abreviatura: 'ALTA',
        label: 'Alta',
        prefijo: null,
        valor: 0,
        descripcion: 'Nivel alto de criticidad. Impacto significativo en operaciones. Requiere atención prioritaria en el corto plazo. Aplica para vencimientos inminentes o desviaciones importantes.',
    },
    [NivelCritico.MEDIA]: {
        id: NivelCritico.MEDIA,
        abreviatura: 'MEDIA',
        label: 'Media',
        prefijo: null,
        valor: 0,
        descripcion: 'Nivel medio de criticidad. Impacto moderado en operaciones. Requiere atención planificada. Aplica para stock bajo, alertas de rendimiento o desviaciones menores.',
    },
    [NivelCritico.BAJA]: {
        id: NivelCritico.BAJA,
        abreviatura: 'BAJA',
        label: 'Baja',
        prefijo: null,
        valor: 0,
        descripcion: 'Nivel bajo de criticidad. Impacto mínimo en operaciones. Requiere monitoreo sin acción inmediata. Aplica para alertas informativas o seguimiento de tendencias.',
    },
    [NivelCritico.INFORMATIVA]: {
        id: NivelCritico.INFORMATIVA,
        abreviatura: 'INFORMATIVA',
        label: 'Informativa',
        prefijo: null,
        valor: 0,
        descripcion: 'Nivel informativo. No representa una criticidad operativa. Solo proporciona información para conocimiento del usuario. Aplica para notificaciones de sistema y reportes. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// ESTADO ALERTA
export enum EstadoAlerta {
    PENDIENTE = 2950,
    EN_PROCESO = 2951,
    RESUELTA = 2952,
    IGNORADA = 2953,
    ESCALADA = 2954,
    NINGUNO = 2955,
}

export const ESTADO_ALERTA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoAlerta.PENDIENTE]: {
        id: EstadoAlerta.PENDIENTE,
        abreviatura: 'PENDIENTE',
        label: 'Pendiente',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta pendiente de atención. No se ha iniciado ningún proceso de resolución. Estado inicial de toda alerta. Requiere asignación de responsable.',
    },
    [EstadoAlerta.EN_PROCESO]: {
        id: EstadoAlerta.EN_PROCESO,
        abreviatura: 'EN_PROCESO',
        label: 'En Proceso',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta en proceso de resolución. Se ha asignado responsable y se están tomando acciones. La investigación o corrección está en curso. Requiere seguimiento activo.',
    },
    [EstadoAlerta.RESUELTA]: {
        id: EstadoAlerta.RESUELTA,
        abreviatura: 'RESUELTA',
        label: 'Resuelta',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta resuelta completamente. La causa ha sido identificada y corregida. No requiere acciones adicionales. Estado final exitoso de la alerta.',
    },
    [EstadoAlerta.IGNORADA]: {
        id: EstadoAlerta.IGNORADA,
        abreviatura: 'IGNORADA',
        label: 'Ignorada',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta ignorada. Se ha decidido no tomar acción por considerarse no relevante o de bajo impacto. Requiere justificación documentada. Estado final sin resolución.',
    },
    [EstadoAlerta.ESCALADA]: {
        id: EstadoAlerta.ESCALADA,
        abreviatura: 'ESCALADA',
        label: 'Escalada',
        prefijo: null,
        valor: 0,
        descripcion: 'Alerta escalada a nivel superior. No pudo ser resuelta en el nivel actual y requiere intervención de gerencia o soporte especializado. Requiere seguimiento priorizado.',
    },
    [EstadoAlerta.NINGUNO]: {
        id: EstadoAlerta.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin estado de alerta definido. Valor por defecto para registros comodín o cuando no aplica clasificación de estado de alerta. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// FRAMEWORK
export enum Framework {
    STATSMODELS = 3000,
    SCIKIT_LEARN = 3001,
    TENSORFLOW = 3002,
    CUSTOM = 3003,
    NINGUNO = 3004,
}

export const FRAMEWORK_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [Framework.STATSMODELS]: {
        id: Framework.STATSMODELS,
        abreviatura: 'STATSMODELS',
        label: 'Statsmodels',
        prefijo: null,
        valor: 0,
        descripcion: 'Framework estadístico para modelos de series temporales y econometría. Ideal para ARIMA, SARIMA y modelos lineales. Compatible con Python.',
    },
    [Framework.SCIKIT_LEARN]: {
        id: Framework.SCIKIT_LEARN,
        abreviatura: 'SCIKIT_LEARN',
        label: 'Scikit-learn',
        prefijo: null,
        valor: 0,
        descripcion: 'Framework de aprendizaje automático para clasificación, regresión y clustering. Incluye K-Means, Random Forest y SVM. Compatible con Python.',
    },
    [Framework.TENSORFLOW]: {
        id: Framework.TENSORFLOW,
        abreviatura: 'TENSORFLOW',
        label: 'TensorFlow',
        prefijo: null,
        valor: 0,
        descripcion: 'Framework de deep learning para redes neuronales y modelos avanzados. Incluye LSTM, CNN y Transformers. Compatible con Python.',
    },
    [Framework.CUSTOM]: {
        id: Framework.CUSTOM,
        abreviatura: 'CUSTOM',
        label: 'Custom',
        prefijo: null,
        valor: 0,
        descripcion: 'Framework personalizado o propietario. Desarrollado específicamente para necesidades particulares del sistema. No es un framework estándar.',
    },
    [Framework.NINGUNO]: {
        id: Framework.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin framework definido. Valor por defecto para modelos que no utilizan un framework específico o cuando no aplica. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// ESTADO EJECUCION
export enum EstadoEjecucion {
    EN_PROCESO = 3050,
    COMPLETADO = 3051,
    FALLIDO = 3052,
    NINGUNO = 3053,
}

export const ESTADO_EJECUCION_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoEjecucion.EN_PROCESO]: {
        id: EstadoEjecucion.EN_PROCESO,
        abreviatura: 'EN_PROCESO',
        label: 'En Proceso',
        prefijo: null,
        valor: 0,
        descripcion: 'Ejecución en curso. El proceso está activo y en ejecución. No hay resultados disponibles hasta su finalización. Aplica para entrenamientos de IA y procesos batch.',
    },
    [EstadoEjecucion.COMPLETADO]: {
        id: EstadoEjecucion.COMPLETADO,
        abreviatura: 'COMPLETADO',
        label: 'Completado',
        prefijo: null,
        valor: 0,
        descripcion: 'Ejecución finalizada exitosamente. El proceso ha concluido sin errores. Los resultados están disponibles para su uso. Aplica para tareas programadas y entrenamientos exitosos.',
    },
    [EstadoEjecucion.FALLIDO]: {
        id: EstadoEjecucion.FALLIDO,
        abreviatura: 'FALLIDO',
        label: 'Fallido',
        prefijo: null,
        valor: 0,
        descripcion: 'Ejecución fallida. El proceso ha terminado con errores. Requiere revisión de logs para identificar la causa. Aplica para entrenamientos fallidos y tareas con errores.',
    },
    [EstadoEjecucion.NINGUNO]: {
        id: EstadoEjecucion.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin estado de ejecución definido. Valor por defecto para registros comodín o cuando no se ha registrado estado de ejecución. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// TIPO METRICAS
export enum TipoMetrica {
    REGRESION = 3100,
    CLASIFICACION = 3101,
    CLUSTERING = 3102,
    NINGUNO = 3103,
}

export const TIPO_METRICA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoMetrica.REGRESION]: {
        id: TipoMetrica.REGRESION,
        abreviatura: 'REGRESION',
        label: 'Regresión',
        prefijo: null,
        valor: 0,
        descripcion: 'Métricas para modelos de regresión. Incluye MAE, RMSE, MAPE, R2 y otras métricas que evalúan la precisión de predicciones numéricas. Aplica para pronósticos de demanda y series temporales.',
    },
    [TipoMetrica.CLASIFICACION]: {
        id: TipoMetrica.CLASIFICACION,
        abreviatura: 'CLASIFICACION',
        label: 'Clasificación',
        prefijo: null,
        valor: 0,
        descripcion: 'Métricas para modelos de clasificación. Incluye F1 Score, precisión, sensibilidad y exactitud. Aplica para segmentación de clientes, clasificación de productos y detección de anomalías.',
    },
    [TipoMetrica.CLUSTERING]: {
        id: TipoMetrica.CLUSTERING,
        abreviatura: 'CLUSTERING',
        label: 'Clustering',
        prefijo: null,
        valor: 0,
        descripcion: 'Métricas para modelos de clustering. Incluye coeficiente de silueta, índice de Davies-Bouldin y otras métricas de calidad de agrupamiento. Aplica para segmentación ABC y agrupación de datos.',
    },
    [TipoMetrica.NINGUNO]: {
        id: TipoMetrica.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin tipo de métrica definido. Valor por defecto para casos donde no se requiere clasificación específica de métricas. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// NIVEL LOG
export enum NivelLog {
    INFO = 3150,
    WARNING = 3151,
    ERROR = 3152,
    DEBUG = 3153,
}

export const NIVEL_LOG_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [NivelLog.INFO]: {
        id: NivelLog.INFO,
        abreviatura: 'INFO',
        label: 'Información',
        prefijo: null,
        valor: 0,
        descripcion: 'Log informativo. Registra eventos normales del sistema, procesos exitosos y cambios de estado. No requiere acción. Utilizado para trazabilidad operativa. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [NivelLog.WARNING]: {
        id: NivelLog.WARNING,
        abreviatura: 'WARNING',
        label: 'Advertencia',
        prefijo: null,
        valor: 0,
        descripcion: 'Log de advertencia. Indica condiciones anormales que no son críticas pero requieren atención. Puede preceder a errores. Requiere monitoreo y posible acción preventiva.',
    },
    [NivelLog.ERROR]: {
        id: NivelLog.ERROR,
        abreviatura: 'ERROR',
        label: 'Error',
        prefijo: null,
        valor: 0,
        descripcion: 'Log de error. Indica fallos en procesos, excepciones o condiciones que impiden la ejecución normal. Requiere acción correctiva inmediata y análisis de causa raíz.',
    },
    [NivelLog.DEBUG]: {
        id: NivelLog.DEBUG,
        abreviatura: 'DEBUG',
        label: 'Depuración',
        prefijo: null,
        valor: 0,
        descripcion: 'Log de depuración. Registro detallado para desarrollo y diagnóstico. Incluye variables internas, trazas de ejecución y datos de depuración. No debe activarse en producción.',
    },
};

// ==========================================
// TIPO UBICACION MOVIMIENTO
export enum TipoUbicacionMovimiento {
    INGRESO = 3200,
    EGRESO = 3201,
}

export const TIPO_UBICACION_MOVIMIENTO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoUbicacionMovimiento.INGRESO]: {
        id: TipoUbicacionMovimiento.INGRESO,
        abreviatura: 'INGRESO',
        label: 'Ingreso',
        prefijo: null,
        valor: 0,
        descripcion: 'Movimiento que representa la entrada o ingreso físico de productos a una ubicación de almacenamiento (estantería, almacén o depósito). Incrementa el stock_actual de la ubicación de destino. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoUbicacionMovimiento.EGRESO]: {
        id: TipoUbicacionMovimiento.EGRESO,
        abreviatura: 'EGRESO',
        label: 'Egreso',
        prefijo: null,
        valor: 0,
        descripcion: 'Movimiento que representa la salida o egreso físico de productos desde una ubicación de almacenamiento hacia otra área, despacho o proceso. Disminuye el stock_actual de la ubicación de origen.',
    },
};

// ==========================================
// TIPO UMBRAL
export enum TipoUmbral {
    STOCK_MINIMO = 3250,
    DIAS_VENCIMIENTO = 3251,
    ERROR_PREDICCION = 3252,
    NINGUNO = 3253,
}

export const TIPO_UMBRAL_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoUmbral.STOCK_MINIMO]: {
        id: TipoUmbral.STOCK_MINIMO,
        abreviatura: 'STOCK_MINIMO',
        label: 'Stock Mínimo',
        prefijo: null,
        valor: 0,
        descripcion: 'Umbral de stock mínimo. Define el nivel mínimo de inventario permitido para un producto. Cuando el stock cae por debajo de este valor, se activa una alerta de reposición. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoUmbral.DIAS_VENCIMIENTO]: {
        id: TipoUmbral.DIAS_VENCIMIENTO,
        abreviatura: 'DIAS_VENCIMIENTO',
        label: 'Días de Vencimiento',
        prefijo: null,
        valor: 0,
        descripcion: 'Umbral de días de vencimiento. Define el número de días antes del vencimiento para activar una alerta. Aplica para control de caducidad y planificación de promociones.',
    },
    [TipoUmbral.ERROR_PREDICCION]: {
        id: TipoUmbral.ERROR_PREDICCION,
        abreviatura: 'ERROR_PREDICCION',
        label: 'Error de Predicción',
        prefijo: null,
        valor: 0,
        descripcion: 'Umbral de error de predicción. Define el porcentaje máximo de error permitido en pronósticos de demanda (MAPE). Si se supera, el modelo se considera rechazado y requiere reentrenamiento.',
    },
    [TipoUmbral.NINGUNO]: {
        id: TipoUmbral.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin tipo de umbral definido. Valor por defecto para configuraciones que no requieren clasificación específica de umbral.',
    },
};

// ==========================================
// ESTADO DOCUMENTO
export enum EstadoDocumento {
    EMITIDO = 3300,
    ANULADO = 3301,
    ANULADO_PARCIAL = 3302,
}

export const ESTADO_DOCUMENTO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoDocumento.EMITIDO]: {
        id: EstadoDocumento.EMITIDO,
        abreviatura: 'EMITIDO',
        label: 'Emitido',
        prefijo: null,
        valor: 0,
        descripcion: 'Documento emitido y vigente. El comprobante fiscal ha sido generado y registrado correctamente. Es válido ante el SIN. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoDocumento.ANULADO]: {
        id: EstadoDocumento.ANULADO,
        abreviatura: 'ANULADO',
        label: 'Anulado',
        prefijo: null,
        valor: 0,
        descripcion: 'Documento anulado completamente. El comprobante fiscal ha sido cancelado en su totalidad. No tiene validez fiscal. Se mantiene en histórico para auditoría.',
    },
    [EstadoDocumento.ANULADO_PARCIAL]: {
        id: EstadoDocumento.ANULADO_PARCIAL,
        abreviatura: 'ANULADO_PARCIAL',
        label: 'Anulado Parcial',
        prefijo: null,
        valor: 0,
        descripcion: 'Documento anulado parcialmente. Solo parte del comprobante fiscal ha sido cancelado (ej. devolución de algunos ítems). Afecta parcialmente la validez fiscal del documento.',
    },
};

// ==========================================
// FRECUENCIA
export enum Frecuencia {
    MINUTOS = 3350,
    HORAS = 3351,
    DIARIO = 3352,
    SEMANAL = 3353,
    MENSUAL = 3354,
    ANUAL = 3355,
    CRON = 3356,
    CONTINUA = 3357,
    TRIGGER_EVENTO = 3358,
    NINGUNO = 3359,
}

export const FRECUENCIA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [Frecuencia.MINUTOS]: {
        id: Frecuencia.MINUTOS,
        abreviatura: 'MINUTOS',
        label: 'Minutos',
        prefijo: null,
        valor: 0,
        descripcion: 'Ejecución programada en intervalos de minutos. Aplica para tareas que requieren monitoreo frecuente o actualizaciones rápidas. Configurable en parametros_globales.',
    },
    [Frecuencia.HORAS]: {
        id: Frecuencia.HORAS,
        abreviatura: 'HORAS',
        label: 'Horas',
        prefijo: null,
        valor: 0,
        descripcion: 'Ejecución programada en intervalos de horas. Aplica para tareas de sincronización, actualización de datos o procesos batch cortos.',
    },
    [Frecuencia.DIARIO]: {
        id: Frecuencia.DIARIO,
        abreviatura: 'DIARIO',
        label: 'Diario',
        prefijo: null,
        valor: 0,
        descripcion: 'Ejecución programada una vez al día. Aplica para tareas de generación de reportes diarios, respaldos y actualizaciones de inventario. Frecuencia más común.',
    },
    [Frecuencia.SEMANAL]: {
        id: Frecuencia.SEMANAL,
        abreviatura: 'SEMANAL',
        label: 'Semanal',
        prefijo: null,
        valor: 0,
        descripcion: 'Ejecución programada una vez por semana. Aplica para tareas de consolidación semanal, reportes gerenciales y análisis de tendencias.',
    },
    [Frecuencia.MENSUAL]: {
        id: Frecuencia.MENSUAL,
        abreviatura: 'MENSUAL',
        label: 'Mensual',
        prefijo: null,
        valor: 0,
        descripcion: 'Ejecución programada una vez al mes. Aplica para tareas de cierre contable, reportes mensuales y análisis de rendimiento de modelos.',
    },
    [Frecuencia.ANUAL]: {
        id: Frecuencia.ANUAL,
        abreviatura: 'ANUAL',
        label: 'Anual',
        prefijo: null,
        valor: 0,
        descripcion: 'Ejecución programada una vez al año. Aplica para tareas de cierre fiscal, auditorías anuales y mantenimiento mayor del sistema.',
    },
    [Frecuencia.CRON]: {
        id: Frecuencia.CRON,
        abreviatura: 'CRON',
        label: 'Expresión CRON',
        prefijo: null,
        valor: 0,
        descripcion: 'Ejecución programada mediante expresión CRON. Permite configuración flexible de fechas y horas. Aplica para tareas con programación compleja o personalizada.',
    },
    [Frecuencia.CONTINUA]: {
        id: Frecuencia.CONTINUA,
        abreviatura: 'CONTINUA',
        label: 'Continua',
        prefijo: null,
        valor: 0,
        descripcion: 'Ejecución continua sin interrupción. Aplica para tareas de monitoreo en tiempo real, servicios de background o procesos que requieren ejecución permanente.',
    },
    [Frecuencia.TRIGGER_EVENTO]: {
        id: Frecuencia.TRIGGER_EVENTO,
        abreviatura: 'TRIGGER_EVENTO',
        label: 'Por Evento',
        prefijo: null,
        valor: 0,
        descripcion: 'Ejecución disparada por un evento específico. Aplica para tareas que se activan ante condiciones o acciones particulares (ej. cambio de estado, fin de proceso).',
    },
    [Frecuencia.NINGUNO]: {
        id: Frecuencia.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin frecuencia definida. Valor por defecto para tareas que no requieren programación automática o que se ejecutan de forma manual. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// TIPO TAREA
export enum TipoTarea {
    REPORTE = 3400,
    ALERTA = 3401,
    BACKUP = 3402,
    MANTENIMIENTO = 3403,
    SUSPENSION_MOROSOS = 3404,
    GENERACION_COBROS = 3405,
    CALCULO_CATEGORIAS = 3406,
    LIMPIEZA = 3407,
    VALIDACION = 3408,
    NINGUNO = 3409,
}

export const TIPO_TAREA_METADATA: Record<TipoTarea, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoTarea.REPORTE]: {
        id: TipoTarea.REPORTE,
        abreviatura: 'REPORTE',
        label: 'Reporte',
        prefijo: 'TAR-REP',
        valor: 0,
        descripcion: 'Tarea automatizada para la generación y envío de reportes periódicos.',
    },
    [TipoTarea.ALERTA]: {
        id: TipoTarea.ALERTA,
        abreviatura: 'ALERTA',
        label: 'Alerta',
        prefijo: 'TAR-ALE',
        valor: 1,
        descripcion: 'Tarea encargada de evaluar condiciones y disparar notificaciones o alertas.',
    },
    [TipoTarea.BACKUP]: {
        id: TipoTarea.BACKUP,
        abreviatura: 'BACKUP',
        label: 'Backup',
        prefijo: 'TAR-BCK',
        valor: 2,
        descripcion: 'Tarea de respaldo programado de bases de datos o información crítica del sistema.',
    },
    [TipoTarea.MANTENIMIENTO]: {
        id: TipoTarea.MANTENIMIENTO,
        abreviatura: 'MANTENIMIENTO',
        label: 'Mantenimiento',
        prefijo: 'TAR-MNT',
        valor: 3,
        descripcion: 'Tarea de mantenimiento general, optimización o ejecución de rutinas de sistema.',
    },
    [TipoTarea.SUSPENSION_MOROSOS]: {
        id: TipoTarea.SUSPENSION_MOROSOS,
        abreviatura: 'SUSPENSION',
        label: 'Suspensión de Morosos',
        prefijo: 'TAR-SUS',
        valor: 4,
        descripcion: 'Tarea que bloquea o suspende de forma automática a usuarios o móviles con deudas vencidas.',
    },
    [TipoTarea.GENERACION_COBROS]: {
        id: TipoTarea.GENERACION_COBROS,
        abreviatura: 'GEN_COBROS',
        label: 'Generación de Cobros',
        prefijo: 'TAR-COB',
        valor: 5,
        descripcion: 'Tarea masiva encargada de generar cuotas, frecuencias o cargos recurrentes.',
    },
    [TipoTarea.CALCULO_CATEGORIAS]: {
        id: TipoTarea.CALCULO_CATEGORIAS,
        abreviatura: 'CALC_CAT',
        label: 'Cálculo de Categorías',
        prefijo: 'TAR-CAT',
        valor: 6,
        descripcion: 'Tarea periódica para recalcular rangos, puntajes o categorías de conductores y clientes.',
    },
    [TipoTarea.LIMPIEZA]: {
        id: TipoTarea.LIMPIEZA,
        abreviatura: 'LIMPIEZA',
        label: 'Limpieza',
        prefijo: 'TAR-LMP',
        valor: 7,
        descripcion: 'Tarea de purga o eliminación de registros temporales obsoletos (como carritos expirados o logs antiguos).',
    },
    [TipoTarea.VALIDACION]: {
        id: TipoTarea.VALIDACION,
        abreviatura: 'VALIDACION',
        label: 'Validación',
        prefijo: 'TAR-VAL',
        valor: 8,
        descripcion: 'Tarea de control de integridad de datos o verificación de documentos vencidos.',
    },
    [TipoTarea.NINGUNO]: {
        id: TipoTarea.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 9,
        descripcion: 'Sin tipo de tarea definido. Valor por defecto para registros comodín o casos excepcionales. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// SUBTIPO TAREA
export enum SubtipoTarea {
    SARIMA = 3450,
    SARIMAX = 3451,
    PROPHET = 3452,
    KMEANS = 3453,
    ROP_CALC = 3454,
    PATRON_CONSUMO = 3455,
    ALERTA_PREDICTIVA = 3456,
    VARIABLE_EXOGENA = 3457,
    METRICA_RENDIMIENTO = 3458,
    REENTRENAMIENTO = 3459,
    VALIDACION_CROSS = 3460,
    NINGUNO = 3461,
}

export const SUBTIPO_TAREA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [SubtipoTarea.SARIMA]: {
        id: SubtipoTarea.SARIMA,
        abreviatura: 'SARIMA',
        label: 'SARIMA',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo para tareas de entrenamiento y ejecución del modelo SARIMA (Seasonal ARIMA). Utilizado para pronósticos de demanda con componente estacional. Asociado a TipoTarea: FORECASTING, IA_MODELO.',
    },
    [SubtipoTarea.SARIMAX]: {
        id: SubtipoTarea.SARIMAX,
        abreviatura: 'SARIMAX',
        label: 'SARIMAX',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo para tareas de entrenamiento y ejecución del modelo SARIMAX (SARIMA con variables exógenas). Incorpora factores externos al pronóstico. Asociado a TipoTarea: FORECASTING, IA_MODELO.',
    },
    [SubtipoTarea.PROPHET]: {
        id: SubtipoTarea.PROPHET,
        abreviatura: 'PROPHET',
        label: 'Prophet',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo para tareas de entrenamiento y ejecución del modelo Prophet de Meta. Detecta estacionalidades múltiples y días festivos. Asociado a TipoTarea: FORECASTING, IA_MODELO.',
    },
    [SubtipoTarea.KMEANS]: {
        id: SubtipoTarea.KMEANS,
        abreviatura: 'KMEANS',
        label: 'K-Means',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo para tareas de clustering y clasificación con K-Means. Utilizado para segmentación ABC de inventario y clasificación de clientes. Asociado a TipoTarea: CLASIFICACION, IA_MODELO.',
    },
    [SubtipoTarea.ROP_CALC]: {
        id: SubtipoTarea.ROP_CALC,
        abreviatura: 'ROP_CALC',
        label: 'Cálculo ROP',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo para tareas de cálculo de Punto de Reorden (ROP). Determina niveles óptimos de reorden basados en demanda y lead time. Asociado a TipoTarea: OPTIMIZACION, FORECASTING.',
    },
    [SubtipoTarea.PATRON_CONSUMO]: {
        id: SubtipoTarea.PATRON_CONSUMO,
        abreviatura: 'PATRON_CONSUMO',
        label: 'Patrón de Consumo',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo para tareas de detección y análisis de patrones de consumo. Identifica estacionalidades y tendencias en datos históricos. Asociado a TipoTarea: FORECASTING, ANALISIS.',
    },
    [SubtipoTarea.ALERTA_PREDICTIVA]: {
        id: SubtipoTarea.ALERTA_PREDICTIVA,
        abreviatura: 'ALERTA_PREDICTIVA',
        label: 'Alerta Predictiva',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo para tareas de generación de alertas predictivas. Evalúa riesgos futuros basados en modelos de IA. Asociado a TipoTarea: ALERTA, IA_MODELO.',
    },
    [SubtipoTarea.VARIABLE_EXOGENA]: {
        id: SubtipoTarea.VARIABLE_EXOGENA,
        abreviatura: 'VARIABLE_EXOGENA',
        label: 'Variable Exógena',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo para tareas de procesamiento y actualización de variables exógenas. Obtiene datos externos (clima, festivos, economía). Asociado a TipoTarea: IA_MODELO, MANTENIMIENTO.',
    },
    [SubtipoTarea.METRICA_RENDIMIENTO]: {
        id: SubtipoTarea.METRICA_RENDIMIENTO,
        abreviatura: 'METRICA_RENDIMIENTO',
        label: 'Métrica de Rendimiento',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo para tareas de cálculo y actualización de métricas de rendimiento de modelos IA. Genera reportes de precisión. Asociado a TipoTarea: REPORTE, VALIDACION.',
    },
    [SubtipoTarea.REENTRENAMIENTO]: {
        id: SubtipoTarea.REENTRENAMIENTO,
        abreviatura: 'REENTRENAMIENTO',
        label: 'Reentrenamiento',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo para tareas de reentrenamiento automático de modelos. Ejecuta cuando el error supera el umbral configurado. Asociado a TipoTarea: IA_MODELO, MANTENIMIENTO.',
    },
    [SubtipoTarea.VALIDACION_CROSS]: {
        id: SubtipoTarea.VALIDACION_CROSS,
        abreviatura: 'VALIDACION_CROSS',
        label: 'Validación Cruzada',
        prefijo: null,
        valor: 0,
        descripcion: 'Subtipo para tareas de validación cruzada de modelos. Evalúa y compara el rendimiento de diferentes modelos. Asociado a TipoTarea: VALIDACION, IA_MODELO.',
    },
    [SubtipoTarea.NINGUNO]: {
        id: SubtipoTarea.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin subtipo de tarea definido. Valor por defecto para tareas que no requieren clasificación específica o cuando no aplica subtipo. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// MOTIVO DEVOLUCION
export enum MotivoDevolucion {
    PRODUCTO_VENCIDO = 3500,
    PRODUCTO_DAÑADO = 3501,
    ERROR_PEDIDO = 3502,
    EXCESO_STOCK = 3503,
    DESCONTINUADO = 3504,
    DEVOLUCION_CLIENTE = 3505,
    NINGUNO = 3506,
    PRODUCTO_NO_SOLICITADO = 3507,
}

export const MOTIVO_DEVOLUCION_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [MotivoDevolucion.PRODUCTO_VENCIDO]: {
        id: MotivoDevolucion.PRODUCTO_VENCIDO,
        abreviatura: 'PRODUCTO_VENCIDO',
        label: 'Producto Vencido',
        prefijo: 'PV',
        valor: 1,
        descripcion: 'Devolución por producto vencido. El producto ha superado su fecha de vencimiento y no puede ser comercializado. Aplica para devoluciones a proveedores o baja de inventario.',
    },
    [MotivoDevolucion.PRODUCTO_DAÑADO]: {
        id: MotivoDevolucion.PRODUCTO_DAÑADO,
        abreviatura: 'PRODUCTO_DAÑADO',
        label: 'Producto Dañado',
        prefijo: 'PD',
        valor: 2,
        descripcion: 'Devolución por producto dañado o roto. Incluye envases deteriorados, productos derramados o con daños físicos. No apto para la venta.',
    },
    [MotivoDevolucion.ERROR_PEDIDO]: {
        id: MotivoDevolucion.ERROR_PEDIDO,
        abreviatura: 'ERROR_PEDIDO',
        label: 'Error en Pedido',
        prefijo: 'EP',
        valor: 3,
        descripcion: 'Devolución por error en el pedido. Producto incorrecto, cantidad errónea o especificaciones no coincidentes. Aplica para devoluciones a proveedores por errores de despacho.',
    },
    [MotivoDevolucion.EXCESO_STOCK]: {
        id: MotivoDevolucion.EXCESO_STOCK,
        abreviatura: 'EXCESO_STOCK',
        label: 'Exceso de Stock',
        prefijo: 'ES',
        valor: 4,
        descripcion: 'Devolución por exceso de stock. Producto con inventario sobrepasado que no tiene rotación esperada. Aplica para devoluciones planificadas para liberar espacio.',
    },
    [MotivoDevolucion.DESCONTINUADO]: {
        id: MotivoDevolucion.DESCONTINUADO,
        abreviatura: 'DESCONTINUADO',
        label: 'Descontinuado',
        prefijo: 'DES',
        valor: 5,
        descripcion: 'Devolución por producto descontinuado. Producto que ya no es fabricado o comercializado. Aplica para devoluciones de productos que serán retirados del catálogo.',
    },
    [MotivoDevolucion.DEVOLUCION_CLIENTE]: {
        id: MotivoDevolucion.DEVOLUCION_CLIENTE,
        abreviatura: 'DEVOLUCION_CLIENTE',
        label: 'Devolución de Cliente',
        prefijo: 'DC',
        valor: 6,
        descripcion: 'Devolución por cliente. Producto devuelto voluntariamente por el comprador por insatisfacción, cambio de opinión o producto no deseado. Aplica para devoluciones de ventas.',
    },
    [MotivoDevolucion.NINGUNO]: {
        id: MotivoDevolucion.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'NIN',
        valor: 0,
        descripcion: 'Sin motivo de devolución definido. Valor por defecto para transacciones que no requieren clasificación de devolución o cuando no aplica motivo específico. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [MotivoDevolucion.PRODUCTO_NO_SOLICITADO]: {
        id: MotivoDevolucion.PRODUCTO_NO_SOLICITADO,
        abreviatura: 'PRODUCTO_NO_SOLICITADO',
        label: 'Producto No Solicitado',
        prefijo: null,
        valor: 0,
        descripcion: 'Devolución por producto no solicitado o error en el pedido',
    },
};

// ==========================================
// TIPO DESPACHO
export enum TipoDespacho {
    VENTA_MOSTRADOR = 3550,
    DOMICILIO = 3551,
    RETIRO = 3552,
    TRANSFERENCIA = 3553,
    NINGUNO = 3554,
}

export const TIPO_DESPACHO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoDespacho.VENTA_MOSTRADOR]: {
        id: TipoDespacho.VENTA_MOSTRADOR,
        abreviatura: 'VENTA_MOSTRADOR',
        label: 'Venta en Mostrador',
        prefijo: 'VM',
        valor: 1,
        descripcion: 'Venta realizada directamente en el mostrador de la farmacia. El cliente recibe el producto en el punto de venta. No requiere logística de entrega. Modalidad más común.',
    },
    [TipoDespacho.DOMICILIO]: {
        id: TipoDespacho.DOMICILIO,
        abreviatura: 'DOMICILIO',
        label: 'A Domicilio',
        prefijo: 'DOM',
        valor: 2,
        descripcion: 'Despacho a domicilio del cliente. El producto es entregado en la dirección indicada por el comprador. Requiere logística de reparto y gestión de tiempos de entrega.',
    },
    [TipoDespacho.RETIRO]: {
        id: TipoDespacho.RETIRO,
        abreviatura: 'RETIRO',
        label: 'Retiro en Sucursal',
        prefijo: 'RET',
        valor: 3,
        descripcion: 'Cliente retira el producto en la sucursal después de haber realizado el pedido. Aplica para pedidos por teléfono, web o aplicación. El producto es reservado para el cliente.',
    },
    [TipoDespacho.TRANSFERENCIA]: {
        id: TipoDespacho.TRANSFERENCIA,
        abreviatura: 'TRANSFERENCIA',
        label: 'Transferencia',
        prefijo: 'TRF',
        valor: 4,
        descripcion: 'Transferencia de producto entre sucursales para cumplir con un pedido. El cliente retira en una sucursal diferente a la que originó el pedido. Requiere coordinación logística.',
    },
    [TipoDespacho.NINGUNO]: {
        id: TipoDespacho.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'NIN',
        valor: 0,
        descripcion: 'Sin tipo de despacho definido. Valor por defecto para transacciones que não requieren clasificación de despacho, como compras a proveedores, ajustes de inventario o movimientos internos. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// METRICA PRECISION
export enum MetricaPrecision {
    MAE = 3600,
    RMSE = 3601,
    MAPE = 3602,
    R2 = 3603,
    F1 = 3604,
    NINGUNO = 3605,
}

export const METRICA_PRECISION_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [MetricaPrecision.MAE]: {
        id: MetricaPrecision.MAE,
        abreviatura: 'MAE',
        label: 'MAE (Error Absoluto Medio)',
        prefijo: 'MAE',
        valor: 1,
        descripcion: 'Mean Absolute Error (Error Absoluto Medio). Mide la magnitud promedio de los errores en un conjunto de predicciones, sin considerar su dirección. Útil para modelos de regresión.',
    },
    [MetricaPrecision.RMSE]: {
        id: MetricaPrecision.RMSE,
        abreviatura: 'RMSE',
        label: 'RMSE (Raíz del Error Cuadrático Medio)',
        prefijo: 'RMSE',
        valor: 2,
        descripcion: 'Root Mean Square Error (Raíz del Error Cuadrático Medio). Penaliza errores grandes más que MAE. Útil para modelos de regresión donde se quiere evitar errores extremos.',
    },
    [MetricaPrecision.MAPE]: {
        id: MetricaPrecision.MAPE,
        abreviatura: 'MAPE',
        label: 'MAPE (Error Porcentual Absoluto Medio)',
        prefijo: 'MAPE',
        valor: 3,
        descripcion: 'Mean Absolute Percentage Error (Error Porcentual Absoluto Medio). Expresa el error en porcentaje, facilitando la interpretación. Útil para comparar precisión entre diferentes escalas.',
    },
    [MetricaPrecision.R2]: {
        id: MetricaPrecision.R2,
        abreviatura: 'R2',
        label: 'R² (Coeficiente de Determinación)',
        prefijo: 'R2',
        valor: 4,
        descripcion: 'R-squared (Coeficiente de Determinación). Mide la proporción de varianza explicada por el modelo. Valores cercanos a 1 indican mejor ajuste. Útil para modelos de regresión.',
    },
    [MetricaPrecision.F1]: {
        id: MetricaPrecision.F1,
        abreviatura: 'F1',
        label: 'F1 Score',
        prefijo: 'F1',
        valor: 5,
        descripcion: 'F1 Score (Puntuación F1). Media armónica entre precisión y sensibilidad. Útil para modelos de clasificación con clases desbalanceadas.',
    },
    [MetricaPrecision.NINGUNO]: {
        id: MetricaPrecision.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'NIN',
        valor: 0,
        descripcion: 'Sin métrica de precisión definida. Valor por defecto para modelos que no han sido evaluados o cuando no aplica métrica específica. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// FACTOR ESTACIONALIDAD
export enum FactorEstacionalidad {
    NONE = 3650,
    DIARIO = 3651,
    SEMANAL = 3652,
    MENSUAL = 3653,
    ANUAL = 3654,
    MULTIPLE = 3655,
}

export const FACTOR_ESTACIONALIDAD_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [FactorEstacionalidad.NONE]: {
        id: FactorEstacionalidad.NONE,
        abreviatura: 'NONE',
        label: 'Ninguno',
        prefijo: 'NON',
        valor: 0,
        descripcion: 'Sin componente estacional. El modelo no considera estacionalidad en el pronóstico. Aplica para productos con demanda constante o cuando la estacionalidad no es significativa. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [FactorEstacionalidad.DIARIO]: {
        id: FactorEstacionalidad.DIARIO,
        abreviatura: 'DIARIO',
        label: 'Diario',
        prefijo: 'DIA',
        valor: 1,
        descripcion: 'Estacionalidad con patrón diario recurrente. El comportamiento de demanda se repite cada día. Aplica para productos con horarios de consumo específicos (ej. medicamentos para el desayuno, almuerzo o cena).',
    },
    [FactorEstacionalidad.SEMANAL]: {
        id: FactorEstacionalidad.SEMANAL,
        abreviatura: 'SEMANAL',
        label: 'Semanal',
        prefijo: 'SEM',
        valor: 2,
        descripcion: 'Estacionalidad con patrón semanal recurrente. El comportamiento de demanda se repite cada semana. Aplica para productos con mayor consumo en días específicos (ej. fines de semana, días de consulta médica).',
    },
    [FactorEstacionalidad.MENSUAL]: {
        id: FactorEstacionalidad.MENSUAL,
        abreviatura: 'MENSUAL',
        label: 'Mensual',
        prefijo: 'MEN',
        valor: 3,
        descripcion: 'Estacionalidad con patrón mensual recurrente. El comportamiento de demanda se repite cada mes. Aplica para productos con consumo vinculado a ciclos mensuales (ej. medicamentos de prescripción mensual, productos de planificación familiar).',
    },
    [FactorEstacionalidad.ANUAL]: {
        id: FactorEstacionalidad.ANUAL,
        abreviatura: 'ANUAL',
        label: 'Anual',
        prefijo: 'ANU',
        valor: 4,
        descripcion: 'Estacionalidad con patrón anual recurrente. El comportamiento de demanda se repite cada año. Aplica para productos con consumo estacional (ej. antigripales en invierno, antialérgicos en primavera, vacunas en campañas anuales).',
    },
    [FactorEstacionalidad.MULTIPLE]: {
        id: FactorEstacionalidad.MULTIPLE,
        abreviatura: 'MULTIPLE',
        label: 'Múltiple',
        prefijo: 'MUL',
        valor: 5,
        descripcion: 'Estacionalidad con múltiples patrones combinados (ej. semanal + anual, mensual + anual). El comportamiento de demanda tiene más de una componente estacional significativa. Aplica para productos con estacionalidad compleja.',
    },
};

// ==========================================
// ESTADO PEDIDO ONLINE
export enum EstadoPedidoOnline {
    PENDIENTE = 3700,
    CONFIRMADO = 3701,
    PREPARANDO = 3702,
    EN_CAMINO = 3703,
    ENTREGADO = 3704,
    CANCELADO = 3705,
    RECHAZADO = 3706,
}

export const ESTADO_PEDIDO_ONLINE_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoPedidoOnline.PENDIENTE]: {
        id: EstadoPedidoOnline.PENDIENTE,
        abreviatura: 'PENDIENTE',
        label: 'Pendiente',
        prefijo: null,
        valor: 0,
        descripcion: 'Pedido recibido, pendiente de confirmación. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoPedidoOnline.CONFIRMADO]: {
        id: EstadoPedidoOnline.CONFIRMADO,
        abreviatura: 'CONFIRMADO',
        label: 'Confirmado',
        prefijo: null,
        valor: 1,
        descripcion: 'Pedido confirmado por la farmacia',
    },
    [EstadoPedidoOnline.PREPARANDO]: {
        id: EstadoPedidoOnline.PREPARANDO,
        abreviatura: 'PREPARANDO',
        label: 'Preparando',
        prefijo: null,
        valor: 2,
        descripcion: 'Pedido en proceso de preparación',
    },
    [EstadoPedidoOnline.EN_CAMINO]: {
        id: EstadoPedidoOnline.EN_CAMINO,
        abreviatura: 'EN_CAMINO',
        label: 'En Camino',
        prefijo: null,
        valor: 3,
        descripcion: 'Pedido despachado, en ruta de entrega',
    },
    [EstadoPedidoOnline.ENTREGADO]: {
        id: EstadoPedidoOnline.ENTREGADO,
        abreviatura: 'ENTREGADO',
        label: 'Entregado',
        prefijo: null,
        valor: 4,
        descripcion: 'Pedido entregado al cliente',
    },
    [EstadoPedidoOnline.CANCELADO]: {
        id: EstadoPedidoOnline.CANCELADO,
        abreviatura: 'CANCELADO',
        label: 'Cancelado',
        prefijo: null,
        valor: 5,
        descripcion: 'Pedido cancelado por el cliente o la farmacia',
    },
    [EstadoPedidoOnline.RECHAZADO]: {
        id: EstadoPedidoOnline.RECHAZADO,
        abreviatura: 'RECHAZADO',
        label: 'Rechazado',
        prefijo: null,
        valor: 6,
        descripcion: 'Pedido rechazado por el cliente',
    },
};

// ==========================================
// METODO CALCULO
export enum MetodoCalculo {
    PONDERADO = 3750,
    FIFO = 3751,
    ULTIMA_COMPRA = 3752,
}

export const METODO_CALCULO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [MetodoCalculo.PONDERADO]: {
        id: MetodoCalculo.PONDERADO,
        abreviatura: 'PONDERADO',
        label: 'Promedio Ponderado',
        prefijo: null,
        valor: 0,
        descripcion: 'Costo promedio ponderado: (stock_actual * costo_anterior + cantidad_comprada * costo_compra) / (stock_actual + cantidad_comprada). CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [MetodoCalculo.FIFO]: {
        id: MetodoCalculo.FIFO,
        abreviatura: 'FIFO',
        label: 'FIFO (PEPS)',
        prefijo: null,
        valor: 0,
        descripcion: 'Primeras en entrar, primeras en salir. Se venden primero los lotes más antiguos.',
    },
    [MetodoCalculo.ULTIMA_COMPRA]: {
        id: MetodoCalculo.ULTIMA_COMPRA,
        abreviatura: 'ULTIMA_COMPRA',
        label: 'Última Compra',
        prefijo: null,
        valor: 0,
        descripcion: 'Usa el costo del último lote comprado como referencia.',
    },
};

// ==========================================
// GRADO EQUIVALENCIA
export enum GradoEquivalencia {
    TOTAL = 3800,
    PARCIAL = 3801,
    TERAPEUTICO = 3802,
    NINGUNO = 3803,
}

export const GRADO_EQUIVALENCIA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [GradoEquivalencia.TOTAL]: {
        id: GradoEquivalencia.TOTAL,
        abreviatura: 'TOTAL',
        label: 'Total',
        prefijo: null,
        valor: 1,
        descripcion: 'Mismo principio activo, misma concentración, misma forma farmacéutica. Intercambio directo y seguro. No requiere ajuste de dosis ni evaluación médica adicional.',
    },
    [GradoEquivalencia.PARCIAL]: {
        id: GradoEquivalencia.PARCIAL,
        abreviatura: 'PARCIAL',
        label: 'Parcial',
        prefijo: null,
        valor: 2,
        descripcion: 'Mismo principio activo, diferente concentración o forma farmacéutica. Requiere ajuste de dosis por parte del profesional de salud. No es intercambio directo.',
    },
    [GradoEquivalencia.TERAPEUTICO]: {
        id: GradoEquivalencia.TERAPEUTICO,
        abreviatura: 'TERAPEUTICO',
        label: 'Terapéutico',
        prefijo: null,
        valor: 3,
        descripcion: 'Diferente principio activo pero mismo efecto terapéutico. Requiere evaluación médica obligatoria antes del intercambio. No es intercambio directo.',
    },
    [GradoEquivalencia.NINGUNO]: {
        id: GradoEquivalencia.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 4,
        descripcion: 'Sin grado de equivalencia definido. Valor por defecto para productos sin equivalencia registrada o cuando no aplica clasificación. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// TIPO RECETA
export enum TipoReceta {
    SIMPLE = 3850,
    ARCHIVADA = 3851,
    VALADA = 3852,
    NINGUNO = 3853,
}

export const TIPO_RECETA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoReceta.SIMPLE]: {
        id: TipoReceta.SIMPLE,
        abreviatura: 'SIMPLE',
        label: 'Simple',
        prefijo: 'SIM',
        valor: 1,
        descripcion: 'Receta médica estándar para medicamentos de venta libre,  antibióticos comunes y medicamentos que no requieren control especial. No requiere retención física en farmacia.',
    },
    [TipoReceta.ARCHIVADA]: {
        id: TipoReceta.ARCHIVADA,
        abreviatura: 'ARCHIVADA',
        label: 'Archivada',
        prefijo: 'ARC',
        valor: 2,
        descripcion: 'Receta retenida obligatoriamente en farmacia. Aplica para medicamentos psicotrópicos y sustancias fiscalizadas que requieren control de dispensación. Se debe conservar por el tiempo establecido por normativa.',
    },
    [TipoReceta.VALADA]: {
        id: TipoReceta.VALADA,
        abreviatura: 'VALADA',
        label: 'Valorada',
        prefijo: 'VAL',
        valor: 3,
        descripcion: 'Receta oficial valorada y timbrada por autoridad competente. Aplica para estupefacientes y medicamentos de control estricto. Requiere registro especial y cumplimiento riguroso de normativa.',
    },
    [TipoReceta.NINGUNO]: {
        id: TipoReceta.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'NIN',
        valor: 4,
        descripcion: 'Sin tipo de receta definido. Valor por defecto para casos donde no se requiere receta médica (venta libre, productos OTC, dispositivos médicos) o cuando no aplica el control por receta. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// MODALIDAD FACTURACION
export enum ModalidadFacturacion {
    NINGUNO = 3900,
    ELECTRONICA = 3901,
    COMPUTARIZADA = 3902,
    MANUAL = 3903,
}

export const MODALIDAD_FACTURACION_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [ModalidadFacturacion.NINGUNO]: {
        id: ModalidadFacturacion.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'NIN',
        valor: 0,
        descripcion: 'Modalidad de facturación ninguno. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [ModalidadFacturacion.ELECTRONICA]: {
        id: ModalidadFacturacion.ELECTRONICA,
        abreviatura: 'ELECTRONICA',
        label: 'Electrónica en Línea',
        prefijo: 'EL',
        valor: 1,
        descripcion: 'Electrónica en Línea',
    },
    [ModalidadFacturacion.COMPUTARIZADA]: {
        id: ModalidadFacturacion.COMPUTARIZADA,
        abreviatura: 'COMPUTARIZADA',
        label: 'Computarizada en Línea',
        prefijo: 'CL',
        valor: 2,
        descripcion: 'Computarizada en Línea',
    },
    [ModalidadFacturacion.MANUAL]: {
        id: ModalidadFacturacion.MANUAL,
        abreviatura: 'MANUAL',
        label: 'Manual',
        prefijo: 'MN',
        valor: 3,
        descripcion: 'Manual',
    },
};

// ==========================================
// TIPO PUNTO VENTA
export enum TipoPuntoVenta {
    NINGUNO = 3950,
    CAJA = 3951,
}

export const TIPO_PUNTO_VENTA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoPuntoVenta.NINGUNO]: {
        id: TipoPuntoVenta.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'NIN',
        valor: 0,
        descripcion: 'Tipo punto venta ninguno. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoPuntoVenta.CAJA]: {
        id: TipoPuntoVenta.CAJA,
        abreviatura: 'CAJA',
        label: 'Caja',
        prefijo: 'CAJ',
        valor: 1,
        descripcion: 'Punto de venta caja.',
    },
};

// ==========================================
// ESTADO PROFORMA
export enum EstadoProforma {
    NO_APLICA = 4000,
    PENDIENTE = 4001,
    CONVERTIDA = 4002,
    EXPIRADA = 4003,
    ANULADA = 4004,
}

export const ESTADO_PROFORMA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoProforma.NO_APLICA]: {
        id: EstadoProforma.NO_APLICA,
        abreviatura: 'NO_APLICA',
        label: 'No Aplica',
        prefijo: null,
        valor: 0,
        descripcion: 'Proforma por default. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoProforma.PENDIENTE]: {
        id: EstadoProforma.PENDIENTE,
        abreviatura: 'PENDIENTE',
        label: 'Pendiente',
        prefijo: null,
        valor: 0,
        descripcion: 'Proforma o reserva emitida y pendiente de resolución o cobro. ',
    },
    [EstadoProforma.CONVERTIDA]: {
        id: EstadoProforma.CONVERTIDA,
        abreviatura: 'CONVERTIDA',
        label: 'Convertida',
        prefijo: null,
        valor: 1,
        descripcion: 'Proforma o reserva convertida exitosamente en venta definitiva.',
    },
    [EstadoProforma.EXPIRADA]: {
        id: EstadoProforma.EXPIRADA,
        abreviatura: 'EXPIRADA',
        label: 'Expirada',
        prefijo: null,
        valor: 2,
        descripcion: 'Reserva cancelada automáticamente por tiempo vencido (TTL) liberando el stock.',
    },
    [EstadoProforma.ANULADA]: {
        id: EstadoProforma.ANULADA,
        abreviatura: 'ANULADA',
        label: 'Anulada',
        prefijo: null,
        valor: 3,
        descripcion: 'Proforma o reserva anulada manualmente por el operador.',
    },
};

// ==========================================
// TIPO OPERACION ALMACEN
export enum TipoOperacionAlmacen {
    LOGISTICA_INTERNA = 4050,
    VENTA_DIRECTA = 4051,
}

export const TIPO_OPERACION_ALMACEN_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoOperacionAlmacen.LOGISTICA_INTERNA]: {
        id: TipoOperacionAlmacen.LOGISTICA_INTERNA,
        abreviatura: 'LOGISTICA_INTERNA',
        label: 'Logística Interna',
        prefijo: 'LI',
        valor: 0,
        descripcion: 'Almacén destinado a depósito general, tránsito o reabastecimiento interno sin venta directa. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoOperacionAlmacen.VENTA_DIRECTA]: {
        id: TipoOperacionAlmacen.VENTA_DIRECTA,
        abreviatura: 'VENTA_DIRECTA',
        label: 'Venta Directa',
        prefijo: 'VD',
        valor: 1,
        descripcion: 'Almacén vinculado a un punto de venta donde las transacciones afectan directamente el stock operativo.',
    },
};

// ==========================================
// ENTIDAD AFECTADA
export enum EntidadAfectada {
    PRODUCTOS = 4100,
    LOTES = 4101,
    VENTAS = 4102,
    COMPRAS = 4103,
    USUARIOS = 4104,
    SUCURSALES = 4105,
    PROVEEDORES = 4106,
    CLIENTES = 4107,
    FACTURAS = 4108,
    PAGOS = 4109,
    INVENTARIO = 4110,
    NINGUNO = 4111,
}

export const ENTIDAD_AFECTADA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EntidadAfectada.PRODUCTOS]: {
        id: EntidadAfectada.PRODUCTOS,
        abreviatura: 'PRODUCTOS',
        label: 'Productos',
        prefijo: 'PROD',
        valor: 0,
        descripcion: 'Productos del catalogo general. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EntidadAfectada.LOTES]: {
        id: EntidadAfectada.LOTES,
        abreviatura: 'LOTES',
        label: 'Lotes',
        prefijo: 'LOT',
        valor: 0,
        descripcion: 'Lotes de inventario y fechas de vencimiento.',
    },
    [EntidadAfectada.VENTAS]: {
        id: EntidadAfectada.VENTAS,
        abreviatura: 'VENTAS',
        label: 'Ventas',
        prefijo: 'VEN',
        valor: 0,
        descripcion: 'Transacciones de venta realizadas.',
    },
    [EntidadAfectada.COMPRAS]: {
        id: EntidadAfectada.COMPRAS,
        abreviatura: 'COMPRAS',
        label: 'Compras',
        prefijo: 'COM',
        valor: 0,
        descripcion: 'Transacciones de compra a proveedores.',
    },
    [EntidadAfectada.USUARIOS]: {
        id: EntidadAfectada.USUARIOS,
        abreviatura: 'USUARIOS',
        label: 'Usuarios',
        prefijo: 'USR',
        valor: 0,
        descripcion: 'Usuarios del sistema registrados.',
    },
    [EntidadAfectada.SUCURSALES]: {
        id: EntidadAfectada.SUCURSALES,
        abreviatura: 'SUCURSALES',
        label: 'Sucursales',
        prefijo: 'SUC',
        valor: 0,
        descripcion: 'Sucursales operativas de la empresa.',
    },
    [EntidadAfectada.PROVEEDORES]: {
        id: EntidadAfectada.PROVEEDORES,
        abreviatura: 'PROVEEDORES',
        label: 'Proveedores',
        prefijo: 'PROV',
        valor: 0,
        descripcion: 'Proveedores comerciales registrados.',
    },
    [EntidadAfectada.CLIENTES]: {
        id: EntidadAfectada.CLIENTES,
        abreviatura: 'CLIENTES',
        label: 'Clientes',
        prefijo: 'CLI',
        valor: 0,
        descripcion: 'Clientes del sistema o compradores.',
    },
    [EntidadAfectada.FACTURAS]: {
        id: EntidadAfectada.FACTURAS,
        abreviatura: 'FACTURAS',
        label: 'Facturas',
        prefijo: 'FAC',
        valor: 0,
        descripcion: 'Documentos fiscales y facturación.',
    },
    [EntidadAfectada.PAGOS]: {
        id: EntidadAfectada.PAGOS,
        abreviatura: 'PAGOS',
        label: 'Pagos',
        prefijo: 'PAG',
        valor: 0,
        descripcion: 'Pagos, abonos y transacciones financieras.',
    },
    [EntidadAfectada.INVENTARIO]: {
        id: EntidadAfectada.INVENTARIO,
        abreviatura: 'INVENTARIO',
        label: 'Inventario',
        prefijo: 'INV',
        valor: 0,
        descripcion: 'Movimientos generales de inventario y stock.',
    },
    [EntidadAfectada.NINGUNO]: {
        id: EntidadAfectada.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'NIN',
        valor: 0,
        descripcion: 'Sin entidad afectada o registro neutral. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// CRITICIDAD MEDICA
export enum CriticidadMedica {
    NORMAL = 4150,
    CRITICO = 4151,
}

export const CRITICIDAD_MEDICA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [CriticidadMedica.NORMAL]: {
        id: CriticidadMedica.NORMAL,
        abreviatura: 'NORMAL',
        label: 'Normal',
        prefijo: null,
        valor: 0,
        descripcion: 'Producto sin criticidad medica especial. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [CriticidadMedica.CRITICO]: {
        id: CriticidadMedica.CRITICO,
        abreviatura: 'CRITICO',
        label: 'Crítico',
        prefijo: null,
        valor: 0,
        descripcion: 'Producto critico para la salud',
    },
};

// ==========================================
// TIPO PATRON
export enum TipoPatron {
    DEMANDA = 4200,
}

export const TIPO_PATRON_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoPatron.DEMANDA]: {
        id: TipoPatron.DEMANDA,
        abreviatura: 'DEMANDA',
        label: 'Demanda',
        prefijo: 'DEM',
        valor: 0,
        descripcion: 'Patrón basado en la demanda histórica. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// FUENTE EXOGENA
export enum FuenteExogena {
    SENAMHI = 4250,
    INE = 4251,
    BCB = 4252,
    API_CLIMA = 4253,
    CALENDARIO_FESTIVOS = 4254,
    CUSTOM = 4255,
}

export const FUENTE_EXOGENA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [FuenteExogena.SENAMHI]: {
        id: FuenteExogena.SENAMHI,
        abreviatura: 'SENAMHI',
        label: 'SENAMHI',
        prefijo: null,
        valor: 0,
        descripcion: 'Servicio Nacional de Meteorologia e Hidrologia. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [FuenteExogena.INE]: {
        id: FuenteExogena.INE,
        abreviatura: 'INE',
        label: 'INE',
        prefijo: null,
        valor: 0,
        descripcion: 'Instituto Nacional de Estadistica',
    },
    [FuenteExogena.BCB]: {
        id: FuenteExogena.BCB,
        abreviatura: 'BCB',
        label: 'Banco Central de Bolivia',
        prefijo: null,
        valor: 0,
        descripcion: 'Banco Central de Bolivia',
    },
    [FuenteExogena.API_CLIMA]: {
        id: FuenteExogena.API_CLIMA,
        abreviatura: 'API_CLIMA',
        label: 'API de Clima',
        prefijo: null,
        valor: 0,
        descripcion: 'API de clima externa',
    },
    [FuenteExogena.CALENDARIO_FESTIVOS]: {
        id: FuenteExogena.CALENDARIO_FESTIVOS,
        abreviatura: 'CALENDARIO_FESTIVOS',
        label: 'Calendario de Festivos',
        prefijo: null,
        valor: 0,
        descripcion: 'Calendario oficial de festivos',
    },
    [FuenteExogena.CUSTOM]: {
        id: FuenteExogena.CUSTOM,
        abreviatura: 'CUSTOM',
        label: 'Personalizada',
        prefijo: null,
        valor: 0,
        descripcion: 'Fuente personalizada definida por el usuario',
    },
};

// ==========================================
// TIPO BILLETE MONEDA
export enum TipoBilleteMoneda {
    NINGUNO = 4300,
    B200 = 4301,
    B100 = 4302,
    B50 = 4303,
    B20 = 4304,
    B10 = 4305,
    B5 = 4306,
    B2 = 4307,
    B1 = 4308,
    M050 = 4309,
    M020 = 4310,
    M010 = 4311,
    M10 = 4312,
    M5 = 4313,
    M2 = 4314,
    M1 = 4315,
}

export const TIPO_BILLETE_MONEDA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoBilleteMoneda.NINGUNO]: {
        id: TipoBilleteMoneda.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Registro comodín para arqueos. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoBilleteMoneda.B200]: {
        id: TipoBilleteMoneda.B200,
        abreviatura: 'B200',
        label: 'Billete de 200 Bs',
        prefijo: null,
        valor: 0,
        descripcion: 'Billete de 200 Bs',
    },
    [TipoBilleteMoneda.B100]: {
        id: TipoBilleteMoneda.B100,
        abreviatura: 'B100',
        label: 'Billete de 100 Bs',
        prefijo: null,
        valor: 0,
        descripcion: 'Billete de 100 Bs',
    },
    [TipoBilleteMoneda.B50]: {
        id: TipoBilleteMoneda.B50,
        abreviatura: 'B50',
        label: 'Billete de 50 Bs',
        prefijo: null,
        valor: 0,
        descripcion: 'Billete de 50 Bs',
    },
    [TipoBilleteMoneda.B20]: {
        id: TipoBilleteMoneda.B20,
        abreviatura: 'B20',
        label: 'Billete de 20 Bs',
        prefijo: null,
        valor: 0,
        descripcion: 'Billete de 20 Bs',
    },
    [TipoBilleteMoneda.B10]: {
        id: TipoBilleteMoneda.B10,
        abreviatura: 'B10',
        label: 'Billete de 10 Bs',
        prefijo: null,
        valor: 0,
        descripcion: 'Billete de 10 Bs',
    },
    [TipoBilleteMoneda.B5]: {
        id: TipoBilleteMoneda.B5,
        abreviatura: 'B5',
        label: 'Billete de 5 Bs',
        prefijo: null,
        valor: 0,
        descripcion: 'Billete de 5 Bs',
    },
    [TipoBilleteMoneda.B2]: {
        id: TipoBilleteMoneda.B2,
        abreviatura: 'B2',
        label: 'Billete de 2 Bs',
        prefijo: null,
        valor: 0,
        descripcion: 'Billete de 2 Bs',
    },
    [TipoBilleteMoneda.B1]: {
        id: TipoBilleteMoneda.B1,
        abreviatura: 'B1',
        label: 'Billete de 1 Bs',
        prefijo: null,
        valor: 0,
        descripcion: 'Billete de 1 Bs',
    },
    [TipoBilleteMoneda.M050]: {
        id: TipoBilleteMoneda.M050,
        abreviatura: 'M050',
        label: 'Moneda de 50 centavos',
        prefijo: null,
        valor: 0,
        descripcion: 'Moneda de 50 centavos',
    },
    [TipoBilleteMoneda.M020]: {
        id: TipoBilleteMoneda.M020,
        abreviatura: 'M020',
        label: 'Moneda de 20 centavos',
        prefijo: null,
        valor: 0,
        descripcion: 'Moneda de 20 centavos',
    },
    [TipoBilleteMoneda.M010]: {
        id: TipoBilleteMoneda.M010,
        abreviatura: 'M010',
        label: 'Moneda de 10 centavos',
        prefijo: null,
        valor: 0,
        descripcion: 'Moneda de 10 centavos',
    },
    [TipoBilleteMoneda.M10]: {
        id: TipoBilleteMoneda.M10,
        abreviatura: 'M10',
        label: 'Moneda de 10 Bs',
        prefijo: null,
        valor: 0,
        descripcion: 'Moneda de 10 Bs',
    },
    [TipoBilleteMoneda.M5]: {
        id: TipoBilleteMoneda.M5,
        abreviatura: 'M5',
        label: 'Moneda de 5 Bs',
        prefijo: null,
        valor: 0,
        descripcion: 'Moneda de 5 Bs',
    },
    [TipoBilleteMoneda.M2]: {
        id: TipoBilleteMoneda.M2,
        abreviatura: 'M2',
        label: 'Moneda de 2 Bs',
        prefijo: null,
        valor: 0,
        descripcion: 'Moneda de 2 Bs',
    },
    [TipoBilleteMoneda.M1]: {
        id: TipoBilleteMoneda.M1,
        abreviatura: 'M1',
        label: 'Moneda de 1 Bs',
        prefijo: null,
        valor: 0,
        descripcion: 'Moneda de 1 Bs',
    },
};

// ==========================================
// TIPO APLICACION
export enum TipoAplicacion {
    GLOBAL = 4350,
    CATEGORIA = 4351,
    LABORATORIO = 4352,
    PRODUCTO = 4353,
}

export const TIPO_APLICACION_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoAplicacion.GLOBAL]: {
        id: TipoAplicacion.GLOBAL,
        abreviatura: 'GLOBAL',
        label: 'Global',
        prefijo: null,
        valor: 0,
        descripcion: 'Política que aplica a todos los productos sin excepción. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoAplicacion.CATEGORIA]: {
        id: TipoAplicacion.CATEGORIA,
        abreviatura: 'CATEGORIA',
        label: 'Por Categoría',
        prefijo: null,
        valor: 0,
        descripcion: 'Política que aplica solo a productos de una categoría específica.',
    },
    [TipoAplicacion.LABORATORIO]: {
        id: TipoAplicacion.LABORATORIO,
        abreviatura: 'LABORATORIO',
        label: 'Por Laboratorio',
        prefijo: null,
        valor: 0,
        descripcion: 'Política que aplica solo a productos de un laboratorio específico.',
    },
    [TipoAplicacion.PRODUCTO]: {
        id: TipoAplicacion.PRODUCTO,
        abreviatura: 'PRODUCTO',
        label: 'Por Producto',
        prefijo: null,
        valor: 0,
        descripcion: 'Política que aplica solo a un producto específico.',
    },
};

// ==========================================
// TIPO ASISTENCIA
export enum TipoAsistencia {
    NORMAL = 4400,
    LICENCIA = 4401,
    PERMISO = 4402,
    JUSTIFICADA = 4403,
}

export const TIPO_ASISTENCIA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoAsistencia.NORMAL]: {
        id: TipoAsistencia.NORMAL,
        abreviatura: 'NORMAL',
        label: 'Normal',
        prefijo: null,
        valor: 0,
        descripcion: 'Asistencia regular sin incidencias. Marcación de entrada y salida estándar. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoAsistencia.LICENCIA]: {
        id: TipoAsistencia.LICENCIA,
        abreviatura: 'LICENCIA',
        label: 'Licencia',
        prefijo: null,
        valor: 1,
        descripcion: 'Ausencia justificada por licencia médica, vacaciones, estudio o personal. Requiere documentación respaldo.',
    },
    [TipoAsistencia.PERMISO]: {
        id: TipoAsistencia.PERMISO,
        abreviatura: 'PERMISO',
        label: 'Permiso',
        prefijo: null,
        valor: 2,
        descripcion: 'Permiso por horas o días con autorización del supervisor. Afecta el cálculo de horas trabajadas.',
    },
    [TipoAsistencia.JUSTIFICADA]: {
        id: TipoAsistencia.JUSTIFICADA,
        abreviatura: 'JUSTIFICADA',
        label: 'Justificada',
        prefijo: null,
        valor: 3,
        descripcion: 'Ausencia justificada sin goce de sueldo (ej. emergencia familiar).',
    },
};

// ==========================================
// ESTADO ASISTENCIA
export enum EstadoAsistencia {
    PRESENTE = 4450,
    AUSENTE = 4451,
    TARDE = 4452,
    FALTA_INJUSTIFICADA = 4453,
}

export const ESTADO_ASISTENCIA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoAsistencia.PRESENTE]: {
        id: EstadoAsistencia.PRESENTE,
        abreviatura: 'PRESENTE',
        label: 'Presente',
        prefijo: null,
        valor: 0,
        descripcion: 'Trabajador asistió puntualmente y cumplió su jornada laboral completa. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoAsistencia.AUSENTE]: {
        id: EstadoAsistencia.AUSENTE,
        abreviatura: 'AUSENTE',
        label: 'Ausente',
        prefijo: null,
        valor: 1,
        descripcion: 'Trabajador no asistió a su jornada laboral. Sin justificación o sin registrar marcación.',
    },
    [EstadoAsistencia.TARDE]: {
        id: EstadoAsistencia.TARDE,
        abreviatura: 'TARDE',
        label: 'Tarde',
        prefijo: null,
        valor: 2,
        descripcion: 'Trabajador llegó después de la hora de inicio de jornada (más de 15 minutos de retraso).',
    },
    [EstadoAsistencia.FALTA_INJUSTIFICADA]: {
        id: EstadoAsistencia.FALTA_INJUSTIFICADA,
        abreviatura: 'FALTA_INJUSTIFICADA',
        label: 'Falta Injustificada',
        prefijo: null,
        valor: 3,
        descripcion: 'Ausencia sin justificación válida. Afecta el cálculo de sueldo y puede generar sanciones.',
    },
};

// ==========================================
// METODO MARCACION
export enum MetodoMarcacion {
    MANUAL = 4500,
    BIOMETRICO = 4501,
    QR = 4502,
    APP = 4503,
}

export const METODO_MARCACION_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [MetodoMarcacion.MANUAL]: {
        id: MetodoMarcacion.MANUAL,
        abreviatura: 'MANUAL',
        label: 'Manual',
        prefijo: null,
        valor: 0,
        descripcion: 'Registro manual por parte del supervisor o administrador. Requiere validación. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [MetodoMarcacion.BIOMETRICO]: {
        id: MetodoMarcacion.BIOMETRICO,
        abreviatura: 'BIOMETRICO',
        label: 'Biométrico',
        prefijo: null,
        valor: 1,
        descripcion: 'Marcación mediante dispositivo biométrico (huella digital, reconocimiento facial). Método más seguro.',
    },
    [MetodoMarcacion.QR]: {
        id: MetodoMarcacion.QR,
        abreviatura: 'QR',
        label: 'Código QR',
        prefijo: null,
        valor: 2,
        descripcion: 'Marcación mediante escaneo de código QR en el punto de acceso. Aplicable para control de acceso.',
    },
    [MetodoMarcacion.APP]: {
        id: MetodoMarcacion.APP,
        abreviatura: 'APP',
        label: 'Aplicación Móvil',
        prefijo: null,
        valor: 3,
        descripcion: 'Marcación desde aplicación móvil con geolocalización. Permite registro remoto.',
    },
};

// ==========================================
// TIPO VEHICULO
export enum TipoVehiculo {
    AUTOMOVIL = 4550,
    VAGONETA = 4551,
    MINI_BUS = 4552,
    MOTOCICLETA = 4553,
    CAMIONETA = 4554,
}

export const TIPO_VEHICULO_METADATA: Record<TipoVehiculo, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoVehiculo.AUTOMOVIL]: {
        id: TipoVehiculo.AUTOMOVIL,
        abreviatura: 'AUTOMOVIL',
        label: 'Automóvil',
        prefijo: 'AUT',
        valor: 1,
        descripcion: 'Vehículo tipo automóvil estándar de 4 puertas, sedán o hatchback, utilizado habitualmente para servicios regulares de taxi. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoVehiculo.VAGONETA]: {
        id: TipoVehiculo.VAGONETA,
        abreviatura: 'VAGONETA',
        label: 'Vagoneta',
        prefijo: 'VAG',
        valor: 2,
        descripcion: 'Vehículo tipo vagoneta o SUV, con mayor capacidad de espacio interior y maletero para pasajeros o equipaje.',
    },
    [TipoVehiculo.MINI_BUS]: {
        id: TipoVehiculo.MINI_BUS,
        abreviatura: 'MINI_BUS',
        label: 'Minibús',
        prefijo: 'MBUS',
        valor: 3,
        descripcion: 'Vehículo tipo minibús o furgoneta para transporte de grupos o servicios especiales de mayor capacidad.',
    },
    [TipoVehiculo.MOTOCICLETA]: {
        id: TipoVehiculo.MOTOCICLETA,
        abreviatura: 'MOTOCICLETA',
        label: 'Motocicleta',
        prefijo: 'MOTO',
        valor: 4,
        descripcion: 'Vehículo de dos ruedas destinado a servicios de delivery rápido, encomiendas o transporte express.',
    },
    [TipoVehiculo.CAMIONETA]: {
        id: TipoVehiculo.CAMIONETA,
        abreviatura: 'CAMIONETA',
        label: 'Camioneta',
        prefijo: 'CAM',
        valor: 5,
        descripcion: 'Vehículo con tolva o platón abierto, utilizado para transporte de cargas medianas o servicios de flete.',
    },
};

// ==========================================
// TIPO PLANILLA
export enum TipoPlanilla {
    SUELDOS = 4600,
    JORNALES = 4601,
    CONTRATO = 4602,
}

export const TIPO_PLANILLA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoPlanilla.SUELDOS]: {
        id: TipoPlanilla.SUELDOS,
        abreviatura: 'SUELDOS',
        label: 'Sueldos',
        prefijo: null,
        valor: 0,
        descripcion: 'Planilla mensual de sueldos para trabajadores con contrato indefinido o fijo. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoPlanilla.JORNALES]: {
        id: TipoPlanilla.JORNALES,
        abreviatura: 'JORNALES',
        label: 'Jornales',
        prefijo: null,
        valor: 1,
        descripcion: 'Planilla por jornales para trabajadores eventuales o temporales.',
    },
    [TipoPlanilla.CONTRATO]: {
        id: TipoPlanilla.CONTRATO,
        abreviatura: 'CONTRATO',
        label: 'Contrato',
        prefijo: null,
        valor: 2,
        descripcion: 'Planilla por contrato de servicios profesionales (consultores, asesores).',
    },
};

// ==========================================
// ESTADO PLANILLA
export enum EstadoPlanilla {
    BORRADOR = 4650,
    CALCULADA = 4651,
    APROBADA = 4652,
    PAGADA = 4653,
    ANULADA = 4654,
}

export const ESTADO_PLANILLA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoPlanilla.BORRADOR]: {
        id: EstadoPlanilla.BORRADOR,
        abreviatura: 'BORRADOR',
        label: 'Borrador',
        prefijo: null,
        valor: 0,
        descripcion: 'Planilla en edición. Los valores pueden ser modificados. No está lista para aprobación. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoPlanilla.CALCULADA]: {
        id: EstadoPlanilla.CALCULADA,
        abreviatura: 'CALCULADA',
        label: 'Calculada',
        prefijo: null,
        valor: 1,
        descripcion: 'Planilla calculada automáticamente por el sistema. Pendiente de aprobación por gerencia.',
    },
    [EstadoPlanilla.APROBADA]: {
        id: EstadoPlanilla.APROBADA,
        abreviatura: 'APROBADA',
        label: 'Aprobada',
        prefijo: null,
        valor: 2,
        descripcion: 'Planilla aprobada por gerencia. Lista para pago a los trabajadores.',
    },
    [EstadoPlanilla.PAGADA]: {
        id: EstadoPlanilla.PAGADA,
        abreviatura: 'PAGADA',
        label: 'Pagada',
        prefijo: null,
        valor: 3,
        descripcion: 'Planilla pagada completamente a los trabajadores. Registro cerrado y contabilizado.',
    },
    [EstadoPlanilla.ANULADA]: {
        id: EstadoPlanilla.ANULADA,
        abreviatura: 'ANULADA',
        label: 'Anulada',
        prefijo: null,
        valor: 4,
        descripcion: 'Planilla anulada irreversiblemente. Solo permitido desde BORRADOR o CALCULADA.',
    },
};

// ==========================================
// ESTADO CONTRATO
export enum EstadoContrato {
    VIGENTE = 4700,
    FINALIZADO = 4701,
    RENOVADO = 4702,
    SUSPENDIDO = 4703,
}

export const ESTADO_CONTRATO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoContrato.VIGENTE]: {
        id: EstadoContrato.VIGENTE,
        abreviatura: 'VIGENTE',
        label: 'Vigente',
        prefijo: null,
        valor: 0,
        descripcion: 'Contrato activo y operativo. El trabajador se encuentra en funciones. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoContrato.FINALIZADO]: {
        id: EstadoContrato.FINALIZADO,
        abreviatura: 'FINALIZADO',
        label: 'Finalizado',
        prefijo: null,
        valor: 1,
        descripcion: 'Contrato finalizado por cumplimiento de plazo o decisión del trabajador.',
    },
    [EstadoContrato.RENOVADO]: {
        id: EstadoContrato.RENOVADO,
        abreviatura: 'RENOVADO',
        label: 'Renovado',
        prefijo: null,
        valor: 2,
        descripcion: 'Contrato renovado por un nuevo período.',
    },
    [EstadoContrato.SUSPENDIDO]: {
        id: EstadoContrato.SUSPENDIDO,
        abreviatura: 'SUSPENDIDO',
        label: 'Suspendido',
        prefijo: null,
        valor: 3,
        descripcion: 'Contrato suspendido temporalmente por licencia o situación especial.',
    },
};

// ==========================================
// TIPO CONTRATO
export enum TipoContrato {
    INDEFINIDO = 4750,
    FIJO = 4751,
    EVENTUAL = 4752,
    PRACTICAS = 4753,
    CONSULTORIA = 4754,
}

export const TIPO_CONTRATO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoContrato.INDEFINIDO]: {
        id: TipoContrato.INDEFINIDO,
        abreviatura: 'INDEFINIDO',
        label: 'Indefinido',
        prefijo: null,
        valor: 0,
        descripcion: 'Contrato sin fecha de término definida. Establece relación laboral permanente. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoContrato.FIJO]: {
        id: TipoContrato.FIJO,
        abreviatura: 'FIJO',
        label: 'Plazo Fijo',
        prefijo: null,
        valor: 1,
        descripcion: 'Contrato con fecha de inicio y fin definidas. Se renueva automáticamente o finaliza.',
    },
    [TipoContrato.EVENTUAL]: {
        id: TipoContrato.EVENTUAL,
        abreviatura: 'EVENTUAL',
        label: 'Eventual',
        prefijo: null,
        valor: 2,
        descripcion: 'Contrato por tiempo determinado para proyectos específicos o temporada.',
    },
    [TipoContrato.PRACTICAS]: {
        id: TipoContrato.PRACTICAS,
        abreviatura: 'PRACTICAS',
        label: 'Prácticas / Pasantía',
        prefijo: null,
        valor: 3,
        descripcion: 'Contrato de prácticas profesionales o pasantías para estudiantes.',
    },
    [TipoContrato.CONSULTORIA]: {
        id: TipoContrato.CONSULTORIA,
        abreviatura: 'CONSULTORIA',
        label: 'Consultoría',
        prefijo: null,
        valor: 4,
        descripcion: 'Contrato de servicios profesionales para consultores o asesores externos.',
    },
};

// ==========================================
// TIPO JORNADA
export enum TipoJornada {
    COMPLETA = 4800,
    MEDIA = 4801,
    POR_HORAS = 4802,
}

export const TIPO_JORNADA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoJornada.COMPLETA]: {
        id: TipoJornada.COMPLETA,
        abreviatura: 'COMPLETA',
        label: 'Completa',
        prefijo: null,
        valor: 0,
        descripcion: 'Jornada laboral completa (40 horas semanales). CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoJornada.MEDIA]: {
        id: TipoJornada.MEDIA,
        abreviatura: 'MEDIA',
        label: 'Media',
        prefijo: null,
        valor: 1,
        descripcion: 'Jornada laboral media (20 horas semanales).',
    },
    [TipoJornada.POR_HORAS]: {
        id: TipoJornada.POR_HORAS,
        abreviatura: 'POR_HORAS',
        label: 'Por Horas',
        prefijo: null,
        valor: 2,
        descripcion: 'Jornada laboral por horas (trabajo por horas).',
    },
};

// ==========================================
// ESTADO RESERVA
export enum EstadoReserva {
    NO_APLICA = 4850,
    PENDIENTE = 4851,
    CONFIRMADA = 4852,
    CANCELADA = 4853,
    EXPIRADA = 4854,
}

export const ESTADO_RESERVA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoReserva.NO_APLICA]: {
        id: EstadoReserva.NO_APLICA,
        abreviatura: 'NO_APLICA',
        label: 'No Aplica',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin estado de reserva definido. Valor por defecto para transacciones que no son reservas.',
        es_defecto: true,
    },
    [EstadoReserva.PENDIENTE]: {
        id: EstadoReserva.PENDIENTE,
        abreviatura: 'PENDIENTE',
        label: 'Pendiente',
        prefijo: null,
        valor: 0,
        descripcion: 'Reserva creada y pendiente de confirmación por el cliente o de conversión a venta.',
    },
    [EstadoReserva.CONFIRMADA]: {
        id: EstadoReserva.CONFIRMADA,
        abreviatura: 'CONFIRMADA',
        label: 'Confirmada',
        prefijo: null,
        valor: 0,
        descripcion: 'Reserva confirmada por el cliente. El stock está apartado y se procederá a la venta.',
    },
    [EstadoReserva.CANCELADA]: {
        id: EstadoReserva.CANCELADA,
        abreviatura: 'CANCELADA',
        label: 'Cancelada',
        prefijo: null,
        valor: 0,
        descripcion: 'Reserva cancelada manualmente por el operador o por solicitud del cliente. Libera el stock automáticamente.',
    },
    [EstadoReserva.EXPIRADA]: {
        id: EstadoReserva.EXPIRADA,
        abreviatura: 'EXPIRADA',
        label: 'Expirada',
        prefijo: null,
        valor: 0,
        descripcion: 'Reserva expirada por tiempo de validez superado (TTL). Libera el stock automáticamente.',
    },
};

// ==========================================
// ESTADO CARRITO
export enum EstadoCarrito {
    PENDIENTE = 4900,
    PROCESADO = 4901,
    EXPIRADO = 4902,
    ABANDONADO = 4903,
    EN_PROCESO = 4904,
    RESERVADO = 4905,
    NINGUNO = 4906,
}

export const ESTADO_CARRITO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoCarrito.PENDIENTE]: {
        id: EstadoCarrito.PENDIENTE,
        abreviatura: 'PENDIENTE',
        label: 'Pendiente',
        prefijo: null,
        valor: 0,
        descripcion: 'Carrito activo pendiente de procesamiento. El cliente puede agregar o quitar productos.',
    },
    [EstadoCarrito.PROCESADO]: {
        id: EstadoCarrito.PROCESADO,
        abreviatura: 'PROCESADO',
        label: 'Procesado',
        prefijo: null,
        valor: 0,
        descripcion: 'Carrito ya convertido en pedido. No se pueden modificar sus productos.',
    },
    [EstadoCarrito.EXPIRADO]: {
        id: EstadoCarrito.EXPIRADO,
        abreviatura: 'EXPIRADO',
        label: 'Expirado',
        prefijo: null,
        valor: 0,
        descripcion: 'Carrito expirado por tiempo de inactividad (TTL).',
    },
    [EstadoCarrito.ABANDONADO]: {
        id: EstadoCarrito.ABANDONADO,
        abreviatura: 'ABANDONADO',
        label: 'Abandonado',
        prefijo: null,
        valor: 0,
        descripcion: 'Carrito abandonado activamente por el cliente (cerró sesión, vació carrito, canceló).',
    },
    [EstadoCarrito.EN_PROCESO]: {
        id: EstadoCarrito.EN_PROCESO,
        abreviatura: 'EN_PROCESO',
        label: 'En Proceso',
        prefijo: null,
        valor: 0,
        descripcion: 'Carrito en proceso de checkout. El cliente está en medio del flujo de compra.',
    },
    [EstadoCarrito.RESERVADO]: {
        id: EstadoCarrito.RESERVADO,
        abreviatura: 'RESERVADO',
        label: 'Reservado',
        prefijo: null,
        valor: 0,
        descripcion: 'Carrito con stock apartado. Pendiente de confirmación final.',
    },
    [EstadoCarrito.NINGUNO]: {
        id: EstadoCarrito.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin estado de carrito definido. Valor por defecto para registros comodín o casos excepcionales.',
        es_defecto: true,
    },
};

// ==========================================
// TIPO DOCUMENTO VEHICULO
export enum TipoDocumentoVehiculo {
    SOAT = 4950,
    LICENCIA_TRANSITO = 4951,
    REVISION_TECNICA = 4952,
    POLIZA_SEGURO = 4953,
    TARJETA_OPERACION = 4954,
    INSPECCION_OCULAR = 4955
}

export const TIPO_DOCUMENTO_VEHICULO_METADATA: Record<TipoDocumentoVehiculo, ConstanteMetadata & { es_defecto?: boolean }> = {
    [TipoDocumentoVehiculo.SOAT]: {
        id: TipoDocumentoVehiculo.SOAT,
        abreviatura: 'SOAT',
        label: 'SOAT',
        prefijo: 'DOC-SOAT',
        valor: 1,
        descripcion: 'Seguro Obligatorio de Accidentes de Tránsito. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoDocumentoVehiculo.LICENCIA_TRANSITO]: {
        id: TipoDocumentoVehiculo.LICENCIA_TRANSITO,
        abreviatura: 'LICENCIA_TRANSITO',
        label: 'Licencia de Tránsito',
        prefijo: 'DOC-LTR',
        valor: 2,
        descripcion: 'Licencia de tránsito o padrón del vehículo.',
    },
    [TipoDocumentoVehiculo.REVISION_TECNICA]: {
        id: TipoDocumentoVehiculo.REVISION_TECNICA,
        abreviatura: 'REVISION_TECNICA',
        label: 'Revisión Técnica',
        prefijo: 'DOC-RTEC',
        valor: 3,
        descripcion: 'Certificado de revisión técnica vehicular vigente.',
    },
    [TipoDocumentoVehiculo.POLIZA_SEGURO]: {
        id: TipoDocumentoVehiculo.POLIZA_SEGURO,
        abreviatura: 'POLIZA_SEGURO',
        label: 'Póliza de Seguro',
        prefijo: 'DOC-POL',
        valor: 4,
        descripcion: 'Póliza de seguro voluntario o comercial del vehículo.',
    },
    [TipoDocumentoVehiculo.TARJETA_OPERACION]: {
        id: TipoDocumentoVehiculo.TARJETA_OPERACION,
        abreviatura: 'TARJETA_OPERACION',
        label: 'Tarjeta de Operación',
        prefijo: 'DOC-TOP',
        valor: 5,
        descripcion: 'Tarjeta de operación o autorización de servicio.',
    },
    [TipoDocumentoVehiculo.INSPECCION_OCULAR]: {
        id: TipoDocumentoVehiculo.INSPECCION_OCULAR,
        abreviatura: 'INSPECCION_OCULAR',
        label: 'Inspección Ocular',
        prefijo: 'DOC-IOC',
        valor: 6,
        descripcion: 'Acta o certificado de inspección ocular policial.',
    },
};

// ==========================================
// TIPO ASIGNACION
export enum TipoAsignacion {
    NINGUNO = 5000,
    TITULAR = 5001,
    SUPLENTE = 5002,
    TURNO_DIA = 5003,
    TURNO_NOCHE = 5004,
    TEMPORAL = 5005,
}

export const TIPO_ASIGNACION_METADATA: Record<TipoAsignacion, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoAsignacion.NINGUNO]: {
        id: TipoAsignacion.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: null,
        valor: 0,
        descripcion: 'Sin tipo de asignación definido. Valor por defecto para registros comodín o casos excepcionales. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoAsignacion.TITULAR]: {
        id: TipoAsignacion.TITULAR,
        abreviatura: 'TITULAR',
        label: 'Titular',
        prefijo: 'ASG-TIT',
        valor: 1,
        descripcion: 'Asignación principal o titular del vehículo o puesto de trabajo.',
    },
    [TipoAsignacion.SUPLENTE]: {
        id: TipoAsignacion.SUPLENTE,
        abreviatura: 'SUPLENTE',
        label: 'Suplente',
        prefijo: 'ASG-SUP',
        valor: 2,
        descripcion: 'Asignación de reemplazo o suplente para cubrir ausencias del titular.',
    },
    [TipoAsignacion.TURNO_DIA]: {
        id: TipoAsignacion.TURNO_DIA,
        abreviatura: 'TURNO_DIA',
        label: 'Turno Día',
        prefijo: 'ASG-DIA',
        valor: 3,
        descripcion: 'Asignación correspondiente al turno diurno (horario de día).',
    },
    [TipoAsignacion.TURNO_NOCHE]: {
        id: TipoAsignacion.TURNO_NOCHE,
        abreviatura: 'TURNO_NOCHE',
        label: 'Turno Noche',
        prefijo: 'ASG-NOC',
        valor: 4,
        descripcion: 'Asignación correspondiente al turno nocturno (horario de noche).',
    },
    [TipoAsignacion.TEMPORAL]: {
        id: TipoAsignacion.TEMPORAL,
        abreviatura: 'TEMPORAL',
        label: 'Temporal',
        prefijo: 'ASG-TMP',
        valor: 5,
        descripcion: 'Asignación de carácter temporal o por un periodo limitado.',
    },
};

// ==========================================
// ESTADO PAGO FRECUENCIA
export enum EstadoPagoFrecuencia {
    PENDIENTE = 5100,
    PAGADO = 5101,
    PARCIAL = 5102,
    EXONERADO = 5103,
}

export const ESTADO_PAGO_FRECUENCIA_METADATA: Record<EstadoPagoFrecuencia, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoPagoFrecuencia.PENDIENTE]: {
        id: EstadoPagoFrecuencia.PENDIENTE,
        abreviatura: 'PENDIENTE',
        label: 'Pendiente',
        prefijo: 'PAG-PEN',
        valor: 0,
        descripcion: 'Pago pendiente de realización. El saldo se encuentra por cobrar. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoPagoFrecuencia.PAGADO]: {
        id: EstadoPagoFrecuencia.PAGADO,
        abreviatura: 'PAGADO',
        label: 'Pagado',
        prefijo: 'PAG-PAG',
        valor: 1,
        descripcion: 'Pago realizado en su totalidad y verificado.',
    },
    [EstadoPagoFrecuencia.PARCIAL]: {
        id: EstadoPagoFrecuencia.PARCIAL,
        abreviatura: 'PARCIAL',
        label: 'Parcial',
        prefijo: 'PAG-PAR',
        valor: 2,
        descripcion: 'Pago realizado de forma parcial, queda un saldo pendiente.',
    },
    [EstadoPagoFrecuencia.EXONERADO]: {
        id: EstadoPagoFrecuencia.EXONERADO,
        abreviatura: 'EXONERADO',
        label: 'Exonerado',
        prefijo: 'PAG-EXO',
        valor: 3,
        descripcion: 'Pago exonerado o condonado por la administración.',
    },
};

// ==========================================
// TIPO PAGO FRECUENCIA
export enum TipoPagoFrecuencia {
    EFECTIVO = 5150,
    TRANSFERENCIA = 5151,
    QR = 5152,
    OTRO = 5153,
}

export const TIPO_PAGO_FRECUENCIA_METADATA: Record<TipoPagoFrecuencia, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoPagoFrecuencia.EFECTIVO]: {
        id: TipoPagoFrecuencia.EFECTIVO,
        abreviatura: 'EFECTIVO',
        label: 'Efectivo',
        prefijo: 'PAG-EFE',
        valor: 0,
        descripcion: 'Pago realizado en efectivo físico. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoPagoFrecuencia.TRANSFERENCIA]: {
        id: TipoPagoFrecuencia.TRANSFERENCIA,
        abreviatura: 'TRANSFERENCIA',
        label: 'Transferencia Bancaria',
        prefijo: 'PAG-TRF',
        valor: 1,
        descripcion: 'Pago realizado mediante transferencia bancaria o depósito.',
    },
    [TipoPagoFrecuencia.QR]: {
        id: TipoPagoFrecuencia.QR,
        abreviatura: 'QR',
        label: 'Código QR',
        prefijo: 'PAG-QRS',
        valor: 2,
        descripcion: 'Pago realizado mediante escaneo de código QR (banca móvil).',
    },
    [TipoPagoFrecuencia.OTRO]: {
        id: TipoPagoFrecuencia.OTRO,
        abreviatura: 'OTRO',
        label: 'Otro',
        prefijo: 'PAG-OTH',
        valor: 3,
        descripcion: 'Pago realizado mediante otro método no especificado.',
    },
};

// ==========================================
// MOTIVO
export enum Motivo {
    MOROSIDAD = 5200,
    SANCION = 5201,
    CONFLICTO = 5202,
    OTRO = 5203,
}

export const MOTIVO_METADATA: Record<Motivo, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [Motivo.MOROSIDAD]: {
        id: Motivo.MOROSIDAD,
        abreviatura: 'MOROSIDAD',
        label: 'Morosidad',
        prefijo: 'MOT-MOR',
        valor: 0,
        descripcion: 'Motivo originado por retraso o falta en los pagos o cuotas. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [Motivo.SANCION]: {
        id: Motivo.SANCION,
        abreviatura: 'SANCION',
        label: 'Sanción',
        prefijo: 'MOT-SAN',
        valor: 1,
        descripcion: 'Motivo derivado de una sanción o penalización aplicada por incumplimiento de normativas.',
    },
    [Motivo.CONFLICTO]: {
        id: Motivo.CONFLICTO,
        abreviatura: 'CONFLICTO',
        label: 'Conflicto',
        prefijo: 'MOT-CON',
        valor: 2,
        descripcion: 'Motivo relacionado con disputas, problemas o conflictos internos.',
    },
    [Motivo.OTRO]: {
        id: Motivo.OTRO,
        abreviatura: 'OTRO',
        label: 'Otro',
        prefijo: 'MOT-OTH',
        valor: 3,
        descripcion: 'Motivo general o no especificado dentro de las categorías principales.',
    },
};

// ==========================================
// ESTADO VIAJE
export enum EstadoViaje {
    SOLICITADO = 5250,
    BUSCANDO_CONDUCTOR = 5251,
    ASIGNADO = 5252,
    EN_CAMINO = 5253,
    EN_CURSO = 5254,
    FINALIZADO = 5255,
    CANCELADO_CLIENTE = 5256,
    CANCELADO_CONDUCTOR = 5257,
    NO_ATENDIDO = 5258,
    REASIGNADO = 5259,
}

export const ESTADO_VIAJE_METADATA: Record<EstadoViaje, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoViaje.SOLICITADO]: {
        id: EstadoViaje.SOLICITADO,
        abreviatura: 'SOLICITADO',
        label: 'Solicitado',
        prefijo: 'VIA-SOL',
        valor: 0,
        descripcion: 'El cliente acaba de crear la solicitud. Punto de auditoría inicial antes de buscar conductor. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoViaje.BUSCANDO_CONDUCTOR]: {
        id: EstadoViaje.BUSCANDO_CONDUCTOR,
        abreviatura: 'BUSCANDO',
        label: 'Buscando Conductor',
        prefijo: 'VIA-BUS',
        valor: 1,
        descripcion: 'Viaje publicado en Redis con notificaciones enviadas a los conductores activos en un radio determinado.',
    },
    [EstadoViaje.ASIGNADO]: {
        id: EstadoViaje.ASIGNADO,
        abreviatura: 'ASIGNADO',
        label: 'Asignado',
        prefijo: 'VIA-ASG',
        valor: 2,
        descripcion: 'Un conductor aceptó la solicitud y quedó vinculado al viaje, preparándose para iniciar la recogida.',
    },
    [EstadoViaje.EN_CAMINO]: {
        id: EstadoViaje.EN_CAMINO,
        abreviatura: 'EN_CAMINO',
        label: 'En Camino',
        prefijo: 'VIA-CAM',
        valor: 3,
        descripcion: 'El conductor está en desplazamiento rumbo al punto de origen para recoger al cliente.',
    },
    [EstadoViaje.EN_CURSO]: {
        id: EstadoViaje.EN_CURSO,
        abreviatura: 'EN_CURSO',
        label: 'En Curso',
        prefijo: 'VIA-CUR',
        valor: 4,
        descripcion: 'El cliente ya se encuentra a bordo y el vehículo está viajando hacia el destino final.',
    },
    [EstadoViaje.FINALIZADO]: {
        id: EstadoViaje.FINALIZADO,
        abreviatura: 'FINALIZADO',
        label: 'Finalizado',
        prefijo: 'VIA-FIN',
        valor: 5,
        descripcion: 'El viaje concluyó exitosamente en el destino y se procede con el cálculo de cobro y calificación.',
    },
    [EstadoViaje.CANCELADO_CLIENTE]: {
        id: EstadoViaje.CANCELADO_CLIENTE,
        abreviatura: 'CANC_CLI',
        label: 'Cancelado por Cliente',
        prefijo: 'VIA-CCI',
        valor: 6,
        descripcion: 'El viaje fue cancelado voluntariamente por el cliente antes de su culminación.',
    },
    [EstadoViaje.CANCELADO_CONDUCTOR]: {
        id: EstadoViaje.CANCELADO_CONDUCTOR,
        abreviatura: 'CANC_CON',
        label: 'Cancelado por Conductor',
        prefijo: 'VIA-CCO',
        valor: 7,
        descripcion: 'El viaje fue cancelado por el conductor tras haberlo aceptado debido a inconvenientes o fuerza mayor.',
    },
    [EstadoViaje.NO_ATENDIDO]: {
        id: EstadoViaje.NO_ATENDIDO,
        abreviatura: 'NO_ATENDIDO',
        label: 'No Atendido',
        prefijo: 'VIA-NAT',
        valor: 8,
        descripcion: 'El tiempo límite de búsqueda expiró (timeout) y ningún conductor aceptó la solicitud.',
    },
    [EstadoViaje.REASIGNADO]: {
        id: EstadoViaje.REASIGNADO,
        abreviatura: 'REASIGNADO',
        label: 'Reasignado',
        prefijo: 'VIA-RES',
        valor: 9,
        descripcion: 'El viaje fue transferido a otro conductor por decisión del sistema o de la administración.',
    },
};

// ==========================================
// CALIFICACION
export enum Calificacion {
    UNA_ESTRELLA     = 5300,
    DOS_ESTRELLAS    = 5301,
    TRES_ESTRELLAS   = 5302,
    CUATRO_ESTRELLAS = 5303,
    CINCO_ESTRELLAS  = 5304,
    SIN_CALIFICAR    = 5305,
}

export const CALIFICACION_METADATA: Record<Calificacion, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [Calificacion.UNA_ESTRELLA]: {
        id: Calificacion.UNA_ESTRELLA,
        abreviatura: '1_ESTRELLA',
        label: 'Una Estrella',
        prefijo: 'CAL-1E',
        valor: 1,
        descripcion: 'Calificación mínima. Experiencia muy insatisfactoria. Activa alerta de revisión de calidad.',
    },
    [Calificacion.DOS_ESTRELLAS]: {
        id: Calificacion.DOS_ESTRELLAS,
        abreviatura: '2_ESTRELLAS',
        label: 'Dos Estrellas',
        prefijo: 'CAL-2E',
        valor: 2,
        descripcion: 'Calificación baja. El servicio presentó deficiencias notables.',
    },
    [Calificacion.TRES_ESTRELLAS]: {
        id: Calificacion.TRES_ESTRELLAS,
        abreviatura: '3_ESTRELLAS',
        label: 'Tres Estrellas',
        prefijo: 'CAL-3E',
        valor: 3,
        descripcion: 'Calificación regular. Servicio aceptable con aspectos a mejorar.',
    },
    [Calificacion.CUATRO_ESTRELLAS]: {
        id: Calificacion.CUATRO_ESTRELLAS,
        abreviatura: '4_ESTRELLAS',
        label: 'Cuatro Estrellas',
        prefijo: 'CAL-4E',
        valor: 4,
        descripcion: 'Calificación buena. Servicio satisfactorio con mínimas observaciones.',
    },
    [Calificacion.CINCO_ESTRELLAS]: {
        id: Calificacion.CINCO_ESTRELLAS,
        abreviatura: '5_ESTRELLAS',
        label: 'Cinco Estrellas',
        prefijo: 'CAL-5E',
        valor: 5,
        descripcion: 'Calificación máxima. Servicio excelente. CONSTANTE POR DEFECTO cuando el cliente no califica (soft default a las 24h).',
        es_defecto: true,
    },
    [Calificacion.SIN_CALIFICAR]: {
        id: Calificacion.SIN_CALIFICAR,
        abreviatura: 'SIN_CALIFICAR',
        label: 'Sin Calificar',
        prefijo: 'CAL-SC',
        valor: 0,
        descripcion: 'Sin calificación registrada. Estado transitorio antes de que el usuario emita su voto o antes del soft default automático a las 24h.',
    },
};

// ==========================================
// TURNO
export enum Turno {
    MAÑANA = 5350,
    TARDE  = 5351,
    NOCHE  = 5352,
}

export const TURNO_METADATA: Record<Turno, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [Turno.MAÑANA]: {
        id: Turno.MAÑANA,
        abreviatura: 'MAÑANA',
        label: 'Mañana',
        prefijo: 'TUR-MAÑ',
        valor: 1,
        descripcion: 'Turno de la mañana (06:00 - 14:00). CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [Turno.TARDE]: {
        id: Turno.TARDE,
        abreviatura: 'TARDE',
        label: 'Tarde',
        prefijo: 'TUR-TAR',
        valor: 2,
        descripcion: 'Turno de la tarde (14:00 - 22:00).',
    },
    [Turno.NOCHE]: {
        id: Turno.NOCHE,
        abreviatura: 'NOCHE',
        label: 'Noche',
        prefijo: 'TUR-NOC',
        valor: 3,
        descripcion: 'Turno de la noche (22:00 - 06:00). Cruza la medianoche.',
    },
};

// ==========================================
// ESTADO VENCIMIENTO
export enum EstadoVencimiento {
    VIGENTES = 5400,
    POR_VENCER_30_DIAS = 5401,
    VENCIDOS = 5402,
}

export const ESTADO_VENCIMIENTO_METADATA: Record<EstadoVencimiento, ConstanteMetadata & { es_defecto?: boolean }> = {
    [EstadoVencimiento.VIGENTES]: {
        id: EstadoVencimiento.VIGENTES,
        abreviatura: 'VIGENTES',
        label: 'Vigentes',
        prefijo: null,
        valor: 0,
        descripcion: 'Documento vigente con más de 30 días hasta su vencimiento. No requiere acción inmediata. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoVencimiento.POR_VENCER_30_DIAS]: {
        id: EstadoVencimiento.POR_VENCER_30_DIAS,
        abreviatura: 'POR_VENCER_30_DIAS',
        label: 'Por vencer (30 días)',
        prefijo: null,
        valor: 0,
        descripcion: 'Documento próximo a vencer en los próximos 30 días. Requiere atención para renovación o gestión administrativa.',
    },
    [EstadoVencimiento.VENCIDOS]: {
        id: EstadoVencimiento.VENCIDOS,
        abreviatura: 'VENCIDOS',
        label: 'Vencidos',
        prefijo: null,
        valor: 0,
        descripcion: 'Documento con fecha de vencimiento superada. Requiere renovación inmediata. Puede generar alertas de cumplimiento normativo.',
    },
};

// ==========================================
// CATEGORÍA MANTENIMIENTO
export enum CategoriaMantenimiento {
    PREVENTIVO = 5450,
    CORRECTIVO = 5451,
    EMERGENCIA = 5452,
}

export const CATEGORIA_MANTENIMIENTO_METADATA: Record<CategoriaMantenimiento, ConstanteMetadata & { es_defecto?: boolean }> = {
    [CategoriaMantenimiento.PREVENTIVO]: {
        id: CategoriaMantenimiento.PREVENTIVO,
        abreviatura: 'PREVENTIVO',
        label: 'Preventivo',
        prefijo: null,
        valor: 0,
        descripcion: 'Preventivo: Mantenimiento programado y planificado para evitar fallas, reducir el desgaste y prolongar la vida útil de los equipos. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [CategoriaMantenimiento.CORRECTIVO]: {
        id: CategoriaMantenimiento.CORRECTIVO,
        abreviatura: 'CORRECTIVO',
        label: 'Correctivo',
        prefijo: null,
        valor: 0,
        descripcion: 'Correctivo: Mantenimiento realizado tras detectar un defecto o falla, destinado a restaurar el equipo a sus condiciones operativas normales.',
    },
    [CategoriaMantenimiento.EMERGENCIA]: {
        id: CategoriaMantenimiento.EMERGENCIA,
        abreviatura: 'EMERGENCIA',
        label: 'Emergencia',
        prefijo: null,
        valor: 0,
        descripcion: 'Emergencia: Mantenimiento crítico y no planificado que requiere atención inmediata para restablecer el servicio, evitar riesgos de seguridad o pérdidas graves.',
    },
};

// ==========================================
// ESTADO OPERATIVO VEHÍCULO
export enum EstadoOperativoVehiculo {
    NO_OPERATIVO = 5500,
    OPERATIVO = 5501,
    EN_TALLER = 5502,
    EN_ESPERA_REPUESTO = 5503,
    SUSPENDIDO = 5504,
    SINIESTRADO = 5505,
}

export const ESTADO_OPERATIVO_VEHICULO_METADATA: Record<EstadoOperativoVehiculo, ConstanteMetadata & { es_defecto?: boolean }> = {
    [EstadoOperativoVehiculo.NO_OPERATIVO]: {
        id: EstadoOperativoVehiculo.NO_OPERATIVO,
        abreviatura: 'NO_OPERATIVO',
        label: 'No Operativo',
        prefijo: null,
        valor: 0,
        descripcion: 'No Operativo: El vehículo no se encuentra disponible para prestar servicio por razones generales no especificadas.',
    },
    [EstadoOperativoVehiculo.OPERATIVO]: {
        id: EstadoOperativoVehiculo.OPERATIVO,
        abreviatura: 'OPERATIVO',
        label: 'Operativo',
        prefijo: null,
        valor: 0,
        descripcion: 'Operativo: Unidad disponible y apta para circular y prestar servicio. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoOperativoVehiculo.EN_TALLER]: {
        id: EstadoOperativoVehiculo.EN_TALLER,
        abreviatura: 'EN_TALLER',
        label: 'En Taller',
        prefijo: null,
        valor: 0,
        descripcion: 'En Taller: Unidad ingresada a mantenimiento preventivo o correctivo.',
    },
    [EstadoOperativoVehiculo.EN_ESPERA_REPUESTO]: {
        id: EstadoOperativoVehiculo.EN_ESPERA_REPUESTO,
        abreviatura: 'EN_ESPERA_REPUESTO',
        label: 'En Espera de Repuesto',
        prefijo: null,
        valor: 0,
        descripcion: 'En Espera de Repuesto: Unidad paralizada temporalmente aguardando la adquisición o llegada de autopartes.',
    },
    [EstadoOperativoVehiculo.SUSPENDIDO]: {
        id: EstadoOperativoVehiculo.SUSPENDIDO,
        abreviatura: 'SUSPENDIDO',
        label: 'Suspendido',
        prefijo: null,
        valor: 0,
        descripcion: 'Suspendido: Unidad fuera de servicio por decisiones administrativas, sanciones internas o documentación pendiente.',
    },
    [EstadoOperativoVehiculo.SINIESTRADO]: {
        id: EstadoOperativoVehiculo.SINIESTRADO,
        abreviatura: 'SINIESTRADO',
        label: 'Siniestrado',
        prefijo: null,
        valor: 0,
        descripcion: 'Siniestrado: Vehículo con daños severos tras accidente o colisión, inhabilitado hasta evaluación técnica o baja.',
    },
};

// ==========================================
// TIPO PROVEEDOR
export enum TipoProveedor {
    COMBUSTIBLE = 5550,
    TALLER_REPARACION = 5551,
    TIENDA_REPUESTOS = 5552,
    OTROS_SERVICIOS = 5553,
}

export const TIPO_PROVEEDOR_METADATA: Record<TipoProveedor, ConstanteMetadata & { es_defecto?: boolean }> = {
    [TipoProveedor.COMBUSTIBLE]: {
        id: TipoProveedor.COMBUSTIBLE,
        abreviatura: 'COMBUSTIBLE',
        label: 'Combustible',
        prefijo: null,
        valor: 0,
        descripcion: 'Combustible: Estaciones de servicio y surtidores autorizados para despacho de gasolina, diésel o GNV. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoProveedor.TALLER_REPARACION]: {
        id: TipoProveedor.TALLER_REPARACION,
        abreviatura: 'TALLER_REPARACION',
        label: 'Taller de Reparación',
        prefijo: null,
        valor: 0,
        descripcion: 'Taller de Reparación: Talleres mecánicos, electromecánicos, lubricentros y servicios de mantenimiento técnico.',
    },
    [TipoProveedor.TIENDA_REPUESTOS]: {
        id: TipoProveedor.TIENDA_REPUESTOS,
        abreviatura: 'TIENDA_REPUESTOS',
        label: 'Tienda de Repuestos',
        prefijo: null,
        valor: 0,
        descripcion: 'Tienda de Repuestos: Comercializadoras e importadoras de autopartes, repuestos, llantas, baterías y accesorios.',
    },
    [TipoProveedor.OTROS_SERVICIOS]: {
        id: TipoProveedor.OTROS_SERVICIOS,
        abreviatura: 'OTROS_SERVICIOS',
        label: 'Otros Servicios',
        prefijo: null,
        valor: 0,
        descripcion: 'Otros Servicios: Inspecciones técnicas, aseguradoras (SOAT), lavaderos, trámites legales y servicios generales.',
    },
};

// ==========================================
// TIPO COMBUSTIBLE
export enum TipoCombustible {
    GASOLINA_ESPECIAL = 5600,
    GASOLINA_PREMIUM = 5601,
    GASOLINA_SUPER_PREMIUM = 5602,
    DIESEL = 5603,
    GNV = 5604,
    GLP = 5605,
}

export const TIPO_COMBUSTIBLE_METADATA: Record<TipoCombustible, ConstanteMetadata & { es_defecto?: boolean }> = {
    [TipoCombustible.GASOLINA_ESPECIAL]: {
        id: TipoCombustible.GASOLINA_ESPECIAL,
        abreviatura: 'GASOLINA_ESPECIAL',
        label: 'Gasolina Especial (GE)',
        prefijo: null,
        valor: 0,
        descripcion: 'Gasolina Especial: Combustible estándar de regular octanaje para vehículos livianos de la flota. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoCombustible.GASOLINA_PREMIUM]: {
        id: TipoCombustible.GASOLINA_PREMIUM,
        abreviatura: 'GASOLINA_PREMIUM',
        label: 'Gasolina Premium',
        prefijo: null,
        valor: 0,
        descripcion: 'Gasolina Premium: Combustible de alto octanaje para motores de mayor compresión y alto rendimiento.',
    },
    [TipoCombustible.GASOLINA_SUPER_PREMIUM]: {
        id: TipoCombustible.GASOLINA_SUPER_PREMIUM,
        abreviatura: 'GASOLINA_SUPER_PREMIUM',
        label: 'Gasolina Súper Premium 92',
        prefijo: null,
        valor: 0,
        descripcion: 'Gasolina Súper Premium: Combustible de ultra alto octanaje (92 RON o superior) para vehículos modernos.',
    },
    [TipoCombustible.DIESEL]: {
        id: TipoCombustible.DIESEL,
        abreviatura: 'DIESEL',
        label: 'Diésel Oil',
        prefijo: null,
        valor: 0,
        descripcion: 'Diésel Oil: Combustible para motores de encendido por compresión (vehículos de trabajo, carga o transporte).',
    },
    [TipoCombustible.GNV]: {
        id: TipoCombustible.GNV,
        abreviatura: 'GNV',
        label: 'Gas Natural Vehicular (GNV)',
        prefijo: null,
        valor: 0,
        descripcion: 'Gas Natural Vehicular: Combustible alternativo comprimido, ecológico y de bajo costo operativo.',
    },
    [TipoCombustible.GLP]: {
        id: TipoCombustible.GLP,
        abreviatura: 'GLP',
        label: 'Gas Licuado de Petróleo (GLP)',
        prefijo: null,
        valor: 0,
        descripcion: 'Gas Licuado de Petróleo: Combustible alternativo líquido/gaseoso para motores adaptados.',
    },
};

// ==========================================
// TIPO ALERTA VEHICULO
export enum TipoAlertaVehiculo {
    // ── Mantenimiento y mecánica (5650-5659) ──
    MANT_PREVENTIVO         = 5650,
    MANT_VENCIDO            = 5651,
    MANT_REPROGRAMADO       = 5652,
    ANOMALIA_CONSUMO        = 5653,
    DESV_KM                 = 5654,
    FALLA_MECANICA_REPORTADA= 5655,
    RENDIMIENTO_BAJO        = 5656,
    REVISION_TECNICA_FALLA  = 5657,
    REPUESTO_PENDIENTE      = 5658,
    VEHICULO_EN_TALLER      = 5659,

    // ── Documentación legal (5660-5669) ──
    VENC_SOAT               = 5660,
    VENC_REVISION_TECNICA   = 5661,
    VENC_LICENCIA_TRANSITO  = 5662,
    VENC_POLIZA_SEGURO      = 5663,
    VENC_TARJETA_OPERACION  = 5664,
    VENC_INSPECCION_OCULAR  = 5665,
    DOC_PROXIMO_VENCER      = 5666,
    DOC_FALTANTE            = 5667,
    DOC_RECHAZADO           = 5668,
    DOC_PENDIENTE_ESCANEO   = 5669,

    // ── Combustible y rendimiento (5670-5679) ──
    CARGA_INUSUAL           = 5670,
    RENDIMIENTO_ANORMAL     = 5671,
    CONSUMO_EXCESIVO        = 5672,
    CARGA_SIN_ODOMETRO      = 5673,
    TANQUE_NO_LLENO_REPETIDO= 5674,
    POSIBLE_FUGA_COMBUSTIBLE= 5675,
    COMBUSTIBLE_DESVIADO    = 5676,
    CARGA_FUERA_HORARIO     = 5677,
    PRECIO_COMBUSTIBLE_ALTO = 5678,
    SIN_CARGAS_RECIENTES    = 5679,

    // ── Odómetro y trazabilidad (5680-5689) ──
    ODOMETRO_RETROCEDE      = 5680,
    ODOMETRO_SALTO_ANORMAL  = 5681,
    ODOMETRO_SIN_ACTUALIZAR = 5682,
    ODOMETRO_INCONSISTENTE  = 5683,
    LECTURA_MANUAL_SOSPECHOSA=5684,
    SIN_LECTURAS_DIARIAS    = 5685,
    KM_DIARIO_EXCEDIDO      = 5686,
    KM_DIARIO_INSUFICIENTE  = 5687,
    VEHICULO_FUERA_ZONA     = 5688,
    USO_NO_AUTORIZADO       = 5689,

    // ── Operación y asignaciones (5690-5699) ──
    SIN_ASIGNACION_DIARIA   = 5690,
    CONDUCTOR_NO_HABILITADO = 5691,
    VEHICULO_NO_OPERATIVO   = 5692,
    CONFLICTO_ASIGNACION    = 5693,
    TURNO_NO_CUBIERTO       = 5694,
    EXCESO_HORAS_TURNO      = 5695,
    CONDUCTOR_SIN_LICENCIA  = 5696,
    CONDUCTOR_CON_SANCION   = 5697,
    VEHICULO_EN_MANTENIMIENTO=5698,
    VEHICULO_SUSPENDIDO     = 5699,

    // ── Morosidad y cobros (5700-5709) ──
    FRECUENCIA_VENCIDA      = 5700,
    FRECUENCIA_PROXIMA_VENCER=5701,
    MORA_REINCIDENTE        = 5702,
    SUSPENSION_ACTIVA       = 5703,
    SUSPENSION_AUTOMATICA   = 5704,
    PAGO_PARCIAL_PENDIENTE  = 5705,
    SALDO_ALTO              = 5706,
    PAGO_FUERA_HORARIO      = 5707,
    PAGO_SIN_COMPROBANTE    = 5708,
    EXONERACION_APLICADA    = 5709,

    // ── Seguridad y siniestros (5710-5719) ──
    EXCESO_VELOCIDAD        = 5710,
    FRENADO_BRUSCO          = 5711,
    ACELERACION_BRUSCA      = 5712,
    COLISION_DETECTADA      = 5713,
    SINIESTRO_REPORTADO     = 5714,
    PANICO_BOTON            = 5715,
    CONDUCTOR_NO_IDENTIFICADO=5716,
    GPS_SIN_SENAL           = 5717,
    GEOCERCA_VIOLADA        = 5718,
    HORARIO_NOCTURNO_INUSUAL= 5719,

    // ── Calidad y satisfacción (5720-5729) ──
    QUEJA_CLIENTE           = 5720,
    CALIFICACION_BAJA       = 5721,
    CALIFICACION_CRITICA    = 5722,
    COMENTARIO_NEGATIVO     = 5723,
    RECLAMO_REITERADO       = 5724,
    ELIMINACION_QUEJA       = 5725,
    RECONOCIMIENTO_POSITIVO = 5726,
    META_CUMPLIDA           = 5727,
    RATING_SEMANAL_BAJO     = 5728,
    RATING_SEMANAL_ALTO     = 5729,

    // ── Sistema y administrativas (5730-5739) ──
    SISTEMA_GENERAL         = 5730,
    ERROR_INTEGRACION       = 5731,
    CONFIGURACION_INVALIDA  = 5732,
    TAREA_FALLIDA           = 5733,
    BACKUP_FALLIDO          = 5734,
    SINCRONIZACION_FALLIDA  = 5735,
    LIMITE_ALCANZADO        = 5736,
    ADVERTENCIA_ADMIN       = 5737,
    RECORDATORIO            = 5738,
    NINGUNO                 = 5739,
}

export const TIPO_ALERTA_VEHICULO_METADATA: Record<TipoAlertaVehiculo, ConstanteMetadata & { es_defecto?: boolean; categoria: string }> = {
    // ── Mantenimiento (5650-5659) ──
    [TipoAlertaVehiculo.MANT_PREVENTIVO]: {
        id: TipoAlertaVehiculo.MANT_PREVENTIVO,
        abreviatura: 'MANT_PREVENTIVO',
        label: 'Mantenimiento Preventivo',
        prefijo: 'ALR-MP',
        valor: 0,
        categoria: 'MANTENIMIENTO',
        descripcion: 'Mantenimiento preventivo próximo o vencido según intervalo_km o intervalo_meses del tipo_mantenimiento. Requiere tipo_mantenimiento_id.',
    },
    [TipoAlertaVehiculo.MANT_VENCIDO]: {
        id: TipoAlertaVehiculo.MANT_VENCIDO,
        abreviatura: 'MANT_VENCIDO',
        label: 'Mantenimiento Vencido',
        prefijo: 'ALR-MV',
        valor: 0,
        categoria: 'MANTENIMIENTO',
        descripcion: 'Mantenimiento preventivo ya vencido (km_faltantes < 0 o dias_faltantes < 0). Nivel CRITICO o ALTA.',
    },
    [TipoAlertaVehiculo.MANT_REPROGRAMADO]: {
        id: TipoAlertaVehiculo.MANT_REPROGRAMADO,
        abreviatura: 'MANT_REPROGRAMADO',
        label: 'Mantenimiento Reprogramado',
        prefijo: 'ALR-MR',
        valor: 0,
        categoria: 'MANTENIMIENTO',
        descripcion: 'Mantenimiento preventivo reprogramado por el administrador. Registra motivo y nueva fecha/km objetivo.',
    },
    [TipoAlertaVehiculo.ANOMALIA_CONSUMO]: {
        id: TipoAlertaVehiculo.ANOMALIA_CONSUMO,
        abreviatura: 'ANOMALIA_CONSUMO',
        label: 'Anomalía en Consumo',
        prefijo: 'ALR-AC',
        valor: 0,
        categoria: 'MANTENIMIENTO',
        descripcion: 'Consumo de combustible anormal detectado (desviación mayor al umbral configurado en parametros_globales).',
    },
    [TipoAlertaVehiculo.DESV_KM]: {
        id: TipoAlertaVehiculo.DESV_KM,
        abreviatura: 'DESV_KM',
        label: 'Desviación de Kilometraje',
        prefijo: 'ALR-DK',
        valor: 0,
        categoria: 'MANTENIMIENTO',
        descripcion: 'Desviación de kilometraje detectada (retroceso o salto anormal entre lecturas consecutivas).',
    },
    [TipoAlertaVehiculo.FALLA_MECANICA_REPORTADA]: {
        id: TipoAlertaVehiculo.FALLA_MECANICA_REPORTADA,
        abreviatura: 'FALLA_MEC_REP',
        label: 'Falla Mecánica Reportada',
        prefijo: 'ALR-FM',
        valor: 0,
        categoria: 'MANTENIMIENTO',
        descripcion: 'Falla mecánica reportada por el conductor. Requiere seguimiento y eventual cambio a estado EN_TALLER.',
    },
    [TipoAlertaVehiculo.RENDIMIENTO_BAJO]: {
        id: TipoAlertaVehiculo.RENDIMIENTO_BAJO,
        abreviatura: 'RENDIMIENTO_BAJO',
        label: 'Rendimiento Bajo',
        prefijo: 'ALR-RB',
        valor: 0,
        categoria: 'MANTENIMIENTO',
        descripcion: 'Rendimiento km/L por debajo del promedio histórico del vehículo. Posible falla mecánica incipiente.',
    },
    [TipoAlertaVehiculo.REVISION_TECNICA_FALLA]: {
        id: TipoAlertaVehiculo.REVISION_TECNICA_FALLA,
        abreviatura: 'REV_TEC_FALLA',
        label: 'Falla en Revisión Técnica',
        prefijo: 'ALR-RT',
        valor: 0,
        categoria: 'MANTENIMIENTO',
        descripcion: 'Vehículo no pasó la revisión técnica vehicular. Requiere reparación antes de volver a circular.',
    },
    [TipoAlertaVehiculo.REPUESTO_PENDIENTE]: {
        id: TipoAlertaVehiculo.REPUESTO_PENDIENTE,
        abreviatura: 'REPUESTO_PEND',
        label: 'Repuesto Pendiente',
        prefijo: 'ALR-RP',
        valor: 0,
        categoria: 'MANTENIMIENTO',
        descripcion: 'Vehículo en espera de repuesto. Estado operativo 5503 (EN_ESPERA_REPUESTO).',
    },
    [TipoAlertaVehiculo.VEHICULO_EN_TALLER]: {
        id: TipoAlertaVehiculo.VEHICULO_EN_TALLER,
        abreviatura: 'VEH_EN_TALLER',
        label: 'Vehículo en Taller',
        prefijo: 'ALR-VT',
        valor: 0,
        categoria: 'MANTENIMIENTO',
        descripcion: 'Vehículo ingresado a taller. Estado operativo 5502 (EN_TALLER). Requiere programación de salida.',
    },

    // ── Documentación (5660-5669) ──
    [TipoAlertaVehiculo.VENC_SOAT]: {
        id: TipoAlertaVehiculo.VENC_SOAT,
        abreviatura: 'VENC_SOAT',
        label: 'Vencimiento de SOAT',
        prefijo: 'ALR-SO',
        valor: 0,
        categoria: 'DOCUMENTACION',
        descripcion: 'SOAT próximo a vencer o vencido. Documento obligatorio para circular. Requiere gestión inmediata.',
    },
    [TipoAlertaVehiculo.VENC_REVISION_TECNICA]: {
        id: TipoAlertaVehiculo.VENC_REVISION_TECNICA,
        abreviatura: 'VENC_REV_TEC',
        label: 'Vencimiento de Revisión Técnica',
        prefijo: 'ALR-RT',
        valor: 0,
        categoria: 'DOCUMENTACION',
        descripcion: 'Revisión técnica vehicular próxima a vencer o vencida. Documento obligatorio ante la ATT.',
    },
    [TipoAlertaVehiculo.VENC_LICENCIA_TRANSITO]: {
        id: TipoAlertaVehiculo.VENC_LICENCIA_TRANSITO,
        abreviatura: 'VENC_LIC_TRAN',
        label: 'Vencimiento de Licencia de Tránsito',
        prefijo: 'ALR-LT',
        valor: 0,
        categoria: 'DOCUMENTACION',
        descripcion: 'Licencia de tránsito (padrón) próxima a vencer o vencida.',
    },
    [TipoAlertaVehiculo.VENC_POLIZA_SEGURO]: {
        id: TipoAlertaVehiculo.VENC_POLIZA_SEGURO,
        abreviatura: 'VENC_POLIZA',
        label: 'Vencimiento de Póliza de Seguro',
        prefijo: 'ALR-PZ',
        valor: 0,
        categoria: 'DOCUMENTACION',
        descripcion: 'Póliza de seguro próxima a vencer o vencida.',
    },
    [TipoAlertaVehiculo.VENC_TARJETA_OPERACION]: {
        id: TipoAlertaVehiculo.VENC_TARJETA_OPERACION,
        abreviatura: 'VENC_TARJ_OP',
        label: 'Vencimiento de Tarjeta de Operación',
        prefijo: 'ALR-TO',
        valor: 0,
        categoria: 'DOCUMENTACION',
        descripcion: 'Tarjeta de operación (ATT) próxima a vencer o vencida.',
    },
    [TipoAlertaVehiculo.VENC_INSPECCION_OCULAR]: {
        id: TipoAlertaVehiculo.VENC_INSPECCION_OCULAR,
        abreviatura: 'VENC_INSP_OC',
        label: 'Vencimiento de Inspección Ocular',
        prefijo: 'ALR-IO',
        valor: 0,
        categoria: 'DOCUMENTACION',
        descripcion: 'Inspección ocular (GAMLP) próxima a vencer o vencida.',
    },
    [TipoAlertaVehiculo.DOC_PROXIMO_VENCER]: {
        id: TipoAlertaVehiculo.DOC_PROXIMO_VENCER,
        abreviatura: 'DOC_PROX_VENC',
        label: 'Documento Próximo a Vencer',
        prefijo: 'ALR-DPV',
        valor: 0,
        categoria: 'DOCUMENTACION',
        descripcion: 'Documento genérico próximo a vencer (entre 1 y N días, según parametros_globales).',
    },
    [TipoAlertaVehiculo.DOC_FALTANTE]: {
        id: TipoAlertaVehiculo.DOC_FALTANTE,
        abreviatura: 'DOC_FALTANTE',
        label: 'Documento Faltante',
        prefijo: 'ALR-DF',
        valor: 0,
        categoria: 'DOCUMENTACION',
        descripcion: 'Documento obligatorio faltante en el vehículo (no registrado en vehiculos_documentos).',
    },
    [TipoAlertaVehiculo.DOC_RECHAZADO]: {
        id: TipoAlertaVehiculo.DOC_RECHAZADO,
        abreviatura: 'DOC_RECHAZADO',
        label: 'Documento Rechazado',
        prefijo: 'ALR-DR',
        valor: 0,
        categoria: 'DOCUMENTACION',
        descripcion: 'Documento rechazado por la entidad emisora o por control interno. Requiere corrección.',
    },
    [TipoAlertaVehiculo.DOC_PENDIENTE_ESCANEO]: {
        id: TipoAlertaVehiculo.DOC_PENDIENTE_ESCANEO,
        abreviatura: 'DOC_PEND_ESC',
        label: 'Documento Pendiente de Escaneo',
        prefijo: 'ALR-DPE',
        valor: 0,
        categoria: 'DOCUMENTACION',
        descripcion: 'Documento registrado pero sin archivo adjunto escaneado. Requiere digitalización.',
    },

    // ── Combustible (5670-5679) ──
    [TipoAlertaVehiculo.CARGA_INUSUAL]: {
        id: TipoAlertaVehiculo.CARGA_INUSUAL,
        abreviatura: 'CARGA_INUSUAL',
        label: 'Carga de Combustible Inusual',
        prefijo: 'ALR-CI',
        valor: 0,
        categoria: 'COMBUSTIBLE',
        descripcion: 'Carga de combustible inusualmente alta o baja. Posible fraude o error de registro.',
    },
    [TipoAlertaVehiculo.RENDIMIENTO_ANORMAL]: {
        id: TipoAlertaVehiculo.RENDIMIENTO_ANORMAL,
        abreviatura: 'REND_ANORMAL',
        label: 'Rendimiento Anormal',
        prefijo: 'ALR-RA',
        valor: 0,
        categoria: 'COMBUSTIBLE',
        descripcion: 'Rendimiento km/L fuera del rango esperado. Posible falla mecánica o manipulación.',
    },
    [TipoAlertaVehiculo.CONSUMO_EXCESIVO]: {
        id: TipoAlertaVehiculo.CONSUMO_EXCESIVO,
        abreviatura: 'CONSUMO_EXC',
        label: 'Consumo Excesivo',
        prefijo: 'ALR-CE',
        valor: 0,
        categoria: 'COMBUSTIBLE',
        descripcion: 'Consumo de combustible excesivo comparado con el promedio de la flota.',
    },
    [TipoAlertaVehiculo.CARGA_SIN_ODOMETRO]: {
        id: TipoAlertaVehiculo.CARGA_SIN_ODOMETRO,
        abreviatura: 'CARGA_SIN_ODO',
        label: 'Carga sin Odómetro',
        prefijo: 'ALR-CSO',
        valor: 0,
        categoria: 'COMBUSTIBLE',
        descripcion: 'Carga registrada sin lectura de odómetro. Impide calcular rendimiento.',
    },
    [TipoAlertaVehiculo.TANQUE_NO_LLENO_REPETIDO]: {
        id: TipoAlertaVehiculo.TANQUE_NO_LLENO_REPETIDO,
        abreviatura: 'TANQUE_NO_LLENO',
        label: 'Tanque No Lleno Repetido',
        prefijo: 'ALR-TNL',
        valor: 0,
        categoria: 'COMBUSTIBLE',
        descripcion: 'Múltiples cargas consecutivas sin tanque lleno. Dificulta el cálculo de rendimiento.',
    },
    [TipoAlertaVehiculo.POSIBLE_FUGA_COMBUSTIBLE]: {
        id: TipoAlertaVehiculo.POSIBLE_FUGA_COMBUSTIBLE,
        abreviatura: 'FUGA_COMBUST',
        label: 'Posible Fuga de Combustible',
        prefijo: 'ALR-FC',
        valor: 0,
        categoria: 'COMBUSTIBLE',
        descripcion: 'Posible fuga de combustible detectada por rendimiento decreciente o manchas reportadas.',
    },
    [TipoAlertaVehiculo.COMBUSTIBLE_DESVIADO]: {
        id: TipoAlertaVehiculo.COMBUSTIBLE_DESVIADO,
        abreviatura: 'COMB_DESVIADO',
        label: 'Combustible Desviado',
        prefijo: 'ALR-CD',
        valor: 0,
        categoria: 'COMBUSTIBLE',
        descripcion: 'Combustible no justificado por kilometraje recorrido. Posible desvío a otro vehículo.',
    },
    [TipoAlertaVehiculo.CARGA_FUERA_HORARIO]: {
        id: TipoAlertaVehiculo.CARGA_FUERA_HORARIO,
        abreviatura: 'CARGA_F_HORARIO',
        label: 'Carga Fuera de Horario',
        prefijo: 'ALR-CFH',
        valor: 0,
        categoria: 'COMBUSTIBLE',
        descripcion: 'Carga de combustible fuera del horario del turno asignado al conductor.',
    },
    [TipoAlertaVehiculo.PRECIO_COMBUSTIBLE_ALTO]: {
        id: TipoAlertaVehiculo.PRECIO_COMBUSTIBLE_ALTO,
        abreviatura: 'PRECIO_COMB_ALTO',
        label: 'Precio de Combustible Alto',
        prefijo: 'ALR-PCA',
        valor: 0,
        categoria: 'COMBUSTIBLE',
        descripcion: 'Precio por litro de combustible superior al promedio de mercado configurado.',
    },
    [TipoAlertaVehiculo.SIN_CARGAS_RECIENTES]: {
        id: TipoAlertaVehiculo.SIN_CARGAS_RECIENTES,
        abreviatura: 'SIN_CARGAS',
        label: 'Sin Cargas Recientes',
        prefijo: 'ALR-SC',
        valor: 0,
        categoria: 'COMBUSTIBLE',
        descripcion: 'Vehículo sin cargas de combustible registradas en los últimos N días. Posible subregistro.',
    },

    // ── Odómetro (5680-5689) ──
    [TipoAlertaVehiculo.ODOMETRO_RETROCEDE]: {
        id: TipoAlertaVehiculo.ODOMETRO_RETROCEDE,
        abreviatura: 'ODOM_RETROCEDE',
        label: 'Odómetro Retrocede',
        prefijo: 'ALR-OR',
        valor: 0,
        categoria: 'ODOMETRO',
        descripcion: 'Lectura de odómetro menor a la anterior. Posible manipulación o error de transcripción.',
    },
    [TipoAlertaVehiculo.ODOMETRO_SALTO_ANORMAL]: {
        id: TipoAlertaVehiculo.ODOMETRO_SALTO_ANORMAL,
        abreviatura: 'ODOM_SALTO',
        label: 'Salto Anormal de Odómetro',
        prefijo: 'ALR-OS',
        valor: 0,
        categoria: 'ODOMETRO',
        descripcion: 'Salto anormal en el odómetro (> N km en un día). Posible error o manipulación.',
    },
    [TipoAlertaVehiculo.ODOMETRO_SIN_ACTUALIZAR]: {
        id: TipoAlertaVehiculo.ODOMETRO_SIN_ACTUALIZAR,
        abreviatura: 'ODOM_SIN_ACT',
        label: 'Odómetro sin Actualizar',
        prefijo: 'ALR-OSA',
        valor: 0,
        categoria: 'ODOMETRO',
        descripcion: 'Odómetro sin actualizar en los últimos N días. Requiere verificación.',
    },
    [TipoAlertaVehiculo.ODOMETRO_INCONSISTENTE]: {
        id: TipoAlertaVehiculo.ODOMETRO_INCONSISTENTE,
        abreviatura: 'ODOM_INCONS',
        label: 'Odómetro Inconsistente',
        prefijo: 'ALR-OI',
        valor: 0,
        categoria: 'ODOMETRO',
        descripcion: 'Inconsistencia entre el odómetro del vehículo y el histórico de lecturas.',
    },
    [TipoAlertaVehiculo.LECTURA_MANUAL_SOSPECHOSA]: {
        id: TipoAlertaVehiculo.LECTURA_MANUAL_SOSPECHOSA,
        abreviatura: 'LECT_MAN_SOSP',
        label: 'Lectura Manual Sospechosa',
        prefijo: 'ALR-LMS',
        valor: 0,
        categoria: 'ODOMETRO',
        descripcion: 'Lectura manual de odómetro registrada en horarios o ubicaciones sospechosas.',
    },
    [TipoAlertaVehiculo.SIN_LECTURAS_DIARIAS]: {
        id: TipoAlertaVehiculo.SIN_LECTURAS_DIARIAS,
        abreviatura: 'SIN_LECT_DIAR',
        label: 'Sin Lecturas Diarias',
        prefijo: 'ALR-SLD',
        valor: 0,
        categoria: 'ODOMETRO',
        descripcion: 'Vehículo operativo sin lecturas diarias de odómetro. Falta de control operativo.',
    },
    [TipoAlertaVehiculo.KM_DIARIO_EXCEDIDO]: {
        id: TipoAlertaVehiculo.KM_DIARIO_EXCEDIDO,
        abreviatura: 'KM_DIARIO_EXC',
        label: 'Kilometraje Diario Excedido',
        prefijo: 'ALR-KDE',
        valor: 0,
        categoria: 'ODOMETRO',
        descripcion: 'Kilometraje diario excedido respecto al promedio esperado para la zona.',
    },
    [TipoAlertaVehiculo.KM_DIARIO_INSUFICIENTE]: {
        id: TipoAlertaVehiculo.KM_DIARIO_INSUFICIENTE,
        abreviatura: 'KM_DIARIO_INS',
        label: 'Kilometraje Diario Insuficiente',
        prefijo: 'ALR-KDI',
        valor: 0,
        categoria: 'ODOMETRO',
        descripcion: 'Kilometraje diario insuficiente. Posible subutilización del vehículo.',
    },
    [TipoAlertaVehiculo.VEHICULO_FUERA_ZONA]: {
        id: TipoAlertaVehiculo.VEHICULO_FUERA_ZONA,
        abreviatura: 'VEH_FUERA_ZONA',
        label: 'Vehículo Fuera de Zona',
        prefijo: 'ALR-VFZ',
        valor: 0,
        categoria: 'ODOMETRO',
        descripcion: 'Vehículo circulando fuera de la zona autorizada de operación.',
    },
    [TipoAlertaVehiculo.USO_NO_AUTORIZADO]: {
        id: TipoAlertaVehiculo.USO_NO_AUTORIZADO,
        abreviatura: 'USO_NO_AUTZ',
        label: 'Uso No Autorizado',
        prefijo: 'ALR-UNA',
        valor: 0,
        categoria: 'ODOMETRO',
        descripcion: 'Uso del vehículo fuera de horario o por conductor no autorizado.',
    },

    // ── Operación (5690-5699) ──
    [TipoAlertaVehiculo.SIN_ASIGNACION_DIARIA]: {
        id: TipoAlertaVehiculo.SIN_ASIGNACION_DIARIA,
        abreviatura: 'SIN_ASIGNACION',
        label: 'Sin Asignación Diaria',
        prefijo: 'ALR-SA',
        valor: 0,
        categoria: 'OPERACION',
        descripcion: 'Vehículo operativo sin asignación diaria registrada. Falta de control de turno.',
    },
    [TipoAlertaVehiculo.CONDUCTOR_NO_HABILITADO]: {
        id: TipoAlertaVehiculo.CONDUCTOR_NO_HABILITADO,
        abreviatura: 'COND_NO_HABIL',
        label: 'Conductor No Habilitado',
        prefijo: 'ALR-CNH',
        valor: 0,
        categoria: 'OPERACION',
        descripcion: 'Conductor asignado no habilitado (sin licencia vigente, antecedentes negativos, etc.).',
    },
    [TipoAlertaVehiculo.VEHICULO_NO_OPERATIVO]: {
        id: TipoAlertaVehiculo.VEHICULO_NO_OPERATIVO,
        abreviatura: 'VEH_NO_OPER',
        label: 'Vehículo No Operativo',
        prefijo: 'ALR-VNO',
        valor: 0,
        categoria: 'OPERACION',
        descripcion: 'Vehículo en estado operativo distinto a OPERATIVO. No puede operar normalmente.',
    },
    [TipoAlertaVehiculo.CONFLICTO_ASIGNACION]: {
        id: TipoAlertaVehiculo.CONFLICTO_ASIGNACION,
        abreviatura: 'CONFLICTO_ASIG',
        label: 'Conflicto de Asignación',
        prefijo: 'ALR-CA',
        valor: 0,
        categoria: 'OPERACION',
        descripcion: 'Conflicto en asignación (solape de turnos para el mismo vehículo o conductor).',
    },
    [TipoAlertaVehiculo.TURNO_NO_CUBIERTO]: {
        id: TipoAlertaVehiculo.TURNO_NO_CUBIERTO,
        abreviatura: 'TURNO_NO_CUB',
        label: 'Turno No Cubierto',
        prefijo: 'ALR-TNC',
        valor: 0,
        categoria: 'OPERACION',
        descripcion: 'Turno no cubierto por ningún conductor. Afecta la disponibilidad operativa.',
    },
    [TipoAlertaVehiculo.EXCESO_HORAS_TURNO]: {
        id: TipoAlertaVehiculo.EXCESO_HORAS_TURNO,
        abreviatura: 'EXCESO_HORAS',
        label: 'Exceso de Horas de Turno',
        prefijo: 'ALR-EHT',
        valor: 0,
        categoria: 'OPERACION',
        descripcion: 'Conductor excedió las horas máximas de turno permitidas.',
    },
    [TipoAlertaVehiculo.CONDUCTOR_SIN_LICENCIA]: {
        id: TipoAlertaVehiculo.CONDUCTOR_SIN_LICENCIA,
        abreviatura: 'COND_SIN_LIC',
        label: 'Conductor Sin Licencia',
        prefijo: 'ALR-CSL',
        valor: 0,
        categoria: 'OPERACION',
        descripcion: 'Conductor sin licencia de conducir vigente. No puede operar legalmente.',
    },
    [TipoAlertaVehiculo.CONDUCTOR_CON_SANCION]: {
        id: TipoAlertaVehiculo.CONDUCTOR_CON_SANCION,
        abreviatura: 'COND_CON_SANC',
        label: 'Conductor con Sanción',
        prefijo: 'ALR-CCS',
        valor: 0,
        categoria: 'OPERACION',
        descripcion: 'Conductor con antecedente negativo vigente. Requiere evaluación.',
    },
    [TipoAlertaVehiculo.VEHICULO_EN_MANTENIMIENTO]: {
        id: TipoAlertaVehiculo.VEHICULO_EN_MANTENIMIENTO,
        abreviatura: 'VEH_EN_MANT',
        label: 'Vehículo en Mantenimiento',
        prefijo: 'ALR-VEM',
        valor: 0,
        categoria: 'OPERACION',
        descripcion: 'Vehículo con mantenimiento activo. No debe asignarse a turnos.',
    },
    [TipoAlertaVehiculo.VEHICULO_SUSPENDIDO]: {
        id: TipoAlertaVehiculo.VEHICULO_SUSPENDIDO,
        abreviatura: 'VEH_SUSPENDIDO',
        label: 'Vehículo Suspendido',
        prefijo: 'ALR-VS',
        valor: 0,
        categoria: 'OPERACION',
        descripcion: 'Vehículo con suspensión activa en moviles_suspendidos. No puede operar.',
    },

    // ── Morosidad (5700-5709) ──
    [TipoAlertaVehiculo.FRECUENCIA_VENCIDA]: {
        id: TipoAlertaVehiculo.FRECUENCIA_VENCIDA,
        abreviatura: 'FREC_VENCIDA',
        label: 'Frecuencia Vencida',
        prefijo: 'ALR-FV',
        valor: 0,
        categoria: 'MOROSIDAD',
        descripcion: 'Frecuencia semanal vencida sin pago completo. Requiere gestión de cobro.',
    },
    [TipoAlertaVehiculo.FRECUENCIA_PROXIMA_VENCER]: {
        id: TipoAlertaVehiculo.FRECUENCIA_PROXIMA_VENCER,
        abreviatura: 'FREC_PROX_VENC',
        label: 'Frecuencia Próxima a Vencer',
        prefijo: 'ALR-FPV',
        valor: 0,
        categoria: 'MOROSIDAD',
        descripcion: 'Frecuencia semanal próxima a vencer (24-48h antes del límite). Recordatorio preventivo.',
    },
    [TipoAlertaVehiculo.MORA_REINCIDENTE]: {
        id: TipoAlertaVehiculo.MORA_REINCIDENTE,
        abreviatura: 'MORA_REINCID',
        label: 'Mora Reincidente',
        prefijo: 'ALR-MR',
        valor: 0,
        categoria: 'MOROSIDAD',
        descripcion: 'Conductor moroso reincidente (3+ semanas con mora). Afecta categoría M-J-K-X.',
    },
    [TipoAlertaVehiculo.SUSPENSION_ACTIVA]: {
        id: TipoAlertaVehiculo.SUSPENSION_ACTIVA,
        abreviatura: 'SUSP_ACTIVA',
        label: 'Suspensión Activa',
        prefijo: 'ALR-SUA',
        valor: 0,
        categoria: 'MOROSIDAD',
        descripcion: 'Vehículo con suspensión activa en moviles_suspendidos (es_activo = 1).',
    },
    [TipoAlertaVehiculo.SUSPENSION_AUTOMATICA]: {
        id: TipoAlertaVehiculo.SUSPENSION_AUTOMATICA,
        abreviatura: 'SUSP_AUTOMATICA',
        label: 'Suspensión Automática',
        prefijo: 'ALR-SAU',
        valor: 0,
        categoria: 'MOROSIDAD',
        descripcion: 'Suspensión generada automáticamente por la tarea SUSPENSION_MOROSOS (jueves 00:00).',
    },
    [TipoAlertaVehiculo.PAGO_PARCIAL_PENDIENTE]: {
        id: TipoAlertaVehiculo.PAGO_PARCIAL_PENDIENTE,
        abreviatura: 'PAGO_PARCIAL_P',
        label: 'Pago Parcial Pendiente',
        prefijo: 'ALR-PPP',
        valor: 0,
        categoria: 'MOROSIDAD',
        descripcion: 'Pago parcial registrado con saldo pendiente > 0. Requiere seguimiento.',
    },
    [TipoAlertaVehiculo.SALDO_ALTO]: {
        id: TipoAlertaVehiculo.SALDO_ALTO,
        abreviatura: 'SALDO_ALTO',
        label: 'Saldo Alto',
        prefijo: 'ALR-SAL',
        valor: 0,
        categoria: 'MOROSIDAD',
        descripcion: 'Saldo pendiente superior al umbral configurado. Riesgo de suspensión.',
    },
    [TipoAlertaVehiculo.PAGO_FUERA_HORARIO]: {
        id: TipoAlertaVehiculo.PAGO_FUERA_HORARIO,
        abreviatura: 'PAGO_F_HORARIO',
        label: 'Pago Fuera de Horario',
        prefijo: 'ALR-PFH',
        valor: 0,
        categoria: 'MOROSIDAD',
        descripcion: 'Pago registrado fuera del horario de operación de la sucursal.',
    },
    [TipoAlertaVehiculo.PAGO_SIN_COMPROBANTE]: {
        id: TipoAlertaVehiculo.PAGO_SIN_COMPROBANTE,
        abreviatura: 'PAGO_SIN_COMP',
        label: 'Pago sin Comprobante',
        prefijo: 'ALR-PSC',
        valor: 0,
        categoria: 'MOROSIDAD',
        descripcion: 'Pago electrónico sin número de comprobante. Requiere regularización.',
    },
    [TipoAlertaVehiculo.EXONERACION_APLICADA]: {
        id: TipoAlertaVehiculo.EXONERACION_APLICADA,
        abreviatura: 'EXONERACION',
        label: 'Exoneración Aplicada',
        prefijo: 'ALR-EXO',
        valor: 0,
        categoria: 'MOROSIDAD',
        descripcion: 'Obligación de frecuencia exonerada por administrador (vacaciones, enfermedad, etc.).',
    },

    // ── Seguridad (5710-5719) ──
    [TipoAlertaVehiculo.EXCESO_VELOCIDAD]: {
        id: TipoAlertaVehiculo.EXCESO_VELOCIDAD,
        abreviatura: 'EXCESO_VELOC',
        label: 'Exceso de Velocidad',
        prefijo: 'ALR-EV',
        valor: 0,
        categoria: 'SEGURIDAD',
        descripcion: 'Exceso de velocidad detectado por GPS. Genera antecedente negativo.',
    },
    [TipoAlertaVehiculo.FRENADO_BRUSCO]: {
        id: TipoAlertaVehiculo.FRENADO_BRUSCO,
        abreviatura: 'FRENADO_BRUSCO',
        label: 'Frenado Brusco',
        prefijo: 'ALR-FB',
        valor: 0,
        categoria: 'SEGURIDAD',
        descripcion: 'Frenado brusco detectado por sensor GPS/acelerómetro. Riesgo para pasajeros.',
    },
    [TipoAlertaVehiculo.ACELERACION_BRUSCA]: {
        id: TipoAlertaVehiculo.ACELERACION_BRUSCA,
        abreviatura: 'ACEL_BRUSCA',
        label: 'Aceleración Brusca',
        prefijo: 'ALR-AB',
        valor: 0,
        categoria: 'SEGURIDAD',
        descripcion: 'Aceleración brusca detectada. Indica conducción agresiva.',
    },
    [TipoAlertaVehiculo.COLISION_DETECTADA]: {
        id: TipoAlertaVehiculo.COLISION_DETECTADA,
        abreviatura: 'COLISION_DET',
        label: 'Colisión Detectada',
        prefijo: 'ALR-CD',
        valor: 0,
        categoria: 'SEGURIDAD',
        descripcion: 'Colisión detectada por sensor. Requiere verificación inmediata.',
    },
    [TipoAlertaVehiculo.SINIESTRO_REPORTADO]: {
        id: TipoAlertaVehiculo.SINIESTRO_REPORTADO,
        abreviatura: 'SINIESTRO_REP',
        label: 'Siniestro Reportado',
        prefijo: 'ALR-SR',
        valor: 0,
        categoria: 'SEGURIDAD',
        descripcion: 'Siniestro reportado por el conductor. Requiere gestión con aseguradora.',
    },
    [TipoAlertaVehiculo.PANICO_BOTON]: {
        id: TipoAlertaVehiculo.PANICO_BOTON,
        abreviatura: 'PANICO_BOTON',
        label: 'Botón de Pánico',
        prefijo: 'ALR-PB',
        valor: 0,
        categoria: 'SEGURIDAD',
        descripcion: 'Botón de pánico activado por el conductor. Emergencia en curso.',
    },
    [TipoAlertaVehiculo.CONDUCTOR_NO_IDENTIFICADO]: {
        id: TipoAlertaVehiculo.CONDUCTOR_NO_IDENTIFICADO,
        abreviatura: 'COND_NO_IDENT',
        label: 'Conductor No Identificado',
        prefijo: 'ALR-CNI',
        valor: 0,
        categoria: 'SEGURIDAD',
        descripcion: 'Vehículo operando con conductor no identificado en el sistema.',
    },
    [TipoAlertaVehiculo.GPS_SIN_SENAL]: {
        id: TipoAlertaVehiculo.GPS_SIN_SENAL,
        abreviatura: 'GPS_SIN_SENAL',
        label: 'GPS sin Señal',
        prefijo: 'ALR-GSS',
        valor: 0,
        categoria: 'SEGURIDAD',
        descripcion: 'Dispositivo GPS sin señal. Vehículo no rastreable.',
    },
    [TipoAlertaVehiculo.GEOCERCA_VIOLADA]: {
        id: TipoAlertaVehiculo.GEOCERCA_VIOLADA,
        abreviatura: 'GEOCERCA_VIOL',
        label: 'Geocerca Violada',
        prefijo: 'ALR-GCV',
        valor: 0,
        categoria: 'SEGURIDAD',
        descripcion: 'Vehículo abandonó la geocerca autorizada (zona de operación o radio de sucursal).',
    },
    [TipoAlertaVehiculo.HORARIO_NOCTURNO_INUSUAL]: {
        id: TipoAlertaVehiculo.HORARIO_NOCTURNO_INUSUAL,
        abreviatura: 'HORARIO_NOCT',
        label: 'Horario Nocturno Inusual',
        prefijo: 'ALR-HNI',
        valor: 0,
        categoria: 'SEGURIDAD',
        descripcion: 'Vehículo circulando en horario nocturno fuera de su turno asignado.',
    },

    // ── Calidad (5720-5729) ──
    [TipoAlertaVehiculo.QUEJA_CLIENTE]: {
        id: TipoAlertaVehiculo.QUEJA_CLIENTE,
        abreviatura: 'QUEJA_CLIENTE',
        label: 'Queja de Cliente',
        prefijo: 'ALR-QC',
        valor: 0,
        categoria: 'CALIDAD',
        descripcion: 'Queja registrada por un cliente. Requiere investigación y respuesta.',
    },
    [TipoAlertaVehiculo.CALIFICACION_BAJA]: {
        id: TipoAlertaVehiculo.CALIFICACION_BAJA,
        abreviatura: 'CALIF_BAJA',
        label: 'Calificación Baja',
        prefijo: 'ALR-CB',
        valor: 0,
        categoria: 'CALIDAD',
        descripcion: 'Calificación de viaje baja (1-2 estrellas). Alerta al conductor.',
    },
    [TipoAlertaVehiculo.CALIFICACION_CRITICA]: {
        id: TipoAlertaVehiculo.CALIFICACION_CRITICA,
        abreviatura: 'CALIF_CRITICA',
        label: 'Calificación Crítica',
        prefijo: 'ALR-CC',
        valor: 0,
        categoria: 'CALIDAD',
        descripcion: 'Calificación crítica (1 estrella) reiterada. Riesgo de suspensión del conductor.',
    },
    [TipoAlertaVehiculo.COMENTARIO_NEGATIVO]: {
        id: TipoAlertaVehiculo.COMENTARIO_NEGATIVO,
        abreviatura: 'COM_NEGATIVO',
        label: 'Comentario Negativo',
        prefijo: 'ALR-CN',
        valor: 0,
        categoria: 'CALIDAD',
        descripcion: 'Comentario negativo de cliente sobre servicio, atención o conducción.',
    },
    [TipoAlertaVehiculo.RECLAMO_REITERADO]: {
        id: TipoAlertaVehiculo.RECLAMO_REITERADO,
        abreviatura: 'RECLAMO_REIT',
        label: 'Reclamo Reiterado',
        prefijo: 'ALR-RR',
        valor: 0,
        categoria: 'CALIDAD',
        descripcion: 'Conductor con reclamos reiterados en el período evaluado.',
    },
    [TipoAlertaVehiculo.ELIMINACION_QUEJA]: {
        id: TipoAlertaVehiculo.ELIMINACION_QUEJA,
        abreviatura: 'ELIM_QUEJA',
        label: 'Eliminación de Queja',
        prefijo: 'ALR-EQ',
        valor: 0,
        categoria: 'CALIDAD',
        descripcion: 'Queja eliminada o desestimada. Registro para auditoría.',
    },
    [TipoAlertaVehiculo.RECONOCIMIENTO_POSITIVO]: {
        id: TipoAlertaVehiculo.RECONOCIMIENTO_POSITIVO,
        abreviatura: 'RECONOC_POSIT',
        label: 'Reconocimiento Positivo',
        prefijo: 'ALR-RP',
        valor: 0,
        categoria: 'CALIDAD',
        descripcion: 'Reconocimiento positivo por servicio destacado. Afecta positivamente la categoría.',
    },
    [TipoAlertaVehiculo.META_CUMPLIDA]: {
        id: TipoAlertaVehiculo.META_CUMPLIDA,
        abreviatura: 'META_CUMPLIDA',
        label: 'Meta Cumplida',
        prefijo: 'ALR-MC',
        valor: 0,
        categoria: 'CALIDAD',
        descripcion: 'Meta de viajes, puntualidad o calificación cumplida por el conductor.',
    },
    [TipoAlertaVehiculo.RATING_SEMANAL_BAJO]: {
        id: TipoAlertaVehiculo.RATING_SEMANAL_BAJO,
        abreviatura: 'RATING_SEM_BAJO',
        label: 'Rating Semanal Bajo',
        prefijo: 'ALR-RSB',
        valor: 0,
        categoria: 'CALIDAD',
        descripcion: 'Rating semanal por debajo del umbral. Afecta categorización M-J-K-X.',
    },
    [TipoAlertaVehiculo.RATING_SEMANAL_ALTO]: {
        id: TipoAlertaVehiculo.RATING_SEMANAL_ALTO,
        abreviatura: 'RATING_SEM_ALTO',
        label: 'Rating Semanal Alto',
        prefijo: 'ALR-RSA',
        valor: 0,
        categoria: 'CALIDAD',
        descripcion: 'Rating semanal alto. Candidato a ascenso de categoría.',
    },

    // ── Sistema (5730-5739) ──
    [TipoAlertaVehiculo.SISTEMA_GENERAL]: {
        id: TipoAlertaVehiculo.SISTEMA_GENERAL,
        abreviatura: 'SISTEMA_GENERAL',
        label: 'Sistema General',
        prefijo: 'ALR-SG',
        valor: 0,
        categoria: 'SISTEMA',
        descripcion: 'Notificación administrativa general o aviso operativo ingresado manualmente.',
    },
    [TipoAlertaVehiculo.ERROR_INTEGRACION]: {
        id: TipoAlertaVehiculo.ERROR_INTEGRACION,
        abreviatura: 'ERROR_INTEGR',
        label: 'Error de Integración',
        prefijo: 'ALR-EI',
        valor: 0,
        categoria: 'SISTEMA',
        descripcion: 'Error en integración con sistemas externos (GPS, SIAT, pasarela QR).',
    },
    [TipoAlertaVehiculo.CONFIGURACION_INVALIDA]: {
        id: TipoAlertaVehiculo.CONFIGURACION_INVALIDA,
        abreviatura: 'CONFIG_INVALIDA',
        label: 'Configuración Inválida',
        prefijo: 'ALR-CI',
        valor: 0,
        categoria: 'SISTEMA',
        descripcion: 'Configuración inválida detectada (parámetros inconsistentes, umbrales fuera de rango).',
    },
    [TipoAlertaVehiculo.TAREA_FALLIDA]: {
        id: TipoAlertaVehiculo.TAREA_FALLIDA,
        abreviatura: 'TAREA_FALLIDA',
        label: 'Tarea Fallida',
        prefijo: 'ALR-TF',
        valor: 0,
        categoria: 'SISTEMA',
        descripcion: 'Tarea programada falló (ver tareas_programadas.ultimo_error). Requiere revisión.',
    },
    [TipoAlertaVehiculo.BACKUP_FALLIDO]: {
        id: TipoAlertaVehiculo.BACKUP_FALLIDO,
        abreviatura: 'BACKUP_FALLIDO',
        label: 'Backup Fallido',
        prefijo: 'ALR-BF',
        valor: 0,
        categoria: 'SISTEMA',
        descripcion: 'Backup de base de datos falló. Riesgo de pérdida de datos.',
    },
    [TipoAlertaVehiculo.SINCRONIZACION_FALLIDA]: {
        id: TipoAlertaVehiculo.SINCRONIZACION_FALLIDA,
        abreviatura: 'SINC_FALLIDA',
        label: 'Sincronización Fallida',
        prefijo: 'ALR-SF',
        valor: 0,
        categoria: 'SISTEMA',
        descripcion: 'Sincronización con base de datos externa o servicio falló.',
    },
    [TipoAlertaVehiculo.LIMITE_ALCANZADO]: {
        id: TipoAlertaVehiculo.LIMITE_ALCANZADO,
        abreviatura: 'LIMITE_ALCANZ',
        label: 'Límite Alcanzado',
        prefijo: 'ALR-LA',
        valor: 0,
        categoria: 'SISTEMA',
        descripcion: 'Límite de licencia, almacenamiento o transacciones alcanzado.',
    },
    [TipoAlertaVehiculo.ADVERTENCIA_ADMIN]: {
        id: TipoAlertaVehiculo.ADVERTENCIA_ADMIN,
        abreviatura: 'ADVERT_ADMIN',
        label: 'Advertencia Administrativa',
        prefijo: 'ALR-AA',
        valor: 0,
        categoria: 'SISTEMA',
        descripcion: 'Advertencia administrativa generada por el equipo de TI o gerencia.',
    },
    [TipoAlertaVehiculo.RECORDATORIO]: {
        id: TipoAlertaVehiculo.RECORDATORIO,
        abreviatura: 'RECORDATORIO',
        label: 'Recordatorio',
        prefijo: 'ALR-RC',
        valor: 0,
        categoria: 'SISTEMA',
        descripcion: 'Recordatorio genérico (reunión, capacitación, evento). No crítico.',
    },
    [TipoAlertaVehiculo.NINGUNO]: {
        id: TipoAlertaVehiculo.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'ALR-NIN',
        valor: 0,
        categoria: 'SISTEMA',
        descripcion: 'Sin tipo de alerta definido. Registro comodín por defecto del sistema. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// PUNTAJE ORIGEN
export enum PuntajeOrigen {
    MANUAL     = 5750,
    ANTECEDENTE = 5751,
    VIAJE      = 5752,
}

export const PUNTAJE_ORIGEN_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [PuntajeOrigen.MANUAL]: {
        id: PuntajeOrigen.MANUAL,
        abreviatura: 'MANUAL',
        label: 'Manual',
        prefijo: 'PUN-MAN',
        valor: 0,
        descripcion: 'Puntaje asignado manualmente por un administrador. No proviene de un antecedente ni de un viaje. Se usa para ajustes administrativos, correcciones o asignaciones especiales. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [PuntajeOrigen.ANTECEDENTE]: {
        id: PuntajeOrigen.ANTECEDENTE,
        abreviatura: 'ANTECEDENTE',
        label: 'Antecedente',
        prefijo: 'PUN-ANT',
        valor: 1,
        descripcion: 'Puntaje originado por la inserción de un registro en trabajador_antecedentes. El backend recalcula el puntaje acumulado del trabajador y, si corresponde, genera un nuevo registro en conductores_categorias con puntaje_origen_id = 5751 y antecedente_id asociado.',
    },
    [PuntajeOrigen.VIAJE]: {
        id: PuntajeOrigen.VIAJE,
        abreviatura: 'VIAJE',
        label: 'Viaje',
        prefijo: 'PUN-VIA',
        valor: 2,
        descripcion: 'Puntaje originado por la finalización de una solicitud_viaje (estado_viaje_id = 5255 FINALIZADO). El backend recalcula el puntaje acumulado del trabajador y, si corresponde, genera un nuevo registro en conductores_categorias con puntaje_origen_id = 5752 y solicitud_viaje_id asociado.',
    },
};

// ==========================================
// TIPO CODIGO PROMO
export enum TipoCodigoPromo {
    NINGUNO        = 5800,
    PORCENTAJE     = 5801,
    MONTO_FIJO     = 5802,
    VIAJE_GRATIS   = 5803,
    DESCUENTO_ENVIO= 5804,
}

export const TIPO_CODIGO_PROMO_METADATA: Record<TipoCodigoPromo, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoCodigoPromo.NINGUNO]: {
        id: TipoCodigoPromo.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'TIPO-PRO-NIN',
        valor: 0,
        descripcion: 'Sin tipo de código promocional definido. Utilizado exclusivamente como comodín del sistema. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoCodigoPromo.PORCENTAJE]: {
        id: TipoCodigoPromo.PORCENTAJE,
        abreviatura: 'PORCENTAJE',
        label: 'Porcentaje',
        prefijo: 'TIPO-PRO-POR',
        valor: 1,
        descripcion: 'Descuento porcentual sobre el total del viaje. El campo valor representa el porcentaje (0-100). El campo descuento_maximo actúa como tope máximo del descuento aplicado.',
    },
    [TipoCodigoPromo.MONTO_FIJO]: {
        id: TipoCodigoPromo.MONTO_FIJO,
        abreviatura: 'MONTO_FIJO',
        label: 'Monto Fijo',
        prefijo: 'TIPO-PRO-MON',
        valor: 2,
        descripcion: 'Descuento de monto fijo en Bs. sobre el total del viaje. El campo valor representa el monto exacto a descontar.',
    },
    [TipoCodigoPromo.VIAJE_GRATIS]: {
        id: TipoCodigoPromo.VIAJE_GRATIS,
        abreviatura: 'VIAJE_GRATIS',
        label: 'Viaje Gratis',
        prefijo: 'TIPO-PRO-VGR',
        valor: 3,
        descripcion: 'El viaje es gratuito hasta el monto definido en descuento_maximo. El campo valor se ignora. Aplica para promociones de lanzamiento o compensaciones.',
    },
    [TipoCodigoPromo.DESCUENTO_ENVIO]: {
        id: TipoCodigoPromo.DESCUENTO_ENVIO,
        abreviatura: 'DESCUENTO_ENVIO',
        label: 'Descuento en Envío',
        prefijo: 'TIPO-PRO-DEN',
        valor: 4,
        descripcion: 'Descuento aplicado al costo de envío de un paquete (servicio Cargo). El campo valor puede ser porcentaje o monto fijo según configuración del código.',
    },
};

// ==========================================
// ESTADO CODIGO PROMO
export enum EstadoCodigoPromo {
    NINGUNO      = 5850,
    ACTIVO       = 5851,
    AGOTADO      = 5852,
    VENCIDO      = 5853,
    SUSPENDIDO   = 5854,
}

export const ESTADO_CODIGO_PROMO_METADATA: Record<EstadoCodigoPromo, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoCodigoPromo.NINGUNO]: {
        id: EstadoCodigoPromo.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'EST-PRO-NIN',
        valor: 0,
        descripcion: 'Sin estado de código promocional definido. Utilizado exclusivamente como comodín del sistema. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoCodigoPromo.ACTIVO]: {
        id: EstadoCodigoPromo.ACTIVO,
        abreviatura: 'ACTIVO',
        label: 'Activo',
        prefijo: 'EST-PRO-ACT',
        valor: 1,
        descripcion: 'Código promocional disponible para ser usado por los clientes. Se aplica mientras esté dentro del rango de vigencia (fecha_inicio a fecha_fin) y no haya alcanzado su límite de usos.',
    },
    [EstadoCodigoPromo.AGOTADO]: {
        id: EstadoCodigoPromo.AGOTADO,
        abreviatura: 'AGOTADO',
        label: 'Agotado',
        prefijo: 'EST-PRO-AGO',
        valor: 2,
        descripcion: 'Código promocional que alcanzó su cantidad_maxima_usos. Se asigna automáticamente por el backend. No puede ser usado por nuevos clientes.',
    },
    [EstadoCodigoPromo.VENCIDO]: {
        id: EstadoCodigoPromo.VENCIDO,
        abreviatura: 'VENCIDO',
        label: 'Vencido',
        prefijo: 'EST-PRO-VEN',
        valor: 3,
        descripcion: 'Código promocional cuya fecha_fin ya pasó. Se asigna automáticamente por el backend. No puede ser usado por nuevos clientes, pero se conserva para auditoría de viajes pasados.',
    },
    [EstadoCodigoPromo.SUSPENDIDO]: {
        id: EstadoCodigoPromo.SUSPENDIDO,
        abreviatura: 'SUSPENDIDO',
        label: 'Suspendido',
        prefijo: 'EST-PRO-SUS',
        valor: 4,
        descripcion: 'Código promocional deshabilitado manualmente por el administrador. No puede ser usado hasta que se reactive. Aplica para revisión de márgenes o problemas detectados.',
    },
};

// ==========================================
// ESTADO REFERIDO
export enum EstadoReferido {
    NINGUNO      = 5900,
    PENDIENTE    = 5901,
    APLICADO     = 5902,
    EXPIRADO     = 5903,
    CANCELADO    = 5904,
}

export const ESTADO_REFERIDO_METADATA: Record<EstadoReferido, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoReferido.NINGUNO]: {
        id: EstadoReferido.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'EST-REF-NIN',
        valor: 0,
        descripcion: 'Sin estado de referido definido. Utilizado exclusivamente como comodín del sistema. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoReferido.PENDIENTE]: {
        id: EstadoReferido.PENDIENTE,
        abreviatura: 'PENDIENTE',
        label: 'Pendiente',
        prefijo: 'EST-REF-PEN',
        valor: 1,
        descripcion: 'El referidor invitó al amigo y se registró el teléfono. El referido aún no se ha registrado ni completado su primer viaje. Esperando acción del referido dentro del plazo de fecha_expiracion.',
    },
    [EstadoReferido.APLICADO]: {
        id: EstadoReferido.APLICADO,
        abreviatura: 'APLICADO',
        label: 'Aplicado',
        prefijo: 'EST-REF-APL',
        valor: 2,
        descripcion: 'El referido se registró y completó su primer viaje. Se generaron los bonos automáticos para ambos (referidor y referido). Requiere fecha_aplicacion NOT NULL.',
    },
    [EstadoReferido.EXPIRADO]: {
        id: EstadoReferido.EXPIRADO,
        abreviatura: 'EXPIRADO',
        label: 'Expirado',
        prefijo: 'EST-REF-EXP',
        valor: 3,
        descripcion: 'Pasó fecha_expiracion sin que el referido completara su primer viaje. El referido ya no puede reclamar el bono. Se asigna automáticamente por el backend o tarea programada.',
    },
    [EstadoReferido.CANCELADO]: {
        id: EstadoReferido.CANCELADO,
        abreviatura: 'CANCELADO',
        label: 'Cancelado',
        prefijo: 'EST-REF-CAN',
        valor: 4,
        descripcion: 'Referido cancelado manualmente por el administrador. Aplica cuando el referido fue bloqueado, se detectó fraude o existió conflicto de intereses. No genera bonos.',
    },
};

// ==========================================
// TIPO BONO CLIENTE
export enum TipoBonoCliente {
    NINGUNO            = 5950,
    BIENVENIDA         = 5951,
    REFERIDO           = 5952,
    PROMOCIONAL        = 5953,
    COMPENSACION       = 5954,
    FIDELIZACION       = 5955,
    REEMBOLSO          = 5956,
}

export const TIPO_BONO_CLIENTE_METADATA: Record<TipoBonoCliente, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoBonoCliente.NINGUNO]: {
        id: TipoBonoCliente.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'BON-NIN',
        valor: 0,
        descripcion: 'Sin tipo de bono definido. Utilizado exclusivamente como comodín del sistema. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoBonoCliente.BIENVENIDA]: {
        id: TipoBonoCliente.BIENVENIDA,
        abreviatura: 'BIENVENIDA',
        label: 'Bienvenida',
        prefijo: 'BON-BIE',
        valor: 1,
        descripcion: 'Bono otorgado al registrarse el cliente. Se aplica en el primer viaje. Al usarse, el campo clientes.descuento_bienvenida_pendiente se marca a 0. Vinculado a codigo_promo BIENVENIDA20.',
    },
    [TipoBonoCliente.REFERIDO]: {
        id: TipoBonoCliente.REFERIDO,
        abreviatura: 'REFERIDO',
        label: 'Referido',
        prefijo: 'BON-REF',
        valor: 2,
        descripcion: 'Bono otorgado por el programa de referidos. Se vincula al campo referido_id en referidos. Hay dos bonos por cada referido exitoso: uno para el referidor y otro para el referido.',
    },
    [TipoBonoCliente.PROMOCIONAL]: {
        id: TipoBonoCliente.PROMOCIONAL,
        abreviatura: 'PROMOCIONAL',
        label: 'Promocional',
        prefijo: 'BON-PRO',
        valor: 3,
        descripcion: 'Bono otorgado por una campaña o código promocional específico. Se vincula al campo codigo_promo_id en codigos_promo. Aplica para promociones temporales o eventos especiales.',
    },
    [TipoBonoCliente.COMPENSACION]: {
        id: TipoBonoCliente.COMPENSACION,
        abreviatura: 'COMPENSACION',
        label: 'Compensación',
        prefijo: 'BON-COM',
        valor: 4,
        descripcion: 'Bono otorgado por una queja, error o mala experiencia. Se usa para retener al cliente tras un incidente. Puede vincularse a solicitud_viaje_origen_id si proviene de un viaje específico.',
    },
    [TipoBonoCliente.FIDELIZACION]: {
        id: TipoBonoCliente.FIDELIZACION,
        abreviatura: 'FIDELIZACION',
        label: 'Fidelización',
        prefijo: 'BON-FID',
        valor: 5,
        descripcion: 'Bono otorgado por lealtad o antigüedad del cliente. Aplica para clientes VIP o con alta frecuencia de viajes. Se otorga manualmente o por tarea programada según reglas de negocio.',
    },
    [TipoBonoCliente.REEMBOLSO]: {
        id: TipoBonoCliente.REEMBOLSO,
        abreviatura: 'REEMBOLSO',
        label: 'Reembolso',
        prefijo: 'BON-REE',
        valor: 6,
        descripcion: 'Bono otorgado por devolución de un viaje cancelado o no prestado. Se vincula a solicitud_viaje_origen_id para trazabilidad. Aplica cuando el conductor canceló y el cliente ya había pagado.',
    },
};

// ==========================================
// ESTADO BONO CLIENTE
export enum EstadoBonoCliente {
    NINGUNO       = 6000,
    DISPONIBLE    = 6001,
    USADO         = 6002,
    EXPIRADO      = 6003,
    CANCELADO     = 6004,
}

export const ESTADO_BONO_CLIENTE_METADATA: Record<EstadoBonoCliente, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoBonoCliente.NINGUNO]: {
        id: EstadoBonoCliente.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'EBO-NIN',
        valor: 0,
        descripcion: 'Sin estado de bono definido. Utilizado exclusivamente como comodín del sistema. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoBonoCliente.DISPONIBLE]: {
        id: EstadoBonoCliente.DISPONIBLE,
        abreviatura: 'DISPONIBLE',
        label: 'Disponible',
        prefijo: 'EBO-DIS',
        valor: 1,
        descripcion: 'Bono con saldo_disponible > 0. Puede aplicarse total o parcialmente en uno o varios viajes. Requiere que monto_usado = 0 y saldo_disponible = monto.',
    },
    [EstadoBonoCliente.USADO]: {
        id: EstadoBonoCliente.USADO,
        abreviatura: 'USADO',
        label: 'Usado',
        prefijo: 'EBO-USA',
        valor: 2,
        descripcion: 'Bono consumido totalmente. saldo_disponible = 0 y monto_usado = monto. Requiere fecha_uso NOT NULL. No puede volver a usarse.',
    },
    [EstadoBonoCliente.EXPIRADO]: {
        id: EstadoBonoCliente.EXPIRADO,
        abreviatura: 'EXPIRADO',
        label: 'Expirado',
        prefijo: 'EBO-EXP',
        valor: 3,
        descripcion: 'Bono cuya fecha_expiracion ya pasó sin ser usado. Se asigna automáticamente por el backend (la validación NO se hace por CHECK porque CURRENT_TIMESTAMP no es IMMUTABLE). No puede usarse, pero se conserva para auditoría financiera.',
    },
    [EstadoBonoCliente.CANCELADO]: {
        id: EstadoBonoCliente.CANCELADO,
        abreviatura: 'CANCELADO',
        label: 'Cancelado',
        prefijo: 'EBO-CAN',
        valor: 4,
        descripcion: 'Bono cancelado manualmente por el administrador. Aplica cuando se detectó que el bono fue otorgado por error, hubo fraude o existió una decisión gerencial. No puede usarse.',
    },
};

// ==========================================
// CANAL NOTIFICACION
export enum CanalNotificacion {
    NINGUNO      = 6050,
    PUSH         = 6051,
    SMS          = 6052,
    WHATSAPP     = 6053,
    EMAIL        = 6054,
    INTERNA      = 6055,
}

export const CANAL_NOTIFICACION_METADATA: Record<CanalNotificacion, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [CanalNotificacion.NINGUNO]: {
        id: CanalNotificacion.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'CAN-NIN',
        valor: 0,
        descripcion: 'Sin canal de notificación definido. Utilizado exclusivamente como comodín del sistema. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [CanalNotificacion.PUSH]: {
        id: CanalNotificacion.PUSH,
        abreviatura: 'PUSH',
        label: 'Push',
        prefijo: 'CAN-PUS',
        valor: 1,
        descripcion: 'Notificación push enviada a la aplicación móvil del destinatario (cliente o trabajador). Requiere token FCM/APNs almacenado en datos_extra. Es el canal principal para notificaciones en tiempo real.',
    },
    [CanalNotificacion.SMS]: {
        id: CanalNotificacion.SMS,
        abreviatura: 'SMS',
        label: 'SMS',
        prefijo: 'CAN-SMS',
        valor: 2,
        descripcion: 'Mensaje de texto enviado al número de teléfono del destinatario. Útil como canal de respaldo cuando el push falla o el usuario no tiene la app instalada. Requiere número de teléfono válido.',
    },
    [CanalNotificacion.WHATSAPP]: {
        id: CanalNotificacion.WHATSAPP,
        abreviatura: 'WHATSAPP',
        label: 'WhatsApp',
        prefijo: 'CAN-WHA',
        valor: 3,
        descripcion: 'Mensaje enviado mediante WhatsApp Business API. Requiere número de teléfono y plantilla aprobada por Meta. Ideal para notificaciones transaccionales (confirmación de viaje, recordatorio de pago).',
    },
    [CanalNotificacion.EMAIL]: {
        id: CanalNotificacion.EMAIL,
        abreviatura: 'EMAIL',
        label: 'Email',
        prefijo: 'CAN-EMA',
        valor: 4,
        descripcion: 'Correo electrónico enviado a la dirección del destinatario. Utilizado para notificaciones formales (facturas, reportes, confirmaciones). Requiere email válido.',
    },
    [CanalNotificacion.INTERNA]: {
        id: CanalNotificacion.INTERNA,
        abreviatura: 'INTERNA',
        label: 'Interna',
        prefijo: 'CAN-INT',
        valor: 5,
        descripcion: 'Notificación dentro de la propia plataforma (campanita o panel de notificaciones). No requiere proveedor externo. Aplica para alertas operativas entre usuarios del sistema.',
    },
};

// ==========================================
// TIPO NOTIFICACION
export enum TipoNotificacion {
    NINGUNO              = 6100,
    VIAJE_SOLICITADO     = 6101,
    VIAJE_ASIGNADO       = 6102,
    VIAJE_EN_CAMINO      = 6103,
    VIAJE_LLEGO_ORIGEN   = 6104,
    VIAJE_EN_CURSO       = 6105,
    VIAJE_FINALIZADO     = 6106,
    VIAJE_CANCELADO      = 6107,
    VIAJE_NO_ATENDIDO    = 6108,
    PROMOCION            = 6109,
    BONO_OTORGADO        = 6110,
    BONO_POR_VENCER      = 6111,
    REFERIDO_EXITOSO     = 6112,
    BIENVENIDA           = 6113,
    RECORDATORIO         = 6114,
    SISTEMA              = 6115,
}

export const TIPO_NOTIFICACION_METADATA: Record<TipoNotificacion, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoNotificacion.NINGUNO]: {
        id: TipoNotificacion.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'TNO-NIN',
        valor: 0,
        descripcion: 'Sin tipo de notificación definido. Utilizado exclusivamente como comodín del sistema. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoNotificacion.VIAJE_SOLICITADO]: {
        id: TipoNotificacion.VIAJE_SOLICITADO,
        abreviatura: 'VIAJE_SOLICITADO',
        label: 'Viaje Solicitado',
        prefijo: 'TNO-VSO',
        valor: 1,
        descripcion: 'Notificación enviada al cliente confirmando que su solicitud de viaje fue recibida y está siendo procesada. Origen: backend al crear solicitud_viaje. Referencia: solicitud_viaje_id.',
    },
    [TipoNotificacion.VIAJE_ASIGNADO]: {
        id: TipoNotificacion.VIAJE_ASIGNADO,
        abreviatura: 'VIAJE_ASIGNADO',
        label: 'Viaje Asignado',
        prefijo: 'TNO-VAS',
        valor: 2,
        descripcion: 'Notificación enviada al cliente informando que un conductor aceptó su solicitud. Incluye datos del conductor y del vehículo. Origen: backend al pasar a estado ASIGNADO. Referencia: solicitud_viaje_id.',
    },
    [TipoNotificacion.VIAJE_EN_CAMINO]: {
        id: TipoNotificacion.VIAJE_EN_CAMINO,
        abreviatura: 'VIAJE_EN_CAMINO',
        label: 'Viaje en Camino',
        prefijo: 'TNO-VCA',
        valor: 3,
        descripcion: 'Notificación enviada al cliente informando que el conductor está en camino al punto de origen. Incluye tiempo estimado de llegada. Origen: backend al pasar a estado EN_CAMINO. Referencia: solicitud_viaje_id.',
    },
    [TipoNotificacion.VIAJE_LLEGO_ORIGEN]: {
        id: TipoNotificacion.VIAJE_LLEGO_ORIGEN,
        abreviatura: 'VIAJE_LLEGO_ORIGEN',
        label: 'Viaje Llegó al Origen',
        prefijo: 'TNO-VLO',
        valor: 4,
        descripcion: 'Notificación enviada al cliente informando que el conductor llegó al punto de recogida. El cliente debe abordar el vehículo. Origen: backend al registrar fecha_llegada_origen. Referencia: solicitud_viaje_id.',
    },
    [TipoNotificacion.VIAJE_EN_CURSO]: {
        id: TipoNotificacion.VIAJE_EN_CURSO,
        abreviatura: 'VIAJE_EN_CURSO',
        label: 'Viaje en Curso',
        prefijo: 'TNO-VCU',
        valor: 5,
        descripcion: 'Notificación enviada al cliente confirmando que el viaje está en curso. El cliente ya abordó el vehículo. Origen: backend al pasar a estado EN_CURSO. Referencia: solicitud_viaje_id.',
    },
    [TipoNotificacion.VIAJE_FINALIZADO]: {
        id: TipoNotificacion.VIAJE_FINALIZADO,
        abreviatura: 'VIAJE_FINALIZADO',
        label: 'Viaje Finalizado',
        prefijo: 'TNO-VFI',
        valor: 6,
        descripcion: 'Notificación enviada al cliente informando que el viaje finalizó. Incluye monto total y solicita calificación del conductor. Origen: backend al pasar a estado FINALIZADO. Referencia: solicitud_viaje_id.',
    },
    [TipoNotificacion.VIAJE_CANCELADO]: {
        id: TipoNotificacion.VIAJE_CANCELADO,
        abreviatura: 'VIAJE_CANCELADO',
        label: 'Viaje Cancelado',
        prefijo: 'TNO-VCE',
        valor: 7,
        descripcion: 'Notificación enviada al cliente o al conductor informando que el viaje fue cancelado. Incluye motivo de cancelación. Origen: backend al pasar a CANCELADO_CLIENTE o CANCELADO_CONDUCTOR. Referencia: solicitud_viaje_id.',
    },
    [TipoNotificacion.VIAJE_NO_ATENDIDO]: {
        id: TipoNotificacion.VIAJE_NO_ATENDIDO,
        abreviatura: 'VIAJE_NO_ATENDIDO',
        label: 'Viaje No Atendido',
        prefijo: 'TNO-VNA',
        valor: 8,
        descripcion: 'Notificación enviada al cliente informando que no se encontró conductor disponible para su solicitud (timeout). Se sugiere intentar nuevamente. Origen: backend al pasar a NO_ATENDIDO. Referencia: solicitud_viaje_id.',
    },
    [TipoNotificacion.PROMOCION]: {
        id: TipoNotificacion.PROMOCION,
        abreviatura: 'PROMOCION',
        label: 'Promoción',
        prefijo: 'TNO-PRO',
        valor: 9,
        descripcion: 'Notificación enviada al cliente informando de una promoción o campaña activa. Incluye código promocional y vigencia. Origen: backend al crear/lanzar un codigo_promo o tarea programada. Referencia: codigo_promo_id.',
    },
    [TipoNotificacion.BONO_OTORGADO]: {
        id: TipoNotificacion.BONO_OTORGADO,
        abreviatura: 'BONO_OTORGADO',
        label: 'Bono Otorgado',
        prefijo: 'TNO-BOT',
        valor: 10,
        descripcion: 'Notificación enviada al cliente informando que se le otorgó un bono (bienvenida, referido, promocional, compensación, fidelización o reembolso). Incluye monto y vigencia. Origen: backend al crear bonos_cliente. Referencia: bono_cliente_id.',
    },
    [TipoNotificacion.BONO_POR_VENCER]: {
        id: TipoNotificacion.BONO_POR_VENCER,
        abreviatura: 'BONO_POR_VENCER',
        label: 'Bono por Vencer',
        prefijo: 'TNO-BPV',
        valor: 11,
        descripcion: 'Notificación enviada al cliente informando que su bono está próximo a vencer. Origen: tarea programada nocturna que evalúa fecha_expiracion. Referencia: bono_cliente_id.',
    },
    [TipoNotificacion.REFERIDO_EXITOSO]: {
        id: TipoNotificacion.REFERIDO_EXITOSO,
        abreviatura: 'REFERIDO_EXITOSO',
        label: 'Referido Exitoso',
        prefijo: 'TNO-REX',
        valor: 12,
        descripcion: 'Notificación enviada al referidor y/o al referido informando que el referido completó su primer viaje y se generaron los bonos. Origen: backend al aplicar referido. Referencia: referido_id.',
    },
    [TipoNotificacion.BIENVENIDA]: {
        id: TipoNotificacion.BIENVENIDA,
        abreviatura: 'BIENVENIDA',
        label: 'Bienvenida',
        prefijo: 'TNO-BIE',
        valor: 13,
        descripcion: 'Notificación enviada al cliente al registrarse en la plataforma. Incluye su código promocional propio y el bono de bienvenida disponible. Origen: backend al crear cliente. Referencia: cliente_id.',
    },
    [TipoNotificacion.RECORDATORIO]: {
        id: TipoNotificacion.RECORDATORIO,
        abreviatura: 'RECORDATORIO',
        label: 'Recordatorio',
        prefijo: 'TNO-REC',
        valor: 14,
        descripcion: 'Notificación genérica de recordatorio (turno asignado, pago próximo a vencer, capacitación, evento). Origen: backend o tarea programada. Referencia: variable según el caso (asignacion_diaria_id, frecuencia_cobro_id, tarea_programada_id).',
    },
    [TipoNotificacion.SISTEMA]: {
        id: TipoNotificacion.SISTEMA,
        abreviatura: 'SISTEMA',
        label: 'Sistema',
        prefijo: 'TNO-SIS',
        valor: 15,
        descripcion: 'Notificación de sistema enviada a usuarios internos (administradores, gerentes). Incluye alertas de mantenimiento, errores de integración, tareas fallidas y eventos de seguridad. Origen: backend o tarea programada. Referencia: variable según el caso.',
    },
};

// ==========================================
// ESTADO NOTIFICACION
export enum EstadoNotificacion {
    NINGUNO      = 6150,
    PENDIENTE    = 6151,
    ENVIADA      = 6152,
    ENTREGADA    = 6153,
    LEIDA        = 6154,
    FALLIDA      = 6155,
    CANCELADA    = 6156,
}

export const ESTADO_NOTIFICACION_METADATA: Record<EstadoNotificacion, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoNotificacion.NINGUNO]: {
        id: EstadoNotificacion.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'ENO-NIN',
        valor: 0,
        descripcion: 'Sin estado de notificación definido. Utilizado exclusivamente como comodín del sistema. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoNotificacion.PENDIENTE]: {
        id: EstadoNotificacion.PENDIENTE,
        abreviatura: 'PENDIENTE',
        label: 'Pendiente',
        prefijo: 'ENO-PEN',
        valor: 1,
        descripcion: 'Notificación creada y en cola de envío. El backend aún no ha contactado al proveedor (FCM, Twilio, WhatsApp API, SMTP). Requiere fecha_envio = NULL. Estado inicial de toda notificación.',
    },
    [EstadoNotificacion.ENVIADA]: {
        id: EstadoNotificacion.ENVIADA,
        abreviatura: 'ENVIADA',
        label: 'Enviada',
        prefijo: 'ENO-ENV',
        valor: 2,
        descripcion: 'Notificación enviada al proveedor correspondiente al canal (FCM, Twilio, WhatsApp API, SMTP). El proveedor aún no ha confirmado la entrega al destinatario. Requiere fecha_envio NOT NULL.',
    },
    [EstadoNotificacion.ENTREGADA]: {
        id: EstadoNotificacion.ENTREGADA,
        abreviatura: 'ENTREGADA',
        label: 'Entregada',
        prefijo: 'ENO-ENT',
        valor: 3,
        descripcion: 'El proveedor confirmó que la notificación fue entregada al dispositivo o bandeja del destinatario. Requiere fecha_envio y fecha_entrega NOT NULL. Aún no se sabe si el destinatario la leyó.',
    },
    [EstadoNotificacion.LEIDA]: {
        id: EstadoNotificacion.LEIDA,
        abreviatura: 'LEIDA',
        label: 'Leída',
        prefijo: 'ENO-LEI',
        valor: 4,
        descripcion: 'El destinatario abrió o leyó la notificación. Requiere fecha_envio, fecha_entrega y fecha_lectura NOT NULL. Estado final exitoso de la notificación. Se registra cuando el frontend confirma la lectura.',
    },
    [EstadoNotificacion.FALLIDA]: {
        id: EstadoNotificacion.FALLIDA,
        abreviatura: 'FALLIDA',
        label: 'Fallida',
        prefijo: 'ENO-FAL',
        valor: 5,
        descripcion: 'Error en el envío de la notificación. Requiere fecha_envio NOT NULL y error_envio NOT NULL con la descripción del fallo. El backend puede reintentar hasta 10 veces (backoff exponencial). Si supera 10 intentos, se marca como FALLIDA permanente y se notifica al administrador.',
    },
    [EstadoNotificacion.CANCELADA]: {
        id: EstadoNotificacion.CANCELADA,
        abreviatura: 'CANCELADA',
        label: 'Cancelada',
        prefijo: 'ENO-CAN',
        valor: 6,
        descripcion: 'Notificación cancelada manualmente antes de su envío. Requiere fecha_envio = NULL. Aplica cuando el evento que originó la notificación ya no es relevante (viaje cancelado antes de enviar el push, promoción desactivada, etc.).',
    },
};

// ==========================================
// ORIGEN UBICACION
export enum OrigenUbicacion {
    NINGUNO  = 6200,
    GPS      = 6201,
    APP      = 6202,
    MANUAL   = 6203,
    SISTEMA  = 6204,
}

export const ORIGEN_UBICACION_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [OrigenUbicacion.NINGUNO]: {
        id: OrigenUbicacion.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'ORI-NIN',
        valor: 0,
        descripcion: 'Sin origen de ubicación definido. Utilizado exclusivamente como comodín del sistema. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [OrigenUbicacion.GPS]: {
        id: OrigenUbicacion.GPS,
        abreviatura: 'GPS',
        label: 'GPS',
        prefijo: 'ORI-GPS',
        valor: 1,
        descripcion: 'Ubicación obtenida directamente del dispositivo GPS instalado en el vehículo. Es la fuente más precisa y confiable. Se registra automáticamente por el backend al recibir los reportes del rastreador satelital.',
    },
    [OrigenUbicacion.APP]: {
        id: OrigenUbicacion.APP,
        abreviatura: 'APP',
        label: 'Aplicación Móvil',
        prefijo: 'ORI-APP',
        valor: 2,
        descripcion: 'Ubicación capturada desde la aplicación móvil (cliente o conductor) mediante el GPS del teléfono. Requiere permisos de geolocalización habilitados. Aplica para solicitudes de viaje creadas por el cliente y para la ubicación reportada por el conductor.',
    },
    [OrigenUbicacion.MANUAL]: {
        id: OrigenUbicacion.MANUAL,
        abreviatura: 'MANUAL',
        label: 'Manual',
        prefijo: 'ORI-MAN',
        valor: 3,
        descripcion: 'Ubicación ingresada manualmente por un operador o administrador. Se usa cuando no hay acceso a GPS ni a la app (ej. despacho telefónico, corrección de datos, direcciones sin geocodificación automática). Menor precisión; puede requerir validación.',
    },
    [OrigenUbicacion.SISTEMA]: {
        id: OrigenUbicacion.SISTEMA,
        abreviatura: 'SISTEMA',
        label: 'Sistema',
        prefijo: 'ORI-SIS',
        valor: 4,
        descripcion: 'Ubicación asignada automáticamente por el sistema (ej. ubicación por defecto de la sucursal, geocodificación inversa, tarea programada). No proviene de un dispositivo ni de un operador. Se usa para registros internos o cuando no aplica una fuente específica.',
    },
};

// ==========================================
// TIPO GEOCERCA
export enum TipoGeocerca {
    NINGUNO     = 6250,
    PERMITIDA   = 6251,
    RESTRINGIDA = 6252,
}

export const TIPO_GEOCERCA_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [TipoGeocerca.NINGUNO]: {
        id: TipoGeocerca.NINGUNO,
        abreviatura: 'NINGUNO',
        label: 'Ninguno',
        prefijo: 'GEO-NIN',
        valor: 0,
        descripcion: 'Sin tipo de geocerca definido. Utilizado exclusivamente como comodín del sistema. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [TipoGeocerca.PERMITIDA]: {
        id: TipoGeocerca.PERMITIDA,
        abreviatura: 'PERMITIDA',
        label: 'Permitida',
        prefijo: 'GEO-PER',
        valor: 1,
        descripcion: 'Geocerca permitida o autorizada. Define una zona donde el vehículo PUEDE circular, operar o permanecer. Si el vehículo sale de esta zona, se genera una alerta (TipoAlertaVehiculo.GEOCERCA_VIOLADA = 5718). Aplica para zonas de operación autorizadas, radios de sucursal o áreas de cobertura del servicio.',
    },
    [TipoGeocerca.RESTRINGIDA]: {
        id: TipoGeocerca.RESTRINGIDA,
        abreviatura: 'RESTRINGIDA',
        label: 'Restringida',
        prefijo: 'GEO-RES',
        valor: 2,
        descripcion: 'Geocerca restringida o prohibida. Define una zona donde el vehículo NO DEBE circular, operar ni permanecer (ej. zonas rojas, áreas de conflicto, perímetros de seguridad, zonas con restricción municipal). Si el vehículo ingresa a esta zona, se genera una alerta inmediata (TipoAlertaVehiculo.GEOCERCA_VIOLADA = 5718) con nivel CRITICO o ALTA.',
    },
};

// ==========================================
// SEXO BIOLOGICO
export enum SexoBiologico {
    MACHO  = 6300,
    HEMBRA = 6301,
}

export const SEXO_BIOLOGICO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [SexoBiologico.MACHO]: {
        id: SexoBiologico.MACHO,
        abreviatura: 'M',
        label: 'Macho',
        prefijo: null,
        valor: 0,
        descripcion: 'Sexo biológico masculino. Utilizado en vacunos (toros, novillos, terneros) y otras especies. No aplica para producción de leche.',
    },
    [SexoBiologico.HEMBRA]: {
        id: SexoBiologico.HEMBRA,
        abreviatura: 'H',
        label: 'Hembra',
        prefijo: null,
        valor: 0,
        descripcion: 'Sexo biológico femenino. Utilizado en vacunos (vacas, vaquillonas, terneras). Aplica para producción de leche si el animal está activo y en la categoría correcta. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
};

// ==========================================
// CONDICION PRODUCTOR LECHE
export enum CondicionProductorLeche {
    NO_PRODUCTOR = 6350,
    PRODUCTOR    = 6351,
}

export const CONDICION_PRODUCTOR_LECHE_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [CondicionProductorLeche.NO_PRODUCTOR]: {
        id: CondicionProductorLeche.NO_PRODUCTOR,
        abreviatura: '0',
        label: 'No Productor',
        prefijo: null,
        valor: 0,
        descripcion: 'El animal o la categoría NO produce leche.',
        es_defecto: true,
    },
    [CondicionProductorLeche.PRODUCTOR]: {
        id: CondicionProductorLeche.PRODUCTOR,
        abreviatura: '1',
        label: 'Productor de Leche',
        prefijo: null,
        valor: 1,
        descripcion: 'El animal o la categoría SÍ produce leche activa.',
    },
};

// ==========================================
// ESTADO VACUNO
export enum EstadoVacuno {
    ACTIVO      = 6400,
    PARA_FAENA  = 6401,
    FAENADO     = 6402,
    PARA_VENTA  = 6403,
    VENDIDO     = 6404,
    MUERTO      = 6405,
}

export const ESTADO_VACUNO_METADATA: Record<number, ConstanteMetadata & { label: string; es_defecto?: boolean }> = {
    [EstadoVacuno.ACTIVO]: {
        id: EstadoVacuno.ACTIVO,
        abreviatura: 'ACTIVO',
        label: 'Activo',
        prefijo: null,
        valor: 1,
        descripcion: 'Vacuno operativo en el hato. Estado por defecto al registrar un animal. CONSTANTE POR DEFECTO.',
        es_defecto: true,
    },
    [EstadoVacuno.PARA_FAENA]: {
        id: EstadoVacuno.PARA_FAENA,
        abreviatura: 'PARA_FAENA',
        label: 'Para Faena',
        prefijo: null,
        valor: 2,
        descripcion: 'Vacuno destinado a faena. Sigue vivo y en libros. Candidato a vacunos_faenas.',
    },
    [EstadoVacuno.FAENADO]: {
        id: EstadoVacuno.FAENADO,
        abreviatura: 'FAENADO',
        label: 'Faenado',
        prefijo: null,
        valor: 3,
        descripcion: 'Vacuno faenado (sacrificado, carne producida). Estado FINAL. Requiere fecha_salida, motivo_salida y precio_venta.',
    },
    [EstadoVacuno.PARA_VENTA]: {
        id: EstadoVacuno.PARA_VENTA,
        abreviatura: 'PARA_VENTA',
        label: 'Para Venta',
        prefijo: null,
        valor: 4,
        descripcion: 'Vacuno destinado a venta en pie. Sigue vivo y en libros. Candidato a venta.',
    },
    [EstadoVacuno.VENDIDO]: {
        id: EstadoVacuno.VENDIDO,
        abreviatura: 'VENDIDO',
        label: 'Vendido',
        prefijo: null,
        valor: 5,
        descripcion: 'Vacuno vendido en pie (salió del hato, NO se faenó). Estado FINAL. Requiere fecha_salida, motivo_salida y precio_venta.',
    },
    [EstadoVacuno.MUERTO]: {
        id: EstadoVacuno.MUERTO,
        abreviatura: 'MUERTO',
        label: 'Muerto',
        prefijo: null,
        valor: 6,
        descripcion: 'Vacuno muerto (no se faenó, no se vendió). Estado FINAL. Requiere fecha_salida, motivo_salida y causa_muerte.',
    },
};

export const ESTADOS_VACUNO_PRODUCTIVOS = [
    EstadoVacuno.ACTIVO,
    EstadoVacuno.PARA_FAENA,
    EstadoVacuno.PARA_VENTA,
] as const;

export const ESTADOS_VACUNO_FINALES = [
    EstadoVacuno.FAENADO,
    EstadoVacuno.VENDIDO,
    EstadoVacuno.MUERTO,
] as const;
