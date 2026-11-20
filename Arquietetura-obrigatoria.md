# Documento de Arquitetura Frontend — Plataforma Tributária RTC (Simples Nacional)

## 1. Visão Geral do Produto

O objetivo deste documento é especificar a arquitetura de software de uma aplicação **Single Page Application (SPA)** desenvolvida em **Angular**, destinada a micro e pequenas empresas enquadradas no Simples Nacional, adaptada às regras da Reforma Tributária do Consumo (LC 214/2025).

A aplicação unificará dois módulos de negócio principais acessíveis através de uma navegação centralizada (Menu Lateral / Header):
1. **Simulador de Nota Fiscal (NF-e / NFC-e / NFS-e):** Permite ao usuário montar uma operação de venda com múltiplos itens e visualizar em tempo real o impacto tributário (CBS, IBS e Imposto Seletivo), validando inconsistências antes da emissão real.
2. **Calculadora de Precificação com Tributos Embutidos (Markup Reverso):** Ferramenta estratégica que auxilia o lojista/prestador a definir o preço final de venda a partir do custo do produto e da margem de lucro líquida desejada, garantindo que a carga tributária do Simples Nacional não corroa o lucro.

---

## 2. Stack Tecnológica e Padrões Adotados

* **Framework Principal:** Angular (v18+ recomendado, utilizando **Standalone Components** por padrão, eliminando a necessidade de `NgModules`).
* **Gerenciamento de Estado:** **Angular Signals** (`signal`, `computed`, `effect`) para reatividade granular nos cálculos em tempo real e formulários dinâmicos, combinado com **RxJS** para orquestração de requisições HTTP.
* **Estilização e UI:** Tailwind CSS + Angular Material (ou PrimeNG) para componentes complexos (tabelas dinâmicas, autocompletes de NCM/Atividades, modais de memória de cálculo).
* **Formulários:** Reactive Forms tipados (`FormGroup`, `FormArray`, `FormControl`).
* **Comunicação HTTP:** `HttpClient` com Interceptors funcionais (`HttpInterceptorFn`) para tratamento global de erros, loading states e cabeçalhos de ambiente.

---

## 3. Arquitetura de Diretórios (Feature-Sliced / Domain-Driven)

A estrutura de pastas foi projetada para isolar as regras de negócio de cada módulo, compartilhando a camada de comunicação com a API RTC e componentes visuais comuns.

