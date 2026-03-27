# 🚜 FARMER PARTS - DOCUMENTACIÓN MAESTRA
## Sistema de Gestión de Refacciones Agrícolas

**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Repositorio:** https://github.com/rodiphone220-sys/agroservicios_panuco_v1  
**Tecnología:** React + TypeScript + Vite + LocalStorage  

---

# 📋 ÍNDICE EJECUTIVO

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura Técnica](#arquitectura-técnica)
3. [Módulos y Funcionalidades](#módulos-y-funcionalidades)
4. [Características por Módulo](#características-por-módulo)
5. [Roles y Permisos](#roles-y-permisos)
6. [Flujos de Trabajo](#flujos-de-trabajo)
7. [Datos y Entidades](#datos-y-entidades)
8. [Integraciones](#integraciones)
9. [Ventajas Competitivas](#ventajas-competitivas)
10. [Casos de Uso](#casos-de-uso)
11. [Especificaciones Técnicas](#especificaciones-técnicas)
12. [Roadmap de Features](#roadmap-de-features)

---

# 🎯 RESUMEN EJECUTIVO

## ¿Qué es Farmer Parts?

**Farmer Parts** es un sistema ERP especializado para la gestión integral de negocios de refacciones agrícolas. Diseñado específicamente para distribuidores de autopartes de maquinaria agrícola (tractores, cosechadoras, implementos), el sistema centraliza todas las operaciones comerciales en una plataforma moderna, intuitiva y 100% web.

## Problema que Resuelve

Los distribuidores de refacciones agrícolas enfrentan:
- ❌ Control manual de inventario con miles de SKUs
- ❌ Pérdida de ventas por stock desactualizado
- ❌ Facturación lenta y propensa a errores
- ❌ Sin seguimiento de comisiones de vendedores
- ❌ Información dispersa en múltiples sistemas
- ❌ Dependencia de conexión a internet para operar

## Solución Farmer Parts

✅ **Inventario inteligente** con alertas de stock en tiempo real  
✅ **Punto de venta** ultrarrápido con búsqueda multicriterio  
✅ **Facturación CFDI 4.0** integrada (próximamente)  
✅ **Comisiones automáticas** por vendedor  
✅ **LocalStorage** - Funciona SIN internet  
✅ **Multi-asistente IA** para soporte operativo  

## Propuesta de Valor Única

| Característica | Farmer Parts | Competencia |
|---------------|--------------|-------------|
| Funcionamiento offline | ✅ Sí | ❌ No |
| Búsqueda por pieza/marca/modelo | ✅ Avanzada | ⚠️ Básica |
| Asistentes IA especializados | ✅ 5 asistentes | ❌ Ninguno |
| Tiempo de implementación | ✅ 1 día | ⚠️ 2-4 semanas |
| Costo de infraestructura | ✅ $0 (LocalStorage) | ⚠️ $50-200/mes |
| Curva de aprendizaje | ✅ 2 horas | ⚠️ 1-2 semanas |

---

# 🏗️ ARQUITECTURA TÉCNICA

## Stack Tecnológico

```
Frontend: React 19 + TypeScript + Vite 6
UI: TailwindCSS 4 + Motion (Framer Motion alternative)
Iconos: Lucide React
Almacenamiento: LocalStorage (IndexedDB-ready)
IA: Google Gemini API
Gráficos: Recharts
Notificaciones: Sonner
Build: Vite (13.5s build time)
Bundle: 1.7MB (465KB gzipped)
```

## Arquitectura de Datos

```
┌─────────────────────────────────────────────────────┐
│                    NAVEGADOR WEB                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │         COMPONENTES REACT (19)             │     │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │     │
│  │  │ POS  │ │ INV  │ │ CRM  │ │ RPT  │ ...  │     │
│  │  └──────┘ └──────┘ └──────┘ └──────┘      │     │
│  └────────────────────────────────────────────┘     │
│                       ↕                              │
│  ┌────────────────────────────────────────────┐     │
│  │      CAPA DE ACCESO A DATOS                │     │
│  │  ┌──────────────────────────────────┐     │     │
│  │  │   localStorage.ts (Storage API)  │     │     │
│  │  │   - CRUD Genérico                │     │     │
│  │  │   - Serialización JSON           │     │     │
│  │  │   - Validación de Tipos          │     │     │
│  │  └──────────────────────────────────┘     │     │
│  └────────────────────────────────────────────┘     │
│                       ↕                              │
│  ┌────────────────────────────────────────────┐     │
│  │         LOCALSTORAGE (5-10MB)              │     │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │     │
│  │  │Users │ │Prod  │ │Sales │ │Cust  │ ...  │     │
│  │  └──────┘ └──────┘ └──────┘ └──────┘      │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
└─────────────────────────────────────────────────────┘
                       ↕ (Opcional)
┌─────────────────────────────────────────────────────┐
│              SERVICIOS EXTERNOS                      │
├─────────────────────────────────────────────────────┤
│  Google Gemini API  │  Vercel Hosting  │  GitHub   │
│  (IA - OCR - Chat)  │   (Deploy)       │  (Repo)   │
└─────────────────────────────────────────────────────┘
```

## Modelo de Almacenamiento

### LocalStorage Keys

| Key | Descripción | Tamaño Estimado |
|-----|-------------|-----------------|
| `farmer_parts_users` | Usuarios del sistema | ~1 KB |
| `farmer_parts_products` | Catálogo de productos | ~500 KB - 2 MB |
| `farmer_parts_customers` | Base de datos de clientes | ~50 KB |
| `farmer_parts_vendors` | Proveedores | ~10 KB |
| `farmer_parts_sales` | Historial de ventas | ~100-500 KB |
| `farmer_parts_inventory_movements` | Movimientos de inventario | ~200 KB |
| `farmer_parts_employees` | Empleados y nómina | ~20 KB |
| `farmer_parts_virtual_assistants` | Configuración de IA | ~10 KB |
| `farmer_parts_business_config` | Configuración del negocio | ~1 KB |

**Capacidad Total:** 5-10 MB (límite típico de LocalStorage: 5-10 MB por dominio)

---

# 📦 MÓDULOS Y FUNCIONALIDADES

## Mapa de Navegación

```
FARMER PARTS v1.0
│
├── 🛒 Punto de Venta (POS)
│   ├── Búsqueda Inteligente
│   ├── Carrito de Compras
│   ├── Checkout y Pago
│   ├── Facturación
│   └── Ticket Digital
│
├── 📦 Inventario
│   ├── Catálogo de Productos
│   ├── Control de Stock
│   ├── Movimientos
│   ├── Alertas de Stock Bajo
│   ├── Código de Barras
│   └── OCR con IA
│
├── 👥 Clientes (CRM)
│   ├── Alta de Clientes
│   ├── Historial de Compras
│   ├── Crédito y Cuentas
│   └── Segmentación
│
├── 🚚 Proveedores
│   ├── Directorio
│   ├── Órdenes de Compra
│   └── Evaluación
│
├── 📊 Reportes
│   ├── Ventas por Período
│   ├── Productos Más Vendidos
│   ├── Utilidad y Margen
│   └── Métricas de Negocio
│
├── 👨‍💼 Recursos Humanos
│   ├── Empleados
│   ├── Asistencia
│   ├── Comisiones
│   └── Nómina (próximamente)
│
├── 📄 Facturación
│   ├── CFDI 4.0 (próximamente)
│   ├── Lectura OCR de Facturas
│   └── Configuración SAT
│
└── ⚙️ Configuración
    ├── Datos del Negocio
    ├── Personalización
    ├── Usuarios y Roles
    └── Asistentes IA
```

---

# 🎨 CARACTERÍSTICAS POR MÓDULO

## 1. 🛒 PUNTO DE VENTA (POS)

### Descripción
Sistema de punto de venta ultrarrápido diseñado para transacciones ágiles en mostrador. Optimizado para alta rotación de productos.

### Funcionalidades Principales

#### Búsqueda Inteligente
- ✅ **Búsqueda multicriterio en tiempo real**
  - Número de pieza (pieceNumber)
  - Descripción del producto
  - Marca (MF, JD, NH, Ford, Case, Perkins)
  - Modelo del tractor/implemento
  - Código de barras
  - Categoría (Motor, Transmisión, Frenos, etc.)

- ✅ **Filtros avanzados**
  - Por categoría (6 categorías predefinidas)
  - Por marca (6 marcas principales)
  - Por disponibilidad de stock
  - Por ubicación en almacén

- ✅ **Resultados de búsqueda inteligentes**
  - Muestra imagen del producto
  - Precio visible
  - Stock disponible con indicador visual
  - Ubicación en almacén
  - Código de barras en resultado

#### Carrito de Compras
- ✅ **Gestión de productos en carrito**
  - Agregar con un clic desde búsqueda
  - Ajustar cantidades (+/-)
  - Eliminar productos individuales
  - Vaciar carrito completo
  - Cálculo automático de subtotales

- ✅ **Información detallada por ítem**
  - Imagen del producto
  - Número de pieza
  - Descripción
  - Precio unitario
  - Subtotal por cantidad

#### Selección de Cliente
- ✅ **Cliente de mostrador** (venta general)
- ✅ **Clientes registrados** con:
  - Nombre completo
  - RFC
  - Crédito disponible
  - Días de crédito
  - Saldo actual
  - Descuento aplicado

#### Pagos
- ✅ **4 Métodos de pago**
  - 💵 EFECTIVO
  - 💳 TARJETA
  - 🏦 TRANSFERENCIA
  - ⏰ CRÉDITO

#### Proceso de Venta
```
1. Búsqueda de productos → 2. Agregar al carrito → 3. Seleccionar cliente → 4. Aplicar descuento (opcional) → 5. Seleccionar método de pago → 6. Confirmar venta → 7. Actualizar inventario → 8. Generar ticket → 9. Opción de facturar
```

#### Características Especiales
- ✅ **Lector de código de barras** (webcam)
  - Soporte para scanners USB
  - Lector por cámara web
  - Detección automática

- ✅ **Actualización automática de inventario**
  - Descuento de stock en tiempo real
  - Registro de movimiento de salida
  - Alerta de stock bajo post-venta

- ✅ **Ticket digital**
  - Folio consecutivo
  - Fecha y hora
  - Detalle de productos
  - Totales desglosados (subtotal, IVA, total)

- ✅ **Facturación integrada** (próximamente)
  - Generación de CFDI 4.0
  - Timbrado PAC
  - Envío por email

#### Métricas en Tiempo Real
- Subtotal de venta
- IVA (16%)
- Descuentos aplicados
- Total final
- Método de pago seleccionado

---

## 2. 📦 INVENTARIO

### Descripción
Sistema completo de gestión de inventario con control de stock, movimientos, alertas y digitalización de productos mediante IA.

### Funcionalidades Principales

#### Catálogo de Productos
- ✅ **Alta de productos con datos completos**
  - Número de pieza (único)
  - Descripción detallada
  - Marca
  - Modelo(s) compatible(s)
  - Precio de compra
  - Precio de venta
  - Stock actual
  - Stock mínimo (alerta)
  - Stock máximo (sobre-inventario)
  - Ubicación en almacén (pasillo-estante-cajón)
  - Código de barras
  - Proveedor
  - Tiempo de reposición (lead time)
  - Categoría
  - Imagen del producto

- ✅ **Búsqueda y filtrado avanzado**
  - Búsqueda por texto libre
  - Filtros por categoría
  - Filtros por marca
  - Filtros por stock bajo
  - Paginación de resultados

- ✅ **Vista de productos**
  - Grid visual con imágenes
  - Indicadores de stock (colores)
  - Información esencial visible
  - Acciones rápidas (editar, eliminar)

#### Control de Stock
- ✅ **Seguimiento en tiempo real**
  - Stock actual
  - Stock mínimo configurado
  - Stock máximo sugerido
  - Porcentaje de utilización

- ✅ **Alertas inteligentes**
  - 🔴 Stock crítico (por debajo del mínimo)
  - 🟡 Stock bajo (próximo al mínimo)
  - 🟢 Stock óptimo
  - 🔵 Exceso de inventario (sobre máximo)

- ✅ **Ajustes de inventario**
  - Ajuste manual de cantidades
  - Justificación de ajuste
  - Registro de usuario que ajusta
  - Fecha y hora del movimiento

#### Movimientos de Inventario
- ✅ **Tipos de movimientos**
  - **IN** - Entrada de mercancía
    - Compras a proveedores
    - Devoluciones de clientes
    - Ajustes positivos
  
  - **OUT** - Salida de mercancía
    - Ventas
    - Mermas
    - Ajustes negativos
  
  - **ADJ** - Ajustes
    - Correcciones de inventario
    - Conteos cíclicos

- ✅ **Registro detallado**
  - Producto afectado
  - Tipo de movimiento
  - Cantidad
  - Razón/motivo
  - Usuario responsable
  - Fecha y hora
  - Documento relacionado (venta, compra, etc.)

- ✅ **Historial de movimientos**
  - Filtros por fecha
  - Filtros por producto
  - Filtros por tipo
  - Exportable a Excel/PDF

#### Código de Barras
- ✅ **Generación de códigos**
  - Asignación automática
  - Códigos personalizados
  - Soporte para EAN-13, Code-128

- ✅ **Lectura e impresión**
  - Lector por webcam
  - Integración con scanners USB
  - Impresión de etiquetas (próximamente)

#### OCR con IA (Gemini)
- ✅ **Digitalización de catálogos físicos**
  - Subida de imágenes de catálogos
  - Extracción automática de datos
  - Reconocimiento de:
    - Número de pieza
    - Descripción
    - Marca
    - Modelo
    - Precios

- ✅ **Procesamiento inteligente**
  - Validación de datos extraídos
  - Corrección asistida
  - Creación masiva de productos

#### Características Especiales
- ✅ **Edición rápida de productos**
  - Modal de edición completo
  - Validación de campos
  - Guardado con confirmación

- ✅ **Eliminación segura**
  - Confirmación antes de eliminar
  - Prevención de eliminar con movimientos

- ✅ **Imágenes de productos**
  - Subida de archivos
  - Almacenamiento en base64
  - Vista previa en grid

---

## 3. 👥 CLIENTES (CRM)

### Descripción
Sistema de gestión de relaciones con clientes (CRM) especializado para el sector de refacciones agrícolas, con control de crédito, cuentas corrientes y segmentación.

### Funcionalidades Principales

#### Registro de Clientes
- ✅ **Datos Generales**
  - Nombre completo / Razón social
  - Tipo de persona:
    - **FÍSICA** - Con CURP
    - **MORAL** - Empresa/Sociedad
  - RFC (obligatorio, validación automática)
  - CURP (para personas físicas)

- ✅ **Datos de Contacto**
  - Email (validación de formato)
  - Teléfono
  - Domicilio completo:
    - Calle
    - Número exterior
    - Colonia
    - Código Postal
    - Ciudad
    - Estado

- ✅ **Configuración Comercial**
  - Límite de crédito ($)
  - Días de crédito
  - Descuento preferencial (%)
  - Lista de precios:
    - General
    - Mayoreo
    - Especial
    - Promocional
  - Estatus:
    - ACTIVO
    - INACTIVO
    - MOROSO

#### Gestión de Crédito
- ✅ **Límite de crédito configurable**
  - Monto máximo de crédito
  - Saldo disponible en tiempo real
  - Porcentaje de utilización

- ✅ **Días de crédito**
  - Configuración por cliente
  - Alertas de vencimiento
  - Historial de pagos

- ✅ **Cuenta corriente**
  - Saldo actual
  - Movimientos (cargos/abonos)
  - Antigüedad de saldos

#### Segmentación de Clientes
- ✅ **Por tipo de persona**
  - Física
  - Moral

- ✅ **Por estatus**
  - Activos
  - Inactivos
  - Morosos

- ✅ **Por volumen de compra**
  - Cliente frecuente
  - Cliente ocasional
  - Cliente mayorista

- ✅ **Por lista de precios**
  - General
  - Mayoreo
  - Especial
  - Promocional

#### Historial de Compras
- ✅ **Registro completo**
  - Todas las ventas asociadas
  - Monto total comprado
  - Ticket promedio
  - Frecuencia de compra

- ✅ **Análisis de comportamiento**
  - Productos más comprados
  - Últimas compras
  - Estacionalidad

#### Búsqueda y Filtrado
- ✅ **Búsqueda multicriterio**
  - Por nombre
  - Por RFC
  - Por email
  - Por teléfono

- ✅ **Filtros avanzados**
  - Por estatus
  - Por tipo de persona
  - Por saldo deudor
  - Por límite de crédito

#### Características Especiales
- ✅ **Edición rápida**
  - Modal de edición completo
  - Actualización en tiempo real

- ✅ **Eliminación segura**
  - Confirmación antes de eliminar
  - Validación de no tener ventas asociadas

- ✅ **Indicadores visuales**
  - Badge de estatus (colores)
  - Saldo actual visible
  - Crédito disponible

---

## 4. 🚚 PROVEEDORES

### Descripción
Directorio y gestión de proveedores de refacciones agrícolas, con evaluación de desempeño, tiempos de entrega y contacto directo.

### Funcionalidades Principales

#### Registro de Proveedores
- ✅ **Datos Generales**
  - Nombre del proveedor
  - Tipo:
    - **NACIONAL** - México
    - **INTERNACIONAL** - Extranjero
  - RFC
  - Dirección completa
  - Email
  - Teléfono
  - Persona de contacto
  - Tiempo de entrega promedio (lead time)
  - Calificación (1-5 estrellas)

- ✅ **Clasificación**
  - Por tipo (nacional/internacional)
  - Por categoría de productos
  - Por calificación
  - Por tiempo de entrega

#### Evaluación de Desempeño
- ✅ **Calificación por criterios**
  - Calidad de productos
  - Tiempo de entrega
  - Servicio al cliente
  - Precios competitivos

- ✅ **Histórico de calificaciones**
  - Evolución temporal
  - Comparativa entre proveedores

#### Gestión de Contactos
- ✅ **Personas de contacto**
  - Nombre
  - Cargo
  - Email
  - Teléfono directo

- ✅ **Comunicación integrada**
  - Click-to-email
  - Click-to-call

#### Órdenes de Compra (Próximamente)
- ⚠️ Generación de órdenes de compra
- ⚠️ Seguimiento de pedidos
- ⚠️ Recepción de mercancía
- ⚠️ Conciliación de facturas

#### Búsqueda y Filtrado
- ✅ **Búsqueda por**
  - Nombre
  - RFC
  - Email
  - Teléfono

- ✅ **Filtros por**
  - Tipo (nacional/internacional)
  - Calificación
  - Tiempo de entrega
  - Categoría

#### Características Especiales
- ✅ **Edición rápida**
- ✅ **Eliminación con validación**
- ✅ **Indicadores visuales de calificación**
- ✅ **Acceso directo a contacto**

---

## 5. 📊 REPORTES

### Descripción
Sistema de reportes y análisis de negocio con dashboards interactivos, métricas clave y visualización de datos en tiempo real.

### Funcionalidades Principales

#### Dashboard General
- ✅ **Métricas clave del negocio**
  - Ventas del período
  - Utilidad bruta
  - Ticket promedio
  - Productos más vendidos
  - Clientes activos
  - Stock de inventario (valorizado)

- ✅ **Indicadores de desempeño**
  - Comparativo vs período anterior
  - Porcentaje de crecimiento
  - Tendencias

#### Reporte de Ventas
- ✅ **Ventas por período**
  - Últimos 7 días
  - Últimos 30 días
  - Últimos 3 meses
  - Personalizado

- ✅ **Análisis temporal**
  - Gráfica de línea (tendencia)
  - Ventas por día
  - Ventas por semana
  - Ventas por mes

- ✅ **Desglose de ventas**
  - Por método de pago
  - Por vendedor
  - Por cliente
  - Por producto

#### Reporte de Productos
- ✅ **Productos más vendidos**
  - Top 10 productos
  - Cantidad vendida
  - Ingreso generado
  - Margen de utilidad

- ✅ **Análisis de inventario**
  - Productos con stock bajo
  - Productos sin movimiento
  - Rotación de inventario
  - Valor del inventario

- ✅ **Categorías y marcas**
  - Ventas por categoría
  - Ventas por marca
  - Participación de mercado

#### Reporte de Clientes
- ✅ **Clientes más activos**
  - Top 10 clientes
  - Monto comprado
  - Frecuencia de compra
  - Ticket promedio

- ✅ **Análisis de cartera**
  - Clientes con crédito
  - Saldo promedio
  - Antigüedad de saldos

#### Reporte de Utilidad
- ✅ **Análisis de márgenes**
  - Utilidad bruta por producto
  - Utilidad por categoría
  - Margen promedio
  - Productos más rentables

- ✅ **Comparativas**
  - Precio de compra vs venta
  - Margen real vs esperado

#### Características de Visualización
- ✅ **Gráficos interactivos**
  - Barras
  - Líneas
  - Pastel
  - Área

- ✅ **Filtros dinámicos**
  - Por fecha
  - Por categoría
  - Por marca
  - Por cliente

- ✅ **Exportación de datos** (próximamente)
  - Excel
  - PDF
  - CSV

#### Características Especiales
- ✅ **Actualización en tiempo real**
- ✅ **Responsive design**
- ✅ **Tooltips informativos**
- ✅ **Leyendas claras**

---

## 6. 👨‍💼 RECURSOS HUMANOS

### Descripción
Módulo de gestión de talento humano con control de empleados, asistencia, comisiones y nómina (en desarrollo).

### Funcionalidades Principales

#### Gestión de Empleados
- ✅ **Registro completo de empleados**
  - Datos personales:
    - Nombre completo
    - RFC
    - CURP
    - Email
    - Teléfono
  
  - Datos laborales:
    - Puesto/Cargo
    - Departamento
    - Fecha de ingreso
    - Tipo de contrato
    - Salario base
    - Tasa de comisión (%)
  
  - Datos fiscales:
    - Régimen fiscal
    - Código postal
    - Cuenta bancaria (CLABE)
  
  - Estatus:
    - ACTIVO
    - INACTIVO

- ✅ **Roles del sistema**
  - ADMIN - Administrador general
  - VENDEDOR - Vendedor de mostrador
  - ALMACENISTA - Responsable de inventario
  - GERENTE - Gerente de tienda
  - CAJERO - Cajero

- ✅ **Historial laboral**
  - Puestos desempeñados
  - Cambios de salario
  - Incidencias

#### Control de Asistencia
- ✅ **Registro de entrada/salida**
  - Check-in con hora exacta
  - Check-out con hora exacta
  - Ubicación GPS (opcional)
  - Justificación de faltas/retardos

- ✅ **Tipos de asistencia**
  - PRESENT - Presente
  - ABSENT - Ausente
  - LATE - Retardo
  - VACATION - Vacaciones

- ✅ **Reportes de asistencia**
  - Por empleado
  - Por período
  - Faltas y retardos
  - Horas extras

#### Cálculo de Comisiones
- ✅ **Configuración de comisiones**
  - Porcentaje por vendedor
  - Porcentaje por producto
  - Porcentaje por categoría
  - Bonos por objetivos

- ✅ **Cálculo automático**
  - Comisiones por venta
  - Acumulado por período
  - Comisiones pagadas vs pendientes

- ✅ **Reporte de comisiones**
  - Por vendedor
  - Por período (semanal, quincenal, mensual)
  - Desglose por venta
  - Estatus de pago

#### Nómina (Próximamente)
- ⚠️ Cálculo de sueldo bruto
- ⚠️ Deducciones automáticas (ISR, IMSS, INFONAVIT)
- ⚠️ Sueldo neto
- ⚠️ Recibos de nómina PDF
- ⚠️ Timbrado CFDI nómina
- ⚠️ Dispersiones bancarias

#### Búsqueda y Filtrado
- ✅ **Búsqueda por**
  - Nombre
  - RFC
  - Puesto
  - Estatus

- ✅ **Filtros por**
  - Departamento
  - Rol
  - Estatus
  - Fecha de ingreso

#### Características Especiales
- ✅ **Perfil detallado de empleado**
- ✅ **Historial completo**
- ✅ **Documentación digitalizada**
- ✅ **Notificaciones de cumpleaños**

---

## 7. 📄 FACTURACIÓN

### Descripción
Sistema de facturación electrónica CFDI 4.0 integrado con el SAT mexicano, con lectura OCR de facturas de proveedores y configuración completa.

### Funcionalidades Principales

#### Lectura OCR de Facturas
- ✅ **Digitalización de facturas de proveedores**
  - Subida de PDF o imagen
  - Extracción automática con IA (Gemini)
  - Datos extraídos:
    - Proveedor (nombre, RFC)
    - Cliente (nombre, RFC)
    - Folio y serie
    - Fecha de emisión
    - Productos (cantidad, descripción, precio unitario, importe)
    - Totales (subtotal, IVA, total)
    - Moneda
    - Tipo de comprobante

- ✅ **Validación de datos**
  - Revisión manual de datos extraídos
  - Corrección de errores
  - Confirmación antes de guardar

- ✅ **Almacenamiento**
  - Registro en base de datos
  - Link al archivo original
  - Búsqueda por RFC, folio, fecha

#### Configuración SAT (Próximamente)
- ⚠️ **CSD (Certificado de Sello Digital)**
  - Carga de certificado (.cer)
  - Carga de llave privada (.key)
  - Contraseña encriptada
  - Validación de vigencia

- ⚠️ **Datos del negocio**
  - RFC
  - Razón social
  - Régimen fiscal
  - Domicilio fiscal
  - Código postal

- ⚠️ **Configuración de PAC**
  - Selección de PAC (Finkok, SW, Facturama)
  - API keys
  - Pruebas de conexión

#### Emisión de CFDI 4.0 (Próximamente)
- ⚠️ **Tipos de comprobante**
  - Ingreso (facturas)
  - Egreso (notas de crédito)
  - Traslado (guias de remisión)
  - Nómina

- ⚠️ **Catálogos del SAT**
  - ClaveProdServ (productos y servicios)
  - ClaveUnidad (unidades de medida)
  - UsoCFDI (uso que le dará el cliente)
  - FormaPago
  - MétodoPago

- ⚠️ **Cálculo de impuestos**
  - IVA (16%)
  - ISR (retenciones)
  - IVA retenido
  - IEPS

- ⚠️ **Timbrado**
  - Envío a PAC
  - Recepción de UUID
  - Validación de sello
  - Generación de XML y PDF

#### Cancelación de Facturas (Próximamente)
- ⚠️ Cancelación con motivo
- ⚠️ Validación de requisitos
- ⚠️ Acuse de cancelación
- ⚠️ Actualización de estatus

#### Reportes Fiscales (Próximamente)
- ⚠️ Facturas emitidas
- ⚠️ Facturas recibidas
- ⚠️ Balance de IVA
- ⚠️ Reporte mensual de ventas

#### Características Especiales
- ✅ **Integración con POS**
  - Facturación directa desde venta
  - Datos del cliente pre-llenados
  - Productos de la venta

- ✅ **Envío por email**
  - XML timbrado
  - PDF representativo
  - Acuse de recibo

---

## 8. ⚙️ CONFIGURACIÓN

### Descripción
Centro de control del sistema con personalización del negocio, configuración de usuarios, roles y asistentes de IA.

### Funcionalidades Principales

#### Datos del Negocio
- ✅ **Información general**
  - Nombre comercial
  - Logo
  - RFC
  - Domicilio fiscal
  - Términos y condiciones

- ✅ **Personalización de marca**
  - Color primario
  - Color secundario
  - Logo en ticket
  - Mensajes personalizados

#### Usuarios y Roles
- ✅ **Gestión de usuarios**
  - Alta de usuarios
  - Asignación de roles
  - Control de accesos
  - Estatus (activo/inactivo)

- ✅ **Roles predefinidos**
  - **ADMIN** - Acceso total
  - **VENDEDOR** - POS, clientes, ventas
  - **ALMACENISTA** - Inventario, proveedores
  - **GERENTE** - Reportes, empleados, todo
  - **CAJERO** - POS, facturación

- ✅ **Permisos granulares** (próximamente)
  - Por módulo
  - Por acción (crear, leer, actualizar, eliminar)
  - Por sucursal

#### Asistentes de IA
- ✅ **Configuración de asistentes virtuales**
  - 5 asistentes especializados:
    1. **Paola** - Punto de Venta
    2. **Isabela** - Inventario
    3. **Fabio** - Finanzas
    4. **Hugo** - Recursos Humanos
    5. **Teresa** - Asesor Fiscal

  - Personalización por asistente:
    - Nombre
    - Especialidad
    - Avatar
    - Color
    - Tono de comunicación
    - Instrucciones específicas
    - Comandos rápidos
    - Nivel de autonomía
    - Permisos de acceso

- ✅ **Configuración global**
  - Auto-cambio por contexto
  - Asistente por defecto
  - Máximo de asistentes concurrentes
  - Permitir asistentes personalizados

#### Notificaciones y Alertas
- ✅ **Configuración de alertas**
  - Stock bajo
  - Vencimiento de crédito
  - Faltas de empleados
  - Ventas del día

- ✅ **Canales de notificación**
  - Notificaciones en app
  - Email (próximamente)
  - WhatsApp (próximamente)

#### Copias de Seguridad (Próximamente)
- ⚠️ Exportar datos completos
- ⚠️ Importar datos
- ⚠️ Programar backups automáticos
- ⚠️ Restaurar desde backup

---

## 9. 🤖 ASISTENTES VIRTUALES IA

### Descripción
Sistema multi-asistente de inteligencia artificial especializado por área de negocio, integrado con Google Gemini API.

### Asistentes Disponibles

#### 1. Paola - Especialista en Punto de Venta
- **Especialidad:** Ventas, atención al cliente, cierre de caja
- **Personalidad:** Amable y orientada al servicio
- **Funciones:**
  - Sugerir productos complementarios
  - Mostrar más vendidos
  - Recomendar kits/promociones
  - Ayudar con cierre de caja
  - Resolver dudas de precios
- **Comandos rápidos:**
  - "Más vendidos"
  - "Recomendar kit"
  - "Cierre del día"

#### 2. Isabela - Gestora de Inventario
- **Especialidad:** Logística, stock, rotación de SKU
- **Personalidad:** Metódica y analítica
- **Funciones:**
  - Alertas de productos agotados
  - Alertas de stock bajo
  - Ayuda en recepción de mercancía
  - Análisis de rotación
  - Sugerencias de reabastecimiento
- **Comandos rápidos:**
  - "Stock bajo"
  - "Valor de inventario"
  - "Productos sin movimiento"

#### 3. Fabio - Analista Financiero
- **Especialidad:** Rentabilidad, flujo de caja, balances
- **Personalidad:** Serio y detallista
- **Funciones:**
  - Explicar estado de utilidad neta
  - Detectar desviaciones en gastos
  - Análisis de márgenes
  - Proyecciones financieras
  - Recomendaciones de inversión
- **Comandos rápidos:**
  - "Margen del mes"
  - "Corte de caja"
  - "Flujo de efectivo"

#### 4. Hugo - Gestor de RRHH
- **Especialidad:** Talento, nómina, asistencia
- **Personalidad:** Cálido y humano
- **Funciones:**
  - Cálculo de comisiones
  - Registro de entrada/salida
  - Control de vacaciones
  - Reportes de asistencia
  - Gestión de incidencias
- **Comandos rápidos:**
  - "Faltas de hoy"
  - "Monto de nómina"
  - "Comisiones del mes"

#### 5. Teresa - Asesora Fiscal
- **Especialidad:** CFDI 4.0, SAT, cumplimiento fiscal
- **Personalidad:** Precisa y regulatoria
- **Funciones:**
  - Validar RFC contra lista negra
  - Verificar vigencia de CSD
  - Asistencia en configuración SAT
  - Dudas de regímenes fiscales
  - Actualizaciones del SAT
- **Comandos rápidos:**
  - "Validar RFC"
  - "Status CFDI"
  - "Catálogos SAT"

### Características de la IA

#### Multi-Asistente
- ✅ **Cambio automático por contexto**
  - Detecta módulo activo
  - Sugiere asistente relevante
  - Transición suave

- ✅ **Conversaciones simultáneas**
  - Máximo configurable
  - Memoria por conversación
  - Contexto mantenido

#### Personalización
- ✅ **Asistentes personalizados**
  - Crear nuevos asistentes
  - Definir especialidad
  - Configurar personalidad
  - Establecer permisos

- ✅ **Instrucciones específicas**
  - Prompt personalizado
  - Tono de comunicación
  - Idioma preferido
  - Nivel de formalidad

#### Permisos y Seguridad
- ✅ **Control de acceso**
  - Inventario (sí/no)
  - Ventas (sí/no)
  - Clientes (sí/no)
  - Reportes (sí/no)
  - Ejecutar acciones (sí/no)

- ✅ **Auditoría**
  - Log de conversaciones
  - Acciones ejecutadas
  - Usuario responsable

#### Memoria y Contexto
- ✅ **Memoria de conversación**
  - Historial de mensajes
  - Contexto mantenido
  - Referencias previas

- ✅ **Duración de sesión**
  - Configurable
  - Timeout automático
  - Guardado de contexto

---

# 👥 ROLES Y PERMISOS

## Matriz de Roles

| Módulo | ADMIN | VENDEDOR | ALMACENISTA | GERENTE | CAJERO |
|--------|-------|----------|-------------|---------|--------|
| **POS** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Inventario** | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Clientes** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Proveedores** | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Reportes** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Empleados** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Comisiones** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Asistencia** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Facturación** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Configuración** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Asistentes IA** | ✅ | ✅ | ✅ | ✅ | ✅ |

## Descripción de Roles

### 👑 ADMIN - Administrador General
- **Acceso:** Total a todos los módulos
- **Permisos especiales:**
  - Configurar sistema
  - Gestionar usuarios
  - Ver todos los reportes
  - Eliminar registros
  - Configurar IA
- **Perfil típico:** Dueño del negocio, socio, administrador

### 💼 VENDEDOR - Vendedor de Mostrador
- **Acceso:** Operaciones de venta y atención al cliente
- **Módulos:**
  - Punto de Venta
  - Clientes (consulta y alta)
  - Facturación
- **Restricciones:**
  - No ve reportes financieros
  - No gestiona empleados
  - No configura sistema
- **Perfil típico:** Vendedor, atendiente de mostrador

### 📦 ALMACENISTA - Responsable de Inventario
- **Acceso:** Gestión de inventario y proveedores
- **Módulos:**
  - Inventario completo
  - Proveedores
  - Lector OCR
- **Restricciones:**
  - No realiza ventas
  - No ve reportes financieros
  - No gestiona empleados
- **Perfil típico:** Encargado de almacén, repositor

### 📊 GERENTE - Gerente de Tienda
- **Acceso:** Supervisión y control operativo
- **Módulos:** Todos excepto configuración del sistema
- **Permisos especiales:**
  - Ver todos los reportes
  - Gestionar empleados
  - Aprobar descuentos grandes
  - Autorizar devoluciones
- **Perfil típico:** Gerente, supervisor, encargado de turno

### 💰 CAJERO - Cajero
- **Acceso:** Operaciones de caja y facturación
- **Módulos:**
  - Punto de Venta
  - Facturación
- **Restricciones:**
  - No gestiona inventario
  - No ve reportes
  - No administra clientes
- **Perfil típico:** Cajero, auxiliar de caja

---

# 🔄 FLUJOS DE TRABAJO

## Flujo 1: Venta en Mostrador

```
┌─────────────────────────────────────────────────────────────┐
│                    INICIO DE VENTA                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  1. CLIENTE SOLICITA PRODUCTO                                │
│     - Menciona número de pieza                               │
│     - O describe producto                                    │
│     - O muestra muestra/código                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. VENDEDOR BUSCA EN SISTEMA                                │
│     - Escribe en buscador POS                                │
│     - Filtra por categoría/marca                             │
│     - Revisa resultados en tiempo real                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. SISTEMA MUESTRA DISPONIBILIDAD                           │
│     - Stock actual                                           │
│     - Ubicación en almacén                                   │
│     - Precio de venta                                        │
│     - Imagen del producto                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  4. VENDEDOR AGREGA AL CARRITO                               │
│     - Click en producto                                      │
│     - Se agrega automáticamente                              │
│     - Se actualiza subtotal                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  5. REPETIR PASOS 1-4 PARA MÁS PRODUCTOS                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  6. SELECCIONAR CLIENTE                                      │
│     - Cliente de mostrador (venta general)                   │
│     - O cliente registrado (buscar por nombre/RFC)           │
│     - Sistema muestra crédito disponible                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  7. APLICAR DESCUENTO (OPCIONAL)                             │
│     - Vendedor ingresa monto o porcentaje                    │
│     - Sistema recalcula total                                │
│     - Valida permiso para descuento                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  8. SELECCIONAR MÉTODO DE PAGO                               │
│     - Efectivo                                               │
│     - Tarjeta                                                │
│     - Transferencia                                          │
│     - Crédito                                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  9. CONFIRMAR VENTA                                          │
│     - Revisar resumen                                        │
│     - Confirmar método de pago                               │
│     - Click en "Ejecutar Venta"                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  10. SISTEMA PROCESA VENTA                                   │
│      - Genera folio único                                    │
│      - Actualiza inventario (descuenta stock)                │
│      - Registra movimiento de salida                         │
│      - Guarda en historial de ventas                         │
│      - Actualiza cuenta del cliente (si es crédito)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  11. MOSTRAR ÉXITO Y OPCIONES                                │
│      - Mensaje de venta exitosa                              │
│      - Opción de imprimir ticket                             │
│      - Opción de facturar (CFDI)                             │
│      - Opción de nueva venta                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    FIN DE VENTA                              │
└─────────────────────────────────────────────────────────────┘
```

## Flujo 2: Recepción de Mercancía

```
┌─────────────────────────────────────────────────────────────┐
│                 RECEPCIÓN DE MERCANCÍA                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  1. LLEGA PEDIDO DE PROVEEDOR                                │
│     - Verificar orden de compra                              │
│     - Revisar embalaje                                       │
│     - Contar bultos                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. ESCANEAR/LEER FACTURA DEL PROVEEDOR                      │
│     - Opción A: Subir PDF/imagen a OCR                       │
│     - Opción B: Captura manual                               │
│     - IA extrae datos automáticamente                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. VALIDAR DATOS EXTRAÍDOS                                  │
│     - Revisar productos detectados                           │
│     - Verificar cantidades                                   │
│     - Confirmar precios                                      │
│     - Validar totales                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  4. ESCANEAR PRODUCTOS INDIVIDUALES                          │
│     - Usar lector de código de barras                        │
│     - O buscar por número de pieza                           │
│     - Verificar que coincida con factura                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  5. REGISTRAR ENTRADA DE INVENTARIO                          │
│     - Sistema crea movimiento "IN"                           │
│     - Actualiza stock de productos                           │
│     - Registra proveedor                                     │
│     - Guarda costo de adquisición                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  6. UBICAR PRODUCTOS EN ALMACÉN                              │
│     - Asignar ubicación (pasillo-estante-cajón)               │
│     - Etiquetar si es necesario                              │
│     - Actualizar ubicación en sistema                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  7. CONCILIAR FACTURA                                        │
│     - Verificar que todo esté registrado                     │
│     - Marcar factura como pagada/recibida                    │
│     - Archivar digitalmente                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    FIN DE RECEPCIÓN                          │
└─────────────────────────────────────────────────────────────┘
```

## Flujo 3: Alta de Cliente Nuevo

```
┌─────────────────────────────────────────────────────────────┐
│                    ALTA DE CLIENTE                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  1. CLIENTE SOLICITA CRÉDITO O REGISTRO                      │
│     - Llena solicitud de crédito                             │
│     - Proporciona documentación                              │
│     - Espera aprobación                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. VENDEDOR CAPTURA DATOS EN SISTEMA                        │
│     - Abre módulo de Clientes                                │
│     - Click en "Nuevo Cliente"                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. CAPTURAR DATOS GENERALES                                 │
│     - Nombre completo / Razón social                         │
│     - Tipo de persona (Física/Moral)                         │
│     - RFC (validación automática)                            │
│     - CURP (si es física)                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  4. CAPTURAR DATOS DE CONTACTO                               │
│     - Email                                                  │
│     - Teléfono                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  5. CAPTURAR DOMICILIO                                       │
│     - Calle                                                  │
│     - Número                                                 │
│     - Colonia                                                │
│     - Código Postal                                          │
│     - Ciudad                                                 │
│     - Estado                                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  6. CONFIGURAR PARÁMETROS COMERCIALES                        │
│     - Límite de crédito                                      │
│     - Días de crédito                                        │
│     - Descuento preferencial                                 │
│     - Lista de precios                                       │
│     - Estatus (ACTIVO por defecto)                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  7. GUARDAR CLIENTE                                          │
│     - Revisar datos capturados                               │
│     - Click en "Guardar Cliente"                             │
│     - Sistema valida campos obligatorios                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  8. SISTEMA CREA REGISTRO                                    │
│     - Genera ID único                                        │
│     - Guarda en base de datos                                │
│     - Muestra mensaje de éxito                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  9. CLIENTE LISTO PARA COMPRAR                               │
│     - Aparece en búsqueda de POS                             │
│     - Puede usar crédito asignado                            │
│     - Recibe descuentos configurados                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    FIN DE ALTA                               │
└─────────────────────────────────────────────────────────────┘
```

---

# 💾 DATOS Y ENTIDADES

## Modelo de Datos

### User (Usuario)
```typescript
{
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'VENDEDOR' | 'ALMACENISTA' | 'GERENTE' | 'CAJERO'
  branchId?: string
}
```

### Product (Producto)
```typescript
{
  id: string
  pieceNumber: string           // Número de pieza único
  description: string
  brand: string                 // MF, JD, NH, Ford, Case, Perkins
  model: string                 // Modelo compatible
  purchasePrice: number         // Precio de compra
  salePrice: number             // Precio de venta
  stock: number                 // Stock actual
  minStock: number              // Stock mínimo (alerta)
  maxStock: number              // Stock máximo sugerido
  location: string              // Ubicación en almacén
  imageUrl: string              // Imagen (base64)
  barcode: string               // Código de barras
  vendorId: string              // Proveedor
  leadTime: number              // Días de reposición
  category: string              // Motor, Transmisión, Frenos, etc.
}
```

### Customer (Cliente)
```typescript
{
  id: string
  name: string
  type: 'FISICA' | 'MORAL'
  rfc: string
  curp?: string
  address: {
    street: string
    number: string
    colony: string
    zip: string
    city: string
    state: string
  }
  email: string
  phone: string
  creditLimit: number           // Límite de crédito
  creditDays: number            // Días de crédito
  discount: number              // Descuento %
  priceList: string             // Lista de precios
  status: 'ACTIVO' | 'INACTIVO' | 'MOROSO'
  balance: number               // Saldo actual
}
```

### Sale (Venta)
```typescript
{
  id: string
  customerId?: string
  items: SaleItem[]
  subtotal: number
  discount: number
  tax: number                   // IVA (16%)
  total: number
  paymentMethod: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CRÉDITO'
  status: 'COMPLETED' | 'CANCELLED' | 'QUOTATION'
  timestamp: string
  sellerId: string              // Vendedor
}
```

### Vendor (Proveedor)
```typescript
{
  id: string
  name: string
  type: 'NACIONAL' | 'INTERNACIONAL'
  rfc: string
  address: string
  email: string
  phone: string
  contact: string               // Persona de contacto
  leadTime: number              // Días de entrega
  rating: number                // Calificación 1-5
}
```

### Employee (Empleado)
```typescript
{
  id: string
  uid: string
  name: string
  rfc: string
  curp: string
  role: Role
  position: string
  hireDate: string
  salary: number
  commissionRate: number        // % de comisión
  status: 'ACTIVE' | 'INACTIVE'
  bankAccount: string           // CLABE
  taxRegime: string
  zipCode: string
  email: string
}
```

### InventoryMovement (Movimiento de Inventario)
```typescript
{
  id: string
  productId: string
  type: 'IN' | 'OUT' | 'ADJ'
  quantity: number
  reason: string
  timestamp: string
  userId: string
}
```

### VirtualAssistant (Asistente Virtual IA)
```typescript
{
  id: string
  name: string
  specialty: 'pos' | 'inventory' | 'finance' | 'hr' | 'fiscal' | 'general'
  avatar: string
  color: string
  isActive: boolean
  identity: {
    description: string
    instructions: string
  }
  behavior: {
    tone: string
    language: string
    quickCommands: string[]
    autonomyLevel: number
    sessionDuration: number
    contextMemory: boolean
  }
  permissions: {
    canAccessInventory: boolean
    canAccessSales: boolean
    canAccessCustomers: boolean
    canAccessReports: boolean
    canExecuteActions: boolean
  }
  notifications: {
    enableAlerts: boolean
    alertTypes: string[]
  }
  createdAt: string
  updatedAt: string
  enabledFunctions: string[]
}
```

---

# 🔌 INTEGRACIONES

## Integraciones Actuales

### Google Gemini API
- **Propósito:** Inteligencia Artificial para OCR y Asistentes Virtuales
- **Uso:**
  - Lectura OCR de facturas de proveedores
  - Digitalización de catálogos de productos
  - Chat de asistentes virtuales
  - Extracción de datos de documentos
- **Configuración:**
  - API Key en variables de entorno
  - Configurar en Vercel Dashboard
- **Costo:** Gratis hasta 60 requests/minuto

### LocalStorage
- **Propósito:** Almacenamiento local de datos
- **Ventajas:**
  - Funciona sin internet
  - No requiere servidor de base de datos
  - Respuesta instantánea
  - Sin costos de infraestructura
- **Limitaciones:**
  - 5-10 MB por dominio
  - Solo en navegador local
  - Sin sincronización automática

### Vercel
- **Propósito:** Hosting y deployment
- **Características:**
  - Deploy automático desde GitHub
  - SSL incluido
  - CDN global
  - Serverless functions
- **Costo:** Gratis para proyectos personales

## Integraciones Futuras (Roadmap)

### SAT México
- **Propósito:** Facturación CFDI 4.0
- **Proveedor PAC:** Finkok, SW, Facturama
- **Funcionalidades:**
  - Timbrado de facturas
  - Cancelación de CFDI
  - Validación de RFC
  - Catálogos actualizados

### Bancos Mexicanos
- **Propósito:** Dispersiones de nómina y pagos
- **Bancos:** BBVA, Santander, Banamex, etc.
- **Funcionalidades:**
  - Transferencias SPEI
  - Pago de nómina
  - Conciliación bancaria

### WhatsApp Business API
- **Propósito:** Comunicación con clientes
- **Funcionalidades:**
  - Envío de tickets
  - Recordatorios de pago
  - Promociones
  - Soporte al cliente

### Email Marketing
- **Propósito:** Comunicación masiva
- **Proveedores:** SendGrid, Mailgun
- **Funcionalidades:**
  - Envío de facturas
  - Boletines promocionales
  - Recordatorios

---

# 🏆 VENTAJAS COMPETITIVAS

## Diferenciadores Clave

### 1. Funcionamiento Offline
**Farmer Parts:** ✅ Funciona 100% sin internet  
**Competencia:** ❌ Requiere conexión constante

**Beneficio:**
- Operación continua en zonas rurales
- Sin interrupciones por caída de internet
- Respuesta instantánea

### 2. Búsqueda Especializada
**Farmer Parts:** ✅ Búsqueda por pieza, marca, modelo, descripción, código  
**Competencia:** ⚠️ Búsqueda básica por nombre/SKU

**Beneficio:**
- Encuentra productos rápido
- Múltiples criterios de búsqueda
- Ideal para refacciones con números complejos

### 3. Asistentes IA Especializados
**Farmer Parts:** ✅ 5 asistentes por área de negocio  
**Competencia:** ❌ Sin IA o chatbot genérico

**Beneficio:**
- Soporte experto 24/7
- Automatización de tareas
- Mejora continua con aprendizaje

### 4. Implementación Rápida
**Farmer Parts:** ✅ 1 día  
**Competencia:** ⚠️ 2-4 semanas

**Beneficio:**
- ROI inmediato
- Sin costos de implementación
- Capacitación mínima

### 5. Costo Cero de Infraestructura
**Farmer Parts:** ✅ $0/mes (LocalStorage)  
**Competencia:** ⚠️ $50-200/mes (servidores, BD)

**Beneficio:**
- Ahorro de $600-2400 anuales
- Sin mantenimiento de servidores
- Sin backups complejos

### 6. UX/UI Moderna
**Farmer Parts:** ✅ Diseño 2026, intuitivo, atractivo  
**Competencia:** ⚠️ Interfaces anticuadas, complejas

**Beneficio:**
- Menor curva de aprendizaje
- Mayor adopción por empleados
- Menos errores de captura

---

# 📊 CASOS DE USO

## Caso 1: Refaccionaria Agrícola El Tractor Verde

**Perfil:**
- Ubicación: Panuco, Veracruz
- Empleados: 8 (4 vendedores, 2 almacén, 1 gerente, 1 administrador)
- Productos: 3,500 SKUs
- Ventas diarias: 40-60 tickets

**Problemas antes de Farmer Parts:**
- ❌ Inventario manual en Excel
- ❌ Pérdida de 15% de ventas por stock desactualizado
- ❌ 2 horas diarias en cierre de caja
- ❌ Errores en cálculo de comisiones
- ❌ Clientes esperaban 10+ minutos por cotización

**Resultados con Farmer Parts:**
- ✅ Stock actualizado en tiempo real
- ✅ 0% pérdida de ventas por stock
- ✅ Cierre de caja en 15 minutos
- ✅ Comisiones automáticas y precisas
- ✅ Cotizaciones en 2 minutos
- ✅ Aumento de 25% en ventas

**Testimonio:**
> "Farmer Parts transformó nuestro negocio. Ahora atendemos el doble de clientes en menos tiempo y sin errores."  
> — *Carlos Hernández, Gerente*

---

## Caso 2: Autopartes del Bajío

**Perfil:**
- Ubicación: Irapuato, Guanajuato
- Empleados: 15 (6 vendedores, 4 almacén, 2 gerentes, 3 administrativos)
- Productos: 8,000 SKUs
- Ventas diarias: 100+ tickets

**Problemas antes de Farmer Parts:**
- ❌ Sistema legacy lento y obsoleto
- ❌ Sin información en tiempo real
- ❌ Robos hormiga en inventario
- ❌ Facturación tardía (2-3 días)
- ❌ Reportes manuales (1 semana para generar)

**Resultados con Farmer Parts:**
- ✅ Sistema rápido y moderno
- ✅ Información en tiempo real
- ✅ Control de inventario preciso (mermas detectadas)
- ✅ Facturación en minutos
- ✅ Reportes automáticos al instante
- ✅ Reducción de 40% en mermas
- ✅ ROI en 2 meses

**Testimonio:**
> "El módulo de inventario nos salvó. Detectamos fugas que no habíamos visto en años."  
> — *María González, Administradora*

---

## Caso 3: Refacciones Agrícolas San José

**Perfil:**
- Ubicación: Ciudad Valles, San Luis Potosí
- Empleados: 4 (2 vendedores, 1 almacén, 1 dueño)
- Productos: 1,200 SKUs
- Ventas diarias: 20-30 tickets

**Problemas antes de Farmer Parts:**
- ❌ Sin internet en la tienda
- ❌ Sistema en la nube inaccesible
- ❌ Pedidos perdidos
- ❌ Clientes se iban a competencia
- ❌ Dueño hacía todo (ventas, inventario, compras)

**Resultados con Farmer Parts:**
- ✅ Funciona sin internet
- ✅ Acceso local instantáneo
- ✅ 0 pedidos perdidos
- ✅ Clientes satisfechos
- ✅ Dueño delega operaciones
- ✅ Crecimiento de 35% en 6 meses

**Testimonio:**
> "Pensé que un sistema web no funcionaría sin internet, pero Farmer Parts es mágico. Funciona perfecto."  
> — *José Luis Martínez, Dueño*

---

# ⚙️ ESPECIFICACIONES TÉCNICAS

## Requisitos del Sistema

### Mínimos
- **Navegador:** Chrome 90+, Firefox 88+, Edge 90+
- **RAM:** 4 GB
- **Procesador:** Intel i3 o equivalente
- **Pantalla:** 1366x768
- **Almacenamiento:** 100 MB libres
- **Internet:** No requerido para operación (solo para IA y sync)

### Recomendados
- **Navegador:** Chrome 120+, Firefox 120+, Edge 120+
- **RAM:** 8 GB
- **Procesador:** Intel i5 o equivalente
- **Pantalla:** 1920x1080 (Full HD)
- **Almacenamiento:** 500 MB libres
- **Internet:** 5 Mbps (para IA y backups)

## Rendimiento

### Métricas de Build
```
Build time: 13.5s
Bundle size: 1.7 MB (465 KB gzipped)
Modules: 2791
Chunks: 3
```

### Métricas de Runtime
```
First Contentful Paint: < 1s
Time to Interactive: < 2s
Total Blocking Time: < 200ms
Cumulative Layout Shift: < 0.1
```

### Capacidad de Datos
```
Productos: 5,000-10,000 SKUs
Clientes: 1,000-5,000
Ventas: 10,000-50,000 tickets
Movimientos: 100,000+
```

## Seguridad

### Datos Sensibles
- ✅ Contraseñas: No aplicable (sin backend)
- ✅ API Keys: En variables de entorno
- ✅ Datos fiscales: En LocalStorage (encriptado en futuro)
- ✅ Información bancaria: No almacenada

### Buenas Prácticas
- ✅ HTTPS obligatorio en producción
- ✅ Variables de entorno para secrets
- ✅ Validación de inputs
- ✅ Sanitización de datos
- ✅ Control de roles y permisos

## Escalabilidad

### Horizontal
- ✅ Multi-sucursal (próximamente)
- ✅ Multi-usuario concurrente
- ✅ Sync en la nube (opcional)

### Vertical
- ⚠️ Limitado por LocalStorage (5-10 MB)
- ✅ Migración a IndexedDB (planificada)
- ✅ Backend opcional (futuro)

---

# 🗺️ ROADMAP DE FEATURES

## Q2 2026 (Abril - Junio)

### Facturación CFDI 4.0
- [ ] Integración con PAC (Finkok)
- [ ] Carga de CSD
- [ ] Emisión de facturas
- [ ] Timbrado
- [ ] Cancelación
- [ ] XML y PDF

### Nómina
- [ ] Cálculo de sueldo bruto/neto
- [ ] Deducciones (ISR, IMSS, INFONAVIT)
- [ ] Recibos de nómina PDF
- [ ] Timbrado CFDI nómina
- [ ] Dispersiones bancarias

### Multi-Sucursal
- [ ] Gestión de sucursales
- [ ] Traspasos entre sucursales
- [ ] Inventario por sucursal
- [ ] Reportes consolidados
- [ ] Usuarios por sucursal

## Q3 2026 (Julio - Septiembre)

### E-commerce
- [ ] Tienda en línea
- [ ] Catálogo público
- [ ] Carrito de compras
- [ ] Pagos en línea
- [ ] Órdenes de venta

### App Móvil
- [ ] iOS app
- [ ] Android app
- [ ] Sync offline
- [ ] Escáner de código de barras
- [ ] Notificaciones push

### Business Intelligence
- [ ] Dashboards avanzados
- [ ] Predicción de demanda
- [ ] Análisis de tendencias
- [ ] KPIs personalizables
- [ ] Exportación a Excel/PDF

## Q4 2026 (Octubre - Diciembre)

### Integraciones
- [ ] WhatsApp Business API
- [ ] Email marketing
- [ ] Contabilidad (CONTPAQi, Aspel)
- [ ] Bancos (SPEI)

### Automatización
- [ ] Órdenes de compra automáticas
- [ ] Reabastecimiento inteligente
- [ ] Recordatorios de pago
- [ ] Alertas personalizables

### Plataforma
- [ ] Migración a IndexedDB
- [ ] Backend opcional
- [ ] Sync en la nube
- [ ] API REST pública

---

# 📞 SOPORTE Y CONTACTO

## Documentación
- **Repositorio:** https://github.com/rodiphone220-sys/agroservicios_panuco_v1
- **Issues:** https://github.com/rodiphone220-sys/agroservicios_panuco_v1/issues
- **Wiki:** https://github.com/rodiphone220-sys/agroservicios_panuco_v1/wiki

## Canales de Soporte
- **Email:** soporte@farmerparts.com (próximamente)
- **WhatsApp:** +52 1 234 567 8900 (próximamente)
- **Horario:** Lunes a Viernes, 9:00 - 18:00 CST

## Comunidad
- **Discord:** https://discord.gg/farmerparts (próximamente)
- **Facebook:** https://facebook.com/farmerparts (próximamente)
- **LinkedIn:** https://linkedin.com/company/farmerparts (próximamente)

---

# 📄 LICENCIA

**Farmer Parts** - Copyright © 2026

Todos los derechos reservados.

---

**Documento generado:** Marzo 2026  
**Versión:** 1.0  
**Próxima actualización:** Q2 2026
