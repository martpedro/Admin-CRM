# Plan de implementación y costeo de nuevos módulos

## 1. Base actual del sistema

La plataforma ya cuenta con una base técnica reutilizable que reduce el costo de construcción de los nuevos módulos:

- Backend NestJS modular con autenticación, usuarios, roles, permisos, clientes, empresas, cotizaciones y catálogos base.
- Frontend React con rutas centralizadas, menú modular y patrón de páginas ya definido.
- Sistema de permisos avanzados por menú, acción y alcance de datos.
- Generación de PDF y envío de correos ya utilizados en cotizaciones.
- Configuración de pagos por empresa y documentación funcional de versionado de cotizaciones.
- Existe una entidad inicial de proveedores en backend, aunque todavía no se expone como módulo completo.

Esto permite plantear una implementación incremental y no empezar desde cero.

## 2. Supuestos para el estimado

- El alcance considera web administrativa sobre la base actual de AdminPlatform.
- Se asume que los nuevos módulos vivirán en la misma arquitectura actual: React en frontend, NestJS en API y base de datos relacional existente.
- El presupuesto se ajusta a una PyME, por lo que el escenario recomendado es MVP operativo, no versión enterprise.
- Se contempla CRUD, validaciones, permisos, bitácora básica, manejo de estados, adjuntos donde aplique, notificaciones por correo y pruebas funcionales mínimas suficientes para salida controlada.
- Se consideran PDFs operativos para los módulos que lo requieren, no un motor documental completamente parametrizable por usuarios finales.
- No se incluye integración con ERP, SAT, timbrado fiscal, WhatsApp, firma electrónica, app móvil, BI externo ni aprobaciones multinivel complejas.
- El estimado es de desarrollo nuevo, incluyendo análisis funcional, desarrollo, QA básico y salida a UAT.

### Alcance PyME recomendado

Para ajustar presupuesto, el supuesto base cambia a una primera versión funcional con estas restricciones:

- Un flujo principal por módulo.
- Reportes operativos básicos, no analítica avanzada.
- PDFs fijos por proceso, con personalización limitada.
- Notificaciones por correo simples.
- Sin tableros ejecutivos avanzados en tiempo real.
- Sin automatizaciones complejas entre áreas fuera del flujo principal.

## 3. Bloques transversales que conviene construir primero

Antes de abrir módulos por separado conviene resolver piezas compartidas:

1. Matriz de permisos y menús por módulo.
2. Catálogos maestros, folios, estados y reglas de transición.
3. Servicio común de adjuntos, comentarios y bitácora.
4. Servicio común de notificaciones y correos.
5. Plantillas PDF reutilizables.
6. Convenciones de reporteo y exportación.

Si estas piezas se construyen una sola vez, el costo total baja y también disminuye el riesgo de inconsistencias entre módulos.

## 4. Estimado por módulo en escenario PyME

Los valores siguientes ya reflejan la tabla final cerrada para esta propuesta. Incluyen frontend, backend, base de datos, permisos, pruebas funcionales básicas y ajustes normales de integración.

| Módulo | Alcance resumido PyME | Horas cerradas | Costo a 240 MXN/h |
|---|---|---:|---:|
| Fundación transversal | permisos, estados, adjuntos básicos, notificaciones simples, bitácora, folios | 80 | 19,200 MXN |
| Proveedores | alta, edición, contacto, correo, copiar a, términos de pago, datos de pago | 70 | 16,800 MXN |
| Actualización de cotizador | catálogos de colores y técnicas, ajuste de formularios y autollenado | 45 | 10,800 MXN |
| Proyectos | listado, alta, relación con cotización, PDF básico de registro y disparo de solicitudes | 100 | 24,000 MXN |
| Compras | solicitud, lista, estados, correo, PDF operativo, reglas básicas de porcentaje y mermas | 115 | 27,600 MXN |
| Maquilación | lista, formato, observaciones y cambio de estatus | 75 | 18,000 MXN |
| Reportes | producción, entradas/salidas y comisiones en versión básica con exportación simple | 80 | 19,200 MXN |
| Órdenes de producción | listado, formulario OP, PDF, estados y notificaciones básicas | 120 | 28,800 MXN |
| Recolección | formulario de solicitud, listado y cambio de estatus | 50 | 12,000 MXN |
| Pagos efectuados | solicitud, adjuntos, comprobantes, estados y avisos básicos | 80 | 19,200 MXN |
| Pagos recibidos | solicitud de factura cliente, adjuntos, comprobantes, estados y avisos básicos | 80 | 19,200 MXN |
| Virtuales | solicitud, seguimiento y estados | 40 | 9,600 MXN |