```text
src/
├── app/
│   ├── core/                                # Serviços singleton, modelos globais e infraestrutura
│   │   ├── config/
│   │   │   └── environment.config.ts        # URLs base da API RTC (ex: http://localhost:8082/api)
│   │   ├── interceptors/
│   │   │   ├── api-error.interceptor.ts     # Intercepta falhas HTTP e traduz códigos VSN-###
│   │   │   └── simulation-header.interceptor.ts # Lê headers de aviso (ex: CALCULO_SIMULADO pré-2027)
│   │   ├── models/                          # Contratos TypeScript espelhando o Swagger da API RTC
│   │   │   ├── rtc-request.model.ts
│   │   │   ├── rtc-response.model.ts
│   │   │   ├── atividade-sn.model.ts
│   │   │   └── erro-vsn.model.ts
│   │   └── services/                        # Comunicação direta com os endpoints da API
│   │       ├── rtc-calculadora.service.ts   # POST /calculadora/observabilidade/simples-nacional
│   │       ├── rtc-atividades.service.ts    # GET /calculadora/simples-nacional/atividades
│   │       └── rtc-sistema.service.ts       # GET /versao, /versao/status e /erros
│   │
│   ├── shared/                              # Componentes, pipes e diretivas reutilizáveis
│   │   ├── components/
│   │   │   ├── atividade-selector/          # Autocomplete inteligente de CNAE/Anexo/Fator R
│   │   │   ├── memoria-calculo-modal/       # Drawer/Modal explicando o passo a passo do imposto
│   │   │   ├── status-api-badge/            # Indicador no header mostrando versão do banco (ex: V0073)
│   │   │   └── alerta-inconsistencia/       # Exibe alertas amigáveis para erros VSN-### por item
│   │   └── pipes/
│   │       ├── currency-brl.pipe.ts
│   │       └── aliquota-percent.pipe.ts
│   │
│   ├── layout/                              # Estrutura visual da aplicação unificada
│   │   ├── main-layout/
│   │   │   ├── main-layout.component.ts     # Shell principal com Sidebar, Topbar e <router-outlet>
│   │   │   ├── sidebar-menu.component.ts    # Menu de navegação entre Simulador e Precificação
│   │   │   └── topbar.component.ts          # Contexto da empresa (Município, Data, Fator R global)
│   │
│   ├── features/                            # Módulos funcionais isolados (Lazy Loaded)
│   │   ├── simulador-nfe/                   # PROJETO 1: Simulador de Nota Fiscal
│   │   │   ├── components/
│   │   │   │   ├── operacao-header-form/    # Data fato gerador, Município IBGE, Tipo Doc (NF-e/NFC-e)
│   │   │   │   ├── itens-nota-table/        # Grid dinâmico (NCM/NBS, CST, cClassTrib, Qtd, Valor)
│   │   │   │   └── resumo-tributario-card/  # Totais de CBS, IBS, IS e carga tributária efetiva (%)
│   │   │   ├── services/
│   │   │   │   └── simulador-state.service.ts # Gerencia estado da nota via Angular Signals
│   │   │   └── simulador-nfe.page.ts        # Componente de página principal
│   │   │
│   │   └── precificacao/                    # PROJETO 2: App de Precificação com Tributos Embutidos
│   │       ├── components/
│   │       │   ├── form-custos-margem/      # Inputs: Custo Aquisição, Despesas Fixas %, Margem Lucro %
│   │       │   ├── composicao-preco-chart/  # Gráfico visual (Custo vs Lucro vs CBS/IBS)
│   │       │   └── simulador-cenarios/      # Comparativo (Ex: Com Fator R vs Sem Fator R)
│   │       ├── services/
│   │       │   └── precificacao-engine.service.ts # Lógica de Markup Reverso + chamada à API RTC
│   │       └── precificacao.page.ts         # Componente de página principal
│   │
│   ├── app.component.ts
│   ├── app.config.ts                        # Configuração de rotas, HttpClient e Interceptors
│   └── app.routes.ts                        # Definição das rotas principais
```

---

## 4. Arquitetura de Navegação e Layout Unificado

A aplicação utiliza um padrão **App Shell** (`MainLayoutComponent`). O usuário configura o perfil básico da sua empresa uma única vez no cabeçalho superior (ou em um painel de contexto persistido em `localStorage`), e esse contexto alimenta ambas as ferramentas.

### Estrutura de Rotas (`app.routes.ts`)

```typescript
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'simulador-nfe', pathMatch: 'full' },
      {
        path: 'simulador-nfe',
        loadComponent: () => import('./features/simulador-nfe/simulador-nfe.page')
          .then(m => m.SimuladorNfePage),
        title: 'Simulador de Nota Fiscal | RTC Simples'
      },
      {
        path: 'precificacao',
        loadComponent: () => import('./features/precificacao/precificacao.page')
          .then(m => m.PrecificacaoPage),
        title: 'Precificação Inteligente | RTC Simples'
      }
    ]
  }
];
```

### Contexto Global Compartilhado (`EmpresaContextService`)
Para evitar que o empresário preencha dados repetitivos ao navegar entre o Simulador de NF-e e a Precificação, um serviço no `core` mantém via `Signals` e `localStorage`:
* **Município Padrão** (Código IBGE — essencial para o cálculo da parcela municipal do IBS).
* **Atividade Econômica Principal** (obtida via `GET /calculadora/simples-nacional/atividades`).
* **Enquadramento no Fator R** (boolean: folha de pagamento > 28% da receita bruta).
* **Data de Referência** (padrão: data atual, permitindo simular datas futuras da transição tributária 2026–2033).

---

## 5. Detalhamento Técnico dos Módulos (Features)

### 5.1. Módulo 1: Simulador de Nota Fiscal (`features/simulador-nfe`)

