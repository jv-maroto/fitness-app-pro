# Fitness App Pro

Sistema completo de seguimiento de peso corporal y nutricion con analisis avanzado basado en evidencia cientifica.

![Dashboard](screenshots/dashboard.png)

## Caracteristicas Principales

### Dashboard
Panel principal con metricas en tiempo real:
- **Peso actual** y medias moviles (7, 14, 30 dias)
- **Objetivo de peso** con porcentaje de progreso
- **Consistencia** de registros diarios
- **Cambio semanal** calculado automaticamente
- **Proyecciones** de peso estimado y dias hasta objetivo
- **Analisis inteligente** con recomendaciones personalizadas

![Dashboard](screenshots/dashboard.png)

### Graficas de Evolucion
![Graficas](screenshots/graficas.png)

Visualizacion interactiva del progreso:
- Medias moviles suavizadas (MA7, MA14, MA30)
- Toggle para activar/desactivar cada media
- Marcadores para cheat meals y retenciones de liquidos
- Las medias excluyen automaticamente dias marcados como cheat meal o retencion para mostrar el progreso real

### Historial de Registros
![Historial](screenshots/historial.png)

- Lista completa de todos los registros ordenados por fecha
- Edicion y eliminacion de entradas individuales
- Notas personalizadas por cada registro
- Indicadores visuales para dias con cheat meal o retencion

### Planificador de Volumen
![Planificador](screenshots/planificador.png)

Rangos cientificos basados en Garthe et al. y Helms (2011-2014):

| Nivel | Ganancia Semanal | Ganancia Mensual |
|-------|------------------|------------------|
| Principiante | 0.25-0.5 kg | 1-2 kg |
| Intermedio | 0.15-0.35 kg | 0.6-1.4 kg |
| Avanzado | 0.1-0.25 kg | 0.4-1 kg |

- Seleccion de nivel de experiencia
- Duracion del volumen configurable (3-12 meses)
- Proyecciones conservador/optimo/agresivo
- Seguimiento de tiempo transcurrido, peso ganado y ritmo actual

### Nutricion
![Nutricion](screenshots/nutricion.png)

Sistema completo de tracking de comidas:
- **Registro por comidas**: Desayuno, Almuerzo, Cena, Snacks
- **Base de datos** con productos reales e imagenes de Open Food Facts
- **Selector de cantidad** en gramos con calculo automatico de macros
- **Grafico circular** de progreso diario (calorias, proteinas, carbohidratos, grasas)
- **Calendario semanal** para navegar entre dias
- Imagenes de productos de Hacendado/Mercadona

### Evaluacion Nutricional
![Evaluacion](screenshots/evaluacion.png)

Calculo profesional del metabolismo:
- **BMR** (Metabolismo Basal) con formula Mifflin-St Jeor
- **TDEE** (Gasto Total Diario) ajustado por actividad
- **Desglose detallado**: BMR + NEAT + Pesas + Cardio
- **Composicion corporal**: porcentaje de grasa, masa magra, masa grasa
- **Historial de fases** con tracking de rebotes

### Importar/Exportar Datos
![Datos](screenshots/datos.png)

Gestion completa de datos:
- **Exportar CSV**: Compatible con Excel para registros de peso
- **Backup JSON**: Perfil completo + registros + evaluacion nutricional
- **Importar**: CSV o JSON con deteccion automatica de duplicados
- **Plantilla CSV** descargable con formato correcto

### Ajustes
![Ajustes](screenshots/ajustes.png)

Personalizacion completa:
- Tema claro/oscuro
- Objetivo de peso (volumen/definicion)
- Objetivos de nutricion personalizados (calorias, proteinas, carbohidratos, grasas)
- Configuracion de nombres de comidas

## Stack Tecnologico

| Tecnologia | Uso |
|------------|-----|
| React 18 | Framework UI |
| TypeScript | Tipado estatico |
| Vite | Build tool y dev server |
| Zustand | State management |
| Recharts | Graficas interactivas |
| Tailwind CSS | Estilos utility-first |
| Framer Motion | Animaciones |
| date-fns | Manejo de fechas |

## Instalacion

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/fitness-app-pro.git

# Entrar al directorio
cd fitness-app-pro

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicacion estara disponible en `http://localhost:5173`

## Build para Produccion

```bash
npm run build
```

Los archivos optimizados se generan en el directorio `dist/`.

## Estructura del Proyecto

```
fitness-app-pro/
├── public/
│   └── food-images/          # Imagenes de productos
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx     # Panel principal
│   │   ├── WeightChart.tsx   # Graficas
│   │   ├── WeightList.tsx    # Historial
│   │   ├── BulkPlanner.tsx   # Planificador
│   │   ├── NutritionLog.tsx  # Nutricion
│   │   ├── NutritionEvaluation.tsx
│   │   ├── ImportExport.tsx  # Datos
│   │   └── AddFoodModal.tsx  # Modal alimentos
│   ├── data/
│   │   └── foodDatabase.ts   # Base de datos alimentos
│   ├── store/
│   │   ├── useWeightStore.ts
│   │   ├── useNutritionStore.ts
│   │   └── useThemeStore.ts
│   ├── types/
│   │   └── index.ts          # Tipos TypeScript
│   └── utils/
│       ├── statistics.ts     # Calculos
│       └── nutrition.ts      # Utilidades nutricion
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Privacidad

- Todos los datos se almacenan localmente en el navegador (LocalStorage)
- No hay backend ni servidor externo
- Los datos nunca salen del dispositivo
- Exporta tus datos en cualquier momento

## Licencia

MIT License
