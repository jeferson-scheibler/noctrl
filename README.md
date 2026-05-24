# Noctrl

> Voce no controle, mesmo no caos.

App de organizacao de vida completa construido para mentes divergentes. Nao e mais um gerenciador de tarefas — e um centro de controle pessoal que se adapta ao estado de energia do usuario, nao o contrario.

---

## Tecnologias

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| UI | React 18 + TypeScript (strict) | Componentizacao e seguranca de tipos em toda a base |
| Build | Vite 6 | Dev server rapido, HMR, bundle otimizado |
| Estilo | Tailwind CSS 3 | Design system baseado em tokens, sem CSS escrito a mao |
| Estado | Zustand 5 | Estado global simples com middleware de persistencia |
| Rotas | React Router v6 | Navegacao declarativa entre telas |
| Datas | date-fns 4 | Manipulacao de datas sem side effects, tree-shakeable |
| Icones | lucide-react | SVG consistente, tamanho controlado |
| Persistencia | localStorage (MVP) | Zero dependencias externas; falha graciosamente em modo privado |

---

## Primeiros Passos

**Pre-requisitos:** Node.js 18 ou superior.

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de producao
npm run build

# Verificar tipos TypeScript
npx tsc --noEmit
```

O app estara disponivel em `http://localhost:5173`.

---

## Estrutura de Arquivos

```
noctrl/
├── public/
│   └── noctrl-logo.png          # Logo fornecida pelo usuario
├── src/
│   ├── components/
│   │   ├── MoodCheckin/
│   │   │   └── index.tsx        # Tela de check-in de energia (tela inicial)
│   │   ├── Dashboard/
│   │   │   ├── index.tsx        # Painel principal adaptativo
│   │   │   ├── TaskItem.tsx     # Item de tarefa com toggle e animacao
│   │   │   └── WeekStrip.tsx    # Mini-calendario semanal do dashboard
│   │   ├── QuickCapture/
│   │   │   └── index.tsx        # Modal de captura rapida (texto/audio/imagem)
│   │   ├── WeekCalendar/
│   │   │   └── index.tsx        # Calendario semanal completo com grid de horas
│   │   ├── AreaView/
│   │   │   └── index.tsx        # Tela de cada area de vida com tarefas e notas
│   │   ├── IdeaInbox/
│   │   │   └── index.tsx        # Inbox de ideias capturadas
│   │   └── ui/
│   │       ├── Button.tsx       # Botao base com variantes
│   │       ├── Card.tsx         # Card clicavel ou estatico com borda colorida
│   │       ├── Badge.tsx        # Badge de area/energia com cor dinamica
│   │       └── Modal.tsx        # Modal com backdrop, ESC e scroll interno
│   ├── pages/
│   │   ├── Layout.tsx           # Shell: bottom nav + FAB de captura rapida
│   │   └── AreaPage.tsx         # Wrapper de rota para AreaView com header
│   ├── store/
│   │   └── index.ts             # Estado global Zustand + hooks derivados
│   ├── types/
│   │   └── index.ts             # Tipos base + constantes de configuracao por area/energia
│   ├── styles/
│   │   └── globals.css          # Tokens CSS, reset, utilitarios globais
│   ├── App.tsx                  # Raiz: guard de mood + roteador
│   └── main.tsx                 # Entry point React
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Arquitetura

### Fluxo de dados

```
localStorage
    |
    v
useStore (Zustand + persist)
    |
    +-- useTodayTasks()   -- filtra por mood atual
    +-- useTodayEvents()  -- filtra por data
    +-- useMoodValid()    -- verifica se mood e do dia atual
    |
    v
Componentes React (leitura e escricao direta via actions do store)
```

O estado e centralizado em um unico store Zustand. Nao ha prop drilling — cada componente assina apenas as fatias de estado que precisa.

### Guard de Mood

`App.tsx` verifica `useMoodValid()` antes de renderizar o roteador. Se o mood nao foi definido hoje (ou foi resetado a meia-noite), o app exibe `MoodCheckin` em vez do painel. Apos a selecao, o estado muda e o painel e exibido automaticamente — sem redirecionamento explicito.

### Filtragem por Mood

`useTodayTasks()` em `store/index.ts` aplica as regras:

| Mood | Regra |
|------|-------|
| `FULL` | Todas as tarefas pendentes |
| `MEDIUM` | Primeiras 5 tarefas pendentes |
| `LOW` | Ate 3 tarefas com energia `easy` |

### Persistencia

O middleware `persist` do Zustand salva automaticamente no `localStorage`. A funcao `safeStorage()` testa o acesso antes de usar — se falhar (modo anonimo, storage cheio), cai silenciosamente para `sessionStorage`, evitando crash.

O mood e salvo com a data (`moodDate`). A funcao `resetMoodIfNewDay()` e chamada na montagem do `App` e limpa o mood se a data armazenada for diferente de hoje.

### Streak de Presenca

O contador `streakCount` incrementa apenas quando `lastOpenedDate` e exatamente um dia antes da data atual (`differenceInCalendarDays === 1`). Qualquer lacuna reinicia o contador para 1.

---

## Design System

Tokens definidos em `src/styles/globals.css` e espelhados em `tailwind.config.ts`:

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-primary` | `#0A0A0C` | Fundo da pagina |
| `--bg-surface` | `#141418` | Cards e listas |
| `--bg-elevated` | `#1E1E24` | Modais e dropdowns |
| `--accent-blue` | `#2E6FFF` | Destaque primario, botoes, FAB |
| `--accent-glow` | `#5B9FFF` | Hover, links, estados ativos |
| `--area-work` | `#7C6FFF` | Area Trabalho |
| `--area-personal` | `#FF6B6B` | Area Pessoal |
| `--area-study` | `#FFD166` | Area Estudos |
| `--area-finance` | `#06D6A0` | Area Financeiro |
| `--text-primary` | `#F0F0F5` | Texto principal |
| `--text-secondary` | `#5A5A6E` | Texto de suporte |
| `--text-muted` | `#3A3A4A` | Placeholders |