Este módulo traduz o payload técnico do endpoint `POST /calculadora/observabilidade/simples-nacional` em uma experiência intuitiva de emissão de venda.

#### Fluxo de Dados e Observabilidade
1. **Entrada de Dados:** O usuário adiciona múltiplos itens à venda usando um `FormArray`. Cada linha representa um produto (`ncm`) ou serviço (`nbs`), quantidade, valor unitário, `cst` e `cClassTrib`.
2. **Disparo Reativo:** Ao clicar em "Simular Tributação" (ou via `debounceTime(600)` automático), o `SimuladorStateService` converte o formulário no DTO esperado pela API e aciona `RtcCalculadoraService.calcularOperacao()`.
3. **Tratamento da Observabilidade por Item:**
   A API RTC não aborta a requisição se apenas 1 de 10 itens estiver incorreto. A interface deve refletir essa característica:
   * Itens com estado `CALCULADO` ou `CALCULO_SIMULADO` exibem um badge verde/azul e os valores de **CBS** e **IBS** discriminados.
   * Itens com estado `INCONSISTENCIA_ENTRADA` destacam a linha em vermelho e exibem um botão *"Ver motivo"*. Ao clicar, o frontend consulta `GET /calculadora/observabilidade/simples-nacional/erros?codigo=VSN-XXX` (com cache local via RxJS `shareReplay`) e exibe a explicação em português claro para o lojista.
4. **Resumo Consolidado:** Um painel lateral fixo exibe:
   * Valor Total dos Produtos/Serviços;
   * Total CBS (União);
   * Total IBS (Estado + Município);
   * Total Imposto Seletivo (se aplicável);
   * **Taxa Efetiva Real:** `(Total Tributos / Valor Total da Nota) * 100`.

---

### 5.2. Módulo 2: App de Precificação com Tributos Embutidos (`features/precificacao`)

Este módulo resolve o problema matemático do cálculo "por dentro" (gross-up), onde o imposto incide sobre o próprio preço de venda final.

#### A Lógica Matemática e Integração com a API
Como a API RTC recebe a `baseCalculo` (preço de venda) para devolver o imposto devido, o `PrecificacaoEngineService` executa um fluxo em duas etapas (ou convergente) para descobrir o preço exato:

1. **Inputs do Usuário:**
   * **Custo Unitário do Produto/Serviço ($C$):** Ex: `R$ 50,00`
   * **Custos Variáveis / Despesas Operacionais ($D_\%$):** Ex: `10%` (taxa de cartão, embalagem, comissão)
   * **Margem de Lucro Líquida Desejada ($M_\%$):** Ex: `30%`
   * **Dados Fiscais do Item:** NCM/NBS, CST, `cClassTrib` e Município.

2. **Etapa 1 — Descoberta da Alíquota Efetiva ($T_\%$):**
   * O serviço envia uma requisição de sonda (probe) para `POST /calculadora/observabilidade/simples-nacional` utilizando uma `baseCalculo` unitária de referência (ex: `R$ 100,00`) com os parâmetros fiscais do produto.
   * A API retorna o valor exato de CBS + IBS + IS considerando eventuais redutores (ex: redução de 60% para saúde/educação ou 100% para cesta básica) e regras do Anexo/Fator R.
   * Com isso, extrai-se a **Alíquota Efetiva Total ($T_\%$)** exata para aquele item naquele município e data.

3. **Etapa 2 — Cálculo do Preço de Venda Ideal ($PV$):**
   Aplicando a fórmula de formação de preço com tributos embutidos:
   $$PV = \frac{C}{1 - \left(\frac{D_\% + M_\% + T_\%}{100}\right)}$$
   *(Nota: O sistema valida se $D_\% + M_\% + T_\% < 100\%$, alertando o usuário caso a soma inviabilize o preço).*

4. **Etapa 3 — Validação Oficial (Arredondamento Bancário `HALF_EVEN`):**
   * O $PV$ encontrado é submetido novamente ao endpoint `POST /calculadora/observabilidade/simples-nacional` como a `baseCalculo` real.
   * Isso garante que o valor final exibido ao lojista respeite rigorosamente o arredondamento bancário de 8 casas decimais da Receita Federal.

