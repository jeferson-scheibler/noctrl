# NOCTRL — Documento de Projeto

> *"Você no controle, mesmo no caos."*

---

## 1. Visão Geral

**Noctrl** é um app de organização de vida completa, construído para mentes divergentes. Não é mais um gerenciador de tarefas — é um centro de controle pessoal que se adapta ao estado emocional e de energia do usuário, não o contrário.

**Plataforma:** Web (mobile-first) + Desktop  
**Stack sugerida:** React + TypeScript + Tailwind CSS  
**Persistência:** localStorage (MVP) → banco de dados (v2)

---

## 2. Identidade Visual

### Logo
Arquivo: `noctrl-logo.png` (fornecido pelo usuário)  
Ícone: N com corte diagonal, borda com glow azul metálico, acabamento cromado

### Paleta de Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-primary` | `#0A0A0C` | Fundo principal |
| `--bg-surface` | `#141418` | Cards e superfícies |
| `--bg-elevated` | `#1E1E24` | Modais, dropdowns |
| `--accent-blue` | `#2E6FFF` | Destaque primário (do logo) |
| `--accent-glow` | `#5B9FFF` | Brilho, hover states |
| `--area-work` | `#7C6FFF` | Área: Trabalho |
| `--area-personal` | `#FF6B6B` | Área: Pessoal |
| `--area-study` | `#FFD166` | Área: Estudos |
| `--area-finance` | `#06D6A0` | Área: Financeiro |
| `--text-primary` | `#F0F0F5` | Texto principal |
| `--text-secondary` | `#5A5A6E` | Texto secundário |
| `--text-muted` | `#3A3A4A` | Placeholders |

### Tipografia

| Uso | Fonte | Peso |
|-----|-------|------|
| Títulos | Space Grotesk | 700 (Bold) |
| Corpo | Inter | 400 / 500 |
| Labels | Inter | 600 (SemiBold) |

```html
<!-- Google Fonts import -->
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### Princípios de Design

- Dark mode absoluto — nunca light mode
- Bordas sutis com `1px solid rgba(255,255,255,0.06)`
- Glow azul em elementos ativos: `box-shadow: 0 0 20px rgba(46,111,255,0.3)`
- Cantos arredondados: `border-radius: 12px` (cards), `8px` (botões)
- Sem sombras pesadas — usar apenas glow e opacidade

---

## 3. Arquitetura de Telas

### 3.1 Mood Check-in (Tela Inicial)
Exibida ao abrir o app. Define o estado de energia do dia.

**Estados de energia:**
- 🔋 `FULL` — Cheio de energia → mostra tudo, todas as áreas
- ⚡ `MEDIUM` — Modo médio → mostra prioridades + compromissos do dia
- 🪫 `LOW` — Baixa energia → mostra apenas 3 tarefas fáceis + nada mais

**Comportamento:**
- Ao selecionar o mood, app transita para o Painel
- Mood salvo localmente, resetado à meia-noite
- Tom do app: *"Como você está hoje?"* — sem pressão, sem julgamento

---

### 3.2 Painel Principal (Dashboard)

**Componentes visíveis variam conforme o mood.**

Layout base (mood FULL):
```
┌─────────────────────────────────┐
│  Boa [tarde], [nome]            │  ← Saudação contextual
│  [data] · mood: 🔋              │
├─────────────────────────────────┤
│  FOCO DE HOJE                   │  ← 3 tarefas prioritárias
│  [ ] Tarefa A  · Trabalho       │
│  [ ] Tarefa B  · Estudos        │
│  [ ] Tarefa C  · Pessoal        │
├─────────────────────────────────┤
│  SEMANA                         │  ← Mini calendário semanal
│  Seg Ter Qua Qui Sex Sab Dom    │
│   •   ●   •             •      │
├─────────────────────────────────┤
│  ÁREAS                          │  ← Atalhos por área
│  🟣 Trabalho  🔴 Pessoal        │
│  🟡 Estudos   🟢 Financeiro     │
└─────────────────────────────────┘
│  [+] Captura Rápida             │  ← FAB fixo no rodapé
```

---

### 3.3 Captura Rápida

Botão flutuante `[+]` sempre visível. Abre um modal com 3 modos:

**Tipos de captura:**
- 📝 **Texto** — campo livre
- 🎙️ **Áudio** — grava e converte para texto (Web Speech API)
- 🖼️ **Imagem** — upload de foto

**Campos obrigatórios na captura:**
- Tipo: `Tarefa` | `Ideia` | `Compromisso`
- Área: Trabalho | Pessoal | Estudos | Financeiro
- Energia (se Tarefa): Fácil | Médio | Pesado

**Destino após captura:**
- Tarefa → vai para lista da área selecionada
- Ideia → vai para Inbox de Ideias
- Compromisso → vai para Calendário

---

### 3.4 Calendário Semanal

- Visão padrão: **semana atual**
- Blocos coloridos por área da vida
- Navegação: semana anterior / próxima
- Ao clicar em um dia: detalhe dos eventos/tarefas daquele dia
- Suporte a eventos com horário e eventos de dia inteiro

---

### 3.5 Áreas da Vida

Cada área tem sua própria tela com:
- Lista de tarefas filtradas por energia (Fácil / Médio / Pesado)
- Bloco de notas livre (tipo Notion light)
- Cor de destaque própria

| Área | Cor | Ícone |
|------|-----|-------|
| Trabalho | `#7C6FFF` | 💼 |
| Pessoal | `#FF6B6B` | 🌿 |
| Estudos | `#FFD166` | 📚 |
| Financeiro | `#06D6A0` | 💰 |