### Total estimado PyME

- Total cerrado de horas: 935 horas
- Total cerrado del proyecto: 224,400 MXN

## 5. Costeo estimado ajustado para PyME

### Escenario final aprobado

| Concepto | Valor |
|---|---:|
| Tarifa por hora | 240 MXN/h |
| Horas totales cerradas | 935 h |
| Costo total base | 224,400 MXN |
| Contingencia sugerida 10% | 22,440 MXN |
| Total sugerido con contingencia | 246,840 MXN |

### Recomendación presupuestal PyME

Para una PyME, con la tabla final ya aterrizada, la recomendación es manejar este proyecto como presupuesto base cerrado y reservar una contingencia pequeña únicamente para cambios funcionales o retrabajo de UAT.

- Base MVP cerrada: 224,400 MXN
- Con contingencia del 10%: 246,840 MXN

### Desglose de costo por módulo desarrollado

Tomando como referencia la tarifa final de 240 MXN/h:

| Módulo | Costo estimado |
|---|---:|
| Fundación transversal | 19,200 MXN |
| Proveedores | 16,800 MXN |
| Actualización de cotizador | 10,800 MXN |
| Proyectos | 24,000 MXN |
| Compras | 27,600 MXN |
| Maquilación | 18,000 MXN |
| Reportes | 19,200 MXN |
| Órdenes de producción | 28,800 MXN |
| Recolección | 12,000 MXN |
| Pagos efectuados | 19,200 MXN |
| Pagos recibidos | 19,200 MXN |
| Virtuales | 9,600 MXN |

### Paquetes recomendados para no golpear caja

Si el presupuesto es especialmente sensible, conviene vender o ejecutar por paquetes:

| Paquete | Módulos incluidos | Rango estimado |
|---|---|---:|
| Paquete 1 | Fundación transversal, Proveedores, Actualización de cotizador | 46,800 MXN |
| Paquete 2 | Proyectos, Virtuales, Recolección | 45,600 MXN |
| Paquete 3 | Pagos efectuados, Pagos recibidos | 38,400 MXN |
| Paquete 4 | Compras, Órdenes de producción, Maquilación | 74,400 MXN |
| Paquete 5 | Reportes | 19,200 MXN |

## 6. Orden recomendado de implementación

### Fase 0. Descubrimiento funcional y diseño técnico

Duración estimada: 2 semanas

- Validar reglas de negocio por módulo.
- Confirmar estados, responsables, aprobaciones, adjuntos y salidas PDF.
- Cerrar matriz de permisos.
- Definir nomenclatura de folios y relaciones entre módulos.

### Fase 1. Capa compartida y catálogos base

Duración estimada: 2 a 3 semanas

- Fundación transversal.
- Proveedores.
- Actualización de cotizador.

Resultado esperado: ya existen catálogos, contactos de proveedor, datos de pago, menús y permisos base para soportar el resto.

### Fase 2. Orquestación comercial y solicitudes iniciales

Duración estimada: 4 a 5 semanas

- Proyectos.
- Virtuales.
- Recolección.
- Pagos efectuados base.
- Pagos recibidos base.