5. **Visualização de Resultados:**
   * **Destaque Principal:** Preço de Venda Sugerido (`R$ 97,80`).
   * **Decomposição Financeira (Gráfico de Rosca/Barras):**
     * Custo do Produto (`R$ 50,00` — 51,1%)
     * Despesas Operacionais (`R$ 9,78` — 10,0%)
     * Tributos RTC: CBS + IBS (`R$ 8,68` — 8,9%)
     * Lucro Líquido Real no Bolso (`R$ 29,34` — 30,0%)
   * **Comparativo "Preço no Feeling vs. Preço Correto":** Mostra quanto dinheiro o empresário perderia se aplicasse apenas um markup simples sobre o custo sem embutir a carga tributária.

---

## 6. Camada de Serviços e Contratos (Core Layer)

### Mapeamento dos Endpoints da API RTC

| Serviço Angular | Método | Endpoint da API RTC | Estratégia de Cache / Estado |
| :--- | :--- | :--- | :--- |
| `RtcCalculadoraService` | `calcular()` | `POST /calculadora/observabilidade/simples-nacional` | Sem cache (transacional) |
| `RtcAtividadesService` | `listarAtividades()` | `GET /calculadora/simples-nacional/atividades` | Cache em memória por `data` (`shareReplay(1)`) |
| `RtcAtividadesService` | `buscarPorCodigo()` | `GET /calculadora/simples-nacional/atividades/{codigo}` | Cache em memória por `codigo + data` |
| `RtcSistemaService` | `consultarErroVsn()` | `GET /calculadora/observabilidade/simples-nacional/erros` | `Map<string, Observable<ErroVsn>>` (cache permanente na sessão) |
| `RtcSistemaService` | `obterVersao()` | `GET /versao` e `GET /versao/status` | Executado no `APP_INITIALIZER` para exibir status no rodapé/header |

### Interceptors Importantes

1. **`SimulationHeaderInterceptor`:**
   A API RTC retorna um cabeçalho de aviso quando o cálculo utiliza alíquotas de transição (período anterior a 2027). O interceptor captura esse header e atualiza um `Signal` global (`isModoTransicaoSimulado`), exibindo um banner discreto no topo da tela: *"Simulação baseada nas regras de transição vigentes na data selecionada"*.
2. **`ApiErrorInterceptor`:**
   Caso a API Java/Spring Boot (porta 8082) esteja offline ou retorne erro `500`, o interceptor captura a falha e aciona um serviço de notificação amigável orientando o usuário a verificar a conexão com o motor de cálculo RTC.

---

## 7. Roteiro de Implementação (Passo a Passo)

1. **Setup Inicial:**
   * Criar projeto com `ng new rtc-simples-app --standalone --style=scss`.
   * Configurar `proxy.conf.json` redirecionando `/api` para `http://localhost:8082/api` para evitar problemas de CORS durante o desenvolvimento local.
2. **Camada Core & Modelos:**
   * Exportar o JSON do Swagger (`http://localhost:8082/api/v3/api-docs`) e gerar/tipar as interfaces TypeScript em `core/models/`.
   * Implementar os serviços HTTP (`RtcCalculadoraService`, `RtcAtividadesService`, `RtcSistemaService`).
3. **App Shell e Contexto Global:**
   * Construir o `MainLayoutComponent` com o menu lateral alternando entre **Simulador de Nota Fiscal** e **Precificação**.
   * Implementar o seletor global de **Atividade Econômica** e **Município**.
4. **Desenvolvimento da Feature 1 (Simulador NF-e):**
   * Criar o formulário reativo de itens com suporte a adição/remoção dinâmica.
   * Construir a tabela de resultados destacando os status (`CALCULADO` vs `INCONSISTENCIA_ENTRADA`) e o modal de memória de cálculo.
5. **Desenvolvimento da Feature 2 (Precificação):**
   * Implementar o `PrecificacaoEngineService` com o algoritmo de sonda de alíquota efetiva + cálculo de markup reverso + validação final na API.
   * Criar os cards de decomposição de preço e gráficos comparativos.