**Tipografia:**
- Titulos: Space Grotesk 700
- Corpo: Inter 400/500
- Labels: Inter 600

**Principios visuais:**
- Dark mode absoluto, sem alternancia
- Bordas sutis: `1px solid rgba(255,255,255,0.06)`
- Glow em elementos ativos: `box-shadow: 0 0 20px rgba(46,111,255,0.3)`
- `border-radius: 12px` para cards, `8px` para botoes

---

## Tipos Centrais

Definidos em `src/types/index.ts`:

```typescript
type Mood        = 'FULL' | 'MEDIUM' | 'LOW';
type CaptureType = 'task' | 'idea' | 'event';
type Area        = 'work' | 'personal' | 'study' | 'finance';
type EnergyLevel = 'easy' | 'medium' | 'heavy';
```

Cada area e energia tem um objeto de configuracao (`AREA_CONFIG`, `ENERGY_CONFIG`) com label, cor e outros metadados, evitando strings espalhadas pelo codigo.

---

## Funcionalidades (MVP)

| # | Funcionalidade | Status |
|---|---------------|--------|
| 1 | Mood Check-in diario | Implementado |
| 2 | Captura rapida (texto) | Implementado |
| 3 | Captura rapida (audio via Web Speech API) | Implementado |
| 4 | Captura rapida (imagem) | Implementado |
| 5 | Categorizacao na captura (tipo + area + energia) | Implementado |
| 6 | Painel adaptativo por mood | Implementado |
| 7 | Mini-calendario semanal no dashboard | Implementado |
| 8 | Calendario semanal completo com grade de horas | Implementado |
| 9 | Telas de Area com filtro por energia | Implementado |
| 10 | Notas livres por area | Implementado |
| 11 | Inbox de Ideias | Implementado |
| 12 | Promover ideia para tarefa | Implementado |
| 13 | Streak de presenca | Implementado (contador) |
| 14 | Persistencia local (localStorage) | Implementado |
| 15 | Resetar mood a meia-noite | Implementado |

---

## Roadmap

### v1.5
- Animacao de celebracao ao completar tarefa (mensagem + efeito visual)
- Modo Foco (tela limpa com apenas a tarefa atual)
- Revisao semanal guiada (3 perguntas toda sexta/sabado)
- Exibicao mais destacada do streak no dashboard

### v2
- Banco de dados remoto com autenticacao (substituir localStorage)
- Lembretes por geolocalização
- Integracao com calendarios nativos (Google Calendar, iCal)
- Widgets de tela inicial (PWA)
- IA para sugestao de horarios baseada no padrao do usuario

---

## Seguranca

- Inputs sanitizados (trim + limite de caracteres) antes de persistir
- Upload de imagem restrito a 5 MB, convertido para base64 local (sem servidor)
- `localStorage` com fallback gracioso para `sessionStorage`
- Zero dependencias com vulnerabilidades conhecidas em producao
- TypeScript strict em toda a base — sem `any` implicito

---

## Decisoes Tecnicas

**Por que Zustand e nao Redux ou Context?**
Redux adiciona boilerplate desnecessario para um app single-user sem colaboracao em tempo real. Context re-renderiza toda a arvore em cada mudanca. Zustand e granular, simples e tem middleware de persistencia de primeira classe.

**Por que localStorage e nao IndexedDB?**
Para o MVP, a simplicidade supera a capacidade. O volume de dados (tarefas, eventos, notas) e pequeno. A migracao para IndexedDB ou um banco remoto na v2 e direta — o store esta desacoplado da camada de persistencia.

**Por que React Router e nao um estado de navegacao customizado?**
Permite deep links e o botao Voltar do navegador/dispositivo funciona corretamente, o que e essencial em mobile.

**Por que date-fns e nao Day.js ou Luxon?**
Tree-shakeable por design — apenas as funcoes importadas entram no bundle. Sem objetos mutaveis (diferente do Moment.js).
