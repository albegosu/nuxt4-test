# Charting

## Purpose

Integrate Chart.js for data visualization in the Nuxt 4 application. Create reusable chart components for displaying data in various chart types.

## Dependencies

- Nuxt 4 project
- Vue 3 composition API
- Chart.js and vue-chartjs

## Step-by-Step Setup

### Step 1: Install Chart Libraries

Install Chart.js and vue-chartjs:

```bash
npm install chart.js vue-chartjs
```

### Step 2: Create Base Chart Component

Create `components/charts/BaseChart.vue`:

```vue
<template>
  <div class="chart-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  type: 'line' | 'bar' | 'pie' | 'doughnut'
  data: {
    labels: string[]
    datasets: any[]
  }
  options?: any
  height?: number
}

const props = defineProps<Props>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null

const renderChart = () => {
  if (!canvasRef.value) return

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const chartConfig = {
    type: props.type,
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      ...props.options,
    },
  }

  chartInstance = new ChartJS(ctx, chartConfig)
}

watch([() => props.data, () => props.type], () => {
  nextTick(() => {
    renderChart()
  })
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    renderChart()
  })
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
```

### Step 3: Create Specific Chart Components

Create `components/charts/LineChart.vue`:

```vue
<template>
  <BaseChart
    type="line"
    :data="chartData"
    :options="chartOptions"
  />
</template>

<script setup lang="ts">
interface Props {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
  }[]
  title?: string
}

const props = defineProps<Props>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset, index) => ({
    ...dataset,
    borderColor: dataset.borderColor || `hsl(${index * 60}, 70%, 50%)`,
    backgroundColor: dataset.backgroundColor || `hsla(${index * 60}, 70%, 50%, 0.1)`,
    tension: 0.4,
  })),
}))

const chartOptions = computed(() => ({
  plugins: {
    title: {
      display: !!props.title,
      text: props.title,
    },
    legend: {
      display: true,
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}))
</script>
```

Create `components/charts/BarChart.vue`:

```vue
<template>
  <BaseChart
    type="bar"
    :data="chartData"
    :options="chartOptions"
  />
</template>

<script setup lang="ts">
interface Props {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
  }[]
  title?: string
}

const props = defineProps<Props>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset, index) => ({
    ...dataset,
    backgroundColor: dataset.backgroundColor || `hsl(${index * 60}, 70%, 50%)`,
  })),
}))

const chartOptions = computed(() => ({
  plugins: {
    title: {
      display: !!props.title,
      text: props.title,
    },
    legend: {
      display: true,
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}))
</script>
```

Create `components/charts/PieChart.vue`:

```vue
<template>
  <BaseChart
    type="pie"
    :data="chartData"
    :options="chartOptions"
  />
</template>

<script setup lang="ts">
interface Props {
  labels: string[]
  data: number[]
  title?: string
}

const props = defineProps<Props>()

const colors = [
  'hsl(0, 70%, 50%)',
  'hsl(60, 70%, 50%)',
  'hsl(120, 70%, 50%)',
  'hsl(180, 70%, 50%)',
  'hsl(240, 70%, 50%)',
  'hsl(300, 70%, 50%)',
]

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: colors.slice(0, props.data.length),
    },
  ],
}))

const chartOptions = computed(() => ({
  plugins: {
    title: {
      display: !!props.title,
      text: props.title,
    },
    legend: {
      display: true,
      position: 'right' as const,
    },
  },
}))
</script>
```

### Step 4: Create Data-Fetching Chart Component

Create `components/charts/DataChart.vue`:

```vue
<template>
  <div>
    <LineChart
      v-if="type === 'line' && chartData"
      :labels="chartData.labels"
      :datasets="chartData.datasets"
      :title="title"
    />
    
    <BarChart
      v-else-if="type === 'bar' && chartData"
      :labels="chartData.labels"
      :datasets="chartData.datasets"
      :title="title"
    />
    
    <PieChart
      v-else-if="type === 'pie' && chartData"
      :labels="chartData.labels"
      :data="chartData.data"
      :title="title"
    />
    
    <div v-if="loading" class="loading">
      Loading chart data...
    </div>
    
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type: 'line' | 'bar' | 'pie'
  apiEndpoint: string
  title?: string
  labelKey?: string
  valueKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  labelKey: 'label',
  valueKey: 'value',
})

const chartData = ref<any>(null)
const loading = ref(false)
const error = ref('')

const fetchChartData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(props.apiEndpoint, {
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch chart data')
    }
    
    const data = await response.json()
    
    // Transform data based on chart type
    if (props.type === 'pie') {
      chartData.value = {
        labels: data.map((item: any) => item[props.labelKey]),
        data: data.map((item: any) => item[props.valueKey]),
      }
    } else {
      chartData.value = {
        labels: data.map((item: any) => item[props.labelKey]),
        datasets: [
          {
            label: props.title || 'Data',
            data: data.map((item: any) => item[props.valueKey]),
          },
        ],
      }
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchChartData()
})
</script>
```

### Step 5: Example Usage

Use in a page:

```vue
<template>
  <div>
    <h1>Analytics Dashboard</h1>
    
    <div class="charts-grid">
      <div class="chart-card">
        <DataChart
          type="line"
          api-endpoint="/api/analytics/sales"
          title="Sales Over Time"
          label-key="month"
          value-key="amount"
        />
      </div>
      
      <div class="chart-card">
        <BarChart
          :labels="['Jan', 'Feb', 'Mar', 'Apr']"
          :datasets="[
            {
              label: 'Revenue',
              data: [1000, 1500, 1200, 1800],
            },
          ]"
          title="Monthly Revenue"
        />
      </div>
      
      <div class="chart-card">
        <PieChart
          :labels="['Centro A', 'Centro B', 'Centro C']"
          :data="[30, 45, 25]"
          title="Distribution by Centro"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component usage
</script>

<style scoped>
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
```

## Configuration

### Chart Types

Supported chart types:
- **Line**: For trends over time
- **Bar**: For comparisons
- **Pie/Doughnut**: For proportions

### Chart Options

Customize charts with Chart.js options:
- Colors and styling
- Legends and tooltips
- Scales and axes
- Animations

## Key Files

- `components/charts/BaseChart.vue` - Base chart component
- `components/charts/LineChart.vue` - Line chart
- `components/charts/BarChart.vue` - Bar chart
- `components/charts/PieChart.vue` - Pie chart
- `components/charts/DataChart.vue` - Data-fetching chart

## Notes & Gotchas

- **Responsive**: Charts are responsive by default
- **Memory**: Destroy chart instances on unmount to prevent memory leaks
- **Data Format**: Ensure data matches expected format
- **API Integration**: Use DataChart component for server-side data
- **Styling**: Customize colors and styles as needed

## Next Steps

- [Initial Tests](../07-testing/initial-tests.md) - Test component functionality