---

### 3.6 Inbox de Ideias

- Lista de tudo capturado como "Ideia"
- Ação disponível em cada item: transformar em Tarefa ou descartar
- Ordenação: mais recente primeiro
- Visual diferenciado — fundo levemente roxo/escuro

---

## 4. Funcionalidades

### Essenciais (MVP)

| # | Funcionalidade | Descrição |
|---|---------------|-----------|
| 1 | **Mood Check-in** | Define energia do dia ao abrir o app |
| 2 | **Captura Rápida** | Texto, áudio-para-texto e imagem |
| 3 | **Categorização na captura** | Tipo + área + energia já na hora |
| 4 | **Painel adaptativo** | Conteúdo muda conforme o mood |
| 5 | **Painel Semanal** | Visão da semana em blocos coloridos |
| 6 | **Áreas da Vida** | 4 áreas com cores próprias |
| 7 | **Nível de energia da tarefa** | Fácil / Médio / Pesado |
| 8 | **Filtro por mood** | App sugere tarefas compatíveis com energia |
| 9 | **Inbox de Ideias** | Repositório de capturas sem destino |
| 10 | **Notas por área** | Bloco de texto livre em cada área |

### Complementares (v1.5)

| # | Funcionalidade | Descrição |
|---|---------------|-----------|
| 11 | **Celebração de conclusão** | Animação + mensagem ao completar tarefa |
| 12 | **Tom de parceiro** | App reconhece esforço, não julga atrasos |
| 13 | **Streak de presença** | Contador de dias que o app foi aberto |
| 14 | **Modo Foco** | Tela limpa com só a tarefa atual |
| 15 | **Revisão semanal** | 3 perguntas guiadas todo domingo |

### Futuras (v2)

| # | Funcionalidade |
|---|---------------|
| 16 | Lembretes por geolocalização |
| 17 | Integração com calendário nativo do celular |
| 18 | Widgets na tela inicial |
| 19 | IA que sugere horários baseado no padrão do usuário |

---

## 5. Tom de Voz do App

O Noctrl fala como um parceiro que acredita em você.

| Situação | Mensagem |
|----------|----------|
| Ao abrir | *"Como você está hoje?"* |
| Tarefa concluída | *"Feito. Você sabia que ia conseguir."* |
| Dia sem tarefas | *"Dia livre. Às vezes descansar é o plano."* |
| Tarefa atrasada | *(silêncio — sem julgamento, sem badge vermelho chamativo)* |
| Streak de presença | *"X dias seguidos aqui. Isso é consistência."* |
| Mood LOW | *"Tudo bem. Hoje é dia de coisas pequenas."* |

---

## 6. Estrutura de Arquivos Sugerida

```
noctrl/
├── public/
│   └── logo.png
├── src/
│   ├── components/
│   │   ├── MoodCheckin/
│   │   ├── Dashboard/
│   │   ├── QuickCapture/
│   │   ├── WeekCalendar/
│   │   ├── AreaView/
│   │   ├── IdeaInbox/
│   │   └── ui/              ← botões, cards, inputs base
│   ├── hooks/
│   │   ├── useMood.ts
│   │   ├── useTasks.ts
│   │   └── useCapture.ts
│   ├── store/
│   │   └── index.ts         ← estado global (Zustand ou Context)
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── globals.css      ← tokens CSS, dark mode base
│   └── App.tsx
├── package.json
└── README.md
```

---

## 7. Tipos Base (TypeScript)

```typescript
type Mood = 'FULL' | 'MEDIUM' | 'LOW';
type CaptureType = 'task' | 'idea' | 'event';
type Area = 'work' | 'personal' | 'study' | 'finance';
type EnergyLevel = 'easy' | 'medium' | 'heavy';

interface Task {
  id: string;
  title: string;
  type: CaptureType;
  area: Area;
  energy: EnergyLevel;
  done: boolean;
  createdAt: Date;
  dueDate?: Date;
  notes?: string;
}

interface DayMood {
  date: string; // ISO date
  mood: Mood;
}

interface AppState {
  mood: Mood | null;
  tasks: Task[];
  ideas: Task[];
  events: CalendarEvent[];
  notes: Record<Area, string>;
}
```

---

## 8. Ordem de Desenvolvimento Sugerida

1. Setup do projeto (Vite + React + TypeScript + Tailwind)
2. Design system: tokens CSS, componentes base (Button, Card, Badge)
3. Tela de Mood Check-in
4. Painel Principal (Dashboard) — versão estática
5. Captura Rápida (modal + formulário)
6. Lógica de filtragem por mood
7. Calendário Semanal
8. Telas de Área (4 áreas)
9. Inbox de Ideias
10. Animações e tom de voz
11. Persistência (localStorage → migrar para DB)

---

*Documento gerado em sessão de brainstorming colaborativo.*  
*Versão 1.0 — pronto para iniciar desenvolvimento com Claude Code.*
