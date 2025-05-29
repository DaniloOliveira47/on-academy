# Entendendo decisões arquiteturais e a estrutura do projeto

## Requisitos para rodar o projeto

### Setup de ambiente:
- [Azure SQL](https://azure.microsoft.com/pt-br/free/sql-database/search/?ef_id=_k_Cj0KCQjwotDBBhCQARIsAG5pinPl_3spTLDl-EmaYRyhH0uJ1VzPHvoJbkzP_BvWI14rXi0JPkJW1hEaAjt-EALw_wcB_k_&OCID=AIDcmmzmnb0182_SEM__k_Cj0KCQjwotDBBhCQARIsAG5pinPl_3spTLDl-EmaYRyhH0uJ1VzPHvoJbkzP_BvWI14rXi0JPkJW1hEaAjt-EALw_wcB_k_&gad_source=1&gad_campaignid=1635077466&gbraid=0AAAAADcJh_vx6Btl9zUo7RlHHvXEZR0-y&gclid=Cj0KCQjwotDBBhCQARIsAG5pinPl_3spTLDl-EmaYRyhH0uJ1VzPHvoJbkzP_BvWI14rXi0JPkJW1hEaAjt-EALw_wcB)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Android Studio](https://code.visualstudio.com/)

### Como rodar na minha máquina?
1. Clone o projeto: `https://github.com/DaniloOliveira47/on-academy`

2. Instale as dependências necessárias:
```
npm i --force
npm i dotenv --force
npm install lucide-react --force
npm install react-circular-progressbar --force
npm install -D tailwind-scrollbar --force
npm install @headlessui/react --force
npm i react-icons --force
npm install recharts react-select --force
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/timegrid @headlessui/react @heroicons/react --force
npm install jsonwebtoken --force
npm install js-cookie --force
npm i --save-dev @types/js-cookie --force
npm install @radix-ui/react-toast --force
npm install @radix-ui/react-label --force
npm install @radix-ui/react-dialog --force
npm install react-toastify --force
npm install react-loading-skeleton --force
```
Ou você pode instalar todas as dependências principais com o comando:
```
  npm install 

```
3. Inicie a aplicação:
```
   npx expo start
```

4. Pronto 🎉
## Onacademy
### Estruruta do Projeto
- `android/` (Configurações específicas para Android)
  - `android/app/` (Configurações do aplicativo Android)
    - `android/app/src/`
      - `android/app/src/debug/` (Configurações para ambiente de depuração)
        - `AndroidManifest.xml` (Permissões e configurações para debug)
      - `android/app/src/main/` (Código principal do app Android)
        - `java/com/danilo_47/onacademy/` (Código nativo em Kotlin)
          - `MainActivity.kt` (Ponto de entrada da aplicação Android)
          - `MainApplication.kt` (Configurações iniciais do app)
        - `res/` (Recursos do app: ícones, cores, layouts)
          - `drawable/` (Arquivos de imagem vetorial)
            - `ic_launcher_background.xml` (Fundo do ícone do app)
            - `rn_edit_text_material.xml` (Estilo padrão de campos de texto)
          - `mipmap-*/` (Ícones em diferentes densidades de tela)
            - `ic_launcher.webp` (Ícone principal)
            - `ic_launcher_foreground.xml` (Parte frontal do ícone)
            - `ic_launcher_round.webp` (Ícone redondo)
          - `values/` (Definições de recursos)
            - `colors.xml` (Paleta de cores do app)
            - `strings.xml` (Textos e traduções)
            - `styles.xml` (Temas e estilos)
          - `values-night/` (Configurações para tema escuro)
            - `colors.xml` (Cores para modo noturno)
          - `AndroidManifest.xml` (Configurações gerais do app)
    - `build.gradle` (Dependências e configurações do módulo app)
    - `debug.keystore` (Chave para assinatura em desenvolvimento)
    - `proguard-rules.pro` (Regras para ofuscar código)
  - `gradle/` (Configurações do sistema de build)
  - `.gitignore` (Arquivos ignorados pelo Git)
  - `build.gradle` (Configurações gerais do projeto Android)
  - `gradle.properties` (Propriedades do Gradle)
  - `gradlew` (Script para build no Linux/macOS)
  - `gradlew.bat` (Script para build no Windows)
  - `settings.gradle` (Módulos incluídos no projeto)
  - `splashscreen_logo.xml` (Tela de splash personalizada)

- `assets/` (Recursos estáticos)
  - `fonts/` (Fontes customizadas)
    - `Epilogue-Bold.ttf` (Fonte para títulos)
    - `Epilogue-Medium.ttf` (Fonte para subtítulos)
    - `OpenSans-Bold.ttf` (Fonte para textos)
  - `ona.png` (Logo da aplicação)

- `src/` (Código-fonte principal)
  - `assets/images/` (Imagens usadas no app)
  - `components/` (Componentes reutilizáveis)
    - `Boletim/` (Componentes de boletim escolar)
      - `CardMateria.js` (Cartão de disciplina com notas)
      - `Nota.js` (Exibição individual de nota)
      - `barraAzul.js` (Barra de progresso)
    - `EditarTurmas/` (Gestão de turmas)
      - `screens/`
        - `Alunos.js` (Lista de alunos por turma)
        - `PerfilAluno.js` (Edição de perfil do aluno)
        - `PerfilProfessor.js` (Edição de perfil do professor)
      - `CardTurmas.js` (Cartão de turma editável)
      - `ModalCadAluno.js` (Formulário de cadastro de aluno)
      - `ModalCadProfessor.js` (Formulário de cadastro de professor)
    - `Emocional/` (Componentes de acompanhamento emocional)
      - `CheckList.js` (Formulário de estado emocional)
      - `List.js` (Histórico de registros)
    - `Eventos/` (Calendário e eventos)
      - `Calendario.js` (Visualização de calendário)
      - `CardHorario.js` (Card de horário de aula)
      - `eventosEditaveis.js` (Eventos que podem ser editados)
      - `proximosEventos.js` (Lista de eventos futuros)
    - `Feedback/` (Componentes de avaliação)
      - `Avaliacao.js` (Formulário de feedback)
      - `Perguntas.js` (Banco de perguntas)
    - `Gerais/` (Componentes compartilhados)
      - `CustomAlert.js` (Modal de alerta customizado)
      - `DeleteAlert.js` (Confirmação de exclusão)
      - `FeedbackModal.js` (Modal de feedback)
      - `GraficoFeedback.js` (Gráficos de avaliação individual)
      - `GraficoFeedbackTurma.js` (Gráficos de turma)
      - `HeaderSimples.js` (Cabeçalho básico)
      - `HeaderSimplesBack.js` (Cabeçalho com botão de voltar)
      - `PhotoPickerModal.js` (Seletor de foto de perfil)
      - `logOut.js` (Botão de logout)
    - `Home/` (Componentes da tela inicial)
      - `Avisos.js` (Lista de notificações)
      - `CardTurmas.js` (Card de turmas)
      - `Header.js` (Cabeçalho padrão)
      - `HeaderDoc.js` (Cabeçalho para professores)
      - `HeaderIns.js` (Cabeçalho para instituição)
      - `cardNota.js` (Card de notas recentes)
      - `graficoMedia.js` (Gráfico de desempenho)
    - `Ocorrência/` (Componentes de ocorrências)
      - `CardOcorrencia.js` (Detalhes de ocorrência)
      - `CardProfessor.js` (Info do professor relacionado)
      - `CardProfessoreIns.js` (Versão institucional)
    - `Perfil/` (Componentes de perfil)
      - `Campo.js` (Campo editável de perfil)
      - `MiniCampo.js` (Campo compacto)
    - `Turmas/` (Componentes de turmas)
      - `screens/`
        - `AlunoPerfil.js` (Perfil do aluno para professores)
        - `AlunosFeedback.js` (Feedback coletivo)
        - `NotasTurma.js` (Notas da turma)
      - `CardAlunos.js` (Lista de alunos)
      - `CardMateria.js` (Disciplinas da turma)
      - `CardNota.js` (Lançamento de notas)
      - `CardSelecao.js` (Filtro de turmas)
      - `CardTurmas.js` (Card de turma)

  - `screens/` (Telas principais)
    - `screensAluno/` (Telas para alunos)
      - `Boletim.js` (Tela de boletim)
      - `ChatBox.js` (Chat com professores)
      - `Emocional.js` (Acompanhamento emocional)
      - `Home.js` (Dashboard do aluno)
      - `Ocorrencia.js` (Ocorrências disciplinares)
      - `Perfil.js` (Perfil pessoal)
      - `PerfilProfessor.js` (Visualização de perfil de professor)
    - `screensDocente/` (Telas para professores)
      - `Feedback.js` (Tela de feedbacks)
      - `Home.js` (Dashboard do professor)
      - `PerfilDocente.js` (Perfil do professor)
      - `Turmas.js` (Gestão de turmas)
    - `screensInstituicao/` (Telas para instituição)
      - `EventosInstitution.js` (Gestão de eventos)
      - `Home.js` (Dashboard administrativo)
      - `PerfilInstitution.js` (Perfil da instituição)
      - `Professores.js` (Lista de professores)
      - `Turmas.js` (Gestão de turmas)
    - `Eventos.js` (Tela compartilhada de eventos)
    - `Login.js` (Tela de autenticação)

  - `stacks/` (Configurações de navegação)
    - `EditarTurmasStack.js` (Navegação para edição de turmas)
    - `FeedbackStack.js` (Fluxo de feedbacks)
    - `NotasStack.js` (Navegação de lançamento de notas)
    - `ProfessoresStack.js` (Fluxo de professores)
    - `TurmasStack.js` (Navegação de turmas)

  - `App.js` (Ponto de entrada do React Native)
  - `Navigation.js` (Rotas para alunos)
  - `NavigationDocente.js` (Rotas para professores)
  - `NavigationInstituicao.js` (Rotas para instituição)

- `.gitignore` (Arquivos ignorados pelo Git)
- `app.json` (Configurações do Expo)
- `CONTRIBUTING.md` (Guia de contribuição)
- `eas.json` (Configurações para builds EAS)
- `index.js` (Ponto de entrada JavaScript)
- `LICENSE` (Licença do projeto)
- `mainNavigation.js` (Navegação raiz)
- `package.json` (Dependências e scripts)
- `package-lock.json` (Versões travadas de dependências)
- `react-native.config.js` (Configurações do React Native)
- `README.md` (Documentação principal)
- `STRUCTURE.md` (Documentação da estrutura)

# Conclusão:
A estrutura do projeto On Academy foi meticulosamente organizada seguindo as melhores práticas de desenvolvimento mobile com React Native.