Resultado esperado: desde proyecto se disparan solicitudes trazables hacia módulos satélite.

### Fase 3. Operación de abastecimiento y producción

Duración estimada: 5 a 6 semanas

- Compras.
- Órdenes de producción.
- Maquilación.

Resultado esperado: flujo completo desde cotización/proyecto hacia compra, orden operativa y seguimiento de maquila.

### Fase 4. Explotación y cierre operativo

Duración estimada: 2 a 3 semanas

- Reportes.
- Ajustes de UAT.
- Endurecimiento de permisos.
- Revisión de notificaciones y PDFs finales.

## 7. Dependencias clave

1. Proveedores debe quedar antes de Compras y de los flujos de pagos a terceros.
2. Actualización de cotizador debe quedar antes de Proyectos, Compras y Órdenes de producción si los formularios se autollenan desde cotización.
3. Proyectos es el pivote para Virtuales, Recolección, Compras y comprobantes de pago.
4. Compras y Órdenes de producción comparten reglas de porcentaje, mermas, plantillas PDF y estados.
5. Reportes debe quedar al final, cuando los módulos transaccionales ya generen datos consistentes.

## 8. Riesgos que pueden mover el presupuesto

Los siguientes puntos pueden empujar el costo hacia la parte alta del rango:

- Reglas de aprobación por varios niveles.
- PDFs muy variables por cliente, marca o tipo de producto.
- Trazabilidad fina de cambios por campo y auditoría avanzada.
- Integraciones con correo corporativo, almacenamiento externo o sistemas contables.
- Fórmulas complejas de comisiones, porcentajes, mermas o costos indirectos.
- Necesidad de tableros analíticos en tiempo real.

## 9. Recomendación operativa

La mejor relación costo/beneficio no es construir los once módulos como piezas aisladas, sino atacar primero la capa compartida y después liberar por ondas funcionales.

### Equipo recomendado

- 1 desarrollador full stack principal.
- 1 apoyo parcial para QA o frontend en momentos de carga.
- 1 responsable funcional disponible para validar procesos y evitar retrabajo.

### Tiempo estimado con ese equipo

- Escenario controlado: 20 a 26 semanas.
- Escenario con cambios funcionales frecuentes: 26 a 32 semanas.

Si el presupuesto es muy bajo y todo recae en una sola persona con disponibilidad parcial del negocio, el mismo alcance puede extenderse a 8 o 10 meses.

## 10. Recomendación final de alcance

Si se busca salir rápido sin comprometer arquitectura, la secuencia recomendada es:

1. Proveedores.
2. Actualización de cotizador.
3. Proyectos.
4. Virtuales, Recolección y Pagos en versión operativa.
5. Compras.
6. Órdenes de producción.
7. Maquilación.
8. Reportes.

Esta secuencia habilita operación temprana y permite que los módulos más pesados se construyan ya sobre datos y catálogos estabilizados.

### Recomendación de presupuesto mínimo viable

Si realmente hay restricción fuerte de caja, mi recomendación no sería intentar vender o construir todo desde el día uno. El mínimo viable sano para arrancar sería:

1. Fundación transversal.
2. Proveedores.
3. Actualización de cotizador.
4. Proyectos.
5. Uno de estos dos frentes primero: Compras o Pagos.

Ese primer bloque dejaría al negocio operando mejor y puede mantenerse en estos valores:

- Con Compras como primer frente operativo: 98,400 MXN
- Con Pagos como primer frente operativo: 90,000 MXN

Si se quisiera agregar un pequeño colchón para cambios menores, ese arranque podría presupuestarse entre 99,000 y 108,500 MXN.

## 11. Documento comercial complementario

La versión comercial resumida, el esquema de cobro por entregables y la propuesta de etapa 1 Lite se movieron al documento independiente [Admin-CRM/docs/propuesta-comercial-nuevos-modulos-2026.md](Admin-CRM/docs/propuesta-comercial-nuevos-modulos-2026.md).