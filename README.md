# 🎯 Weight Tracker Pro

Sistema inteligente y moderno de seguimiento de peso con análisis avanzado, medias móviles, detección de cheat meals y retenciones.

## 🚀 Características

### Core Features
- ✅ Registro diario de peso
- 📊 Gráficas interactivas con Recharts
- 📈 Medias móviles (7, 14 y 30 días)
- 🍕 Marcadores de cheat meals
- 💧 Identificación de retenciones de líquidos
- 🎯 Definición de objetivos (Volumen/Definición/Mantenimiento)
- 📉 Proyecciones inteligentes de peso

### Análisis Avanzado
- **Estadísticas Inteligentes**: Cambio semanal, mensual, consistencia
- **Insights Automáticos**: Recomendaciones basadas en tus datos
- **Filtrado Inteligente**: Excluye cheat meals y retenciones de las medias
- **Análisis Semanal**: Desglose por semanas con métricas detalladas
- **Proyecciones**: Estimación de peso futuro y días hasta objetivo

### Tecnologías Modernas
- ⚛️ **React 18** con TypeScript
- 🎨 **Tailwind CSS** para diseño moderno
- 📊 **Recharts** para visualizaciones
- 🗄️ **Zustand** para gestión de estado
- 💾 **LocalStorage** persistencia automática
- 🎭 **Framer Motion** animaciones fluidas
- 📅 **date-fns** manejo de fechas

## 📦 Instalación

```bash
cd weight-tracker
npm install
npm run dev
```

La aplicación se abrirá en `http://localhost:3000`

## 🏗️ Estructura del Proyecto

```
weight-tracker/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # Panel principal con stats
│   │   ├── WeightChart.tsx        # Gráfica interactiva
│   │   ├── WeightEntryForm.tsx    # Formulario de registro
│   │   ├── WeightList.tsx         # Lista de registros
│   │   └── ProfileSetup.tsx       # Configuración inicial
│   ├── store/
│   │   └── useWeightStore.ts      # Estado global con Zustand
│   ├── utils/
│   │   ├── statistics.ts          # Cálculos y análisis
│   │   └── uuid.ts               # Generador de IDs
│   ├── types/
│   │   └── index.ts              # Tipos TypeScript
│   ├── App.tsx                    # Componente principal
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Estilos globales
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎯 Uso

### Primera Vez
1. Ingresa tu nombre y datos básicos
2. Selecciona tu objetivo (Volumen/Definición/Mantenimiento)
3. Define tu peso inicial y objetivo
4. ¡Comienza a registrar!

### Registro Diario
1. Haz clic en el botón flotante "+"
2. Ingresa tu peso del día
3. Marca si es cheat meal o retención (opcional)
4. Añade notas si lo deseas

### Interpretación de Datos
- **Peso Actual**: Último registro
- **Media Móvil 7**: Promedio de última semana (excluye cheat meals)
- **Cambio Semanal**: Tendencia de ganancia/pérdida por semana
- **Consistencia**: % de días que has registrado peso
- **Proyecciones**: Estimación basada en tu tendencia actual

## 🧠 Algoritmos Inteligentes

### Medias Móviles
Las medias móviles **excluyen automáticamente** registros marcados como cheat meals o retenciones para dar una visión más precisa de tu progreso real.

### Insights Automáticos
El sistema analiza tus datos y proporciona recomendaciones:
- Si ganas/pierdes muy rápido o muy lento
- Si tienes muchos cheat meals
- Tendencias a corto vs largo plazo
- Estimación de tiempo para alcanzar objetivo

### Proyecciones
Basadas en tu cambio semanal promedio:
- Peso estimado en 30 días
- Días restantes hasta objetivo (si lo definiste)

## 🎨 Personalización

### Colores y Tema
Edita `tailwind.config.js` para cambiar la paleta de colores.

### Ventanas de Medias Móviles
En `WeightChart.tsx` puedes activar/desactivar MA7, MA14, MA30.

## 📱 Responsive

Totalmente responsive y optimizado para:
- 📱 Móviles
- 📲 Tablets
- 💻 Desktop

## 🔒 Privacidad

- Todos los datos se guardan **localmente** en tu navegador
- No hay backend ni servidor
- Tus datos **nunca** salen de tu dispositivo
- Puedes exportar/eliminar tus datos en cualquier momento

## 🚀 Build para Producción

```bash
npm run build
```

Los archivos optimizados estarán en `dist/`. Puedes desplegarlos en cualquier hosting estático (Netlify, Vercel, GitHub Pages, etc.).

## 🤝 Contribuir

Este es un proyecto open source. Siéntete libre de:
- Reportar bugs
- Sugerir features
- Hacer pull requests
- Mejorar la documentación

## 📄 Licencia

MIT License - Libre para uso personal y comercial

---

**Desarrollado con ❤️ usando las mejores prácticas y tecnologías modernas de 2025**
